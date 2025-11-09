const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || (() => {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('❌ DB_PASSWORD es requerida en producción. Configura las variables de entorno.');
        }
        return '';
    })(),
    database: process.env.DB_NAME || 'perfumeria2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
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
