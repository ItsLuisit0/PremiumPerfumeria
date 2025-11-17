-- Script para agregar la columna 'coleccion' a la tabla perfumes
-- Esta columna permitirá agrupar perfumes en colecciones especiales

USE perfumeria2;

-- Agregar columna coleccion si no existe
ALTER TABLE perfumes 
ADD COLUMN IF NOT EXISTS coleccion VARCHAR(50) DEFAULT NULL 
COMMENT 'Colección especial a la que pertenece el perfume (arabes_destacados, disenador_destacados, nicho_destacados, etc.)';

-- Verificar que se agregó correctamente
DESCRIBE perfumes;

SELECT 'Columna coleccion agregada exitosamente!' as Resultado;

