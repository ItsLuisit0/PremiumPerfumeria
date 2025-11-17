-- ============================================
-- AGREGAR COLUMNA 'coleccion' (Si ya tienes la BD creada)
-- ============================================

-- Solo ejecuta esto si tu tabla ya existe y no tiene la columna
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS coleccion VARCHAR(100) NULL AFTER activo;

-- ============================================
-- ACTUALIZAR PERFUMES EXISTENTES CON COLECCIONES
-- ============================================

-- Colecciones Árabes
UPDATE perfumes SET coleccion = 'Lattafa' WHERE marca = 'Lattafa';
UPDATE perfumes SET coleccion = 'Rasasi' WHERE marca = 'Rasasi';
UPDATE perfumes SET coleccion = 'Armaf' WHERE marca = 'Armaf';
UPDATE perfumes SET coleccion = 'Arabesque' WHERE marca = 'Arabesque';

-- Perfumes de Diseñador (si aplica)
UPDATE perfumes SET coleccion = 'Diseñador' WHERE tipo = 'Diseñador' AND coleccion IS NULL;

-- Perfumes de Nicho
UPDATE perfumes SET coleccion = 'Nicho' WHERE tipo = 'Nicho' AND coleccion IS NULL;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver qué colecciones tienes y cuántos perfumes en cada una
SELECT 
    coleccion,
    COUNT(*) as total_perfumes,
    GROUP_CONCAT(DISTINCT marca) as marcas
FROM perfumes
WHERE activo = TRUE
GROUP BY coleccion
ORDER BY total_perfumes DESC;

-- Ver perfumes sin colección asignada
SELECT id_perfume, marca, nombre, tipo
FROM perfumes
WHERE coleccion IS NULL AND activo = TRUE
LIMIT 20;
