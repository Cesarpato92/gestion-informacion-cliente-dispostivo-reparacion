import React from 'react'
import './Autenticacion.css'
import { AutenticacionHook } from '../hooks/Autenticacion.hook'

export const Autenticacion = () => {

    const { usuario, error, handleInputChange, handleSubmit, mensaje } = AutenticacionHook()

    return (
        <div className='contenedor-autenticacion'>
            <h1 className='titulo'>Autenticación SGI PCELMEDIC</h1>
            <form className='formulario' onSubmit={handleSubmit}>
                <div className='input-group'>
                    <input 
                        type="text" 
                        placeholder="Usuario" 
                        name='username' 
                        value={usuario.username}
                        onChange={handleInputChange} 
                    />
                </div>
                <div className='input-group'>
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        name='password' 
                        value={usuario.password}
                        onChange={handleInputChange} 
                    />
                </div>
                <button type="submit">Iniciar Sesión</button>
                
                {mensaje.texto && <p className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</p>}
            </form>
            <div className='enlaces'><a href="">¿Olvidaste tu contraseña?</a></div>
        </div>
    )
}
