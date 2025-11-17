const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQL_USER || process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: (() => {
        const password = process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
        if (!password && process.env.NODE_ENV === 'production') {
            throw new Error('DB_PASSWORD es requerida en producción. Configura las variables de entorno.');
        }
        return password || '';
    })(),
    database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME || 'perfumeria2',
    port: process.env.MYSQL_PORT || process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexion a base de datos exitosa');
        connection.release();
    } catch (error) {
        console.error('Error de conexion a base de datos:', error.message);
        throw error;
    }
}

let pool;
if (process.env.MYSQL_URL) {
    pool = mysql.createPool(process.env.MYSQL_URL);
} else {
    pool = mysql.createPool(dbConfig);
}

module.exports = { pool, testConnection };
