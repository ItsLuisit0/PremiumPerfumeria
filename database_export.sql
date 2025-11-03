-- =====================================================
-- BASE DE DATOS: Premium Perfumeria
-- Para importar en Railway MySQL
-- =====================================================

-- Usar la base de datos (Railway ya la crea)
-- No necesitas CREATE DATABASE

-- =====================================================
-- TABLA: perfumes
-- =====================================================

DROP TABLE IF EXISTS `reseñas`;
DROP TABLE IF EXISTS `perfumes`;

CREATE TABLE `perfumes` (
    `id_perfume` INT AUTO_INCREMENT PRIMARY KEY,
    `marca` VARCHAR(100) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(100),
    `publico` ENUM('Hombre', 'Mujer', 'Unisex'),
    `descripcion` TEXT,
    `notas` TEXT,
    `precio_minimo` DECIMAL(10,2),
    `mililitros` INT,
    `imagen_url` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: reseñas
-- =====================================================

CREATE TABLE `reseñas` (
    `id_reseña` INT AUTO_INCREMENT PRIMARY KEY,
    `id_perfume` INT NOT NULL,
    `usuario` VARCHAR(100) NOT NULL,
    `comentario` TEXT NOT NULL,
    `calificacion` INT NOT NULL,
    `fecha` DATETIME DEFAULT NOW(),
    CONSTRAINT `chk_calificacion` CHECK (`calificacion` BETWEEN 1 AND 5),
    CONSTRAINT `fk_resena_perfume` 
        FOREIGN KEY (`id_perfume`) 
        REFERENCES `perfumes`(`id_perfume`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_perfume` (`id_perfume`),
    INDEX `idx_fecha` (`fecha` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERTAR DATOS: perfumes
-- =====================================================

INSERT INTO `perfumes` (`marca`, `nombre`, `tipo`, `publico`, `descripcion`, `notas`, `precio_minimo`, `mililitros`, `imagen_url`) VALUES
('Versace', 'Eros Flame', 'Eau de Parfum', 'Hombre', 'Fragancia amaderada y especiada con cítricos intensos y un fondo cálido.', 'Es una fragancia amaderada y especiada. Abre con notas cítricas intensas como limón y mandarina, equilibradas con pimienta negra. Tiene un corazón de romero y geranio, y un fondo cálido de vainilla, haba tonka y sándalo.', 435.00, 100, 'imagenesPerfumes/Eros Flame.png'),
('Dior', 'Sauvage', 'Eau de Toilette', 'Hombre', 'Un aroma fresco y especiado, popular, con bergamota y ambroxan.', 'Un aroma fresco y especiado muy popular. Destaca por la bergamota de Calabria y la pimienta de Sichuan. Su base es amaderada y dominada por el ambroxan, que le da un toque mineral y duradero.', 480.00, 100, 'imagenesPerfumes/Sauvage.png'),
('Lattafa', 'Fakhar', 'Eau de Parfum', 'Hombre', 'Fragancia árabe fresca, frutal y aromática con manzana, jengibre y haba tonka.', 'Una fragancia árabe (de Dubái) conocida por ser un aroma fresco, frutal y aromático. Combina notas de manzana, jengibre y bergamota con un corazón de lavanda y salvia, sobre una base de madera de ámbar y haba tonka.', 595.00, 100, 'imagenesPerfumes/Fakhar.png'),
('Carolina Herrera', '212 Men Sexy', 'Eau de Toilette', 'Hombre', 'Fragancia oriental y dulce con notas cítricas, cardamomo, vainilla y ámbar.', 'Una fragancia oriental y dulce. Tiene notas de salida cítricas (mandarina, bergamota) que rápidamente dan paso a un corazón especiado de cardamomo. La base es dulce y magnética, con vainilla, ámbar y maderas.', 690.00, 100, 'imagenesPerfumes/212 Men Sexy.png'),
('Creed', 'Aventus', 'Eau de Parfum', 'Hombre', 'Fragancia de lujo icónica, chipre-frutal con piña, abedul ahumado y ámbar gris.', 'Una fragancia de lujo icónica, chipre-frutal. Famosa por sus notas de salida de piña, bergamota y manzana. Su corazón tiene abedul (que le da un toque ahumado) y jazmín, con una base robusta de almizcle, musgo de roble y ámbar gris.', 550.00, 100, 'imagenesPerfumes/aventus.png'),
('Armaf', 'Club de Nuit Sillage', 'Eau de Parfum', 'Unisex', 'Aroma árabe cítrico, metálico y almizclado, similar a Creed Silver Mountain Water.', 'Otra fragancia árabe, conocida por su inspiración en Creed Silver Mountain Water. Es un aroma cítrico, metálico y almizclado. Abre con limón y bergamota, tiene notas florales de violeta y jazmín, y un fondo de almizcle y sándalo.', 480.00, 100, 'imagenesPerfumes/Club de Nuit Sillage.png'),
('Chanel', 'Bleu de Chanel', 'Eau de Parfum', 'Hombre', 'Clásico moderno, amaderado y aromático con cítricos, jengibre e incienso.', 'Un clásico moderno, amaderado y aromático. Abre con frescura cítrica (pomelo, limón) y menta. El corazón es especiado con jengibre y nuez moscada, y tiene una base profunda de incienso, sándalo y cedro.', 480.00, 100, 'imagenesPerfumes/Bleu de chanel.png'),
('Montblanc', 'Explorer', 'Eau de Parfum', 'Hombre', 'Fragancia amaderada y aromática, similar a Aventus, con bergamota, cuero y ambroxan.', 'Una fragancia amaderada y aromática que comparte similitudes con Creed Aventus. Abre con bergamota y pimienta rosa. Su corazón es de cuero y vetiver, y la base se compone de pachulí y ambroxan.', 480.00, 100, 'imagenesPerfumes/Explorer.png'),
('Carolina Herrera', 'Bad Boy', 'Eau de Toilette', 'Hombre', 'Fragancia oriental y especiada con pimienta, salvia, cacao y haba tonka.', 'Una fragancia oriental y especiada. Se caracteriza por sus notas de pimienta blanca y negra, y bergamota. El corazón es de salvia y cedro, mientras que la base es dulce y oscura, con cacao y haba tonka.', 690.00, 100, 'imagenesPerfumes/Bad Boy.png');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que todo se insertó correctamente
SELECT COUNT(*) AS total_perfumes FROM perfumes;
SELECT COUNT(*) AS total_resenas FROM reseñas;

SELECT 'Base de datos importada correctamente' AS status;

