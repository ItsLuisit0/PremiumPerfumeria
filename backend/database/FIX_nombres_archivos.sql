-- =====================================================
-- ACTUALIZAR NOMBRES DE ARCHIVOS EN BASE DE DATOS
-- =====================================================
-- Cambiar caracteres especiales por guiones normales
-- =====================================================

USE perfumeria2;

-- Cambiar en-dash (–) por guión normal (-) en Cheap and Chic
UPDATE perfumes 
SET imagen_url = 'ImagenesPerfumes/Cheap_and_Chic-_Chic_Petals.jpg' 
WHERE nombre = 'Cheap and Chic – Chic Petals';

-- Verificar el cambio
SELECT nombre, imagen_url 
FROM perfumes 
WHERE nombre LIKE '%Cheap%Petals%';

