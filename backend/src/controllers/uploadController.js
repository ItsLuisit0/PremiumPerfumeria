const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Guardar en la carpeta de imágenes del frontend
        const uploadPath = path.join(__dirname, '../../..', 'docs', 'ImagenesPerfumes');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Sanitizar nombre del archivo
        const marca = req.body.marca || 'perfume';
        const nombre = req.body.nombre || 'imagen';
        const ext = path.extname(file.originalname);
        
        // Crear nombre único con timestamp
        const nombreArchivo = `${marca}_${nombre}_${Date.now()}${ext}`
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_.-]/g, '');
        
        cb(null, nombreArchivo);
    }
});

// Filtrar tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: fileFilter
});

// Controlador para subir imagen
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ninguna imagen'
            });
        }
        
        // Ruta relativa de la imagen
        const imagenUrl = `ImagenesPerfumes/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Imagen subida correctamente',
            data: {
                imagen_url: imagenUrl,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen',
            error: error.message
        });
    }
};

// Middleware de multer para usar en las rutas
exports.uploadMiddleware = upload.single('imagen');

// Eliminar imagen
exports.deleteImage = async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó el nombre del archivo'
            });
        }
        
        const imagePath = path.join(__dirname, '../../..', 'docs', 'ImagenesPerfumes', filename);
        
        // Verificar si el archivo existe
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            res.json({
                success: true,
                message: 'Imagen eliminada correctamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Imagen no encontrada'
            });
        }
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la imagen',
            error: error.message
        });
    }
};

