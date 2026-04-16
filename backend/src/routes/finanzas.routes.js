import express from 'express';
import * as finanzasController from '../controllers/finanzas.controller.js';
import { verificarAdmin } from '../middleware/auth.middleware.js';

const ruta = express.Router();

ruta.get('/dashboard', verificarAdmin, finanzasController.obtenerDashboardFinanciero);
ruta.get('/mensual', verificarAdmin, finanzasController.obtenerEstadisticasMensuales);
ruta.get('/torta', verificarAdmin, finanzasController.obtenerGraficoTorta);

export default ruta;