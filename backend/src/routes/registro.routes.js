import express from 'express'
import * as registroController from '../controllers/registro.controller'

const ruta = express.Router()

// Rutas para el registro
ruta.post('/registro', registroController.crearRegistroMultiple)
ruta.get('/buscar-cliente/:cedula', registroController.buscarClientePorCedula)

