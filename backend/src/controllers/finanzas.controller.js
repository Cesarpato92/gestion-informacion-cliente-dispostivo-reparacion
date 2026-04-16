import pool from '../config/db.config.js';

const buildFechaFilter = (fechaDesde, fechaHasta) => {
    if (fechaDesde && fechaHasta) {
        return `AND r.fecha_salida >= '${fechaDesde}' AND r.fecha_salida <= '${fechaHasta}'`;
    }
    if (fechaDesde) {
        return `AND r.fecha_salida >= '${fechaDesde}'`;
    }
    if (fechaHasta) {
        return `AND r.fecha_salida <= '${fechaHasta}'`;
    }
    return '';
};

export const obtenerDashboardFinanciero = async (req, res) => {
    let conexion;
    try {
        const { fecha_desde, fecha_hasta } = req.query;
        const filtroFechas = buildFechaFilter(fecha_desde, fecha_hasta);

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        const [ingresosTotal] = await conexion.query(`
            SELECT COALESCE(SUM(precio_reparacion), 0) as total 
            FROM reparacion r WHERE estado = 'completada' ${filtroFechas}
        `);

        const [costoRepuestosTotal] = await conexion.query(`
            SELECT COALESCE(SUM(costo_repuesto), 0) as total 
            FROM reparacion r WHERE estado = 'completada' ${filtroFechas}
        `);

        const [gananciaNeta] = await conexion.query(`
            SELECT COALESCE(SUM(precio_reparacion - costo_repuesto), 0) as total 
            FROM reparacion r WHERE estado = 'completada' ${filtroFechas}
        `);

        const [perdidasTotal] = await conexion.query(`
            SELECT COALESCE(SUM(costo_repuesto), 0) as total 
            FROM reparacion r WHERE estado = 'cancelada' ${filtroFechas}
        `);

        const [garantiasTotal] = await conexion.query(`
            SELECT COUNT(*) as total, COALESCE(SUM(costo_repuesto), 0) as costo 
            FROM garantia g
            INNER JOIN reparacion r ON g.id_reparacion = r.id_reparacion
            WHERE tipo_movimiento = 'entrada' ${filtroFechas}
        `);

        const [reparacionesCompletadas] = await conexion.query(`
            SELECT COUNT(*) as total FROM reparacion r WHERE estado = 'completada' ${filtroFechas}
        `);

        const [facturasRecientes] = await conexion.query(`
            SELECT 
                r.id_reparacion,
                r.n_orden,
                r.precio_reparacion,
                r.costo_repuesto,
                (r.precio_reparacion - r.costo_repuesto) as ganancia,
                r.fecha_salida,
                r.tipo_reparacion,
                c.nombre as cliente
            FROM reparacion r
            LEFT JOIN dispositivo d ON r.id_dispositivo = d.id_dispositivo
            LEFT JOIN cliente c ON d.cedula = c.cedula
            WHERE r.estado = 'completada' ${filtroFechas}
            ORDER BY r.fecha_salida DESC
            LIMIT 20
        `);

        await conexion.commit();

        res.status(200).json({
            success: true,
            data: {
                ingresos_totales: ingresosTotal[0].total,
                costo_repuestos: costoRepuestosTotal[0].total,
                ganancia_neta: gananciaNeta[0].total,
                perdidas: perdidasTotal[0].total,
                garantias_count: garantiasTotal[0].total,
                garantias_costo: garantiasTotal[0].costo,
                reparaciones_completadas: reparacionesCompletadas[0].total,
                facturas_recientes: facturasRecientes
            }
        });
    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error('Error en dashboard financiero:', error);
        res.status(500).json({ success: false, message: 'Error al obtener datos financieros' });
    } finally {
        if (conexion) conexion.release();
    }
};

export const obtenerEstadisticasMensuales = async (req, res) => {
    let conexion;
    try {
        const { anio, mes, fecha_desde, fecha_hasta } = req.query;

        let whereClause = "estado = 'completada'";
        const params = [];

        if (fecha_desde && fecha_hasta) {
            whereClause += " AND fecha_salida >= ? AND fecha_salida <= ?";
            params.push(fecha_desde, fecha_hasta);
        } else if (anio && mes) {
            whereClause += " AND YEAR(fecha_salida) = ? AND MONTH(fecha_salida) = ?";
            params.push(anio, mes);
        } else if (anio) {
            whereClause += " AND YEAR(fecha_salida) = ?";
            params.push(anio);
        } else if (fecha_desde) {
            whereClause += " AND fecha_salida >= ?";
            params.push(fecha_desde);
        } else if (fecha_hasta) {
            whereClause += " AND fecha_salida <= ?";
            params.push(fecha_hasta);
        }

        conexion = await pool.getConnection();

        const [mensual] = await conexion.query(`
            SELECT 
                DATE_FORMAT(fecha_salida, '%Y-%m') as mes,
                COUNT(*) as reparaciones,
                COALESCE(SUM(precio_reparacion), 0) as ingresos,
                COALESCE(SUM(costo_repuesto), 0) as costos,
                COALESCE(SUM(precio_reparacion - costo_repuesto), 0) as ganancia
            FROM reparacion 
            WHERE ${whereClause}
            GROUP BY DATE_FORMAT(fecha_salida, '%Y-%m')
        `, params);

        const [ultimosMeses] = await conexion.query(`
            SELECT 
                DATE_FORMAT(fecha_salida, '%Y-%m') as mes,
                COUNT(*) as reparaciones,
                COALESCE(SUM(precio_reparacion), 0) as ingresos,
                COALESCE(SUM(costo_repuesto), 0) as costos,
                COALESCE(SUM(precio_reparacion - costo_repuesto), 0) as ganancia
            FROM reparacion 
            WHERE estado = 'completada' 
            AND fecha_salida >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_salida, '%Y-%m')
            ORDER BY mes DESC
            LIMIT 12
        `);

        res.status(200).json({
            success: true,
            data: {
                mes_actual: mensual[0] || null,
                ultimos_meses: ultimosMeses
            }
        });
    } catch (error) {
        console.error('Error en estadísticas mensuales:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    } finally {
        if (conexion) conexion.release();
    }
};

export const obtenerGraficoTorta = async (req, res) => {
    let conexion;
    try {
        const { fecha_desde, fecha_hasta } = req.query;
        let whereClause = "estado = 'completada'";
        const params = [];

        if (fecha_desde && fecha_hasta) {
            whereClause += " AND fecha_salida >= ? AND fecha_salida <= ?";
            params.push(fecha_desde, fecha_hasta);
        } else if (fecha_desde) {
            whereClause += " AND fecha_salida >= ?";
            params.push(fecha_desde);
        } else if (fecha_hasta) {
            whereClause += " AND fecha_salida <= ?";
            params.push(fecha_hasta);
        }

        conexion = await pool.getConnection();

        const [porTipo] = await conexion.query(`
            SELECT 
                tipo_reparacion,
                COUNT(*) as cantidad,
                COALESCE(SUM(precio_reparacion), 0) as ingresos,
                COALESCE(SUM(costo_repuesto), 0) as costos,
                COALESCE(SUM(precio_reparacion - costo_repuesto), 0) as ganancia
            FROM reparacion 
            WHERE ${whereClause}
            GROUP BY tipo_reparacion
            ORDER BY cantidad DESC
        `, params);

        res.status(200).json({
            success: true,
            data: porTipo
        });
    } catch (error) {
        console.error('Error en gráfico torta:', error);
        res.status(500).json({ success: false, message: 'Error al obtener datos' });
    } finally {
        if (conexion) conexion.release();
    }
};