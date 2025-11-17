const { pool } = require('../db/db');
const fs = require('fs');
const path = require('path');

const imagenCache = new Map();
let imagenesCacheInitialized = false;

function inicializarCacheImagenes() {
    if (imagenesCacheInitialized) return;
    
    try {
        const dirImagenes = path.join(__dirname, '../ImagenesPerfumes');
        
        if (!fs.existsSync(dirImagenes)) {
            imagenesCacheInitialized = true;
            return;
        }
        
        const archivos = fs.readdirSync(dirImagenes);
        
        archivos.forEach(archivo => {
            const nombreSinExt = path.parse(archivo).name.toLowerCase().replace(/\s+/g, '_');
            imagenCache.set(nombreSinExt, `ImagenesPerfumes/${archivo}`);
        });
        
        imagenesCacheInitialized = true;
    } catch (error) {
        imagenesCacheInitialized = true;
    }
}

function encontrarImagenPerfume(nombrePerfume) {
    if (!imagenesCacheInitialized) {
        inicializarCacheImagenes();
    }
    
    const nombreNormalizado = nombrePerfume.toLowerCase().replace(/\s+/g, '_');
    
    if (imagenCache.has(nombreNormalizado)) {
        return imagenCache.get(nombreNormalizado);
    }
    
    return null;
}

exports.getAllPerfumes = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ 
                success: false,
                message: 'El limite debe estar entre 1 y 100' 
            });
        }
        
        if (offset < 0) {
            return res.status(400).json({ 
                success: false,
                message: 'El offset debe ser mayor o igual a 0' 
            });
        }
        
        const [rows] = await pool.query(
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, descuento_porcentaje, precio_con_descuento, activo, coleccion FROM perfumes WHERE activo = 1 LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        const perfumesConImagenes = rows.map(perfume => {
            if (!perfume.imagen_url) {
                perfume.imagen_url = encontrarImagenPerfume(perfume.nombre);
            }
            return perfume;
        });
        
        const [total] = await pool.query('SELECT COUNT(*) as total FROM perfumes WHERE activo = 1');
        
        res.json({
            success: true,
            data: perfumesConImagenes,
            pagination: {
                limit,
                offset,
                total: total[0].total,
                hasMore: offset + limit < total[0].total
            }
        });
    } catch (error) {
        console.error('Error en getAllPerfumes:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, descuento_porcentaje, precio_con_descuento, activo, coleccion FROM perfumes WHERE id_perfume = ?', 
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Perfume no encontrado' });
        }
        
        const perfume = rows[0];
        if (!perfume.imagen_url) {
            perfume.imagen_url = encontrarImagenPerfume(perfume.nombre);
        }
        
        res.json(perfume);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};