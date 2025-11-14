-- =====================================================
-- CORRECCIÓN DE IMÁGENES FALTANTES
-- =====================================================
-- Este script corrige los perfumes con imágenes faltantes o NULL
-- =====================================================

-- Cambiar según el entorno: 'railway' para producción, 'perfumeria2' para local
USE perfumeria2;

-- Primero, ver los IDs de los perfumes a actualizar
SELECT id_perfume, nombre, imagen_url FROM perfumes WHERE nombre IN ('Khamrah Qahwa', 'Toy 2');

-- Deshabilitar temporalmente el safe update mode
SET SQL_SAFE_UPDATES = 0;

-- 1. Khamrah Qahwa no tiene imagen - usar la misma que Khamrah Original
UPDATE perfumes 
SET imagen_url = 'ImagenesPerfumes/Khamrah_Qahwa.png' 
WHERE nombre = 'Khamrah Qahwa';

-- 2. Toy 2 busca Toy_2.jpg pero el archivo es Toy_2_Bubble_Gum.jpg
-- Usar la imagen de Toy 2 Bubble Gum para ambos
UPDATE perfumes 
SET imagen_url = 'ImagenesPerfumes/Toy_2.jpg' 
WHERE nombre = 'Toy 2';

-- 3. Cheap and Chic - Chic Petals tiene problema con el guión
UPDATE perfumes 
SET imagen_url = 'ImagenesPerfumes/Cheap_and_Chic-_Chic_Petals.jpg' 
WHERE nombre LIKE 'Cheap and Chic%Chic Petals%';

-- Reactivar el safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verificar las correcciones
SELECT nombre, imagen_url 
FROM perfumes 
WHERE nombre IN ('Khamrah Qahwa', 'Toy 2') OR nombre LIKE 'Cheap and Chic%Chic Petals%';

-- Verificar que no haya más perfumes sin imagen
SELECT nombre, marca, imagen_url 
FROM perfumes 
WHERE imagen_url IS NULL AND activo = TRUE;

