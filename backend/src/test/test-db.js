import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carga de variables de primera para verificar que se encuentran disponibles
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Ahora a importar pool después de cargar las variables de entorno
import pool from '../config/db.config.js';

async function testConnection() {
    let conexion;
    try {
        console.log('Conectando con variables de entorno:');
        console.log('   Host:', process.env.DB_HOST);
        console.log('   Port:', process.env.DB_PORT);
        console.log('   User:', process.env.DB_USER);
        
        conexion = await pool.getConnection();
        console.log('Conexión exitosa');
        
        const [resultado] = await conexion.query("SELECT NOW() as time");
        console.log('Hora actual:', resultado[0].time);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conexion) conexion.release();
    }
}

testConnection();