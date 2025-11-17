const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');
const { verifyToken, verifyRole } = require('../middleware/auth');

const protect = verifyToken;
const authorize = verifyRole;

router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.put('/change-password', protect, authController.changePassword);

router.get('/estadisticas', protect, adminController.getEstadisticas);
router.get('/estadisticas/categoria', protect, adminController.getEstadisticasPorCategoria);
router.get('/estadisticas/marca', protect, adminController.getEstadisticasPorMarca);
router.get('/stock-bajo', protect, adminController.getStockBajo);
router.get('/logs', protect, authorize('superadmin', 'admin'), adminController.getLogs);

router.get('/perfumes', protect, adminController.getAllPerfumesAdmin);
router.get('/perfumes/:id', protect, adminController.getPerfumeById);
router.post('/perfumes', protect, authorize('superadmin', 'admin'), adminController.createPerfume);
router.put('/perfumes/:id', protect, authorize('superadmin', 'admin'), adminController.updatePerfume);
router.delete('/perfumes/:id', protect, authorize('superadmin', 'admin'), adminController.deletePerfume);
router.patch('/perfumes/:id/stock', protect, authorize('superadmin', 'admin'), adminController.updateStock);
router.patch('/perfumes/:id/descuento', protect, authorize('superadmin', 'admin'), adminController.updateDescuento);

router.get('/reviews', protect, adminController.getAllReviews);
router.patch('/reviews/:id/moderar', protect, authorize('superadmin', 'admin', 'moderador'), adminController.moderarReview);
router.patch('/reviews/:id/approve', protect, authorize('superadmin', 'admin', 'moderador'), adminController.moderarReview);
router.delete('/reviews/:id', protect, authorize('superadmin', 'admin'), adminController.deleteReview);

router.post('/upload/imagen', protect, authorize('superadmin', 'admin'), uploadController.uploadMiddleware, uploadController.uploadImage);
router.delete('/upload/imagen/:filename', protect, authorize('superadmin', 'admin'), uploadController.deleteImage);

module.exports = router;

