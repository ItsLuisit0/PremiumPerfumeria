-- ============================================
-- CORREGIR COLECCIONES ÁRABES
-- Unificar todas las marcas árabes bajo una sola colección
-- ============================================

-- Actualizar todas las marcas árabes para usar colección genérica 'Arabes'
UPDATE perfumes SET coleccion = 'Arabes' 
WHERE marca IN ('Lattafa', 'Rasasi', 'Armaf', 'Arabesque');

-- Verificar los cambios
SELECT 
    coleccion,
    COUNT(*) as total_perfumes,
    GROUP_CONCAT(DISTINCT marca) as marcas
FROM perfumes
WHERE activo = TRUE
GROUP BY coleccion
ORDER BY total_perfumes DESC;

