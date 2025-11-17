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

if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Configuración de CORS según el entorno
const defaultDevOrigins = [
    'http://127.0.0.1:5500', 
    'http://localhost:3000', 
    'http://localhost:5500', 
    'http://localhost:8080'
];

const defaultProdOrigins = [
    'https://perfumeriapremium-production.up.railway.app',
    'https://premiumperfumeria.onrender.com'
];

const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : (NODE_ENV === 'production' ? defaultProdOrigins : defaultDevOrigins);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin && NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        if (!origin && NODE_ENV === 'production') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La política de CORS para este sitio no permite acceso desde el origen especificado.';
            return callback(new Error(msg), false);
        }
        
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

if (NODE_ENV === 'development') {
    app.use(rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minuto
        max: 200, // 200 requests por minuto en desarrollo
        message: { 
            success: false, 
            message: 'Demasiadas solicitudes. Por favor, espera un momento.' 
        }
    }));
} else {
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false,
        message: { 
            success: false, 
            message: 'Demasiadas solicitudes. Por favor, intenta más tarde.' 
        },
        skip: (req) => req.path === '/health' || req.path === '/'
    }));
}

const staticOptions = {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Cache-Control', 'public, max-age=86400');
    }
};

app.use('/ImagenesPerfumes', express.static(
    path.join(__dirname, 'ImagenesPerfumes'), 
    staticOptions
));

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de Perfumeria Elegancia',
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

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        database: 'Conectada',
        environment: NODE_ENV
    });
});

if (NODE_ENV === 'development') {
    app.get('/api/info', (req, res) => {
        res.json({
            name: 'Perfumeria Elegancia API',
            status: 'En linea',
            cors: {
                allowedOrigins: ['http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:8080'],
                staticFiles: 'Configurados con CORS'
            }
        });
    });
}

app.use('/api/perfumes', perfumeRoutes);
app.use('/api/admin', adminRoutes);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
        availableRoutes: ['/', '/health', '/api/perfumes', '/imagenesPerfumes/*']
    });
});

app.use((error, req, res, next) => {
    if (error.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'Error de politica de origen cruzado (CORS)'
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

testConnection()
    .then(() => {
        app.listen(PORT, () => {
            if (NODE_ENV === 'development') {
                console.log(`Servidor iniciado en puerto ${PORT}`);
            }
        });
    })
    .catch(error => {
        console.error('ERROR CRITICO - No se pudo conectar a la base de datos:', error.message);
        console.error('Variables de entorno disponibles:', {
            MYSQL_HOST: process.env.MYSQL_HOST ? 'SET' : 'NOT SET',
            MYSQL_USER: process.env.MYSQL_USER ? 'SET' : 'NOT SET',
            MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? 'SET' : 'NOT SET',
            MYSQL_DATABASE: process.env.MYSQL_DATABASE ? 'SET' : 'NOT SET',
            MYSQL_URL: process.env.MYSQL_URL ? 'SET' : 'NOT SET',
            NODE_ENV: NODE_ENV
        });
        process.exit(1);
    });

module.exports = app;