import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import logo from '../img/Logo Pcelmedic.png'

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

const normalizeRol = (rol) => {
  if (rol === 'admin' || rol === 'administrador') return 'admin';
  if (rol === 'tecnico' || rol === 'técnico') return 'tecnico';
  return rol;
};

export const Navbar = () => {
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [userRol, setUserRol] = useState(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData) {
      setUserRol(normalizeRol(tokenData.rol));
      setUserName(tokenData.username || 'Usuario');
    }
  }, [])

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto)
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  const isAdmin = userRol === 'admin';

  return (
    <nav className='navbar'>
      <div className="navbar-container">
        <div className="navbar-logo">
           
           <Link to={isAdmin ? "/admin" : "/tecnico"}>
              <img 
                src={logo} 
                alt="Logo Pcelmedic" 
                className="logo" 
                title="Dale vida a tu dispositivo!"
              />
           </Link>
           <p className='navbar-rol'>Panel de {isAdmin ? 'Administrador' : 'Técnico'}</p>
        </div>
        
        <button className="menu-icon" onClick={toggleMenu}>
          <span className={menuAbierto ? 'menu-icon-bar open' : 'menu-icon-bar'}></span>
          <span className={menuAbierto ? 'menu-icon-bar open' : 'menu-icon-bar'}></span>
          <span className={menuAbierto ? 'menu-icon-bar open' : 'menu-icon-bar'}></span>
        </button>

        <ul className={`nav-menu ${menuAbierto ? 'active' : ''}`}>
          <li>
            <Link 
              className={isAdmin ? (location.pathname === '/admin' ? 'active' : '') : (location.pathname === '/tecnico' ? 'active' : '')} 
              to={isAdmin ? "/admin" : "/tecnico"}
            >
              INICIO
            </Link>
          </li>
          
          {isAdmin ? (
            <>
              <li>
                <Link 
                  className={location.pathname === '/admin/usuarios' ? 'active' : ''} 
                  to="/admin/usuarios"
                >
                  USUARIOS
                </Link>
              </li>
              <li>
                <Link 
                  className={location.pathname === '/admin/reportes' ? 'active' : ''} 
                  to="/admin/reportes"
                >
                  REPORTES
                </Link>
              </li>
              <li>
                <Link 
                  className={location.pathname === '/admin/configuracion' ? 'active' : ''} 
                  to="/admin/configuracion"
                >
                  CONFIGURACIÓN
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  className={location.pathname === '/tecnico/registro' ? 'active' : ''} 
                  to="/tecnico/registro"
                >
                  REGISTRO
                </Link>
              </li>
              <li>
                <Link 
                  className={location.pathname === '/tecnico/reparacion' ? 'active' : ''} 
                  to="/tecnico/reparacion"
                >
                  REPARACIONES
                </Link>
              </li>
              <li>
                <Link 
                  className={location.pathname === '/tecnico/garantias' ? 'active' : ''} 
                  to="/tecnico/garantias"
                >
                  GARANTÍAS
                </Link>
              </li>
              <li>
                <Link 
                  className={location.pathname === '/tecnico/facturacion' ? 'active' : ''} 
                  to="/tecnico/facturacion"
                >
                  FACTURACIÓN
                </Link>
              </li>
            </>
          )}
          
          <li>
            <button 
              className='logout-btn'
              onClick={handleLogout}
            >
              CERRAR SESIÓN
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}