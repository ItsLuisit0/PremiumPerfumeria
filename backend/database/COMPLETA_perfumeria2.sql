-- =====================================================
-- BASE DE DATOS COMPLETA - PERFUMERÍA PREMIUM
-- =====================================================
-- Este script contiene la estructura completa de la base de datos
-- incluyendo tablas, vistas, procedimientos almacenados e INSERTs
-- 
-- INSTRUCCIONES DE USO:
-- 1. Asegúrate de tener MySQL/MariaDB instalado y ejecutándose
-- 2. Ejecuta este script completo en tu cliente MySQL:
--    mysql -u root -p < backend/database/COMPLETA_perfumeria2.sql
--    O copia y pega el contenido en MySQL Workbench o phpMyAdmin
-- 
-- CREDENCIALES POR DEFECTO:
-- Usuario: admin
-- Contraseña: admin123
-- 
-- NOTA: Después de ejecutar este script, cambia la contraseña del administrador
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS perfumeria2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE perfumeria2;

-- =====================================================
-- TABLA: administradores
-- =====================================================
CREATE TABLE IF NOT EXISTS administradores (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol ENUM('superadmin', 'admin', 'moderador') DEFAULT 'admin',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso DATETIME NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: perfumes
-- =====================================================
CREATE TABLE IF NOT EXISTS perfumes (
    id_perfume INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL COMMENT 'Eau de Parfum, Eau de Toilette, etc.',
    publico ENUM('Hombre', 'Mujer', 'Unisex') NOT NULL,
    descripcion TEXT NULL,
    notas TEXT NULL COMMENT 'Notas olfativas',
    precio_minimo DECIMAL(10, 2) NOT NULL,
    mililitros INT NOT NULL,
    imagen_url VARCHAR(255) NULL,
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0.00,
    precio_con_descuento DECIMAL(10, 2) GENERATED ALWAYS AS (
        precio_minimo * (1 - descuento_porcentaje / 100)
    ) STORED,
    stock INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    creado_por INT NULL,
    actualizado_por INT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES administradores(id_admin) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES administradores(id_admin) ON DELETE SET NULL,
    INDEX idx_marca (marca),
    INDEX idx_publico (publico),
    INDEX idx_activo (activo),
    INDEX idx_destacado (destacado),
    INDEX idx_stock (stock),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: reseñas
-- =====================================================
CREATE TABLE IF NOT EXISTS reseñas (
    id_reseña INT AUTO_INCREMENT PRIMARY KEY,
    id_perfume INT NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    comentario TEXT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprobada BOOLEAN DEFAULT FALSE,
    moderada BOOLEAN DEFAULT FALSE,
    moderada_por INT NULL,
    fecha_moderacion DATETIME NULL,
    razon_rechazo TEXT NULL,
    FOREIGN KEY (id_perfume) REFERENCES perfumes(id_perfume) ON DELETE CASCADE,
    FOREIGN KEY (moderada_por) REFERENCES administradores(id_admin) ON DELETE SET NULL,
    INDEX idx_id_perfume (id_perfume),
    INDEX idx_aprobada (aprobada),
    INDEX idx_fecha (fecha),
    INDEX idx_calificacion (calificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: tokens_revocados
-- =====================================================
CREATE TABLE IF NOT EXISTS tokens_revocados (
    token_jti VARCHAR(255) PRIMARY KEY,
    id_admin INT NOT NULL,
    razon VARCHAR(255) NULL,
    fecha_revocacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES administradores(id_admin) ON DELETE CASCADE,
    INDEX idx_id_admin (id_admin),
    INDEX idx_fecha_revocacion (fecha_revocacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: actividad_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS actividad_logs (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    accion VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.',
    tabla VARCHAR(50) NOT NULL,
    id_registro INT NULL,
    datos_anteriores JSON NULL,
    datos_nuevos JSON NULL,
    ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES administradores(id_admin) ON DELETE CASCADE,
    INDEX idx_id_admin (id_admin),
    INDEX idx_accion (accion),
    INDEX idx_tabla (tabla),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VISTAS
-- =====================================================

-- Vista: estadísticas del dashboard
CREATE OR REPLACE VIEW vista_estadisticas_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE) AS total_perfumes_activos,
    (SELECT COUNT(*) FROM reseñas WHERE aprobada = TRUE) AS total_resenas_aprobadas,
    (SELECT SUM(stock) FROM perfumes WHERE activo = TRUE) AS stock_total,
    (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE AND stock = 0) AS productos_sin_stock,
    (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE AND stock > 0 AND stock <= 5) AS productos_stock_critico,
    (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE AND stock > 5 AND stock <= 10) AS productos_stock_bajo,
    (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE AND stock > 10 AND stock <= 20) AS productos_stock_normal,
    (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE AND stock > 20) AS productos_stock_alto,
    (SELECT AVG(calificacion) FROM reseñas WHERE aprobada = TRUE) AS calificacion_promedio,
    (SELECT COUNT(*) FROM perfumes WHERE publico = 'Hombre' AND activo = TRUE) AS perfumes_hombre,
    (SELECT COUNT(*) FROM perfumes WHERE publico = 'Mujer' AND activo = TRUE) AS perfumes_mujer,
    (SELECT COUNT(*) FROM perfumes WHERE publico = 'Unisex' AND activo = TRUE) AS perfumes_unisex;

-- Vista: actividad reciente
CREATE OR REPLACE VIEW vista_actividad_reciente AS
SELECT 
    al.id_actividad,
    al.id_admin,
    a.username,
    a.nombre_completo,
    al.accion,
    al.tabla,
    al.id_registro,
    al.ip,
    al.user_agent,
    al.fecha
FROM actividad_logs al
INNER JOIN administradores a ON al.id_admin = a.id_admin
ORDER BY al.fecha DESC;

-- Vista: stock bajo
CREATE OR REPLACE VIEW vista_stock_bajo AS
SELECT 
    id_perfume,
    marca,
    nombre,
    publico,
    stock,
    precio_minimo,
    CASE 
        WHEN stock = 0 THEN 'Sin Stock'
        WHEN stock <= 5 THEN 'Stock Crítico'
        WHEN stock <= 10 THEN 'Stock Bajo'
        WHEN stock <= 20 THEN 'Stock Normal'
        ELSE 'Stock Alto'
    END AS estado_stock
FROM perfumes
WHERE activo = TRUE AND stock <= 10
ORDER BY stock ASC, nombre ASC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento: Registrar actividad
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_registrar_actividad(
    IN p_id_admin INT,
    IN p_accion VARCHAR(50),
    IN p_tabla VARCHAR(50),
    IN p_id_registro INT,
    IN p_datos_anteriores JSON,
    IN p_datos_nuevos JSON,
    IN p_ip VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO actividad_logs (
        id_admin, accion, tabla, id_registro,
        datos_anteriores, datos_nuevos, ip, user_agent
    ) VALUES (
        p_id_admin, p_accion, p_tabla, p_id_registro,
        p_datos_anteriores, p_datos_nuevos, p_ip, p_user_agent
    );
END //
DELIMITER ;

-- Procedimiento: Estadísticas por categoría
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_estadisticas_por_categoria()
BEGIN
    SELECT 
        publico AS categoria,
        COUNT(*) AS cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE), 2) AS porcentaje
    FROM perfumes
    WHERE activo = TRUE
    GROUP BY publico
    ORDER BY cantidad DESC;
END //
DELIMITER ;

-- Procedimiento: Estadísticas por marca
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_estadisticas_por_marca()
BEGIN
    SELECT 
        marca,
        COUNT(*) AS cantidad_perfumes,
        SUM(stock) AS stock_total,
        AVG(precio_minimo) AS precio_promedio
    FROM perfumes
    WHERE activo = TRUE
    GROUP BY marca
    ORDER BY cantidad_perfumes DESC
    LIMIT 10;
END //
DELIMITER ;

-- =====================================================
-- INSERTS INICIALES
-- =====================================================

-- Insertar administrador inicial
-- Contraseña: admin123 (hash generado con bcrypt)
-- NOTA: Para generar un nuevo hash, ejecutar: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tu_contraseña', 10).then(hash => console.log(hash));"
INSERT INTO administradores (username, email, password_hash, nombre_completo, rol, activo) VALUES
('admin', 'admin@perfumeria.com', '$2a$10$80p2oTu9VOqThgJUc8jt8OANMlYPLf1YpneTeXsDZv.xMDIzuO.Ee', 'Administrador Principal', 'superadmin', TRUE)
ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    nombre_completo = VALUES(nombre_completo),
    rol = VALUES(rol);

-- Insertar perfumes masculinos
INSERT INTO perfumes (marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, stock, activo, destacado) VALUES
('Versace', 'Eros Flame', 'Eau de Parfum', 'Hombre', 'Fragancia masculina intensa y seductora', 'Notas de pimienta roja, limón siciliano, geranio, rosas, vainilla, sándalo', 1200.00, 100, 'ImagenesPerfumes/Eros_Flame.jpg', 15, TRUE, TRUE),
('Dior', 'Sauvage', 'Eau de Toilette', 'Hombre', 'Fragancia fresca y salvaje', 'Notas de bergamota, pimienta, lavanda, patchouli, ambroxán', 1500.00, 100, 'ImagenesPerfumes/Sauvage.PNG', 20, TRUE, TRUE),
('Lattafa', 'Fakhar', 'Eau de Parfum', 'Hombre', 'Fragancia oriental intensa', 'Notas de bergamota, lavanda, sándalo, ámbar, almizcle', 800.00, 100, 'ImagenesPerfumes/Fakhar.PNG', 12, TRUE, FALSE),
('Carolina Herrera', 'Bad Boy', 'Eau de Toilette', 'Hombre', 'Fragancia audaz y moderna', 'Notas de pimienta negra, bergamota, cacao, cuero, tabaco', 1300.00, 100, 'ImagenesPerfumes/Bad_Boy.PNG', 18, TRUE, TRUE),
('Chanel', 'Bleu de Chanel', 'Eau de Parfum', 'Hombre', 'Fragancia elegante y sofisticada', 'Notas de cítricos, jengibre, nuez moscada, sándalo, incienso', 2000.00, 100, 'ImagenesPerfumes/Bleu_de_Chanel.PNG', 10, TRUE, TRUE),
('Creed', 'Aventus', 'Eau de Parfum', 'Hombre', 'Fragancia exclusiva y poderosa', 'Notas de piña, bergamota, manzana, rosa, abedul, pachulí, almizcle', 3500.00, 100, 'ImagenesPerfumes/aventus.png', 8, TRUE, TRUE),
('Montblanc', 'Explorer', 'Eau de Parfum', 'Hombre', 'Fragancia aventurera', 'Notas de bergamota, rosa, vetiver, ambroxán', 1100.00, 100, 'ImagenesPerfumes/Explorer.PNG', 14, TRUE, FALSE),
('Armaf', 'Club de Nuit Sillage', 'Eau de Parfum', 'Hombre', 'Fragancia elegante y sofisticada', 'Notas de bergamota, rosa, sándalo, almizcle', 900.00, 100, 'ImagenesPerfumes/Club_de_Nuit_Sillage.PNG', 16, TRUE, FALSE),
('Carolina Herrera', '212 Men Sexy', 'Eau de Toilette', 'Hombre', 'Fragancia sensual y moderna', 'Notas de bergamota, pimienta, lavanda, cuero, ámbar', 1000.00, 100, 'ImagenesPerfumes/212_Men_Sexy.PNG', 13, TRUE, FALSE),
('Armaf', 'Club de Nuit Intense Man', 'Eau de Parfum', 'Hombre', 'Fragancia intensa y duradera', 'Notas de limón, bergamota, pimienta, rosa, abedul, pachulí, almizcle', 850.00, 100, 'ImagenesPerfumes/Club_de_Nuit_Intense_Man.PNG', 19, TRUE, TRUE),
('Rasasi', 'Hawas for Him', 'Eau de Parfum', 'Hombre', 'Fragancia acuática y fresca', 'Notas de manzana, bergamota, lavanda, ambroxán', 950.00, 100, 'ImagenesPerfumes/Hawas_for_Him.PNG', 11, TRUE, FALSE),
('Lattafa', 'Asad (Original)', 'Eau de Parfum', 'Hombre', 'Fragancia oriental intensa', 'Notas de bergamota, lavanda, sándalo, ámbar, almizcle', 750.00, 100, 'ImagenesPerfumes/Asad_(Original).PNG', 17, TRUE, FALSE),
('Lattafa', 'Asad Bourbon', 'Eau de Parfum', 'Hombre', 'Fragancia con toque bourbon', 'Notas de bergamota, lavanda, bourbon, sándalo, ámbar', 780.00, 100, 'ImagenesPerfumes/Asad_Bourbon.PNG', 15, TRUE, FALSE),
('Jean Paul Gaultier', 'Le Male Elixir', 'Eau de Parfum', 'Hombre', 'Fragancia intensa y seductora', 'Notas de lavanda, cardamomo, vainilla, ámbar, almizcle', 1400.00, 100, 'ImagenesPerfumes/Le_Male_Elixir.PNG', 9, TRUE, TRUE),
('Jean Paul Gaultier', 'Le Male Le Parfum', 'Eau de Parfum', 'Hombre', 'Fragancia elegante y sofisticada', 'Notas de lavanda, cardamomo, vainilla, ámbar', 1350.00, 100, 'ImagenesPerfumes/Le_Male_Le_Parfum.png', 12, TRUE, TRUE),
('Jean Paul Gaultier', 'Le Male Pride Edition', 'Eau de Parfum', 'Hombre', 'Edición especial Pride', 'Notas de lavanda, cardamomo, vainilla, ámbar, almizcle', 1450.00, 100, 'ImagenesPerfumes/Le_Male_Pride_Edition.PNG', 7, TRUE, FALSE),
('Jean Paul Gaultier', 'Le Beau Le Parfum', 'Eau de Parfum', 'Hombre', 'Fragancia fresca y tropical', 'Notas de coco, bergamota, jengibre, vetiver, almizcle', 1300.00, 100, 'ImagenesPerfumes/Le_Beau_Le_Parfum.PNG', 14, TRUE, FALSE),
('Jean Paul Gaultier', 'Le Beau Paradise Garden', 'Eau de Parfum', 'Hombre', 'Fragancia tropical y exótica', 'Notas de coco, bergamota, jengibre, vetiver, almizcle', 1320.00, 100, 'ImagenesPerfumes/Le_Beau_Paradise_Garden.jpg', 10, TRUE, FALSE),
('Valentino', 'Uomo Born in Roma Intense', 'Eau de Parfum', 'Hombre', 'Fragancia intensa y moderna', 'Notas de bergamota, lavanda, vainilla, cuero', 1600.00, 100, 'ImagenesPerfumes/Uomo_Born_in_Roma_Intense.jpg', 8, TRUE, TRUE),
('Valentino', 'Uomo Born in Roma Coral Fantasy', 'Eau de Parfum', 'Hombre', 'Fragancia vibrante y colorida', 'Notas de bergamota, pimienta rosa, vainilla, cuero', 1650.00, 100, 'ImagenesPerfumes/Uomo_Born_in_Roma_Coral_Fantasy.jpg', 6, TRUE, FALSE),
('Giorgio Armani', 'Acqua di Giò Profumo', 'Eau de Parfum', 'Hombre', 'Fragancia acuática y elegante', 'Notas de bergamota, lavanda, incienso, patchouli', 1800.00, 100, 'ImagenesPerfumes/Acqua_di_Giò_Profumo.jpg', 11, TRUE, TRUE),
('Jean Paul Gaultier', 'Scandal Le Parfum Pour Homme', 'Eau de Parfum', 'Hombre', 'Fragancia escandalosa y seductora', 'Notas de miel, lavanda, vainilla, ámbar', 1250.00, 100, 'ImagenesPerfumes/Scandal_Le_Parfum_Pour_Homme.jpg', 13, TRUE, FALSE),
('Yves Saint Laurent', 'Y', 'Eau de Parfum', 'Hombre', 'Fragancia moderna y elegante', 'Notas de manzana, jengibre, geranio, sándalo, cedro', 1700.00, 100, 'ImagenesPerfumes/Y.jpg', 9, TRUE, TRUE),
('Montblanc', 'Legend', 'Eau de Toilette', 'Hombre', 'Fragancia legendaria', 'Notas de lavanda, bergamota, manzana, rosa, eucalipto', 1050.00, 100, 'ImagenesPerfumes/Legend.jpg', 16, TRUE, FALSE),
('Lattafa', '9 AM Dive', 'Eau de Parfum', 'Hombre', 'Fragancia fresca y acuática', 'Notas de bergamota, manzana, lavanda, ambroxán', 700.00, 100, 'ImagenesPerfumes/9_AM_Dive.PNG', 18, TRUE, FALSE),
('Lattafa', '9 PM', 'Eau de Parfum', 'Hombre', 'Fragancia nocturna intensa', 'Notas de bergamota, lavanda, sándalo, ámbar, almizcle', 720.00, 100, 'ImagenesPerfumes/9_PM.jpg', 15, TRUE, FALSE),
('Lattafa', '9 PM Rebel', 'Eau de Parfum', 'Hombre', 'Fragancia rebelde y nocturna', 'Notas de bergamota, lavanda, sándalo, ámbar, almizcle', 750.00, 100, 'ImagenesPerfumes/9_PM_Rebel.PNG', 12, TRUE, FALSE);

-- Insertar perfumes femeninos
INSERT INTO perfumes (marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, stock, activo, destacado) VALUES
('Ariana Grande', 'Sweet Like Candy', 'Eau de Parfum', 'Mujer', 'Fragancia dulce y jugosa', 'Notas de pera, frambuesa, bergamota, flor de algodón, vainilla, almizcle', 900.00, 100, 'ImagenesPerfumes/Sweet_Like_Candy.jpg', 20, TRUE, TRUE),
('Lattafa', 'Yara Moi (Blanco/Rosa)', 'Eau de Parfum', 'Mujer', 'Fragancia dulce y floral', 'Notas de rosa, vainilla, almizcle', 650.00, 100, 'ImagenesPerfumes/Yara_Moi_(Blanco_Rosa).PNG', 18, TRUE, FALSE),
('Lattafa', 'Yara (Rosa)', 'Eau de Parfum', 'Mujer', 'Fragancia floral y dulce', 'Notas de rosa, vainilla, almizcle', 600.00, 100, 'ImagenesPerfumes/Yara_(Rosa).PNG', 22, TRUE, FALSE),
('Lattafa', 'Yara Tous (Naranja)', 'Eau de Parfum', 'Mujer', 'Fragancia cítrica y dulce', 'Notas de naranja, vainilla, almizcle', 620.00, 100, 'ImagenesPerfumes/Yara_Tous_(Naranja).PNG', 19, TRUE, FALSE),
('DKNY', 'Be Delicious Fresh Blossom', 'Eau de Toilette', 'Mujer', 'Fragancia fresca y floral', 'Notas de manzana, rosa, peonía, sándalo', 950.00, 100, 'ImagenesPerfumes/Be_Delicious_Fresh_Blossom.jpg', 14, TRUE, FALSE),
('Carolina Herrera', '212 NYC Women', 'Eau de Toilette', 'Mujer', 'Fragancia urbana y moderna', 'Notas de bergamota, rosa, sándalo, almizcle', 1000.00, 100, 'ImagenesPerfumes/212_0NYC_Women.jpg', 16, TRUE, FALSE),
('Moschino', 'Cheap and Chic - Hippy Fizz', 'Eau de Toilette', 'Mujer', 'Fragancia fresca y jugosa', 'Notas de bergamota, limón, rosa, sándalo', 850.00, 100, 'ImagenesPerfumes/Cheap_and_Chic-Hippy__Fizz.jpg', 17, TRUE, FALSE),
('Moschino', 'Cheap and Chic – Chic Petals', 'Eau de Toilette', 'Mujer', 'Fragancia floral y elegante', 'Notas de rosa, peonía, sándalo, almizcle', 880.00, 100, 'ImagenesPerfumes/Cheap_and_Chic–_Chic_Petals.jpg', 15, TRUE, FALSE),
('Ariana Grande', 'Cloud', 'Eau de Parfum', 'Mujer', 'Fragancia dulce y esponjosa', 'Notas de lavanda, pera, coco, vainilla, almizcle', 920.00, 100, 'ImagenesPerfumes/Cloud.jpg', 21, TRUE, TRUE),
('Chanel', 'Coco Mademoiselle', 'Eau de Parfum', 'Mujer', 'Fragancia elegante y sofisticada', 'Notas de naranja, rosa, jacinto, patchouli, vainilla', 2200.00, 100, 'ImagenesPerfumes/Coco_Mademoiselle.jpg', 8, TRUE, TRUE),
('Ariana Grande', 'Eclaire', 'Eau de Parfum', 'Mujer', 'Fragancia dulce y brillante', 'Notas de pera, frambuesa, flor de algodón, vainilla', 950.00, 100, 'ImagenesPerfumes/Eclaire.jpg', 19, TRUE, FALSE),
('Carolina Herrera', 'Very Good Girl', 'Eau de Parfum', 'Mujer', 'Fragancia elegante y seductora', 'Notas de lichi, rosa, vainilla, pachulí', 1300.00, 100, 'ImagenesPerfumes/Very_Good_Girl.jpg', 12, TRUE, TRUE),
('Lattafa', 'Odyssey Candee (Special Edition)', 'Eau de Parfum', 'Mujer', 'Fragancia dulce y especial', 'Notas de caramelo, vainilla, almizcle', 680.00, 100, 'ImagenesPerfumes/Odyssey_Candee_(Special_Edition).jpg', 20, TRUE, FALSE),
('Moschino', 'Toy 2 Bubble Gum', 'Eau de Toilette', 'Mujer', 'Fragancia divertida y dulce', 'Notas de chicle, rosa, sándalo', 800.00, 100, 'ImagenesPerfumes/Toy_2_Bubble_Gum.jpg', 16, TRUE, FALSE),
('Lattafa', 'Yara Moi', 'Eau de Parfum', 'Mujer', 'Fragancia dulce y floral', 'Notas de rosa, vainilla, almizcle', 640.00, 100, 'ImagenesPerfumes/Yara_Moi.jpg', 23, TRUE, FALSE),
('Cacharel', 'Amor Amor', 'Eau de Toilette', 'Mujer', 'Fragancia romántica y dulce', 'Notas de mandarina, rosa, vainilla, almizcle', 750.00, 100, 'ImagenesPerfumes/Amor_Amor.jpg', 18, TRUE, FALSE),
('Ariana Grande', 'Thank U Next', 'Eau de Parfum', 'Mujer', 'Fragancia moderna y dulce', 'Notas de frambuesa, coco, rosa, vainilla', 980.00, 100, 'ImagenesPerfumes/Thank_U_Next.jpg', 17, TRUE, FALSE),
('DKNY', 'Be Delicious', 'Eau de Toilette', 'Mujer', 'Fragancia fresca y jugosa', 'Notas de manzana, rosa, sándalo, almizcle', 900.00, 100, 'ImagenesPerfumes/Be_Delicious.jpg', 15, TRUE, FALSE),
('Lattafa', 'Fruit Collection - Lemon', 'Eau de Parfum', 'Mujer', 'Fragancia cítrica y fresca', 'Notas de limón, bergamota, vainilla', 580.00, 100, 'ImagenesPerfumes/Fruit_Collection-Lemon.jpg', 24, TRUE, FALSE),
('Lattafa', 'Fruit Collection Orange', 'Eau de Parfum', 'Mujer', 'Fragancia cítrica y dulce', 'Notas de naranja, bergamota, vainilla', 590.00, 100, 'ImagenesPerfumes/Fruit_Collection_Orange.jpg', 22, TRUE, FALSE);

-- Insertar perfumes unisex
INSERT INTO perfumes (marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, stock, activo, destacado) VALUES
('Lattafa', 'Khamrah (Original)', 'Eau de Parfum', 'Unisex', 'Fragancia oriental intensa', 'Notas de canela, nuez, vainilla, ámbar, almizcle', 700.00, 100, 'ImagenesPerfumes/Khamrah_(Original).jpg', 16, TRUE, TRUE),
('Maison Francis Kurkdjian', 'Baccarat Rouge 540', 'Eau de Parfum', 'Unisex', 'Fragancia exclusiva y elegante', 'Notas de azafrán, jasmín, ámbar, almizcle', 4000.00, 100, 'ImagenesPerfumes/Baccarat_Rouge_540.jpg', 5, TRUE, TRUE);

-- Insertar algunas reseñas de ejemplo
INSERT INTO reseñas (id_perfume, usuario, comentario, calificacion, aprobada) VALUES
(1, 'Juan Pérez', 'Excelente fragancia, muy duradera y con un aroma increíble. Recomendado 100%', 5, TRUE),
(1, 'Carlos Rodríguez', 'Buen perfume, pero el olor no es exactamente lo que esperaba', 3, TRUE),
(2, 'María González', 'Me encanta este perfume, es mi favorito. Muy elegante y sofisticado', 5, TRUE),
(2, 'Pedro Martínez', 'Buena calidad, buen precio. Lo recomiendo', 4, TRUE),
(3, 'Ana López', 'Fragancia agradable, pero no muy duradera', 3, TRUE),
(4, 'Luis Fernández', 'Excelente relación calidad-precio. Muy satisfecho', 4, TRUE),
(5, 'Carmen Ruiz', 'Perfume de alta calidad, muy elegante', 5, TRUE),
(6, 'Roberto Sánchez', 'El mejor perfume que he probado. Vale cada peso', 5, TRUE),
(7, 'Laura Torres', 'Fragancia fresca y agradable, perfecta para el día', 4, TRUE),
(8, 'Miguel Díaz', 'Buen perfume, pero esperaba más duración', 3, TRUE);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

