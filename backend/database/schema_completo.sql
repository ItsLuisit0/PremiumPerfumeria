-- ============================================
-- SCRIPT COMPLETO PARA BASE DE DATOS EN PRODUCCIÓN
-- Perfumería Premium - Railway
-- ============================================

-- Crear base de datos (si no existe)
-- CREATE DATABASE IF NOT EXISTS perfumeria2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE perfumeria2;

-- ============================================
-- TABLA: perfumes
-- ============================================
CREATE TABLE IF NOT EXISTS perfumes (
    id_perfume INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(50),
    publico ENUM('Hombre', 'Mujer', 'Unisex') NOT NULL,
    descripcion TEXT,
    notas TEXT,
    precio_minimo DECIMAL(10, 2) NOT NULL,
    mililitros INT DEFAULT 100,
    imagen_url VARCHAR(500),
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
    precio_con_descuento DECIMAL(10, 2) GENERATED ALWAYS AS (precio_minimo - (precio_minimo * descuento_porcentaje / 100)) STORED,
    stock INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    coleccion VARCHAR(100) NULL,
    creado_por INT,
    actualizado_por INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_publico (publico),
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo),
    INDEX idx_marca (marca),
    INDEX idx_coleccion (coleccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: reseñas
-- ============================================
CREATE TABLE IF NOT EXISTS reseñas (
    id_reseña INT AUTO_INCREMENT PRIMARY KEY,
    id_perfume INT NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    comentario TEXT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aprobada BOOLEAN DEFAULT FALSE,
    moderada BOOLEAN DEFAULT FALSE,
    moderada_por INT,
    fecha_moderacion TIMESTAMP NULL,
    razon_rechazo TEXT,
    FOREIGN KEY (id_perfume) REFERENCES perfumes(id_perfume) ON DELETE CASCADE,
    INDEX idx_perfume (id_perfume),
    INDEX idx_fecha (fecha),
    INDEX idx_aprobada (aprobada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: administradores
-- ============================================
CREATE TABLE IF NOT EXISTS administradores (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150),
    rol ENUM('superadmin', 'admin', 'moderador') DEFAULT 'admin',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: tokens_revocados
-- ============================================
CREATE TABLE IF NOT EXISTS tokens_revocados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    id_admin INT NOT NULL,
    razon VARCHAR(255),
    fecha_revocacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES administradores(id_admin) ON DELETE CASCADE,
    INDEX idx_token_jti (token_jti),
    INDEX idx_fecha (fecha_revocacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: actividad_admin (Opcional - para logs)
-- ============================================
CREATE TABLE IF NOT EXISTS actividad_admin (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CHANGE_PASSWORD') NOT NULL,
    tabla_afectada VARCHAR(50),
    id_registro INT,
    datos_antiguos JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES administradores(id_admin) ON DELETE CASCADE,
    INDEX idx_admin (id_admin),
    INDEX idx_fecha (fecha),
    INDEX idx_accion (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VISTA: vista_actividad_reciente
-- ============================================
CREATE OR REPLACE VIEW vista_actividad_reciente AS
SELECT 
    a.id_actividad,
    a.accion,
    a.tabla_afectada,
    a.id_registro,
    a.fecha,
    ad.username,
    ad.nombre_completo,
    a.ip_address
FROM actividad_admin a
INNER JOIN administradores ad ON a.id_admin = ad.id_admin
ORDER BY a.fecha DESC
LIMIT 100;

-- ============================================
-- STORED PROCEDURE: sp_registrar_actividad
-- ============================================
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_registrar_actividad(
    IN p_id_admin INT,
    IN p_accion VARCHAR(50),
    IN p_tabla VARCHAR(50),
    IN p_id_registro INT,
    IN p_datos_antiguos JSON,
    IN p_datos_nuevos JSON,
    IN p_ip VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO actividad_admin (
        id_admin, accion, tabla_afectada, id_registro,
        datos_antiguos, datos_nuevos, ip_address, user_agent
    ) VALUES (
        p_id_admin, p_accion, p_tabla, p_id_registro,
        p_datos_antiguos, p_datos_nuevos, p_ip, p_user_agent
    );
END$$

DELIMITER ;

-- ============================================
-- STORED PROCEDURE: sp_estadisticas_por_marca
-- ============================================
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_estadisticas_por_marca()
BEGIN
    SELECT 
        marca,
        COUNT(*) as total,
        AVG(precio_minimo) as precio_promedio,
        SUM(stock) as stock_total
    FROM perfumes
    WHERE activo = TRUE
    GROUP BY marca
    ORDER BY total DESC;
END$$

DELIMITER ;

-- ============================================
-- VERIFICACIONES
-- ============================================

-- Verificar que todas las tablas se crearon
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('perfumes', 'reseñas', 'administradores', 'tokens_revocados', 'actividad_admin');

-- Verificar columnas de la tabla perfumes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'perfumes'
ORDER BY ORDINAL_POSITION;

