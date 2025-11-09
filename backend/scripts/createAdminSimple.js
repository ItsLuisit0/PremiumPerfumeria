// Script para crear/actualizar administrador con contraseña "123"
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/db/db');

async function createAdmin() {
    try {
        console.log('\n🔐 Generando hash de contraseña...');
        
        // Generar hash para la contraseña "123"
        const password = '123';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('✅ Hash generado correctamente\n');
        
        // Verificar si el admin ya existe
        const [existing] = await pool.query(
            'SELECT id_admin FROM administradores WHERE username = ?',
            ['admin']
        );
        
        if (existing.length > 0) {
            // Actualizar contraseña existente
            await pool.query(
                'UPDATE administradores SET password_hash = ? WHERE username = ?',
                [hash, 'admin']
            );
            console.log('✅ Contraseña actualizada para el usuario "admin"');
        } else {
            // Insertar nuevo admin
            await pool.query(
                `INSERT INTO administradores (username, email, password_hash, nombre_completo, rol, activo) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['admin', 'admin@perfumeria.com', hash, 'Administrador Principal', 'superadmin', true]
            );
            console.log('✅ Usuario "admin" creado exitosamente');
        }
        
        console.log('\n========================================');
        console.log('CREDENCIALES DE ACCESO:');
        console.log('========================================');
        console.log('Usuario: admin');
        console.log('Contraseña: 123');
        console.log('========================================\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();


