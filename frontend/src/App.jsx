import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Index } from "./pages/Index.jsx"
import { Autenticacion } from "./pages/Autenticacion.jsx"
import { Admin } from "./pages/admin/Admin.jsx"
import { Tecnico } from "./pages/tecnico/Tecnico.jsx"
import { Registro } from "./pages/tecnico/pages/Registro.jsx"
import { Reparacion } from "./pages/tecnico/pages/Reparacion.jsx"
import Garantias from "./pages/tecnico/pages/Garantias.jsx"
import Facturacion from "./pages/tecnico/pages/Facturacion.jsx"
import Finanzas from "./pages/admin/pages/Finanzas.jsx"
import './global.css'

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

const ProtectedRoute = ({ children, rolRequerido }) => {
  const tokenData = getTokenData();
  if (!tokenData) return <Navigate to="/" replace />;
  const userRol = normalizeRol(tokenData.rol);
  const requiredRol = normalizeRol(rolRequerido);
  if (rolRequerido && userRol !== requiredRol) {
    return userRol === 'admin' 
      ? <Navigate to="/admin" replace /> 
      : <Navigate to="/tecnico" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Autenticacion />} />
        
        <Route path="/admin" element={<ProtectedRoute rolRequerido="admin"><Admin /></ProtectedRoute>} />
        
        <Route path="/tecnico" element={<ProtectedRoute rolRequerido="tecnico"><Tecnico /></ProtectedRoute>} />
        <Route path="/tecnico/registro" element={<ProtectedRoute rolRequerido="tecnico"><Registro /></ProtectedRoute>} />
        <Route path="/tecnico/reparacion" element={<ProtectedRoute rolRequerido="tecnico"><Reparacion /></ProtectedRoute>} />
        <Route path="/tecnico/garantias" element={<ProtectedRoute rolRequerido="tecnico"><Garantias /></ProtectedRoute>} />
        <Route path="/tecnico/facturacion" element={<ProtectedRoute rolRequerido="tecnico"><Facturacion /></ProtectedRoute>} />
        
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
