const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perfumeria'
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos establecida correctamente.');
        connection.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    }
}

module.exports = { pool, testConnection };
