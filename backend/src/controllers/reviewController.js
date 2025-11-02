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

        // Validaciones
        if (!usuario || !comentario || !calificacion) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ message: 'La calificación debe ser entre 1 y 5' });
        }

        // Verificar si el perfume existe
        const [perfume] = await pool.query('SELECT id_perfume FROM perfumes WHERE id_perfume = ?', [id]);
        if (perfume.length === 0) {
            return res.status(404).json({ message: 'Perfume no encontrado' });
        }

        const [result] = await pool.query(
            'INSERT INTO reseñas (id_perfume, usuario, comentario, calificacion) VALUES (?, ?, ?, ?)',
            [id, usuario, comentario, calificacion]
        );

        res.status(201).json({ 
            message: 'Reseña añadida correctamente', 
            id_reseña: result.insertId 
        });
    } catch (error) {
        console.error('Error al añadir reseña:', error.message);
        
        // Manejar error de FK constraint específico
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'Perfume no encontrado' });
        }
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};