import React from 'react'
import { Navbar } from '../../components/Navbar'

const getTokenData = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const Tecnico = () => {
    const tokenData = getTokenData();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const nombreMostrar = tokenData?.nombre || user?.nombre || 'Usuario';

    return (
        <>
            <Navbar />
            <div style={{ padding: '20px' }}>
                <h1>Panel de Técnico</h1>
                <p>Bienvenido, {nombreMostrar}</p>
               
                
                

                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h2>Opciones Disponibles</h2>
                    <ul>
                        <li>Registrar nuevas reparaciones</li>
                        <li>Ver estado de reparaciones</li>
                        <li>Gestionar garantías</li>
                        <li>Generar facturas</li>
                        <li>Ver reportes financieros</li>
                    </ul>
                </div>
            </div>
        </>
    )
}
