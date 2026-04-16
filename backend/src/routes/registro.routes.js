import express from 'express'
import * as registroController from '../controllers/registro.controller.js'

const ruta = express.Router()

ruta.post('/registro', registroController.crearRegistroMultiple)
ruta.get('/buscar-cliente/:cedula', registroController.buscarClientePorCedula)
ruta.get('/buscar-orden/:nOrden', registroController.buscarReparacionPorNumeroOrden)
ruta.put('/actualizar-estado/:id', registroController.actualizarEstadoReparacion)

export default ruta;