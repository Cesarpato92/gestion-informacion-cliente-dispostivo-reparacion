import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Ruta de login
router.post('/login', authController.login);

export default router;