import pool from '../config/db.config.js';
import { Usuario } from '../models/usuario.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export const login = async (req, res) => {
    let conexion;
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
        }

        conexion = await pool.getConnection();

        const [usuarios] = await conexion.query(
            'SELECT * FROM usuario WHERE username = ?',
            [username.trim()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        const usuarioDB = usuarios[0];
        const passwordValida = await bcrypt.compare(password, usuarioDB.password);

        if (!passwordValida) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { 
                id: usuarioDB.id, 
                username: usuarioDB.username, 
                rol: usuarioDB.rol,
                nombre: usuarioDB.nombre,
                celular: usuarioDB.celular
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                usuario: {
                    id: usuarioDB.id,
                    username: usuarioDB.username,
                    rol: usuarioDB.rol,
                    nombre: usuarioDB.nombre,
                    celular: usuarioDB.celular
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
    } finally {
        if (conexion) conexion.release();
    }
};

export const verificarToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        res.status(200).json({
            success: true,
            data: {
                id: decoded.id,
                username: decoded.username,
                rol: decoded.rol
            }
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};

export const crearUsuario = async (req, res) => {
    let conexion;
    try {
        const { username, password, rol, nombre, celular } = req.body;

        if (!username || !password || !rol || !nombre || !celular) {
            return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
        }

        const usuario = new Usuario(null, username, password, rol, nombre, celular);

        if (!usuario.validacion()) {
            return res.status(400).json({ success: false, message: 'Datos de usuario inválidos' });
        }

        const validacionPass = usuario.validarPassword(password);
        if (!validacionPass.valida) {
            return res.status(400).json({ success: false, message: validacionPass.mensaje });
        }

        conexion = await pool.getConnection();

        const [existente] = await conexion.query(
            'SELECT * FROM usuario WHERE username = ?',
            [usuario.username]
        );

        if (existente.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }

        const passwordEncriptada = await bcrypt.hash(password, SALT_ROUNDS);

        const [resultado] = await conexion.query(
            'INSERT INTO usuario (username, password, rol, nombre, celular) VALUES (?, ?, ?, ?, ?)',
            [usuario.username, passwordEncriptada, usuario.rol, usuario.nombre, usuario.celular]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: { id: resultado.insertId, username: usuario.username, rol: usuario.rol, nombre: usuario.nombre }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ success: false, message: 'Error al crear usuario' });
    } finally {
        if (conexion) conexion.release();
    }
};

export const solicitarRecuperacion = async (req, res) => {
    let conexion;
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, message: 'El usuario es requerido' });
        }

        conexion = await pool.getConnection();

        const [usuarios] = await conexion.query(
            'SELECT id, username FROM usuario WHERE username = ?',
            [username.trim()]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const tokenRecuperacion = crypto.randomBytes(32).toString('hex');
        const expira = new Date(Date.now() + 30 * 60 * 1000);

        await conexion.query(
            'UPDATE usuario SET token_recuperacion = ?, token_expira = ? WHERE id = ?',
            [tokenRecuperacion, expira, usuarios[0].id]
        );

        res.status(200).json({
            success: true,
            message: 'Token de recuperación generado',
            data: { 
                token: tokenRecuperacion,
                mensaje: 'En producción, este token se enviaría por email'
            }
        });
    } catch (error) {
        console.error('Error en solicitud recuperación:', error);
        res.status(500).json({ success: false, message: 'Error al procesar solicitud' });
    } finally {
        if (conexion) conexion.release();
    }
};

export const cambiarPassword = async (req, res) => {
    let conexion;
    try {
        const { username, token, nuevaPassword } = req.body;

        if (!username || !token || !nuevaPassword) {
            return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
        }

        if (nuevaPassword.length < 4) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 4 caracteres' });
        }

        conexion = await pool.getConnection();

        const [usuarios] = await conexion.query(
            'SELECT id, username FROM usuario WHERE username = ? AND token_recuperacion = ? AND token_expira > NOW()',
            [username.trim(), token]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
        }

        const passwordEncriptada = await bcrypt.hash(nuevaPassword, SALT_ROUNDS);

        await conexion.query(
            'UPDATE usuario SET password = ?, token_recuperacion = NULL, token_expira = NULL WHERE id = ?',
            [passwordEncriptada, usuarios[0].id]
        );

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al cambiar password:', error);
        res.status(500).json({ success: false, message: 'Error al cambiar contraseña' });
    } finally {
        if (conexion) conexion.release();
    }
};
