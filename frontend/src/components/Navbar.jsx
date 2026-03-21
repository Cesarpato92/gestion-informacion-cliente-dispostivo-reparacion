import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import logo from '../img/Logo Pcelmedic.png'

export const Navbar = () => {
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const Menu = () => {
    setMenuAbierto(!menuAbierto)
  }

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  return (
    <nav className='navbar'>
      <div className="navbar-container">
        <div className="navbar-logo">
           <Link to="/" className="navbar-logo">
              <img 
                src={logo} 
                alt="Logo Pcelmedic" 
                className="logo" 
                title="Dale vida a tu dispositivo!"
              />
            </Link>
        </div>
        
        <button className="menu-icon" onClick={Menu}>
          <span className={menuAbierto ? 'menu-icon-bar open' : 'menu-icon-bar'}></span>
          <span className={menuAbierto ? 'menu-icon-bar open' : 'menu-icon-bar'}></span>
          <span className={menuAbierto ? 'menu-icon-bar open' : 'menu-icon-bar'}></span>
        </button>

        <ul className={`nav-menu ${menuAbierto ? 'active' : ''}`}>
          <li>
            <Link 
              className={location.pathname === '/' ? 'active' : ''} 
              to="/"
              onClick={cerrarMenu}
            >
              INICIO
            </Link>
          </li>
          <li>
            <Link 
              className={location.pathname === '/Registro' ? 'active' : ''} 
              to="/Registro"
              onClick={cerrarMenu}
            >
              REGISTRO
            </Link>
          </li>
          <li>
            <Link 
              className={location.pathname === '/Reparacion' ? 'active' : ''} 
              to="/Reparacion"
              onClick={cerrarMenu}
            >
              GESTION REPARACIONES
            </Link>
          </li>
          <li>
            <Link 
              className={location.pathname === '/Garantias' ? 'active' : ''} 
              to="/Garantias"
              onClick={cerrarMenu}
            >
              GARANTIAS
            </Link>
          </li>
          <li>
            <Link 
              className={location.pathname === '/Facturacion' ? 'active' : ''} 
              to="/Facturacion"
              onClick={cerrarMenu}
            >
              FACTURACION
            </Link>
          </li>
          <li>
            <Link 
              className={location.pathname === '/Finanzas' ? 'active' : ''} 
              to="/Finanzas"
              onClick={cerrarMenu}
            >
              FINANZAS
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
