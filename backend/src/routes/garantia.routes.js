import express from 'express';
import * as garantiaController from '../controllers/garantia.controller.js';

const ruta = express.Router();

ruta.post('/registrar', garantiaController.registrarMovimientoGarantia);
ruta.get('/listar', garantiaController.obtenerGarantias);
ruta.get('/por-orden/:nOrden', garantiaController.obtenerGarantiasPorOrden);

export default ruta;