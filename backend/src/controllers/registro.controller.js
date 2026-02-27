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
            datos.telefono,
            datos.email);

        const dispositivo = new Dispositivo(
            null,
            datos.marca,
            datos.version,
            datos.tipo_reparacion,
            datos.tipo_password,
            datos.password,
            cliente.cedula);

        const reparacion = new Reparacion(
            null,
            new Date().toISOString().split('T')[0],
            null, 'pendiente',
            datos.costo_repuesto,
            datos.precio_reparacion, 
            datos.comentarios, null);
        
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
        console.error('Error al buscar el cliente:', error);
        res.status(500).json({ success:false, message: 'Error al buscar el cliente' });
        }
    finally {
        if (conexion) {
            conexion.release();
        }
    }
};