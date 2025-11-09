const { pool } = require('../db/db');
const fs = require('fs');
const path = require('path');

// Función auxiliar para encontrar la imagen correcta
function encontrarImagenPerfume(nombrePerfume) {
    const dirImagenes = path.join(__dirname, '../ImagenesPerfumes');
    const nombreBase = nombrePerfume.replace(/\s+/g, '_');
    
    // Extensiones posibles a buscar
    const extensiones = ['.PNG', '.png', '.jpg', '.jpeg', '.JPG', '.JPEG'];
    
    // Buscar archivo con cualquier extensión
    for (const ext of extensiones) {
        const nombreArchivo = `${nombreBase}${ext}`;
        const rutaCompleta = path.join(dirImagenes, nombreArchivo);
        
        if (fs.existsSync(rutaCompleta)) {
            return `ImagenesPerfumes/${nombreArchivo}`;
        }
    }
    
    // Si no se encuentra, devolver null para usar placeholder
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
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, descuento_porcentaje, precio_con_descuento, activo FROM perfumes WHERE activo = TRUE LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        // Construir URLs de imágenes para perfumes que no tienen imagen_url
        const perfumesConImagenes = rows.map(perfume => {
            if (!perfume.imagen_url) {
                // Buscar imagen con cualquier extensión
                perfume.imagen_url = encontrarImagenPerfume(perfume.nombre);
            }
            return perfume;
        });
        
        // Obtener total de perfumes para paginación
        const [total] = await pool.query('SELECT COUNT(*) as total FROM perfumes WHERE activo = TRUE');
        
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