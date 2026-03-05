import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registroRutas from './src/routes/registro.routes.js'
import {validarJSON} from './src/middleware/error.middleware.js'


dotenv.config();

const app = express()
const PORT = process.env.PORT || 3001



// Middleware
app.use(express.json());
app.use(validarJSON);
app.use(cors());

//Rutas
app.use('/api', registroRutas)

// error 404
app.use((req, res) =>{
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    })
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})

export default app