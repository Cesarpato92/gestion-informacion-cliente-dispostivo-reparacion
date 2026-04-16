import { useState } from 'react';
import './css/Usuarios.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ username: '', password: '', rol: 'tecnico' });

  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const handleChange = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    
    if (!nuevoUsuario.username.trim() || !nuevoUsuario.password.trim()) {
      setMensaje({ texto: 'Todos los campos son requeridos', tipo: 'error' });
      return;
    }

    if (nuevoUsuario.password.length < 4) {
      setMensaje({ texto: 'La contraseña debe tener al menos 4 caracteres', tipo: 'error' });
      return;
    }

    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/registro-usuario`, {
        method: 'POST',
        headers,
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensaje({ texto: 'Usuario creado exitosamente', tipo: 'success' });
        setNuevoUsuario({ username: '', password: '', rol: 'tecnico' });
        setMostrarFormulario(false);
      } else {
        setMensaje({ texto: data.message || 'Error al crear usuario', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="usuarios-container">
      <div className="usuarios-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-nuevo" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {mostrarFormulario && (
        <div className="formulario-usuario">
          <h3>Crear Nuevo Usuario</h3>
          <form onSubmit={crearUsuario}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input
                  type="text"
                  name="username"
                  value={nuevoUsuario.username}
                  onChange={handleChange}
                  placeholder="Ingrese nombre de usuario"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={nuevoUsuario.password}
                  onChange={handleChange}
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select name="rol" value={nuevoUsuario.rol} onChange={handleChange}>
                  <option value="tecnico">Técnico</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <button type="submit" className="btn-crear" disabled={cargando}>
                {cargando ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="info-panel">
        <h3>Información de Roles</h3>
        <div className="roles-grid">
          <div className="rol-card">
            <span className="rol-icon">👨‍💻</span>
            <h4>Técnico</h4>
            <ul>
              <li>Registro de clientes y dispositivos</li>
              <li>Gestión de reparaciones</li>
              <li>Garantías</li>
              <li>Facturación</li>
            </ul>
          </div>
          <div className="rol-card admin">
            <span className="rol-icon">⚙️</span>
            <h4>Administrador</h4>
            <ul>
              <li>Todas las funciones de técnico</li>
              <li>Acceso a Finanzas</li>
              <li>Gestión de usuarios</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="usuarios-nota">
        <p>📝 <strong>Nota:</strong> Los usuarios se crean desde este panel. Cada usuario podrá iniciar sesión con sus credenciales.</p>
      </div>
    </main>
  );
};
