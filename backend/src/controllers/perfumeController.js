const { pool } = require('../db/db');
const fs = require('fs');
const path = require('path');

// Caché de imágenes para evitar búsquedas repetidas en filesystem
const imagenCache = new Map();
let imagenesCacheInitialized = false;

// Inicializar caché de imágenes al arrancar
function inicializarCacheImagenes() {
    if (imagenesCacheInitialized) return;
    
    try {
        const dirImagenes = path.join(__dirname, '../ImagenesPerfumes');
        
        // Verificar si el directorio existe
        if (!fs.existsSync(dirImagenes)) {
            console.warn('⚠️  Directorio de imágenes no encontrado:', dirImagenes);
            imagenesCacheInitialized = true;
            return;
        }
        
        // Leer todos los archivos del directorio
        const archivos = fs.readdirSync(dirImagenes);
        
        archivos.forEach(archivo => {
            // Obtener nombre sin extensión y normalizado
            const nombreSinExt = path.parse(archivo).name.toLowerCase().replace(/\s+/g, '_');
            imagenCache.set(nombreSinExt, `ImagenesPerfumes/${archivo}`);
        });
        
        console.log(`✅ Caché de imágenes inicializado: ${imagenCache.size} imágenes`);
        imagenesCacheInitialized = true;
    } catch (error) {
        console.error('❌ Error al inicializar caché de imágenes:', error.message);
        imagenesCacheInitialized = true;
    }
}

// Función optimizada para encontrar la imagen correcta
function encontrarImagenPerfume(nombrePerfume) {
    // Inicializar caché si no está inicializado
    if (!imagenesCacheInitialized) {
        inicializarCacheImagenes();
    }
    
    // Normalizar nombre del perfume
    const nombreNormalizado = nombrePerfume.toLowerCase().replace(/\s+/g, '_');
    
    // Buscar en caché
    if (imagenCache.has(nombreNormalizado)) {
        return imagenCache.get(nombreNormalizado);
    }
    
    // Si no se encuentra, devolver null
    return null;
}

exports.getAllPerfumes = async (req, res) => {
    try {
        // Paginación opcional
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        // Validar parámetros
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ 
                success: false,
                message: 'El límite debe estar entre 1 y 100' 
            });
        }
        
        if (offset < 0) {
            return res.status(400).json({ 
                success: false,
                message: 'El offset debe ser mayor o igual a 0' 
            });
        }
        
        const [rows] = await pool.query(
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, descuento_porcentaje, precio_con_descuento, activo FROM perfumes WHERE activo = 1 LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        console.log('📦 Perfumes activos encontrados para catálogo:', rows.length);
        
        // Verificar cuántos perfumes hay en total (activos e inactivos)
        const [allPerfumes] = await pool.query('SELECT COUNT(*) as total, SUM(activo = 1) as activos, SUM(activo = 0) as inactivos FROM perfumes');
        console.log('📊 Total en BD:', allPerfumes[0].total, '| Activos:', allPerfumes[0].activos, '| Inactivos:', allPerfumes[0].inactivos);
        
        // Construir URLs de imágenes para perfumes que no tienen imagen_url
        const perfumesConImagenes = rows.map(perfume => {
            if (!perfume.imagen_url) {
                // Buscar imagen con cualquier extensión
                perfume.imagen_url = encontrarImagenPerfume(perfume.nombre);
            }
            return perfume;
        });
        
        // Obtener total de perfumes para paginación
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
        console.error('Error al obtener perfumes:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor' 
        });
    }
};

exports.getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, descuento_porcentaje, precio_con_descuento, activo FROM perfumes WHERE id_perfume = ?', 
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Perfume no encontrado' });
        }
        
        // Construir URL de imagen si no existe
        const perfume = rows[0];
        if (!perfume.imagen_url) {
            perfume.imagen_url = encontrarImagenPerfume(perfume.nombre);
        }
        
        res.json(perfume);
    } catch (error) {
        console.error('Error al obtener perfume por ID:', error.message);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};