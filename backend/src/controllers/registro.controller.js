import pool from '../config/db.js';
import Cliente from '../models/cliente.model.js';
import Dispositivo from '../models/dispositivo.model.js';
import Reparacion from '../models/reparacion.model.js';

export const crearRegistro = async (req, res) => {
    let conexion;

    try{
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
            datos.tipo_reparacion,
            datos.tipo_password,
            datos.password,
            datos.comentarios,
            cliente.cedula);

        const reparacion = new Reparacion(
            null, // id_reparacion se autogenera
            new Date().toISOString().split('T')[0],
            null, // fecha_entrega se deja null porque se asigna cuando se entrega el dispositivo
            'pendiente',
            datos.costo_repuesto,
            datos.precio_reparacion, 
            datos.comentarios, 
            null // id_dispositivo se asigna después de insertar el dispositivo
            );
        
        //validaciones

        if (!cliente.validacion()) {
            return res.status(400).json({ success:false, message: 'Datos del cliente inválidos' });

        }
        if (!dispositivo.validacion()) {
            return res.status(400).json({ success:false, message: 'Datos del dispositivo inválidos' });
        }
        if (!reparacion.validacion()) {
            return res.status(400).json({ success:false, message: 'Datos de la reparación inválidos' });
        }

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        // Verificar si el cliente ya existe por su cédula
        const [clienteExistente] = await conexion.query('SELECT * FROM cliente WHERE cedula = ?', [cliente.cedula]);
        if(clienteExistente.length > 0){
            // Si el cliente ya existe, actualizar su información
           await conexion.query(
                'UPDATE cliente SET ? WHERE cedula = ?', [cliente.toUpdate(), cliente.cedula]);
        }
        else{
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
        res.status(201).json({ success:true, message: 'Registro creado exitosamente', 
            cedula: cliente.cedula, 
            id_dispositivo: id_dispositivo, 
            id_reparacion: reparacion.id_reparacion });
    }
    catch(error){
        // Si ocurre un error, hacer rollback de la transacción (solo si la conexión fue establecida)
        if (conexion) {
            await conexion.rollback();
        } 
        console.error('Error al crear el registro:', error);
        res.status(500).json({ success:false, message: error.message || 'Error al crear el registro' });
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
        const {cliente: datosCliente, dispositivos} = req.body;

        //validamos la informacion
        if (!datosCliente || !dispositivos || !Array.isArray(dispositivos) || dispositivos.length === 0) {
            return res.status(400).json({ success:false, message: 'Datos del cliente o dispositivos inválidos' });
        }
        // validaciones de cliente
        const cliente = new Cliente(
            datosCliente.cedula,
            datosCliente.nombre,
            datosCliente.email,
            datosCliente.telefono);

        if (!cliente.validacion()) {
            return res.status(400).json({ success:false, message: 'Datos del cliente inválidos' });
        }

        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        // se procesa al cliente, si ya existe se actualiza, si no existe se inserta
        const [clienteExistente] = await conexion.query('SELECT * FROM cliente WHERE cedula = ?', [cliente.cedula]);
        if(clienteExistente.length > 0){
            await conexion.query('UPDATE cliente SET ? WHERE cedula = ?', [cliente.toUpdate(), cliente.cedula]);
        }
        else{
            await conexion.query('INSERT INTO cliente SET ?', [cliente.toInsert()]);
        }
        const dipositivosRegistrados = [];

        // Se procesa cada dispositivo
        for (const d of dispositivos) {
            if (!d.reparaciones || !Array.isArray(d.reparaciones) || d.reparaciones.length === 0) {
                throw new Error('Cada dispositivo debe tener al menos una reparación');
            }

            const dispositivo = new Dispositivo(
                null,
                d.marca,
                d.version,
                d.tipo_reparacion,
                d.tipo_password,
                d.password,
                d.comentarios,
                cliente.cedula
            );
            if (!dispositivo.validacion()){
                throw new Error(`Datos del dispositivo de marca ${d.marca} inválidos`);
            }
            // insertar el dispositivo y obtener su ID para asociarlo a las reparaciones
            const [resultadoDispositivo] = await conexion.query('INSERT INTO dispositivo SET ?', [dispositivo.toInsert()]);
            const id_dispositivo = resultadoDispositivo.insertId;

            // arreglo temporal para almacenar las reparaciones registradas de este dispositivo, se usará para la respuesta final
            const reparacionesRegistradas = [];

            // Se procesa cada reparación del dispositivo
            for (const r of d.reparaciones) {
                const reparacion = new Reparacion(
                    null, 
                    new Date().toISOString().split('T')[0],
                    null, 
                    'pendiente',
                    r.costo_repuesto,
                    r.precio_reparacion, 
                    r.comentarios, 
                    id_dispositivo
                );

                if (!reparacion.validacion()) {
                    throw new Error(`Datos de la reparación para el dispositivo de marca ${d.marca} inválidos`);
                }
                const [resultadoReparacion] = await conexion.query('INSERT INTO reparacion SET ?', [reparacion.toInsert()]);

                reparacionesRegistradas.push({
                    id_reparacion: resultadoReparacion.insertId,
                    costo_repuesto: r.costo_repuesto,
                    precio_reparacion: r.precio_reparacion,
                    comentarios: r.comentarios
                });
            }

            dipositivosRegistrados.push({
                id_dispositivo,
                marca: d.marca,
                version: d.version,
                tipo_reparacion: d.tipo_reparacion,
                reparaciones: reparacionesRegistradas
            });

        }
        // Se confirma la transacción solo si todo se ha insertado correctamente
        await conexion.commit();

        res.status(201).json({ 
            success: true, 
            message: 'Registro múltiple exitoso',
            data: {
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
        res.status(500).json({ success:false, message: error.message || 'Error al crear el registro' });
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
        const clienteValidacion = new Cliente(cedula, '','','');
        if(!clienteValidacion.validacionCedula()){
            return res.status(400).json({ success:false, message: 'Cédula inválida' });
        }
        // Buscar en la DB
        conexion =  await pool.getConnection();

        const [clienteEncontrado] = await conexion.query('SELECT * FROM cliente WHERE cedula = ?', [cedula]);
        if (clienteEncontrado.length === 0) {
            return res.status(404).json({ success:false, message: 'Cliente no encontrado' });
        }

        // convertimos a objeto el cliente usando fromDB
        const clienteCompleto = Cliente.fromDB(clienteEncontrado[0]);
        res.status(200).json({ 
            success:true, 
            data: clienteCompleto
        });
    } 
    catch (error) {
        if (conexion) {
            conexion.release();
        }
        console.error('Error al buscar el cliente:', error);
        res.status(500).json({ success:false, message: 'Error al buscar el cliente' });
        }
    finally {
        if (conexion) {
            conexion.release();
        }
    }
};