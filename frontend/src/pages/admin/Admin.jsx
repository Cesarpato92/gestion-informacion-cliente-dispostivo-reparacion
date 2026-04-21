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

export const Admin = () => {
    const tokenData = getTokenData();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const nombreMostrar = tokenData?.nombre || user?.nombre || user?.username || 'Usuario';

    return (
        <>
            <Navbar />
            <div style={{ padding: '20px' }}>
                <h1>Panel de Administrador</h1>
                <p>Bienvenido, {nombreMostrar}</p>
                <p>Rol: {user.rol || tokenData?.rol}</p>

                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h2>Opciones de Administrador</h2>
                    <ul>
                        <li>Gestionar usuarios</li>
                        <li>Ver reportes</li>
                        <li>Configurar sistema</li>
                    </ul>
                </div>
            </div>
        </>
    )
}
