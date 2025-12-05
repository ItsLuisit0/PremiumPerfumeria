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
        const { limit = 100, offset = 0, publico, tipo, coleccion, search } = req.query;

        let query = 'SELECT SQL_CALC_FOUND_ROWS id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, descuento_porcentaje, precio_con_descuento, activo, coleccion, stock FROM perfumes WHERE activo = 1';
        const params = [];

        if (publico) {
            query += ' AND publico = ?';
            params.push(publico);
        }

        if (coleccion) {
            query += ' AND coleccion = ?';
            params.push(coleccion);
        }

        if (search) {
            query += ' AND (nombre LIKE ? OR marca LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (tipo) {
            const tipoLower = tipo.toLowerCase();
            const marcasArabes = ['lattafa', 'armaf', 'rasasi', 'afnan'];
            const marcasDisenador = ['versace', 'dior', 'carolina herrera', 'chanel', 'montblanc', 'jean paul gaultier', 'valentino', 'giorgio armani', 'armani', 'yves saint laurent', 'dkny', 'moschino', 'cacharel'];
            const marcasNicho = ['creed', 'maison francis kurkdjian', 'baccarat'];

            let marcas;
            if (tipoLower.includes('arab')) {
                marcas = marcasArabes;
            } else if (tipoLower.includes('diseñ')) {
                marcas = marcasDisenador;
            } else if (tipoLower.includes('nicho')) {
                marcas = marcasNicho;
            }

            if (marcas) {
                query += ` AND marca IN (${marcas.map(() => '?').join(',')})`;
                params.push(...marcas);
            }
        }

        query += ' ORDER BY coleccion, nombre LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        
        const [totalResult] = await pool.query('SELECT FOUND_ROWS() as total');
        const total = totalResult[0].total;
        
        res.json({
            success: true,
            data: rows, // Devolver las filas directamente
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: total,
                hasMore: parseInt(offset) + parseInt(limit) < total
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
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, descuento_porcentaje, precio_con_descuento, activo, coleccion, stock FROM perfumes WHERE id_perfume = ?', 
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Perfume no encontrado' });
        }
        
        res.json(rows[0]); // Devolver el perfume directamente
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};