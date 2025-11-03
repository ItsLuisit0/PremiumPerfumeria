const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const perfumeController = require('../controllers/perfumeController');
const reviewController = require('../controllers/reviewController');

// Middleware de validación básico
const validateId = (req, res, next) => {
    const { id } = req.params;
    
    if (id && !/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID debe ser un número válido'
        });
    }
    
    next();
};

const validateReview = (req, res, next) => {
    const { usuario, comentario, calificacion } = req.body;
    const errors = [];

    // Log solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Validando reseña:', { usuario, comentario, calificacion });
    }

    // Validar usuario
    if (!usuario || typeof usuario !== 'string') {
        errors.push('El nombre es obligatorio');
    } else if (usuario.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (usuario.trim().length > 50) {
        errors.push('El nombre no puede exceder 50 caracteres');
    }

    // Validar comentario
    if (!comentario || typeof comentario !== 'string') {
        errors.push('El comentario es obligatorio');
    } else if (comentario.trim().length < 10) {
        errors.push('El comentario debe tener al menos 10 caracteres');
    } else if (comentario.trim().length > 500) {
        errors.push('El comentario no puede exceder 500 caracteres');
    }

    // Validar calificación
    const calificacionNum = Number(calificacion);
    if (!calificacion) {
        errors.push('La calificación es obligatoria');
    } else if (isNaN(calificacionNum)) {
        errors.push('La calificación debe ser un número');
    } else if (calificacionNum < 1 || calificacionNum > 5) {
        errors.push('La calificación debe ser entre 1 y 5');
    } else if (!Number.isInteger(calificacionNum)) {
        errors.push('La calificación debe ser un número entero');
    }

    if (errors.length > 0) {
        if (process.env.NODE_ENV === 'development') {
            console.log('❌ Errores de validación:', errors);
        }
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('✅ Validación exitosa');
    }
    next();
};

// Rate limiter para la obtención de reseñas
const getReviewsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 solicitudes por ventana por IP
    message: {
        success: false,
        message: 'Demasiadas solicitudes para ver reseñas. Por favor, intenta más tarde.'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// ===== RUTAS DE PERFUMES =====
router.get('/', perfumeController.getAllPerfumes);
router.get('/:id', validateId, perfumeController.getPerfumeById);

// ===== RUTAS DE RESEÑAS =====
router.get('/:id/reviews', validateId, getReviewsLimiter, reviewController.getReviewsByPerfumeId);
router.post('/:id/reviews', validateId, validateReview, reviewController.addReview);

// ===== RUTAS ADICIONALES (COMENTADAS POR AHORA) =====
// router.get('/brands/list', perfumeController.getPerfumeBrands);
// router.get('/stats/overview', perfumeController.getPerfumeStats);

// Manejo de rutas no encontradas en este router
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}`,
        availableRoutes: [
            'GET /api/perfumes',
            'GET /api/perfumes/:id',
            'GET /api/perfumes/:id/reviews',
            'POST /api/perfumes/:id/reviews'
        ]
    });
});

module.exports = router;