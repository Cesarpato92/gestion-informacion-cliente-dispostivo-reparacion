import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Navbar } from "./components/Navbar"
import Index from "./pages/Index.jsx"
import { Registro } from "./pages/Registro.jsx"
import { Reparacion } from "./pages/Reparacion.jsx"
import Garantias from "./pages/Garantias.jsx"
import Facturacion from "./pages/Facturacion.jsx"
import Finanzas from "./pages/Finanzas.jsx"
import { Login } from "./pages/Login.jsx"
import { Usuarios } from "./pages/Usuarios.jsx"
import './pages/css/Index.css'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [logueado, setLogueado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    if (token && usuario) {
      setLogueado(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setLogueado(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setLogueado(false);
  };

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (!logueado || !usuario) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar usuario={usuario} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Index />} />
        
        <Route path="/Registro" element={
          <ProtectedRoute allowedRoles={['tecnico']}>
            <Registro />
          </ProtectedRoute>
        } />
        
        <Route path="/Reparacion" element={
          <ProtectedRoute allowedRoles={['tecnico']}>
            <Reparacion />
          </ProtectedRoute>
        } />
        
        <Route path="/Garantias" element={
          <ProtectedRoute allowedRoles={['tecnico']}>
            <Garantias />
          </ProtectedRoute>
        } />
        
        <Route path="/Facturacion" element={
          <ProtectedRoute allowedRoles={['tecnico']}>
            <Facturacion />
          </ProtectedRoute>
        } />
        
        <Route path="/Finanzas" element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <Finanzas />
          </ProtectedRoute>
        } />
        
        <Route path="/Usuarios" element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <Usuarios />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
