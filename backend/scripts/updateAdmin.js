require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updateAdmin() {
    console.log('\n🔧 Actualizando administrador...\n');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'perfumeria2'
        });

        console.log('✅ Conectado a la base de datos');

        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        console.log('✅ Hash generado para password: admin123');

        await connection.execute('DELETE FROM administradores WHERE username = ? OR email = ?', 
            ['admin', 'admin@perfumeria.com']);

        console.log('✅ Administrador antiguo eliminado');

        // Insertar nuevo administrador
        const [result] = await connection.execute(
            `INSERT INTO administradores (username, email, password_hash, nombre_completo, rol, activo) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['admin', 'admin@perfumeria.com', hash, 'Administrador Principal', 'superadmin', true]
        );

        console.log('✅ Nuevo administrador creado con ID:', result.insertId);

        // Verificar
        const [admins] = await connection.execute(
            'SELECT id_admin, username, email, nombre_completo, rol, activo FROM administradores WHERE username = ?',
            ['admin']
        );

        console.log('\n📋 Datos del administrador:');
        console.log(admins[0]);

        console.log('\n🔐 Credenciales de acceso:');
        console.log('   Usuario: admin');
        console.log('   Contraseña: admin123');
        console.log('\n✅ ¡Todo listo! Ahora puedes hacer login.');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateAdmin();

