-- =====================================================
-- MIGRACIÓN: Agregar campo stock a tabla perfumes
-- Descripción: Agrega campos para control de inventario
-- Fecha: 5 de Noviembre, 2025
-- =====================================================

USE perfumeria;

-- Agregar campo stock (cantidad disponible)
ALTER TABLE perfumes 
ADD COLUMN stock INT DEFAULT 0 COMMENT 'Cantidad disponible en inventario';

-- Agregar campo disponible (estado del producto)
ALTER TABLE perfumes 
ADD COLUMN disponible BOOLEAN DEFAULT TRUE COMMENT 'Indica si el producto está disponible para venta';

-- Agregar índice para consultas de productos disponibles
CREATE INDEX idx_disponible ON perfumes(disponible);

-- Actualizar stock inicial de los perfumes existentes (ejemplo: 10 unidades)
UPDATE perfumes SET stock = 10, disponible = TRUE WHERE stock = 0;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar estructura actualizada de la tabla
DESCRIBE perfumes;

-- Mostrar productos con su stock
SELECT id_perfume, nombre, marca, stock, disponible 
FROM perfumes 
ORDER BY id_perfume;

SELECT 'Migración completada exitosamente' AS status;

