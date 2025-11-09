// Script para crear administrador inicial
// Ejecutar con: node backend/scripts/createAdmin.js

const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
    const password = 'Admin123!'; // Cambiar después del primer login
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('\n========================================');
        console.log('✅ Hash de contraseña generado exitosamente');
        console.log('========================================\n');
        console.log('Usuario: admin');
        console.log('Email: admin@perfumeria.com');
        console.log('Contraseña: Admin123!');
        console.log('\n⚠️  IMPORTANTE: Cambiar esta contraseña después del primer login\n');
        console.log('Hash para insertar en la base de datos:');
        console.log(hash);
        console.log('\n========================================\n');
        console.log('SQL Query para insertar:');
        console.log(`
INSERT INTO administradores (username, email, password_hash, nombre_completo, rol) 
VALUES (
    'admin',
    'admin@perfumeria.com',
    '${hash}',
    'Administrador Principal',
    'superadmin'
);
        `);
        console.log('========================================\n');
    } catch (error) {
        console.error('❌ Error generando hash:', error);
    }
}

generatePasswordHash();

