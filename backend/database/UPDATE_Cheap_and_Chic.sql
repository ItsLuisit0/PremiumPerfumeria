-- =====================================================
-- ACTUALIZAR IMAGEN DE CHEAP AND CHIC - CHIC PETALS
-- =====================================================

USE railway;

-- Deshabilitar safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Ver el perfume antes de actualizar
SELECT id_perfume, nombre, imagen_url 
FROM perfumes 
WHERE nombre LIKE '%Cheap and Chic%Chic Petals%';

-- Actualizar la URL de la imagen
UPDATE perfumes 
SET imagen_url = 'ImagenesPerfumes/Cheap_and_Chic_Chic_Petals.jpg' 
WHERE nombre LIKE '%Cheap and Chic%Chic Petals%';

-- Reactivar safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verificar la actualización
SELECT id_perfume, nombre, imagen_url 
FROM perfumes 
WHERE nombre LIKE '%Cheap and Chic%Chic Petals%';

