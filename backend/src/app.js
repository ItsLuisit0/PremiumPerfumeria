require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Database y rutas
const { testConnection } = require('./db/db');
const perfumeRoutes = require('./routes/perfumes');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===== CONFIGURACIÓN CORS PARA PRODUCCIÓN Y DESARROLLO =====
const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5500', 'http://localhost:8080'];

console.log('🌐 Orígenes CORS permitidos:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como Postman o apps móviles)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La política de CORS para este sitio no permite acceso desde el origen especificado.';
            console.warn('❌ CORS bloqueado para origen:', origin);
            return callback(new Error(msg), false);
        }
        
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== CONFIGURACIÓN HELMET PARA RECURSOS CRUZADOS =====
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ===== RATE LIMITING PERMISIVO PARA DESARROLLO =====
/* if (NODE_ENV === 'development') {
    app.use(rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minuto
        max: 100, // 100 requests por minuto en desarrollo
        message: { 
            success: false, 
            message: 'Demasiadas solicitudes. Por favor, espera un momento.' 
        }
    }));
} */ else {
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: { success: false, message: 'Demasiadas solicitudes' }
    }));
}

// ===== SERVIR IMÁGENES CON CONFIGURACIÓN CORS =====
const staticOptions = {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache de 1 día
    }
};

app.use('/imagenesPerfumes', express.static(
    path.join(__dirname, '../../frontend/public/imagenesPerfumes'), 
    staticOptions
));

// ===== RUTAS DE LA API =====

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 API de Perfumería Elegancia',
        version: '1.0.0',
        endpoints: {
            'GET /api/perfumes': 'Todos los perfumes',
            'GET /api/perfumes/:id': 'Perfume por ID', 
            'GET /api/perfumes/:id/reviews': 'Reseñas del perfume',
            'POST /api/perfumes/:id/reviews': 'Añadir reseña',
            'GET /health': 'Estado del servidor',
            'GET /imagenesPerfumes/*': 'Servir imágenes de perfumes'
        },
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente ✅',
        database: 'Conectada',
        environment: NODE_ENV
    });
});

// Info (solo desarrollo)
if (NODE_ENV === 'development') {
    app.get('/api/info', (req, res) => {
        res.json({
            name: 'Perfumería Elegancia API',
            status: '🟢 En línea',
            cors: {
                allowedOrigins: ['http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:8080'],
                staticFiles: 'Configurados con CORS'
            }
        });
    });
}

// Rutas principales
app.use('/api/perfumes', perfumeRoutes);

// ===== MANEJO DE ERRORES =====

// Rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
        availableRoutes: ['/', '/health', '/api/perfumes', '/imagenesPerfumes/*']
    });
});

// Error handler global
app.use((error, req, res, next) => {
    console.error('Error:', error.message);
    
    // Manejar errores CORS específicos
    if (error.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'Error de política de origen cruzado (CORS)'
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// ===== INICIALIZACIÓN =====
testConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`
🚀 Servidor iniciado en puerto ${PORT}
📍 http://localhost:${PORT}
🌍 Ambiente: ${NODE_ENV}
📁 Serviendo imágenes desde: ${path.join(__dirname, '../../frontend/public/imagenesPerfumes')}
            `);
        });
    })
    .catch(error => {
        console.error('❌ Error con la base de datos:', error.message);
        process.exit(1);
    });

module.exports = app;