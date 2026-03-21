import {Link, useLocation} from 'react-router-dom'
import './Navbar.css'
import logo from '../img/Logo Pcelmedic.png'

export const Navbar = () => {
  const location = useLocation()
  return (
    <>
    <nav className='navbar'>
      <ul>
        <li><img src={logo} alt="Logo Pcelmedic" className="logo" title='Dale vida a tu dispositivo!'/></li>
                <li><Link className={location.pathname === '/' ? 'active' : ''} to="/">INICIO</Link></li>
                <li><Link className={location.pathname === '/registro' ? 'active' : ''} to="/registro">REGISTRO</Link></li>
                <li><Link className={location.pathname === '/reparaciones' ? 'active' : ''} to="/reparaciones">GESTION REPARACIONES</Link></li>
                <li><Link className={location.pathname === '/garantias' ? 'active' : ''} to="/garantias">GARANTIAS</Link></li>
                <li><Link className={location.pathname === '/facturacion' ? 'active' : ''} to="/facturacion">FACTURACION</Link></li>
                <li><Link className={location.pathname === '/finanzas' ? 'active' : ''} to="/finanzas">FINANZAS</Link></li>
      </ul>
    </nav>
    </>
  )
}
