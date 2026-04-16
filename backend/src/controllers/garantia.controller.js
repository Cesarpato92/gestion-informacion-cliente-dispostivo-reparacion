import pool from '../config/db.config.js';
import { Garantia } from '../models/garantia.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const registrarMovimientoGarantia = async (req, res) => {
    let conexion;
    let id_tecnico = null;
    
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            id_tecnico = decoded.id;
        }
    } catch (e) {
        //Token inválido pero continuamos
    }

    try {
        const { id_reparacion, tipo_movimiento, observaciones } = req.body;

        if (!id_reparacion || !tipo_movimiento) {
            return res.status(400).json({ success: false, message: 'ID de reparación y tipo de movimiento son requeridos' });
        }

        if (isNaN(parseInt(id_reparacion))) {
            return res.status(400).json({ success: false, message: 'ID de reparación inválido' });
        }

        const garantia = new Garantia(null, id_reparacion, tipo_movimiento, null, observaciones, id_tecnico);

        if (!garantia.validacion()) {
            return res.status(400).json({ success: false, message: 'Datos de garantía inválidos' });
        }

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        const [reparacion] = await conexion.query(
            'SELECT id_reparacion, estado, vigencia_garantia FROM reparacion WHERE id_reparacion = ?',
            [id_reparacion]
        );

        if (reparacion.length === 0) {
            await conexion.rollback();
            return res.status(404).json({ success: false, message: 'Reparación no encontrada' });
        }

        const vigencia = reparacion[0].vigencia_garantia;
        if (!vigencia) {
            await conexion.rollback();
            return res.status(400).json({ success: false, message: 'Esta reparación no tiene garantía registrada' });
        }

        const vigenciaFecha = new Date(vigencia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (vigenciaFecha < hoy) {
            await conexion.rollback();
            return res.status(400).json({ success: false, message: 'La garantía de esta reparación está vencida' });
        }

        const estadoRep = reparacion[0].estado?.toLowerCase();
        if (tipo_movimiento.toLowerCase() === 'entrada' && estadoRep !== 'completada') {
            await conexion.rollback();
            return res.status(400).json({ success: false, message: 'Solo se puede registrar garantía de reparaciones completadas' });
        }

        const [garantiaExistente] = await conexion.query(
            'SELECT * FROM garantia WHERE id_reparacion = ? AND tipo_movimiento = ?',
            [id_reparacion, tipo_movimiento.toLowerCase()]
        );

        if (garantiaExistente.length > 0) {
            await conexion.rollback();
            return res.status(400).json({ success: false, message: `Ya existe un movimiento de ${tipo_movimiento} para esta reparación` });
        }

        const [ resultado] = await conexion.query(
            'INSERT INTO garantia (id_reparacion, tipo_movimiento, fecha_movimiento, observaciones, id_tecnico) VALUES (?, ?, ?, ?, ?)',
            [
                id_reparacion,
                tipo_movimiento.toLowerCase(),
                new Date().toISOString().split('T')[0],
                observaciones || null,
                id_tecnico
            ]
        );
        
        console.log('DEBUG - Garantía registrada:', {
            id_reparacion,
            tipo_movimiento,
            id_tecnico,
            resultado: resultado.insertId
        });

        await conexion.commit();

        res.status(201).json({
            success: true,
            message: `Garantía de ${tipo_movimiento} registrada correctamente`,
            data: { id_garantia: resultado.insertId, id_reparacion, tipo_movimiento: garantia.tipo_movimiento }
        });
    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error('Error al registrar garantía:', error);
        res.status(500).json({ success: false, message: 'Error al registrar garantía' });
    } finally {
        if (conexion) conexion.release();
    }
};

export const obtenerGarantias = async (req, res) => {
    let conexion;
    try {
        conexion = await pool.getConnection();

        const [garantias] = await conexion.query(`
            SELECT 
                g.id_garantia,
                g.id_reparacion,
                g.tipo_movimiento,
                g.fecha_movimiento,
                g.observaciones,
                g.id_tecnico,
                u.nombre as tecnico,
                r.n_orden,
                r.estado as estado_reparacion,
                r.precio_reparacion,
                r.costo_repuesto,
                d.marca,
                d.version,
                c.nombre as cliente_nombre,
                c.celular as cliente_telefono
            FROM garantia g
            LEFT JOIN reparacion r ON g.id_reparacion = r.id_reparacion
            LEFT JOIN dispositivo d ON r.id_dispositivo = d.id_dispositivo
            LEFT JOIN cliente c ON d.cedula = c.cedula
            LEFT JOIN usuario u ON g.id_tecnico = u.id
            ORDER BY g.fecha_movimiento DESC
        `);

        res.status(200).json({
            success: true,
            data: garantias
        });
    } catch (error) {
        console.error('Error al obtener garantías:', error);
        res.status(500).json({ success: false, message: 'Error al obtener garantías' });
    } finally {
        if (conexion) conexion.release();
    }
};

export const obtenerGarantiasPorOrden = async (req, res) => {
    let conexion;
    try {
        const { nOrden } = req.params;

        if (!nOrden || nOrden.trim() === '') {
            return res.status(400).json({ success: false, message: 'Número de orden inválido' });
        }

        conexion = await pool.getConnection();

        const [reparaciones] = await conexion.query(`
            SELECT 
                r.id_reparacion,
                r.n_orden,
                r.fecha_ingreso,
                r.fecha_salida,
                r.estado,
                r.costo_repuesto,
                r.precio_reparacion,
                r.tipo_reparacion,
                r.comentarios,
                r.vigencia_garantia,
                d.id_dispositivo,
                d.marca,
                d.version,
                d.tipo_password,
                d.password,
                c.cedula,
                c.nombre,
                c.email,
                c.celular as telefono
            FROM reparacion r
            INNER JOIN dispositivo d ON r.id_dispositivo = d.id_dispositivo
            INNER JOIN cliente c ON d.cedula = c.cedula
            WHERE r.n_orden = ?
        `, [nOrden.trim()]);

        if (reparaciones.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró ninguna orden con ese número' });
        }

        const [garantias] = await conexion.query(`
            SELECT 
                g.id_garantia,
                g.id_reparacion,
                g.tipo_movimiento,
                g.fecha_movimiento,
                g.observaciones,
                g.id_tecnico,
                u.nombre as tecnico
            FROM garantia g
            LEFT JOIN usuario u ON g.id_tecnico = u.id
            WHERE g.id_reparacion = ?
            ORDER BY g.fecha_movimiento DESC
        `, [reparaciones[0].id_reparacion]);

        const cliente = {
            cedula: reparaciones[0].cedula,
            nombre: reparaciones[0].nombre,
            email: reparaciones[0].email,
            telefono: reparaciones[0].telefono
        };

        const dispositivos = [{
            id_dispositivo: reparaciones[0].id_dispositivo,
            marca: reparaciones[0].marca,
            version: reparaciones[0].version,
            tipo_password: reparaciones[0].tipo_password,
            password: reparaciones[0].password,
            reparaciones: reparaciones.map(r => ({
                id_reparacion: r.id_reparacion,
                tipo_reparacion: r.tipo_reparacion,
                estado: r.estado,
                costo_repuesto: r.costo_repuesto,
                precio_reparacion: r.precio_reparacion,
                fecha_ingreso: r.fecha_ingreso,
                fecha_salida: r.fecha_salida,
                comentarios: r.comentarios,
                vigencia_garantia: r.vigencia_garantia
            }))
        }];

        res.status(200).json({
            success: true,
            data: {
                n_orden: nOrden,
                cliente,
                dispositivos,
                garantias,
                total_reparaciones: reparaciones.length
            }
        });
    } catch (error) {
        console.error('Error al obtener garantías por orden:', error);
        res.status(500).json({ success: false, message: 'Error al obtener órdenes' });
    } finally {
        if (conexion) conexion.release();
    }
};