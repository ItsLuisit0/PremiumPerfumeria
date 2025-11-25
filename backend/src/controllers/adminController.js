const { pool } = require('../db/db');

exports.getEstadisticas = async (req, res) => {
    try {
        // Calcular estadísticas directamente
        const [totalPerfumes] = await pool.query(
            'SELECT COUNT(*) as total FROM perfumes WHERE activo = TRUE'
        );
        
        const [totalReviews] = await pool.query(
            'SELECT COUNT(*) as total FROM reseñas'
        );
        
        const [stockTotal] = await pool.query(
            'SELECT SUM(stock) as total FROM perfumes WHERE activo = TRUE'
        );
        
        const [stockBajo] = await pool.query(
            'SELECT COUNT(*) as total FROM perfumes WHERE activo = TRUE AND stock < 10'
        );
        
        res.json({
            success: true,
            data: {
                total_perfumes: totalPerfumes[0].total || 0,
                total_reviews: totalReviews[0].total || 0,
                stock_total: stockTotal[0].total || 0,
                productos_stock_bajo: stockBajo[0].total || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas del dashboard'
        });
    }
};

exports.getEstadisticasPorCategoria = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                publico AS categoria,
                COUNT(*) AS total,
                SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END) AS activos,
                SUM(CASE WHEN destacado = TRUE THEN 1 ELSE 0 END) AS destacados,
                SUM(CASE WHEN activo = TRUE THEN stock ELSE 0 END) AS stock_total,
                ROUND(AVG(precio_minimo), 2) AS precio_promedio,
                ROUND(AVG(descuento_porcentaje), 2) AS descuento_promedio
            FROM perfumes
            GROUP BY publico
            ORDER BY publico
        `);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas por categoría'
        });
    }
};

exports.getEstadisticasPorMarca = async (req, res) => {
    try {
        const [stats] = await pool.query('CALL sp_estadisticas_por_marca()');
        
        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas por marca'
        });
    }
};

exports.getAllPerfumesAdmin = async (req, res) => {
    try {
        const { activo, destacado, publico, marca, search, page = 1, limit = 20, sortField = 'fecha_creacion', sortOrder = 'desc' } = req.query;
        
        let query = 'SELECT * FROM perfumes WHERE 1=1';
        const params = [];
        
        if (activo !== undefined) {
            query += ' AND activo = ?';
            params.push(activo === 'true' ? 1 : 0);
        }
        
        if (destacado !== undefined) {
            query += ' AND destacado = ?';
            params.push(destacado === 'true' ? 1 : 0);
        }
        
        if (publico) {
            query += ' AND publico = ?';
            params.push(publico);
        }
        
        if (marca) {
            query += ' AND marca = ?';
            params.push(marca);
        }
        
        if (search) {
            query += ' AND (nombre LIKE ? OR marca LIKE ? OR descripcion LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }
        
        const validSortFields = ['nombre', 'precio_minimo', 'stock', 'fecha_creacion', 'marca'];
        const validSortOrders = ['asc', 'desc'];
        
        const orderField = validSortFields.includes(sortField) ? sortField : 'fecha_creacion';
        const orderDirection = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';
        
        query += ` ORDER BY ${orderField} ${orderDirection}`;
        
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [perfumes] = await pool.query(query, params);
        
        // Obtener total para paginación
        let countQuery = 'SELECT COUNT(*) as total FROM perfumes WHERE 1=1';
        const countParams = [];
        
        if (activo !== undefined) {
            countQuery += ' AND activo = ?';
            countParams.push(activo === 'true' ? 1 : 0);
        }
        
        if (destacado !== undefined) {
            countQuery += ' AND destacado = ?';
            countParams.push(destacado === 'true' ? 1 : 0);
        }
        
        if (publico) {
            countQuery += ' AND publico = ?';
            countParams.push(publico);
        }
        
        if (marca) {
            countQuery += ' AND marca = ?';
            countParams.push(marca);
        }
        
        if (search) {
            countQuery += ' AND (nombre LIKE ? OR marca LIKE ? OR descripcion LIKE ?)';
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam, searchParam);
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        
        res.json({
            success: true,
            data: perfumes,
            total: countResult[0].total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfumes'
        });
    }
};

exports.getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [perfume] = await pool.query('SELECT * FROM perfumes WHERE id_perfume = ?', [id]);
        
        if (perfume.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Perfume no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: perfume[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfume'
        });
    }
};

exports.createPerfume = async (req, res) => {
    try {
        const {
            marca, nombre, tipo, publico, descripcion, notas,
            precio_minimo, mililitros, imagen_url, stock,
            descuento_porcentaje, activo, destacado
        } = req.body;
        
        const id_admin = req.admin.id_admin;
        
        const activoValue = (activo === true || activo === 1 || activo === '1' || activo === 'true') ? 1 : 0;
        const destacadoValue = (destacado === true || destacado === 1 || destacado === '1' || destacado === 'true') ? 1 : 0;
        
        const [result] = await pool.query(
            `INSERT INTO perfumes (
                marca, nombre, tipo, publico, descripcion, notas,
                precio_minimo, mililitros, imagen_url, stock,
                descuento_porcentaje, activo, destacado, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                marca, nombre, tipo, publico, descripcion, notas,
                precio_minimo, mililitros, imagen_url || null, stock || 0,
                descuento_porcentaje || 0, activoValue, destacadoValue, id_admin
            ]
        );
        
        try {
            await pool.query(
                `CALL sp_registrar_actividad(?, 'CREATE', 'perfumes', ?, NULL, ?, ?, ?)`,
                [
                    id_admin,
                    result.insertId,
                    JSON.stringify({ id_perfume: result.insertId, nombre, marca, activo: activoValue }),
                    req.ip,
                    req.headers['user-agent']
                ]
            );
        } catch (spError) {}
        
        res.status(201).json({
            success: true,
            message: 'Perfume creado exitosamente',
            data: { id_perfume: result.insertId, activo: activoValue }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear perfume',
            error: error.message
        });
    }
};

exports.updatePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            marca, nombre, tipo, publico, descripcion, notas,
            precio_minimo, mililitros, imagen_url, stock,
            descuento_porcentaje, activo, destacado
        } = req.body;
        
        const id_admin = req.admin.id_admin;
        
        const [oldData] = await pool.query('SELECT * FROM perfumes WHERE id_perfume = ?', [id]);
        
        if (oldData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Perfume no encontrado'
            });
        }
        
        const activoValue = (activo === true || activo === 1 || activo === '1' || activo === 'true') ? 1 : 0;
        const destacadoValue = (destacado === true || destacado === 1 || destacado === '1' || destacado === 'true') ? 1 : 0;
        
        await pool.query(
            `UPDATE perfumes SET
                marca = ?, nombre = ?, tipo = ?, publico = ?, descripcion = ?, notas = ?,
                precio_minimo = ?, mililitros = ?, imagen_url = ?, stock = ?,
                descuento_porcentaje = ?, activo = ?, destacado = ?, actualizado_por = ?
            WHERE id_perfume = ?`,
            [
                marca, nombre, tipo, publico, descripcion, notas,
                precio_minimo, mililitros, imagen_url || null, stock,
                descuento_porcentaje || 0, activoValue, destacadoValue,
                id_admin, id
            ]
        );
        
        try {
            await pool.query(
                `CALL sp_registrar_actividad(?, 'UPDATE', 'perfumes', ?, ?, ?, ?, ?)`,
                [
                    id_admin,
                    id,
                    JSON.stringify(oldData[0]),
                    JSON.stringify(req.body),
                    req.ip,
                    req.headers['user-agent']
                ]
            );
        } catch (spError) {}
        
        res.json({
            success: true,
            message: 'Perfume actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfume',
            error: error.message
        });
    }
};

exports.deletePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const id_admin = req.admin.id_admin;
        
        const [perfume] = await pool.query('SELECT * FROM perfumes WHERE id_perfume = ?', [id]);
        
        if (perfume.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Perfume no encontrado'
            });
        }
        
        const [result] = await pool.query('UPDATE perfumes SET activo = 0 WHERE id_perfume = ?', [id]);
        
        try {
            await pool.query(
                `CALL sp_registrar_actividad(?, 'DELETE', 'perfumes', ?, ?, NULL, ?, ?)`,
                [
                    id_admin,
                    id,
                    JSON.stringify(perfume[0]),
                    req.ip,
                    req.headers['user-agent']
                ]
            );
        } catch (spError) {}
        
        res.json({
            success: true,
            message: 'Perfume desactivado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar perfume',
            error: error.message
        });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        
        if (stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock inválido'
            });
        }
        
        const id_admin = req.admin.id_admin;
        
        await pool.query('UPDATE perfumes SET stock = ?, actualizado_por = ? WHERE id_perfume = ?', 
            [stock, id_admin, id]);
        
        res.json({
            success: true,
            message: 'Stock actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar stock'
        });
    }
};

exports.updateDescuento = async (req, res) => {
    try {
        const { id } = req.params;
        const { descuento_porcentaje } = req.body;
        
        if (descuento_porcentaje === undefined || descuento_porcentaje < 0 || descuento_porcentaje > 100) {
            return res.status(400).json({
                success: false,
                message: 'Descuento inválido (debe estar entre 0 y 100)'
            });
        }
        
        const id_admin = req.admin.id_admin;
        
        await pool.query('UPDATE perfumes SET descuento_porcentaje = ?, actualizado_por = ? WHERE id_perfume = ?',
            [descuento_porcentaje, id_admin, id]);
        
        res.json({
            success: true,
            message: 'Descuento actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar descuento'
        });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const { aprobada, id_perfume, page = 1, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                r.id_reseña,
                r.id_perfume,
                r.usuario,
                r.comentario,
                r.calificacion,
                r.fecha,
                r.aprobada,
                r.moderada,
                r.moderada_por,
                r.fecha_moderacion,
                r.razon_rechazo,
                p.nombre as nombre_perfume, 
                p.marca
            FROM reseñas r
            INNER JOIN perfumes p ON r.id_perfume = p.id_perfume
            WHERE 1=1
        `;
        const params = [];
        
        if (aprobada !== undefined) {
            query += ' AND r.aprobada = ?';
            params.push(aprobada === 'true' ? 1 : 0);
        }
        
        if (id_perfume) {
            query += ' AND r.id_perfume = ?';
            params.push(id_perfume);
        }
        
        query += ' ORDER BY r.fecha DESC';
        
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [reviews] = await pool.query(query, params);
        
        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reseñas'
        });
    }
};

exports.moderarReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { aprobada, razon_rechazo } = req.body;
        
        const id_admin = req.admin.id_admin;
        
        const [review] = await pool.query('SELECT * FROM reseñas WHERE id_reseña = ?', [id]);
        
        if (review.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }
        
        await pool.query(
            `UPDATE reseñas SET 
                aprobada = ?, 
                moderada = TRUE, 
                moderada_por = ?, 
                fecha_moderacion = NOW(),
                razon_rechazo = ?
            WHERE id_reseña = ?`,
            [aprobada !== false, id_admin, razon_rechazo || null, id]
        );
        
        res.json({
            success: true,
            message: aprobada !== false ? 'Reseña aprobada' : 'Reseña rechazada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al moderar reseña'
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const id_admin = req.admin.id_admin;
        
        const [review] = await pool.query('SELECT * FROM reseñas WHERE id_reseña = ?', [id]);
        
        if (review.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }
        
        await pool.query('DELETE FROM reseñas WHERE id_reseña = ?', [id]);
        
        await pool.query(
            `CALL sp_registrar_actividad(?, 'DELETE', 'reseñas', ?, ?, NULL, ?, ?)`,
            [
                id_admin,
                id,
                JSON.stringify(review[0]),
                req.ip,
                req.headers['user-agent']
            ]
        );
        
        res.json({
            success: true,
            message: 'Reseña eliminada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar reseña'
        });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const [logs] = await pool.query(
            'SELECT * FROM vista_actividad_reciente LIMIT ?',
            [parseInt(limit)]
        );
        
        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener logs de actividad'
        });
    }
};

exports.getStockBajo = async (req, res) => {
    try {
        const [productos] = await pool.query(`
            SELECT 
                id_perfume,
                nombre,
                marca,
                stock,
                precio_minimo,
                activo
            FROM perfumes 
            WHERE activo = TRUE AND stock < 10
            ORDER BY stock ASC
        `);
        
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos con stock bajo'
        });
    }
};

