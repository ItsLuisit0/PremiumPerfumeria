const jwt = require('jsonwebtoken');
const { pool } = require('../db/db');

// Secret key para JWT (debe estar en .env en producción)
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-super-seguro-cambiame-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Middleware para verificar el token JWT
 */
const verifyToken = async (req, res, next) => {
    try {
        // Obtener token del header Authorization o de las cookies
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado. Acceso denegado.'
            });
        }

        // Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verificar si el token ha sido revocado (opcional)
        const [revokedTokens] = await pool.query(
            'SELECT * FROM tokens_revocados WHERE token_jti = ?',
            [decoded.jti]
        );

        if (revokedTokens.length > 0) {
            return res.status(401).json({
                success: false,
                message: 'Token revocado. Por favor inicia sesión nuevamente.'
            });
        }

        // Verificar que el usuario siga activo
        const [users] = await pool.query(
            'SELECT id_admin, username, email, nombre_completo, rol, activo FROM administradores WHERE id_admin = ? AND activo = TRUE',
            [decoded.id_admin]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo.'
            });
        }

        // Agregar información del usuario al request
        req.admin = users[0];
        req.tokenJti = decoded.jti;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor inicia sesión nuevamente.',
                expired: true
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido. Acceso denegado.'
            });
        }

        console.error('Error en verificación de token:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación.'
        });
    }
};

/**
 * Middleware para verificar roles específicos
 */
const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado.'
            });
        }

        if (!allowedRoles.includes(req.admin.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción.',
                requiredRole: allowedRoles,
                yourRole: req.admin.rol
            });
        }

        next();
    };
};

/**
 * Middleware para verificar que sea superadmin
 */
const verifySuperAdmin = verifyRole('superadmin');

/**
 * Middleware para verificar que sea admin o superadmin
 */
const verifyAdmin = verifyRole('superadmin', 'admin');

/**
 * Middleware para verificar cualquier rol autenticado (incluyendo moderador)
 */
const verifyAnyAdmin = verifyRole('superadmin', 'admin', 'moderador');

/**
 * Generar un nuevo token JWT
 */
const generateToken = (admin) => {
    const payload = {
        id_admin: admin.id_admin,
        username: admin.username,
        email: admin.email,
        rol: admin.rol,
        jti: `${admin.id_admin}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Revocar un token (logout)
 */
const revokeToken = async (tokenJti, adminId, razon = 'Logout manual') => {
    try {
        await pool.query(
            'INSERT INTO tokens_revocados (token_jti, id_admin, razon) VALUES (?, ?, ?)',
            [tokenJti, adminId, razon]
        );
        return true;
    } catch (error) {
        console.error('Error al revocar token:', error);
        return false;
    }
};

/**
 * Limpiar tokens revocados expirados (ejecutar periódicamente)
 */
const cleanExpiredTokens = async () => {
    try {
        // Eliminar tokens revocados más antiguos de 7 días
        await pool.query(
            'DELETE FROM tokens_revocados WHERE fecha_revocacion < DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
    } catch (error) {
        console.error('Error al limpiar tokens expirados:', error);
    }
};

module.exports = {
    verifyToken,
    verifyRole,
    verifySuperAdmin,
    verifyAdmin,
    verifyAnyAdmin,
    generateToken,
    revokeToken,
    cleanExpiredTokens,
    JWT_SECRET,
    JWT_EXPIRES_IN
};

