import pool from '../config/db.js';
import cliente from '../models/cliente.model.js';
import dispositivo from '../models/dispositivo.model.js';
import reparacion from '../models/reparacion.model.js';

export const crearRegistro = async (req, res) => {
    const conexion = await pool.beginTransaction();

    try{
        const {
            cedula,
            nombre,
            telefono,
            email,
            marca,
            version,
            tipo_reparacion,
            tipo_password,
            password,
            precio_reparacion,
            costo_repuesto,
            comentarios

        } = req.body;  
        // Verificar si el cliente ya existe por su cédula
        const [clienteExistente] = await conexion.query('SELECT * FROM cliente WHERE cedula = ?', [cedula]);
        if(clienteExistente.length > 0){
            // Si el cliente ya existe, actualizar su información
           await conexion.query('UPDATE cliente SET nombre = ?, telefono = ?, email = ? WHERE cedula = ?', [nombre, telefono, email, cedula]);
        }
        else{
            await conexion.query('INSERT INTO cliente (cedula, nombre, telefono, email) VALUES (?, ?, ?, ?)', [cedula, nombre, telefono, email]);
        }
        // Insertar el dispositivo asociado al cliente
        const [resultadoDispositivo] = await conexion.query('INSERT INTO dispositivo (marca, version, tipo_reparacion, tipo_password, password, cedula_cliente) VALUES (?, ?, ?, ?, ?, ?)', [marca, version, tipo_reparacion, tipo_password, password, cedula]);

        // Obtener el ID del dispositivo recién insertado para usarlo en la tabla de reparaciones
        const id_dispositivo = resultadoDispositivo.insertId;
        // Insertar la reparación asociada al dispositivo
        await conexion.query('INSERT INTO reparacion (fecha_ingreso, estado, costo_repuesto, precio_reparacion, comentarios, id_dispositivo) VALUES (NOW(), ?, ?, ?, ?, ?)', ['pendiente', costo_repuesto, precio_reparacion, comentarios, id_dispositivo]);

        await conexion.commit();
        res.status(201).json({ success:true, message: 'Registro creado exitosamente', cedula, id_dispositivo });
    }
    catch(error){
        await conexion.rollback();
        console.error('Error al crear el registro:', error);
        res.status(500).json({ success:false, message: error.message || 'Error al crear el registro' });
    }
    finally {
        conexion.release();
    }
};