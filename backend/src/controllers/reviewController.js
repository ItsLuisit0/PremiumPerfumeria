const { pool } = require('../db/db');

exports.getReviewsByPerfumeId = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el perfume existe
        const [perfume] = await pool.query('SELECT id_perfume FROM perfumes WHERE id_perfume = ?', [id]);
        if (perfume.length === 0) {
            return res.status(404).json({ message: 'Perfume no encontrado' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM reseñas WHERE id_perfume = ? ORDER BY fecha DESC', 
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener reseñas:', error.message);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario, comentario, calificacion } = req.body;

        // Log solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('📝 Recibiendo reseña para perfume ID:', id);
            console.log('📦 Datos recibidos:', { usuario, comentario, calificacion });
        }

        // Validaciones básicas (el middleware ya validó, pero por seguridad)
        if (!usuario || !comentario || !calificacion) {
            return res.status(400).json({ 
                success: false,
                message: 'Todos los campos son obligatorios' 
            });
        }

        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ 
                success: false,
                message: 'La calificación debe ser entre 1 y 5' 
            });
        }

        // Verificar si el perfume existe
        const [perfume] = await pool.query('SELECT id_perfume FROM perfumes WHERE id_perfume = ?', [id]);
        if (perfume.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Perfume no encontrado' 
            });
        }

        // Insertar la reseña
        const [result] = await pool.query(
            'INSERT INTO reseñas (id_perfume, usuario, comentario, calificacion) VALUES (?, ?, ?, ?)',
            [id, usuario.trim(), comentario.trim(), calificacion]
        );

        // Log solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Reseña añadida con ID:', result.insertId);
        }

        res.status(201).json({ 
            success: true,
            message: 'Reseña añadida correctamente', 
            id_reseña: result.insertId 
        });
    } catch (error) {
        console.error('Error al añadir reseña:', error.message);
        
        // Manejar errores específicos de base de datos
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ 
                success: false,
                message: 'Perfume no encontrado' 
            });
        }

        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ 
                success: false,
                message: 'Error de configuración de base de datos: tabla no existe' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};