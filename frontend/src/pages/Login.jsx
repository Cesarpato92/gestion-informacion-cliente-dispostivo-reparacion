import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Login.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modoRecuperacion, setModoRecuperacion] = useState(false);
  const [token, setToken] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!username.trim() || !password.trim()) {
      setError('Ingrese usuario y contraseña');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        onLogin(data.data.usuario);
        navigate('/');
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const solicitarToken = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!username.trim()) {
      setError('Ingrese su nombre de usuario');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/solicitar-recuperacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensaje('Token generado. Ingresa el token y tu nueva contraseña.');
        setModoRecuperacion(true);
      } else {
        setError(data.message || 'Error al solicitar recuperación');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!token.trim() || !nuevaPassword.trim()) {
      setError('Ingrese el token y la nueva contraseña');
      return;
    }

    if (nuevaPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/cambiar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          token: token.trim(),
          nuevaPassword: nuevaPassword 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensaje('Contraseña actualizada. Ahora puede iniciar sesión.');
        setTimeout(() => {
          setModoRecuperacion(false);
          setToken('');
          setNuevaPassword('');
          setMensaje('');
        }, 2000);
      } else {
        setError(data.message || 'Error al cambiar contraseña');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PCelMedic</h1>
          <p>Sistema de Gestión</p>
        </div>

        {!modoRecuperacion ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <button 
              type="button" 
              className="btn-olvide"
              onClick={solicitarToken}
              disabled={loading}
            >
              ¿Olvidé mi contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={cambiarPassword} className="login-form">
            <div className="info-recuperacion">
              <p>Recuperación de contraseña</p>
              <small>Ingrese el token proporcionado y su nueva contraseña</small>
            </div>

            <div className="form-group">
              <label htmlFor="token">Token de Recuperación</label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ingrese el token"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nuevaPassword">Nueva Contraseña</label>
              <input
                type="password"
                id="nuevaPassword"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {mensaje && <div className="success-message">{mensaje}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>

            <button 
              type="button" 
              className="btn-olvide"
              onClick={() => {
                setModoRecuperacion(false);
                setToken('');
                setNuevaPassword('');
                setError('');
              }}
              disabled={loading}
            >
              Volver al Login
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>© 2024 PCelMedic - Todos los derechos reservados</p>
        </div>
      </div>
    </main>
  );
};
