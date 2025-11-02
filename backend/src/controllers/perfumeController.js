const { pool } = require('../db/db');

exports.getAllPerfumes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_perfume, marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url FROM perfumes');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener perfumes:', error.message);
        res.status(500).json({ message: 'Error interno del servidor' });
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