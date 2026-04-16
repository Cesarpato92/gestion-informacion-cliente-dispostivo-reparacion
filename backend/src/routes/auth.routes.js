import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verificarAdmin } from '../middleware/auth.middleware.js';

const ruta = express.Router();

ruta.post('/login', authController.login);
ruta.post('/registro-usuario', verificarAdmin, authController.crearUsuario);
ruta.get('/verificar', authController.verificarToken);
ruta.post('/solicitar-recuperacion', authController.solicitarRecuperacion);
ruta.post('/cambiar-password', authController.cambiarPassword);

export default ruta;
