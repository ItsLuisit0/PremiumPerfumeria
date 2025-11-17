const bcrypt = require('bcryptjs');
const { pool } = require('../db/db');
const { generateToken, revokeToken } = require('../middleware/auth');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos.'
            });
        }

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

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.'
            });
        }

        await pool.query(
            'UPDATE administradores SET ultimo_acceso = NOW() WHERE id_admin = ?',
            [admin.id_admin]
        );

        const token = generateToken(admin);

        const adminData = {
            id_admin: admin.id_admin,
            username: admin.username,
            email: admin.email,
            nombre_completo: admin.nombre_completo,
            rol: admin.rol,
            ultimo_acceso: admin.ultimo_acceso
        };

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
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al procesar login.'
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const { id_admin } = req.admin;
        const tokenJti = req.tokenJti;

        await revokeToken(tokenJti, id_admin, 'Logout manual');

        await pool.query(
            `CALL sp_registrar_actividad(?, 'LOGOUT', 'administradores', ?, NULL, NULL, ?, ?)`,
            [id_admin, id_admin, req.ip, req.get('user-agent')]
        );

        res.json({
            success: true,
            message: 'Logout exitoso.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al procesar logout.'
        });
    }
};

exports.verifyAuth = async (req, res) => {
    try {
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
        res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación.'
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { id_admin } = req.admin;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas.'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 8 caracteres.'
            });
        }

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

        const isPasswordValid = await bcrypt.compare(currentPassword, admins[0].password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta.'
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE administradores SET password_hash = ? WHERE id_admin = ?',
            [newPasswordHash, id_admin]
        );

        await pool.query(
            `CALL sp_registrar_actividad(?, 'CHANGE_PASSWORD', 'administradores', ?, NULL, NULL, ?, ?)`,
            [id_admin, id_admin, req.ip, req.get('user-agent')]
        );

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña.'
        });
    }
};

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
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil.'
        });
    }
};


