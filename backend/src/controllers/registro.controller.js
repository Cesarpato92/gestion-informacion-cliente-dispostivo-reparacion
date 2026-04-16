import pool from '../config/db.config.js';
import { Cliente } from '../models/cliente.model.js';
import { Dispositivo } from '../models/dispositivo.model.js';
import { Reparacion } from '../models/reparacion.model.js';

const generarNumeroOrden = async (conexion) => {
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0].replace(/-/g, '');
    const prefijo = `ORD-${fechaStr}-`;

    const [resultado] = await conexion.query(
        `SELECT MAX(n_orden) as max_orden FROM reparacion WHERE n_orden LIKE ?`,
        [`${prefijo}%`]
    );

    let siguienteNumero = 1;
    if (resultado[0].max_orden) {
        const ultimoNumero = resultado[0].max_orden.split('-')[2];
        siguienteNumero = parseInt(ultimoNumero) + 1;
    }

    return `${prefijo}${siguienteNumero.toString().padStart(4, '0')}`;
};

export const crearRegistro = async (req, res) => {
    let conexion;

    try {
        const datos = req.body;
        const cliente = new Cliente(
            datos.cedula,
            datos.nombre,
            datos.email,
            datos.telefono);

        const dispositivo = new Dispositivo(
            null,
            datos.marca,
            datos.version,
            datos.tipo_password,
            datos.password,
            datos.comentarios,
            cliente.cedula);

        const reparacion = new Reparacion(
            null, // id_reparacion se autogenera
            new Date().toISOString().split('T')[0],
            null, // fecha_entrega se deja null porque se asigna cuando se termina la reparacion
            'pendiente',
            datos.costo_repuesto || 0,
            datos.precio_reparacion || 0,
            datos.tipo_reparacion,
            datos.comentarios,
            datos.n_orden,
            null // id_dispositivo se asigna después de insertar el dispositivo
        );

        //validaciones

        if (!cliente.validacion()) {
            return res.status(400).json({ success: false, message: 'Datos del cliente inválidos' });

        }
        if (!dispositivo.validacion()) {
            return res.status(400).json({ success: false, message: 'Datos del dispositivo inválidos' });
        }
        if (!reparacion.validacion()) {
            return res.status(400).json({ success: false, message: 'Datos de la reparación inválidos' });
        }

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        // Verificar si el cliente ya existe por su cédula
        const [clienteExistente] = await conexion.query('SELECT * FROM cliente WHERE cedula = ?', [cliente.cedula]);
        if (clienteExistente.length > 0) {
            // Si el cliente ya existe, actualizar su información
            await conexion.query(
                'UPDATE cliente SET ? WHERE cedula = ?', [cliente.toUpdate(), cliente.cedula]);
        }
        else {
            await conexion.query('INSERT INTO cliente SET ?', [cliente.toInsert()]);
        }
        // Insertar el dispositivo asociado al cliente
        const [resultadoDispositivo] = await conexion.query('INSERT INTO dispositivo SET ?', [dispositivo.toInsert()]);

        // Obtener el ID del dispositivo recién insertado para usarlo en la tabla de reparaciones
        const id_dispositivo = resultadoDispositivo.insertId;
        reparacion.id_dispositivo = id_dispositivo;


        // Insertar la reparación asociada al dispositivo
        await conexion.query('INSERT INTO reparacion SET ?', [reparacion.toInsert()]);

        await conexion.commit();
        res.status(201).json({
            success: true, message: 'Registro creado exitosamente',
            cedula: cliente.cedula,
            id_dispositivo: id_dispositivo,
            id_reparacion: reparacion.id_reparacion
        });
    }
    catch (error) {
        // Si ocurre un error, hacer rollback de la transacción (solo si la conexión fue establecida)
        if (conexion) {
            await conexion.rollback();
        }
        console.error('Error al crear el registro:', error);
        res.status(500).json({ success: false, message: error.message || 'Error al crear el registro' });
    }
    finally {
        if (conexion) {
            conexion.release();
        }

    }
};

export const crearRegistroMultiple = async (req, res) => {
    let conexion;

    try {
        const { cliente: datosCliente, dispositivos } = req.body;

        if (!datosCliente || !dispositivos || !Array.isArray(dispositivos) || dispositivos.length === 0) {
            return res.status(400).json({ success: false, message: 'Datos del cliente o dispositivos inválidos' });
        }
        const cliente = new Cliente(
            datosCliente.cedula,
            datosCliente.nombre,
            datosCliente.email,
            datosCliente.telefono);

        if (!cliente.validacion()) {
            return res.status(400).json({ success: false, message: 'Datos del cliente inválidos' });
        }

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        const [clienteExistente] = await conexion.query('SELECT * FROM cliente WHERE cedula = ?', [cliente.cedula]);
        if (clienteExistente.length > 0) {
            await conexion.query('UPDATE cliente SET ? WHERE cedula = ?', [cliente.toUpdate(), cliente.cedula]);
        }
        else {
            await conexion.query('INSERT INTO cliente SET ?', [cliente.toInsert()]);
        }

        const nOrden = await generarNumeroOrden(conexion);
        const dispositivosRegistrados = [];

        for (const d of dispositivos) {
            if (!d.reparaciones || !Array.isArray(d.reparaciones) || d.reparaciones.length === 0) {
                throw new Error('Cada dispositivo debe tener al menos una reparación');
            }

            const dispositivo = new Dispositivo(
                null,
                d.marca,
                d.version,
                d.tipo_password,
                d.password,
                d.comentarios,
                cliente.cedula
            );
            if (!dispositivo.validacion()) {
                throw new Error(`Datos del dispositivo de marca ${d.marca} inválidos`);
            }
            const [resultadoDispositivo] = await conexion.query('INSERT INTO dispositivo SET ?', [dispositivo.toInsert()]);
            const id_dispositivo = resultadoDispositivo.insertId;

            const reparacionesRegistradas = [];

            for (const r of d.reparaciones) {
                let vigenciaFecha = null;
                if (r.vigencia_garantia && parseInt(r.vigencia_garantia) > 0) {
                    const dias = parseInt(r.vigencia_garantia);
                    const fechaSalida = new Date();
                    fechaSalida.setDate(fechaSalida.getDate() + dias);
                    vigenciaFecha = fechaSalida.toISOString().split('T')[0];
                }

                const reparacion = new Reparacion(
                    null,
                    new Date().toISOString().split('T')[0],
                    null,
                    'pendiente',
                    r.costo_repuesto || 0,
                    r.precio_reparacion || 0,
                    r.tipo_reparacion,
                    r.comentarios,
                    nOrden,
                    id_dispositivo,
                    vigenciaFecha
                );

                if (!reparacion.validacion()) {
                    throw new Error(`Datos de la reparación para el dispositivo de marca ${d.marca} inválidos`);
                }
                const [resultadoReparacion] = await conexion.query('INSERT INTO reparacion SET ?', [reparacion.toInsert()]);

                reparacionesRegistradas.push({
                    id_reparacion: resultadoReparacion.insertId,
                    n_orden: nOrden,
                    tipo_reparacion: r.tipo_reparacion,
                    costo_repuesto: r.costo_repuesto,
                    precio_reparacion: r.precio_reparacion,
                    comentarios: r.comentarios
                });
            }

            dispositivosRegistrados.push({
                id_dispositivo,
                marca: d.marca,
                version: d.version,
                reparaciones: reparacionesRegistradas
            });

        }
        await conexion.commit();

        res.status(201).json({
            success: true,
            message: 'Registro creado exitosamente',
            data: {
                n_orden: nOrden,
                cliente: cliente.cedula,
                total_dispositivos: dispositivosRegistrados.length,
                total_reparaciones: dispositivosRegistrados.reduce(
                    (acc, d) => acc + d.reparaciones.length, 0
                ),
                dispositivos: dispositivosRegistrados
            }
        });
    }
    catch (error) {
        if (conexion) {
            await conexion.rollback();
        }
        console.error('Error al crear el registro:', error);
        res.status(500).json({ success: false, message: error.message || 'Error al crear el registro' });
    }
    finally {
        if (conexion) {
            conexion.release();
        }
    }
};
export const buscarClientePorCedula = async (req, res) => {
    let conexion;

    try {
        const cedula = req.params.cedula;
        const clienteValidacion = new Cliente(cedula, '', '', '');
        if (!clienteValidacion.validacionCedula()) {
            return res.status(400).json({ success: false, message: 'Cédula inválida' });
        }
        // Buscar en la DB
        conexion = await pool.getConnection();

        const [clienteEncontrado] = await conexion.query('SELECT * FROM cliente WHERE cedula = ?', [cedula]);
        if (clienteEncontrado.length === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        // convertimos a objeto el cliente usando fromDB
        const clienteCompleto = Cliente.fromDB(clienteEncontrado[0]);
        res.status(200).json({
            success: true,
            data: clienteCompleto
        });
    }
    catch (error) {
        if (conexion) {
            conexion.release();
        }
        console.error('Error al buscar el cliente:', error);
        res.status(500).json({ success: false, message: 'Error al buscar el cliente' });
    }
    finally {
        if (conexion) {
            conexion.release();
        }
    }
};

export const obtenerRegistros = async (req, res) => {
    let conexion;

    try {
        conexion = await pool.getConnection();

        const [filas] = await pool.query(`
            SELECT c.cedula, c.nombre, c.email, c.celular as telefono,
            d.id_dispositivo, d.marca, d.version as modelo, r.tipo_reparacion, d.comentarios,
            r.id_reparacion, r.precio_reparacion, r.estado, r.fecha_ingreso
            FROM cliente c
            LEFT JOIN dispositivo d ON c.cedula = d.cedula
            LEFT JOIN reparacion r ON d.id_dispositivo = r.id_dispositivo
            ORDER BY r.fecha_ingreso DESC
            `)

        res.status(200).json({
            success: true,
            data: filas
        })
    }
    catch (error) {
        if (conexion) {
            await conexion.release();
        }
        console.error('Error al listar los datos: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar los datos'
        })
    }
    finally {
        if (conexion) {
            conexion.release();
        }
    }
};
export const buscarReparacionPorNumeroOrden = async (req, res) => {
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
                r.comentarios_tecnico,
                d.id_dispositivo,
                d.marca,
                d.version,
                d.tipo_password,
                d.password,
                d.comentarios AS comentarios_dispositivo,
                c.cedula,
                c.nombre,
                c.email,
                c.celular AS telefono
            FROM reparacion r
            INNER JOIN dispositivo d ON r.id_dispositivo = d.id_dispositivo
            INNER JOIN cliente c ON d.cedula = c.cedula
            WHERE r.n_orden = ?
            ORDER BY d.id_dispositivo, r.id_reparacion
        `, [nOrden.trim()]);

        if (reparaciones.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró ninguna orden con ese número' });
        }

        const cliente = {
            cedula: reparaciones[0].cedula,
            nombre: reparaciones[0].nombre,
            email: reparaciones[0].email,
            telefono: reparaciones[0].telefono
        };

        const dispositivosMap = new Map();
        for (const r of reparaciones) {
            if (!dispositivosMap.has(r.id_dispositivo)) {
                dispositivosMap.set(r.id_dispositivo, {
                    id_dispositivo: r.id_dispositivo,
                    marca: r.marca,
                    version: r.version,
                    tipo_password: r.tipo_password,
                    password: r.password,
                    comentarios: r.comentarios_dispositivo,
                    reparaciones: []
                });
            }
            dispositivosMap.get(r.id_dispositivo).reparaciones.push({
                id_reparacion: r.id_reparacion,
                tipo_reparacion: r.tipo_reparacion,
                estado: r.estado?.toLowerCase() || 'pendiente',
                costo_repuesto: r.costo_repuesto,
                precio_reparacion: r.precio_reparacion,
                fecha_ingreso: r.fecha_ingreso,
                fecha_salida: r.fecha_salida,
                comentarios: r.comentarios,
                comentarios_tecnico: r.comentarios_tecnico
            });
        }

        res.status(200).json({
            success: true,
            data: {
                n_orden: nOrden,
                cliente,
                dispositivos: Array.from(dispositivosMap.values()),
                total_dispositivos: dispositivosMap.size,
                total_reparaciones: reparaciones.length
            }
        });
    } catch (error) {
        if (conexion) {
            conexion.release();
        }
        console.error('Error al buscar la reparación:', error);
        res.status(500).json({ success: false, message: 'Error al buscar la reparación' });
    } finally {
        if (conexion) {
            conexion.release();
        }
    }
};

export const actualizarEstadoReparacion = async (req, res) => {
    let conexion;
    try {
        const { id } = req.params;
        const { estado, costo_repuesto, comentarios_tecnico } = req.body;
        let fecha_salida = null;

        conexion = await pool.getConnection();

        const estadoLower = estado?.toLowerCase();
        
        if (!estado || !["completada", "cancelada"].includes(estadoLower)) {
            return res.status(400).json({
                success: false,
                message: 'Solo puede guardar cuando el estado sea completada o cancelada'
            });
        }

        if (estadoLower === 'completada' || estadoLower === 'cancelada') {
            fecha_salida = new Date().toISOString().split('T')[0];
        }

        const costoNum = parseFloat(costo_repuesto);
        
        if (estadoLower === 'completada' && (isNaN(costoNum) || costoNum <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Para estado completado, el costo de repuesto debe ser mayor a cero'
            });
        }

        if (estadoLower === 'cancelada' && costoNum > 0) {
            return res.status(400).json({
                success: false,
                message: 'Para estado cancelada, el costo de repuesto debe ser cero'
            });
        }

        const [reparacionActual] = await conexion.query(
            'SELECT precio_reparacion, estado FROM reparacion WHERE id_reparacion = ?',
            [id]
        );

        if (reparacionActual.length > 0) {
            const estadoActual = reparacionActual[0].estado?.toLowerCase();
            if (estadoActual === 'completada' || estadoActual === 'cancelada') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede cambiar el estado de una reparación completada o cancelada'
                });
            }
        }

        if (reparacionActual.length > 0 && costoNum > reparacionActual[0].precio_reparacion) {
            return res.status(400).json({
                success: false,
                message: 'El costo de repuesto no puede ser mayor al precio de reparación'
            });
        }

        if (isNaN(costoNum) || costoNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Costo de repuesto inválido'
            });
        }

        // iniciamos la transaccion
        await conexion.beginTransaction();

        // verificamos que la reparacion exista
        const [reparacionExistente] = await conexion.query(
            'SELECT * FROM reparacion WHERE id_reparacion = ?',
            [id]
        );

        if (reparacionExistente.length === 0) {
            await conexion.rollback();
            return res.status(404).json({
                success: false,
                message: 'Reparación no encontrada'
            });
        }

        // Usamos el id_reparacion para actualizar
        const [resultado] = await conexion.query(`
            UPDATE reparacion SET
            fecha_salida = ?,
            estado = ?,
            costo_repuesto = ?,
            comentarios_tecnico = ?
            WHERE id_reparacion = ?
            `,
            [
                fecha_salida,
                estado.toLowerCase(),
                costo_repuesto,
                comentarios_tecnico,
                id])

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Reparacion no encontrada"
            })
        }

        /// transaccion hecha la cerramos
        await conexion.commit();

        res.status(200).json({
            success: true,
            message: 'Estado actualizado correctamente'
        })
    }
    catch (error) {
        // error de transaccion
        if (conexion) {
            await conexion.rollback();
        }
        console.log('Error al actualizar el registro', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al actualizar el registro'
        });

    }
    finally {
        if (conexion) {
            conexion.release();
        }
    }
};