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

    if (!usuario || usuario.trim().length < 2 || usuario.trim().length > 50) {
        errors.push('El nombre debe tener entre 2 y 50 caracteres');
    }

    if (!comentario || comentario.trim().length < 10 || comentario.trim().length > 500) {
        errors.push('El comentario debe tener entre 10 y 500 caracteres');
    }

    if (!calificacion || calificacion < 1 || calificacion > 5) {
        errors.push('La calificación debe ser entre 1 y 5');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
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