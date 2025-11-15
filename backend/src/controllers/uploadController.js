const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración para Cloudinary (opcional)
let cloudinary, cloudinaryStorage;
let useCloudinary = false;

try {
    // Intentar cargar Cloudinary si está disponible
    cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    
    // Verificar si hay credenciales de Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        cloudinaryStorage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'perfumeria',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                transformation: [{ width: 800, height: 800, crop: 'limit' }]
            }
        });
        
        useCloudinary = true;
        console.log('✅ Cloudinary configurado correctamente');
    } else {
        console.log('⚠️ Cloudinary no configurado - usando almacenamiento local');
    }
} catch (error) {
    console.log('ℹ️ Cloudinary no disponible - usando almacenamiento local');
}

// Configurar almacenamiento local como fallback
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../..', 'docs', 'ImagenesPerfumes');
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const marca = req.body.marca || 'perfume';
        const nombre = req.body.nombre || 'imagen';
        const ext = path.extname(file.originalname);
        
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

// Configurar multer (usa Cloudinary si está disponible, sino local)
const upload = multer({
    storage: useCloudinary ? cloudinaryStorage : localStorage,
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
        
        console.log('📤 Archivo recibido:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });
        
        let imagenUrl;
        
        if (useCloudinary) {
            // Cloudinary devuelve la URL completa en req.file.path
            imagenUrl = req.file.path || req.file.url;
            
            // Si por alguna razón no está la URL completa, construirla
            if (!imagenUrl || !imagenUrl.startsWith('http')) {
                const publicId = req.file.filename || req.file.public_id;
                imagenUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
            }
            
            console.log('✅ Imagen subida a Cloudinary:', imagenUrl);
        } else {
            // Almacenamiento local - ruta relativa
            imagenUrl = `ImagenesPerfumes/${req.file.filename}`;
            console.log('✅ Imagen guardada localmente:', imagenUrl);
        }
        
        res.json({
            success: true,
            message: 'Imagen subida correctamente',
            data: {
                imagen_url: imagenUrl,
                filename: req.file.filename || req.file.public_id || req.file.originalname,
                size: req.file.size || 0,
                storage: useCloudinary ? 'cloudinary' : 'local'
            }
        });
    } catch (error) {
        console.error('❌ Error al subir imagen:', error);
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

