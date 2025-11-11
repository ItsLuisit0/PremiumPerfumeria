require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

const { testConnection } = require('./db/db');
const perfumeRoutes = require('./routes/perfumes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Confiar en proxies (Railway, Render, etc)
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Confiar en el primer proxy
    console.log('✅ Trust proxy habilitado para producción');
}

// Configuración de CORS según el entorno
const defaultDevOrigins = [
    'http://127.0.0.1:5500', 
    'http://localhost:3000', 
    'http://localhost:5500', 
    'http://localhost:8080'
];

const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : defaultDevOrigins;

console.log('🌐 Orígenes CORS permitidos:', allowedOrigins);

if (NODE_ENV === 'production' && allowedOrigins.length === defaultDevOrigins.length) {
    console.warn('⚠️  ADVERTENCIA: Usando orígenes CORS por defecto en producción');
    console.warn('📝 Configura CORS_ORIGIN en las variables de entorno');
}

app.use(cors({
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen en desarrollo
        if (!origin && NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // En producción, permitir requests sin origen (healthchecks de Railway, etc)
        if (!origin && NODE_ENV === 'production') {
            console.log('✅ CORS: Request sin origen permitido (healthcheck)');
            return callback(null, true);
        }
        
        // Verificar si el origen está en la lista permitida
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La política de CORS para este sitio no permite acceso desde el origen especificado.';
            console.warn('❌ CORS bloqueado para origen:', origin);
            return callback(new Error(msg), false);
        }
        
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== CONFIGURACIÓN HELMET PARA RECURSOS CRUZADOS =====
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ===== RATE LIMITING PERMISIVO PARA DESARROLLO =====
if (NODE_ENV === 'development') {
    app.use(rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minuto
        max: 100, // 100 requests por minuto en desarrollo
        message: { 
            success: false, 
            message: 'Demasiadas solicitudes. Por favor, espera un momento.' 
        }
    }));
} else {
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // 100 requests por 15 minutos en producción
        message: { success: false, message: 'Demasiadas solicitudes. Por favor, intenta más tarde.' }
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

app.use('/ImagenesPerfumes', express.static(
    path.join(__dirname, 'ImagenesPerfumes'), 
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
            'POST /api/admin/login': 'Login de administrador',
            'GET /api/admin/estadisticas': 'Estadísticas del dashboard',
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
app.use('/api/admin', adminRoutes);

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
📁 Serviendo imágenes desde: ${path.join(__dirname, 'ImagenesPerfumes')}
            `);
        });
    })
    .catch(error => {
        console.error('❌ Error con la base de datos:', error.message);
        process.exit(1);
    });

module.exports = app;