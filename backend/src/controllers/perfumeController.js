const { pool } = require('../db/db');

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
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url FROM perfumes LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        // Obtener total de perfumes para paginación
        const [total] = await pool.query('SELECT COUNT(*) as total FROM perfumes');
        
        res.json({
            success: true,
            data: rows,
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
            'SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url FROM perfumes WHERE id_perfume = ?', 
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Perfume no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener perfume por ID:', error.message);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};