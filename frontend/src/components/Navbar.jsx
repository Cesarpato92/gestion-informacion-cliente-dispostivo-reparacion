import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import logo from '../img/Logo Pcelmedic.png'

const menuItemsByRole = {
  tecnico: [
    { path: '/', label: 'INICIO' },
    { path: '/Registro', label: 'REGISTRO' },
    { path: '/Reparacion', label: 'REPARACIONES' },
    { path: '/Garantias', label: 'GARANTIAS' },
    { path: '/Facturacion', label: 'FACTURAS' },
  ],
  administrador: [
    { path: '/', label: 'INICIO' },
    { path: '/Finanzas', label: 'FINANZAS' },
    { path: '/Usuarios', label: 'USUARIOS' },
  ]
}

export const Navbar = ({ usuario, onLogout }) => {
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const menuItems = menuItemsByRole[usuario?.rol] || menuItemsByRole.tecnico

  const Menu = () => {
    setMenuAbierto(!menuAbierto)
  }

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  const handleLogout = () => {
    onLogout();
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
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                className={location.pathname === item.path ? 'active' : ''} 
                to={item.path}
                onClick={cerrarMenu}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="user-info">
            <span className="user-badge">{usuario?.username}</span>
            <span className={`role-badge role-${usuario?.rol}`}>
              {usuario?.rol === 'administrador' ? 'Admin' : 'Técnico'}
            </span>
          </li>
          <li>
            <button className="btn-logout" onClick={handleLogout}>
              CERRAR SESIÓN
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
