import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.config.js';

export const login = async (req, res) => {
    let conexion;
    try {
        const { username, password } = req.body;

        // Validar que username y password existan
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Usuario y contraseña son obligatorios' 
            });
        }

        // Obtener conexión a la BD
        conexion = await pool.getConnection();

        // Buscar usuario por username
        const [usuarios] = await conexion.query(
            'SELECT id, username, password, rol, nombre FROM usuario WHERE username = ?', 
            [username]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

const usuarioEncontrado = usuarios[0];

        // Comparar contraseña con bcrypt
        const isMatch = await bcrypt.compare(password, usuarioEncontrado.password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Contraseña incorrecta' 
            });
        }

// Crear JWT
        const token = jwt.sign(
            { 
                id: usuarioEncontrado.id, 
                username: usuarioEncontrado.username, 
                nombre: usuarioEncontrado.nombre,
                rol: usuarioEncontrado.rol 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

res.json({ 
            success: true,
            token, 
            user: { 
                username: usuarioEncontrado.username,
                nombre: usuarioEncontrado.nombre,
                rol: usuarioEncontrado.rol 
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor' 
        });
    } finally {
        if (conexion) conexion.release();
    }
};