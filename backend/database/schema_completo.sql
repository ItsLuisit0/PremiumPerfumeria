-- Base de datos Railway (usa la base de datos por defecto)
-- No es necesario crear ni seleccionar base de datos en Railway

-- =====================================================
-- TABLA: ADMINISTRADORES
-- =====================================================
CREATE TABLE IF NOT EXISTS administradores (
    id_admin INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol ENUM('superadmin', 'admin', 'moderador') DEFAULT 'admin',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso DATETIME,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_activo (activo),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: PERFUMES
-- =====================================================
CREATE TABLE IF NOT EXISTS perfumes (
    id_perfume INT PRIMARY KEY AUTO_INCREMENT,
    marca VARCHAR(100) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo ENUM('Eau de Parfum', 'Eau de Toilette', 'Colonia', 'Perfume', 'Extracto') DEFAULT 'Eau de Parfum',
    publico ENUM('Hombre', 'Mujer', 'Unisex') NOT NULL,
    descripcion TEXT,
    notas TEXT,
    precio_minimo DECIMAL(10,2) NOT NULL,
    mililitros INT NOT NULL,
    imagen_url VARCHAR(255),
    stock INT DEFAULT 0,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0.00,
    precio_con_descuento DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN descuento_porcentaje > 0 
            THEN ROUND(precio_minimo * (1 - descuento_porcentaje/100), 2)
            ELSE precio_minimo
        END
    ) STORED,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    actualizado_por INT,
    INDEX idx_marca (marca),
    INDEX idx_publico (publico),
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo),
    INDEX idx_destacado (destacado),
    INDEX idx_precio (precio_minimo),
    INDEX idx_descuento (descuento_porcentaje),
    INDEX idx_fecha_creacion (fecha_creacion DESC),
    CONSTRAINT fk_perfumes_creado_por 
        FOREIGN KEY (creado_por) 
        REFERENCES administradores(id_admin) 
        ON DELETE SET NULL,
    CONSTRAINT fk_perfumes_actualizado_por 
        FOREIGN KEY (actualizado_por) 
        REFERENCES administradores(id_admin) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: RESEÑAS
-- =====================================================
CREATE TABLE IF NOT EXISTS reseñas (
    id_reseña INT PRIMARY KEY AUTO_INCREMENT,
    id_perfume INT NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    comentario TEXT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aprobada BOOLEAN DEFAULT TRUE,
    moderada BOOLEAN DEFAULT FALSE,
    moderada_por INT,
    fecha_moderacion DATETIME,
    razon_rechazo TEXT,
    INDEX idx_perfume (id_perfume),
    INDEX idx_fecha (fecha DESC),
    INDEX idx_calificacion (calificacion),
    INDEX idx_aprobada (aprobada),
    INDEX idx_moderada (moderada),
    CONSTRAINT fk_reviews_perfume 
        FOREIGN KEY (id_perfume) 
        REFERENCES perfumes(id_perfume) 
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_moderador 
        FOREIGN KEY (moderada_por) 
        REFERENCES administradores(id_admin) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: TOKENS REVOCADOS (Para JWT)
-- =====================================================
CREATE TABLE IF NOT EXISTS tokens_revocados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    id_admin INT NOT NULL,
    fecha_revocacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    razon VARCHAR(255),
    INDEX idx_token_jti (token_jti),
    INDEX idx_admin (id_admin),
    INDEX idx_fecha (fecha_revocacion),
    CONSTRAINT fk_tokens_admin 
        FOREIGN KEY (id_admin) 
        REFERENCES administradores(id_admin) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: LOGS DE ACTIVIDAD ADMINISTRATIVA
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id_log BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_admin INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    id_registro INT,
    datos_antiguos JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin (id_admin),
    INDEX idx_fecha (fecha DESC),
    INDEX idx_accion (accion),
    INDEX idx_tabla (tabla_afectada),
    CONSTRAINT fk_logs_admin 
        FOREIGN KEY (id_admin) 
        REFERENCES administradores(id_admin) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERTS INICIALES
-- =====================================================

-- Insertar administrador por defecto
-- Contraseña: Admin123! (cambiar después del primer login)
-- Hash generado con bcrypt (10 rounds)
INSERT INTO administradores (username, email, password_hash, nombre_completo, rol) 
VALUES (
    'admin',
    'admin@perfumeria.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1J9J3lG8lT5bXfJ8BXvXf7yTG5tWpJq',
    'Administrador Principal',
    'superadmin'
) ON DUPLICATE KEY UPDATE username = username;

-- Perfumes Caballero
INSERT INTO perfumes (marca, nombre, tipo, publico, descripcion, notas, precio_minimo, mililitros, imagen_url, stock, destacado) VALUES
('Versace', 'Eros Flame', 'Eau de Parfum', 'Hombre', 'Fragancia amaderada y especiada con notas cítricas intensas', 'Limón, mandarina, pimienta negra, romero, geranio, vainilla, haba tonka, sándalo', 435.00, 100, 'ImagenesPerfumes/Eros_Flame.jpg', 15, TRUE),
('Dior', 'Sauvage', 'Eau de Toilette', 'Hombre', 'Aroma fresco y especiado muy popular', 'Bergamota de Calabria, pimienta de Sichuan, ambroxan, notas amaderadas', 480.00, 100, 'ImagenesPerfumes/Sauvage.png', 20, TRUE),
('Lattafa', 'Fakhar', 'Eau de Parfum', 'Hombre', 'Fragancia árabe fresca, frutal y aromática', 'Manzana, jengibre, bergamota, lavanda, salvia, madera de ámbar, haba tonka', 595.00, 100, 'ImagenesPerfumes/Fakhar.png', 12, FALSE),
('Carolina Herrera', '212 Men Sexy', 'Eau de Toilette', 'Hombre', 'Fragancia oriental y dulce con notas magnéticas', 'Mandarina, bergamota, cardamomo, vainilla, ámbar, maderas', 690.00, 100, 'ImagenesPerfumes/212_Men_Sexy.PNG', 8, FALSE),
('Creed', 'Aventus', 'Eau de Parfum', 'Hombre', 'Fragancia de lujo icónica chipre-frutal', 'Piña, bergamota, manzana, abedul, jazmín, almizcle, musgo de roble, ámbar gris', 550.00, 100, 'ImagenesPerfumes/aventus.png', 5, TRUE),
('Armaf', 'Club de Nuit Sillage', 'Eau de Parfum', 'Unisex', 'Fragancia árabe inspirada en Creed Silver Mountain Water', 'Limón, bergamota, violeta, jazmín, almizcle, sándalo', 480.00, 100, 'ImagenesPerfumes/Club_de_Nuit_Sillage.PNG', 10, FALSE),
('Chanel', 'Bleu de Chanel', 'Eau de Parfum', 'Hombre', 'Clásico moderno amaderado y aromático', 'Pomelo, limón, menta, jengibre, nuez moscada, incienso, sándalo, cedro', 480.00, 100, 'ImagenesPerfumes/Bleu_de_Chanel.PNG', 18, TRUE),
('Montblanc', 'Explorer', 'Eau de Parfum', 'Hombre', 'Fragancia amaderada y aromática con similitudes a Creed Aventus', 'Bergamota, pimienta rosa, cuero, vetiver, pachulí, ambroxan', 480.00, 100, 'ImagenesPerfumes/Explorer.png', 10, FALSE),
('Carolina Herrera', 'Bad Boy', 'Eau de Toilette', 'Hombre', 'Fragancia oriental y especiada', 'Pimienta blanca, pimienta negra, bergamota, salvia, cedro, cacao, haba tonka', 690.00, 100, 'ImagenesPerfumes/Bad_Boy.PNG', 7, FALSE),
('Jean Paul Gaultier', 'Le Male Pride Edition', 'Eau de Toilette', 'Hombre', 'Edición especial del clásico Le Male - oriental-fougère', 'Menta, lavanda, canela, vainilla, haba tonka', 690.00, 125, 'ImagenesPerfumes/Le_Male_Pride_Edition.PNG', 6, TRUE),
('Rasasi', 'Hawas for Him', 'Eau de Parfum', 'Hombre', 'Perfume aromático-acuático muy fresco', 'Bergamota, manzana, limón, canela, notas acuáticas, ámbar gris, almizcle, sándalo', 480.00, 100, 'ImagenesPerfumes/Hawas_for_Him.PNG', 14, FALSE),
('Afnan', '9 AM Dive', 'Eau de Parfum', 'Unisex', 'Aroma fresco, limpio y acuático', 'Limón, menta, pimienta rosa, manzana, cedro, pachulí, jengibre, sándalo', 525.00, 100, 'ImagenesPerfumes/9_AM_Dive.PNG', 15, FALSE),
('Afnan', '9 PM', 'Eau de Parfum', 'Hombre', 'Fragancia dulce y nocturna muy popular', 'Manzana, canela, lavanda, vainilla, haba tonka, ámbar', 525.00, 100, 'ImagenesPerfumes/9_PM.jpg', 9, FALSE),
('Afnan', '9 PM Rebel', 'Eau de Parfum', 'Hombre', 'Variante frutal y dulce del 9 PM', 'Piña, manzana, mandarina, vainilla, cedro, caramelo, ámbar gris, almizcle', 525.00, 100, 'ImagenesPerfumes/9_PM_Rebel.PNG', 11, FALSE),
('Armaf', 'Club de Nuit Intense Man', 'Eau de Toilette', 'Hombre', 'Fragancia amaderada-especiada inspirada en Creed Aventus', 'Limón, piña, bergamota, abedul, jazmín, rosa, almizcle, ámbar gris, vainilla', 480.00, 105, 'ImagenesPerfumes/Club_de_Nuit_Intense_Man.PNG', 13, FALSE),
('Lattafa', 'Asad Bourbon', 'Eau de Parfum', 'Hombre', 'Fragancia nueva dulce, especiada y licorosa', 'Lavanda, pimienta rosa, cacao, nuez moscada, Vainilla Bourbon, vetiver, ámbar', 525.00, 100, 'ImagenesPerfumes/Asad_Bourbon.PNG', 8, FALSE),
('Valentino', 'Uomo Born in Roma Intense', 'Eau de Parfum', 'Hombre', 'Fragancia ambarada y dulce potente pero elegante', 'Vainilla bourbon, lavanda, vetiver ahumado', 550.00, 100, 'ImagenesPerfumes/Uomo_Born_in_Roma_Intense.jpg', 6, TRUE),
('Valentino', 'Uomo Born in Roma Coral Fantasy', 'Eau de Parfum', 'Hombre', 'Aroma amaderado y aromático con toque frutal distintivo', 'Manzana roja, cardamomo, lavanda, hoja de tabaco, pachulí', 550.00, 100, 'ImagenesPerfumes/Uomo_Born_in_Roma_Coral_Fantasy.jpg', 7, FALSE),
('Lattafa', 'Asad (Original)', 'Eau de Parfum', 'Hombre', 'Fragancia especiada y cálida muy popular', 'Pimienta negra, piña, tabaco, pachulí, café, vainilla, ámbar, maderas secas', 525.00, 100, 'ImagenesPerfumes/Asad_(Original).PNG', 10, FALSE),
('Jean Paul Gaultier', 'Le Beau Paradise Garden', 'Eau de Parfum', 'Hombre', 'Fragancia tropical, verde y acuática', 'Notas verdes, menta, higo, coco, sal, sándalo, haba tonka', 850.00, 125, 'ImagenesPerfumes/Le_Beau_Paradise_Garden.jpg', 4, TRUE),
('Giorgio Armani', 'Acqua di Giò Profumo', 'Perfume', 'Hombre', 'Fragancia acuática y amaderada muy elegante', 'Notas marinas, bergamota, romero, salvia, incienso, pachulí', 515.00, 125, 'ImagenesPerfumes/Acqua_di_Giò_Profumo.jpg', 9, FALSE),
('Jean Paul Gaultier', 'Scandal Le Parfum Pour Homme', 'Perfume', 'Hombre', 'Versión intensa del Scandal original - ámbar-amaderado', 'Geranio, caramelo, haba tonka, sándalo', 515.00, 100, 'ImagenesPerfumes/Scandal_Le_Parfum_Pour_Homme.jpg', 5, FALSE),
('Montblanc', 'Legend', 'Eau de Toilette', 'Hombre', 'Clásico aromático-fougère', 'Lavanda, bergamota, piña, musgo de roble, manzana roja, geranio, sándalo, haba tonka', 690.00, 100, 'ImagenesPerfumes/Legend.jpg', 12, FALSE),
('Yves Saint Laurent', 'Y', 'Eau de Parfum', 'Hombre', 'Perfume aromático-fougère moderno', 'Manzana, jengibre, bergamota, salvia, geranio, madera de ámbar, haba tonka, vetiver', 480.00, 100, 'ImagenesPerfumes/Y.jpg', 16, FALSE),
('Jean Paul Gaultier', 'Le Male Elixir', 'Perfume', 'Hombre', 'Aromática Fougère Ambarina', 'Lavanda, menta, benjuí, haba tonka, miel, vainilla', 850.00, 125, 'ImagenesPerfumes/Le_Male_Elixir.PNG', 3, TRUE),
('Jean Paul Gaultier', 'Le Male Le Parfum', 'Eau de Parfum', 'Hombre', 'Ambarina Oriental Especiada', 'Cardamomo, lavanda, vainilla, iris, maderas orientales', 850.00, 125, 'ImagenesPerfumes/Le_Male_Le_Parfum.png', 4, FALSE),
('Jean Paul Gaultier', 'Le Beau Le Parfum', 'Eau de Parfum', 'Hombre', 'Amaderada Ambarina Tropical', 'Piña, coco, haba tonka, sándalo, maderas de ámbar', 850.00, 125, 'ImagenesPerfumes/Le_Beau_Le_Parfum.PNG', 3, FALSE),

-- Perfumes Dama
('Lattafa', 'Yara (Rosa)', 'Eau de Parfum', 'Mujer', 'Fragancia gourmand y cremosa', 'Orquídea, heliotropo, notas frutales tropicales, vainilla, sándalo, almizcle', 525.00, 100, 'ImagenesPerfumes/Yara_(Rosa).PNG', 14, FALSE),
('Ariana Grande', 'Sweet Like Candy', 'Eau de Parfum', 'Mujer', 'Fragancia floral-frutal-gourmand', 'Zarzamora, pera, bergamota, malvavisco, crema batida, grosellas negras, vainilla, madera de cachemira', 495.00, 100, 'ImagenesPerfumes/Sweet_Like_Candy.jpg', 18, FALSE),
('Lattafa', 'Yara Tous (Naranja)', 'Eau de Parfum', 'Mujer', 'Fragancia marcadamente tropical y frutal', 'Mango, coco, maracuyá, vainilla, almizcle', 525.00, 100, 'ImagenesPerfumes/Yara_Tous_(Naranja).PNG', 12, FALSE),
('Lattafa', 'Yara Moi (Blanco/Rosa)', 'Eau de Parfum', 'Mujer', 'Fragancia atalcada y floral - Yara blanca', 'Jazmín, durazno, caramelo, ámbar, sándalo, pachulí', 525.00, 100, 'ImagenesPerfumes/Yara_Moi_(Blanco_Rosa).PNG', 11, FALSE),
('DKNY', 'Be Delicious Fresh Blossom', 'Eau de Parfum', 'Mujer', 'Fragancia floral y frutal muy fresca', 'Toronja, chabacano, rosa, jazmín, manzana roja, maderas suaves', 485.00, 100, 'ImagenesPerfumes/Be_Delicious_Fresh_Blossom.jpg', 16, FALSE),
('Moschino', 'Cheap and Chic – Chic Petals', 'Eau de Parfum', 'Mujer', 'Perfume floral y frutal vibrante', 'Granada, fresa, gardenia, lirio de agua, almizcle, madera de hinoki', 700.00, 100, 'ImagenesPerfumes/Cheap_and_Chic–_Chic_Petals.jpg', 8, FALSE),
('Carolina Herrera', '212 NYC Women', 'Eau de Parfum', 'Mujer', 'Clásico floral, limpio y almizclado', 'Flor de cactus, gardenia, camelia, lirio, sándalo, almizcle', 650.00, 100, 'ImagenesPerfumes/212_0NYC_Women.jpg', 9, FALSE),
('Moschino', 'Cheap and Chic - Hippy Fizz', 'Eau de Toilette', 'Mujer', 'Aroma floral-frutal alegre y cítrico', 'Limón de Amalfi, magnolia, hojas de frambuesa, rosa, flor de loto, almizcle, cedro', 550.00, 100, 'ImagenesPerfumes/Cheap_and_Chic-Hippy__Fizz.jpg', 13, FALSE),
('Chanel', 'Coco Mademoiselle', 'Eau de Parfum', 'Mujer', 'Icónico perfume chipre-floral', 'Naranja, bergamota, rosa, jazmín, pachulí, vetiver, vainilla', 555.00, 100, 'ImagenesPerfumes/Coco_Mademoiselle.jpg', 7, TRUE),
('Ariana Grande', 'Cloud', 'Eau de Parfum', 'Mujer', 'Fragancia gourmand muy popular', 'Lavanda, pera, crema batida, praliné, coco, almizcle, notas amaderadas', 510.00, 100, 'ImagenesPerfumes/Cloud.jpg', 20, TRUE),
('Lattafa', 'Eclaire', 'Eau de Parfum', 'Mujer', 'Fragancia gourmand láctica y dulce muy reciente', 'Caramelo, leche, azúcar, miel, flores blancas, vainilla, praliné', 550.00, 100, 'ImagenesPerfumes/Eclaire.jpg', 10, FALSE),
('Carolina Herrera', 'Very Good Girl', 'Eau de Parfum', 'Mujer', 'Perfume floral-frutal atrevido y juguetón', 'Lichi, grosella roja, rosa, vainilla, vetiver', 680.00, 100, 'ImagenesPerfumes/Very_Good_Girl.jpg', 8, FALSE),
('Armaf', 'Odyssey Candee (Special Edition)', 'Eau de Parfum', 'Mujer', 'Fragancia frutal y gourmand', 'Fresa, frambuesa, durazno, caramelo, maracuyá, ámbar, pachulí, almizcle', 525.00, 100, 'ImagenesPerfumes/Odyssey_Candee_(Special_Edition).jpg', 11, FALSE),
('Moschino', 'Toy 2 Bubble Gum', 'Eau de Toilette', 'Mujer', 'Fragancia floral-frutal-gourmand', 'Goma de mascar, frutas confitadas, limón, naranja, rosa, durazno, jengibre, almizcle, cedro', 550.00, 100, 'ImagenesPerfumes/Toy_2_Bubble_Gum.jpg', 14, FALSE),
('Lattafa', 'Yara Moi', 'Eau de Parfum', 'Mujer', 'Fragancia floral y gourmand - Yara blanca', 'Durazno, jazmín, caramelo, ámbar, sándalo, pachulí', 525.00, 100, 'ImagenesPerfumes/Yara_Moi.jpg', 12, FALSE),
('Cacharel', 'Amor Amor', 'Eau de Toilette', 'Mujer', 'Clásico floral-frutal para jóvenes', 'Grosella negra, naranja, mandarina, rosa, jazmín, vainilla, ámbar, almizcle', 465.00, 100, 'ImagenesPerfumes/Amor_Amor.jpg', 19, FALSE),
('Ariana Grande', 'Thank U Next', 'Eau de Parfum', 'Mujer', 'Fragancia floral-frutal-gourmand', 'Frambuesa, pera, coco, rosa, macarrones dulces, almizcle', 495.00, 100, 'ImagenesPerfumes/Thank_U_Next.jpg', 17, FALSE),
('Moschino', 'Toy 2', 'Eau de Parfum', 'Mujer', 'Aroma floral y amaderado fresco y limpio', 'Manzana, mandarina, magnolia, peonía, jazmín, sándalo, almizcle', 550.00, 100, 'ImagenesPerfumes/Toy_2.jpg', 15, FALSE),
('DKNY', 'Be Delicious', 'Eau de Parfum', 'Mujer', 'Perfume icónico floral y frutal', 'Manzana verde, pepino, toronja, nardos, lirio de los valles, rosa, maderas', 485.00, 100, 'ImagenesPerfumes/Be_Delicious.jpg', 16, FALSE),

-- Perfumes Unisex
('Lattafa', 'Khamrah (Original)', 'Eau de Parfum', 'Unisex', 'Fragancia gourmand, cálida y especiada', 'Canela, nuez moscada, dátiles, praliné, vainilla, haba tonka, ámbar', 630.00, 100, 'ImagenesPerfumes/Khamrah_(Original).jpg', 9, TRUE),
('Lattafa', 'Khamrah Qahwa', 'Eau de Parfum', 'Unisex', 'Versión flanker del Khamrah original enfocada en café', 'Canela, praliné, vainilla, café, notas especiadas', 630.00, 100, NULL, 8, FALSE),
('Maison Francis Kurkdjian', 'Baccarat Rouge 540', 'Extracto', 'Unisex', 'Versión intensa del icónico BR540 - aroma ámbar-floral', 'Almendra amarga, azafrán, jazmín egipcio, cedro, ámbar gris, almizcle, notas amaderadas', 690.00, 70, 'ImagenesPerfumes/Baccarat_Rouge_540.jpg', 3, TRUE),
('Dolce & Gabbana', 'Fruit Collection - Lemon', 'Eau de Toilette', 'Unisex', 'Fragancia cítrica y aromática', 'Limón siciliano, bergamota, jengibre, vetiver', 555.00, 150, 'ImagenesPerfumes/Fruit_Collection-Lemon.jpg', 12, FALSE),
('Dolce & Gabbana', 'Fruit Collection Orange', 'Eau de Toilette', 'Unisex', 'Fragancia cítrica floral fresca', 'Naranja sanguina, albahaca, flor de azahar del naranjo (Neroli), ámbar', 555.00, 100, 'ImagenesPerfumes/Fruit_Collection_Orange.jpg', 11, FALSE);

-- =====================================================
-- VISTAS PARA EL DASHBOARD
-- =====================================================

-- Vista: Estadísticas generales del dashboard
CREATE OR REPLACE VIEW vista_estadisticas_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM perfumes WHERE activo = TRUE) as total_perfumes_activos,
    (SELECT COUNT(*) FROM perfumes WHERE activo = FALSE) as total_perfumes_inactivos,
    (SELECT COUNT(*) FROM perfumes WHERE destacado = TRUE) as total_perfumes_destacados,
    (SELECT COUNT(*) FROM reseñas WHERE aprobada = TRUE) as total_reviews_aprobadas,
    (SELECT COUNT(*) FROM reseñas WHERE aprobada = FALSE OR moderada = FALSE) as total_reviews_pendientes,
    (SELECT ROUND(AVG(calificacion), 2) FROM reseñas WHERE aprobada = TRUE) as promedio_calificaciones,
    (SELECT SUM(stock) FROM perfumes WHERE activo = TRUE) as stock_total,
    (SELECT COUNT(*) FROM perfumes WHERE stock <= 5 AND activo = TRUE) as productos_stock_bajo,
    (SELECT COUNT(*) FROM perfumes WHERE stock = 0 AND activo = TRUE) as productos_sin_stock,
    (SELECT COUNT(DISTINCT publico) FROM perfumes WHERE activo = TRUE) as categorias_activas,
    (SELECT COUNT(DISTINCT marca) FROM perfumes WHERE activo = TRUE) as marcas_activas,
    (SELECT COUNT(*) FROM administradores WHERE activo = TRUE) as total_admins_activos;

-- Vista: Perfumes más reseñados
CREATE OR REPLACE VIEW vista_perfumes_mas_resenados AS
SELECT 
    p.id_perfume,
    p.nombre,
    p.marca,
    p.imagen_url,
    p.precio_minimo,
    p.descuento_porcentaje,
    p.precio_con_descuento,
    p.stock,
    COUNT(r.id_reseña) as total_reviews,
    ROUND(AVG(r.calificacion), 2) as promedio_calificacion
FROM perfumes p
LEFT JOIN reseñas r ON p.id_perfume = r.id_perfume AND r.aprobada = TRUE
WHERE p.activo = TRUE
GROUP BY p.id_perfume, p.nombre, p.marca, p.imagen_url, p.precio_minimo, 
         p.descuento_porcentaje, p.precio_con_descuento, p.stock
ORDER BY total_reviews DESC
LIMIT 10;

-- Vista: Perfumes mejor calificados
CREATE OR REPLACE VIEW vista_perfumes_mejor_calificados AS
SELECT 
    p.id_perfume,
    p.nombre,
    p.marca,
    p.imagen_url,
    p.precio_minimo,
    p.descuento_porcentaje,
    p.precio_con_descuento,
    COUNT(r.id_reseña) as total_reviews,
    ROUND(AVG(r.calificacion), 2) as promedio_calificacion
FROM perfumes p
INNER JOIN reseñas r ON p.id_perfume = r.id_perfume AND r.aprobada = TRUE
WHERE p.activo = TRUE
GROUP BY p.id_perfume, p.nombre, p.marca, p.imagen_url, p.precio_minimo,
         p.descuento_porcentaje, p.precio_con_descuento
HAVING COUNT(r.id_reseña) >= 3
ORDER BY promedio_calificacion DESC, total_reviews DESC
LIMIT 10;

-- Vista: Actividad reciente de administradores
CREATE OR REPLACE VIEW vista_actividad_reciente AS
SELECT 
    al.id_log,
    a.username,
    a.nombre_completo,
    a.rol,
    al.accion,
    al.tabla_afectada,
    al.id_registro,
    al.fecha
FROM admin_logs al
INNER JOIN administradores a ON al.id_admin = a.id_admin
ORDER BY al.fecha DESC
LIMIT 50;

-- Vista: Reseñas pendientes de moderación
CREATE OR REPLACE VIEW vista_reviews_pendientes AS
SELECT 
    r.id_reseña,
    r.id_perfume,
    p.nombre as nombre_perfume,
    p.marca,
    r.usuario,
    r.comentario,
    r.calificacion,
    r.fecha,
    r.aprobada,
    r.moderada
FROM reseñas r
INNER JOIN perfumes p ON r.id_perfume = p.id_perfume
WHERE r.aprobada = FALSE OR r.moderada = FALSE
ORDER BY r.fecha DESC;

-- Vista: Perfumes con stock bajo
CREATE OR REPLACE VIEW vista_stock_bajo AS
SELECT 
    id_perfume,
    nombre,
    marca,
    stock,
    precio_minimo,
    activo,
    CASE 
        WHEN stock = 0 THEN 'SIN STOCK'
        WHEN stock <= 5 THEN 'CRÍTICO'
        WHEN stock <= 10 THEN 'BAJO'
        ELSE 'NORMAL'
    END as estado_stock
FROM perfumes
WHERE stock <= 10 AND activo = TRUE
ORDER BY stock ASC, nombre ASC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento: Registrar actividad administrativa
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_registrar_actividad(
    IN p_id_admin INT,
    IN p_accion VARCHAR(100),
    IN p_tabla VARCHAR(50),
    IN p_id_registro INT,
    IN p_datos_antiguos JSON,
    IN p_datos_nuevos JSON,
    IN p_ip VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO admin_logs (
        id_admin, accion, tabla_afectada, id_registro, 
        datos_antiguos, datos_nuevos, ip_address, user_agent
    ) VALUES (
        p_id_admin, p_accion, p_tabla, p_id_registro,
        p_datos_antiguos, p_datos_nuevos, p_ip, p_user_agent
    );
END//
DELIMITER ;

-- Procedimiento: Obtener estadísticas por categoría
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_estadisticas_por_categoria()
BEGIN
    SELECT 
        publico as categoria,
        COUNT(*) as total_productos,
        COUNT(CASE WHEN activo = TRUE THEN 1 END) as productos_activos,
        COUNT(CASE WHEN destacado = TRUE THEN 1 END) as productos_destacados,
        SUM(stock) as stock_total,
        ROUND(AVG(precio_minimo), 2) as precio_promedio,
        ROUND(AVG(descuento_porcentaje), 2) as descuento_promedio
    FROM perfumes
    GROUP BY publico
    ORDER BY publico;
END//
DELIMITER ;

-- Procedimiento: Obtener estadísticas por marca
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_estadisticas_por_marca()
BEGIN
    SELECT 
        marca,
        COUNT(*) as total_productos,
        COUNT(CASE WHEN activo = TRUE THEN 1 END) as productos_activos,
        SUM(stock) as stock_total,
        ROUND(AVG(precio_minimo), 2) as precio_promedio,
        (SELECT COUNT(*) FROM reseñas r 
         INNER JOIN perfumes p2 ON r.id_perfume = p2.id_perfume 
         WHERE p2.marca = p.marca AND r.aprobada = TRUE) as total_reviews
    FROM perfumes p
    GROUP BY marca
    ORDER BY total_productos DESC;
END//
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Validar calificación antes de insertar reseña
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_validar_calificacion_insert
BEFORE INSERT ON reseñas
FOR EACH ROW
BEGIN
    IF NEW.calificacion < 1 OR NEW.calificacion > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La calificación debe estar entre 1 y 5';
    END IF;
END//
DELIMITER ;

-- Trigger: Validar calificación antes de actualizar reseña
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_validar_calificacion_update
BEFORE UPDATE ON reseñas
FOR EACH ROW
BEGIN
    IF NEW.calificacion < 1 OR NEW.calificacion > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La calificación debe estar entre 1 y 5';
    END IF;
END//
DELIMITER ;

-- Trigger: Validar precio antes de insertar perfume
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_validar_precio_insert
BEFORE INSERT ON perfumes
FOR EACH ROW
BEGIN
    IF NEW.precio_minimo <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El precio debe ser mayor a 0';
    END IF;
    IF NEW.descuento_porcentaje < 0 OR NEW.descuento_porcentaje > 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El descuento debe estar entre 0 y 100';
    END IF;
END//
DELIMITER ;

-- Trigger: Validar precio antes de actualizar perfume
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_validar_precio_update
BEFORE UPDATE ON perfumes
FOR EACH ROW
BEGIN
    IF NEW.precio_minimo <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El precio debe ser mayor a 0';
    END IF;
    IF NEW.descuento_porcentaje < 0 OR NEW.descuento_porcentaje > 100 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El descuento debe estar entre 0 y 100';
    END IF;
END//
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
-- Nota: Comentados porque MySQL no soporta IF NOT EXISTS en CREATE INDEX
-- Los índices principales ya están definidos en las tablas
-- CREATE INDEX idx_perfumes_activo_destacado ON perfumes(activo, destacado);
-- CREATE INDEX idx_perfumes_activo_publico ON perfumes(activo, publico);
-- CREATE INDEX idx_perfumes_activo_marca ON perfumes(activo, marca);
-- CREATE INDEX idx_reviews_perfume_aprobada ON reseñas(id_perfume, aprobada);
-- CREATE INDEX idx_reviews_fecha_aprobada ON reseñas(fecha DESC, aprobada);
-- CREATE INDEX idx_perfumes_busqueda ON perfumes(activo, publico, tipo, precio_minimo);
-- CREATE INDEX idx_resenias_moderacion ON reseñas(aprobada, moderada, fecha);
-- CREATE INDEX idx_admin_logs_busqueda ON admin_logs(id_admin, fecha, accion);


