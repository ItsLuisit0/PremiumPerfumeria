-- =====================================================
-- CORRECCIÓN DE IMÁGENES FALTANTES
-- =====================================================
-- Este script corrige los perfumes con imágenes faltantes o NULL
-- =====================================================

USE perfumeria2;

-- 1. Khamrah Qahwa no tiene imagen - usar la misma que Khamrah Original
UPDATE perfumes 
SET imagen_url = 'ImagenesPerfumes/Khamrah_(Original).jpg' 
WHERE nombre = 'Khamrah Qahwa';

-- 2. Toy 2 busca Toy_2.jpg pero el archivo es Toy_2_Bubble_Gum.jpg
-- Usar la imagen de Toy 2 Bubble Gum para ambos
UPDATE perfumes 
SET imagen_url = 'ImagenesPerfumes/Toy_2_Bubble_Gum.jpg' 
WHERE nombre = 'Toy 2';

-- Verificar las correcciones
SELECT nombre, imagen_url 
FROM perfumes 
WHERE nombre IN ('Khamrah Qahwa', 'Toy 2');

-- Verificar que no haya más perfumes sin imagen
SELECT nombre, marca, imagen_url 
FROM perfumes 
WHERE imagen_url IS NULL AND activo = TRUE;

