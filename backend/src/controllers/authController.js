const bcrypt = require('bcryptjs');
const { pool } = require('../db/db');
const { generateToken, revokeToken } = require('../middleware/auth');

/**
 * Login de administrador
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar datos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos.'
            });
        }

        // Buscar administrador por username o email
        const [admins] = await pool.query(
            'SELECT * FROM administradores WHERE (username = ? OR email = ?) AND activo = TRUE',
            [username, username]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.'
            });
        }

        const admin = admins[0];

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.'
            });
        }

        // Actualizar último acceso
        await pool.query(
            'UPDATE administradores SET ultimo_acceso = NOW() WHERE id_admin = ?',
            [admin.id_admin]
        );

        // Generar token
        const token = generateToken(admin);

        // Preparar datos del admin (sin password)
        const adminData = {
            id_admin: admin.id_admin,
            username: admin.username,
            email: admin.email,
            nombre_completo: admin.nombre_completo,
            rol: admin.rol,
            ultimo_acceso: admin.ultimo_acceso
        };

        // Log de actividad
        await pool.query(
            `CALL sp_registrar_actividad(?, 'LOGIN', 'administradores', ?, NULL, NULL, ?, ?)`,
            [admin.id_admin, admin.id_admin, req.ip, req.get('user-agent')]
        );

        res.json({
            success: true,
            message: 'Login exitoso.',
            token,
            admin: adminData
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al procesar login.'
        });
    }
};

/**
 * Logout de administrador
 */
exports.logout = async (req, res) => {
    try {
        const { id_admin } = req.admin;
        const tokenJti = req.tokenJti;

        // Revocar token
        await revokeToken(tokenJti, id_admin, 'Logout manual');

        // Log de actividad
        await pool.query(
            `CALL sp_registrar_actividad(?, 'LOGOUT', 'administradores', ?, NULL, NULL, ?, ?)`,
            [id_admin, id_admin, req.ip, req.get('user-agent')]
        );

        res.json({
            success: true,
            message: 'Logout exitoso.'
        });

    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al procesar logout.'
        });
    }
};

/**
 * Verificar si el token actual es válido
 */
exports.verifyAuth = async (req, res) => {
    try {
        // Si llegó aquí, el middleware verifyToken ya validó el token
        const { id_admin, username, email, nombre_completo, rol } = req.admin;

        res.json({
            success: true,
            authenticated: true,
            admin: {
                id_admin,
                username,
                email,
                nombre_completo,
                rol
            }
        });

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación.'
        });
    }
};

/**
 * Cambiar contraseña
 */
exports.changePassword = async (req, res) => {
    try {
        const { id_admin } = req.admin;
        const { currentPassword, newPassword } = req.body;

        // Validar datos
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas.'
            });
        }

        // Validar longitud mínima
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 8 caracteres.'
            });
        }

        // Obtener administrador
        const [admins] = await pool.query(
            'SELECT password_hash FROM administradores WHERE id_admin = ?',
            [id_admin]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Administrador no encontrado.'
            });
        }

        // Verificar contraseña actual
        const isPasswordValid = await bcrypt.compare(currentPassword, admins[0].password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta.'
            });
        }

        // Hash de la nueva contraseña
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await pool.query(
            'UPDATE administradores SET password_hash = ? WHERE id_admin = ?',
            [newPasswordHash, id_admin]
        );

        // Log de actividad
        await pool.query(
            `CALL sp_registrar_actividad(?, 'CHANGE_PASSWORD', 'administradores', ?, NULL, NULL, ?, ?)`,
            [id_admin, id_admin, req.ip, req.get('user-agent')]
        );

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente.'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña.'
        });
    }
};

/**
 * Obtener perfil del administrador actual
 */
exports.getProfile = async (req, res) => {
    try {
        const { id_admin } = req.admin;

        const [admins] = await pool.query(
            `SELECT 
                id_admin, username, email, nombre_completo, rol, 
                activo, ultimo_acceso, fecha_creacion
            FROM administradores 
            WHERE id_admin = ?`,
            [id_admin]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Perfil no encontrado.'
            });
        }

        res.json({
            success: true,
            admin: admins[0]
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil.'
        });
    }
};


