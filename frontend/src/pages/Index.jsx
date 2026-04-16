import { Link } from 'react-router-dom';
import './css/Index.css';

const getUsuarioInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return { rol: null, nombre: null };
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { rol: payload.rol, nombre: payload.nombre };
    } catch {
        return { rol: null, nombre: null };
    }
};

const featuresTecnico = [
  { icon: '📋', title: 'Registro de Clientes', description: 'Registra clientes y dispositivos nuevos' },
  { icon: '🔧', title: 'Reparaciones', description: 'Gestiona reparaciones del taller' },
  { icon: '🛡️', title: 'Garantías', description: 'Control de garantías' },
  { icon: '🧾', title: 'Facturación', description: 'Genera facturas' }
];

const featuresAdmin = [
  { icon: '📋', title: 'Registro de Clientes', description: 'Gestiona clientes' },
  { icon: '📊', title: 'Finanzas', description: 'Dashboard financiero' },
  { icon: '👥', title: 'Usuarios', description: 'Administra usuarios del sistema' },
  { icon: '🛡️', title: 'Garantías', description: 'Control de garantías' },
  { icon: '🧾', title: 'Facturación', description: 'Gestión de facturas' }
];

const Index = () => {
  const { rol, nombre } = getUsuarioInfo();
  const isAdmin = rol === 'administrador';
  const features = isAdmin ? featuresAdmin : featuresTecnico;
  const titulo = isAdmin ? 'Panel de Administración' : 'Panel de Técnico';

  return (
    <main className="index-container">
      <section className="hero-section">
        <div className="hero-content">
          {nombre && <p className="hero-usuario">👤 {nombre}</p>}
          <h1 className="hero-title">PCelMedic</h1>
          <p className="hero-subtitle">{titulo}</p>
          <p className="hero-description">
            {isAdmin 
              ? 'Administra las finanzas, usuarios y el funcionamiento del taller.'
              : 'Gestiona el registro de dispositivos y reparaciones del taller.'}
          </p>
          <div className="hero-buttons">
            {isAdmin ? (
              <>
                <Link to="/Finanzas" className="btn-hero btn-primary">Ver Finanzas</Link>
                <Link to="/Usuarios" className="btn-hero btn-secondary">Usuarios</Link>
              </>
            ) : (
              <>
                <Link to="/Registro" className="btn-hero btn-primary">Nueva Orden</Link>
                <Link to="/Reparacion" className="btn-hero btn-secondary">Reparaciones</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">{isAdmin ? '💰' : '🔧'}</span>
            <span className="stat-label">{isAdmin ? 'Finanzas' : 'Reparar'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{isAdmin ? '📊' : '📱'}</span>
            <span className="stat-label">{isAdmin ? 'Reportes' : 'Equipos'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{isAdmin ? '✅' : '🛡️'}</span>
            <span className="stat-label">{isAdmin ? 'Control' : 'Garantía'}</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">{isAdmin ? 'Funciones de Administración' : 'Funciones de Técnico'}</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="actions-grid">
          {!isAdmin && (
            <>
              <Link to="/Registro" className="action-card">
                <span className="action-icon">📝</span>
                <span className="action-text">Nueva Orden</span>
              </Link>
              <Link to="/Reparacion" className="action-card">
                <span className="action-icon">🔍</span>
                <span className="action-text">Buscar Orden</span>
              </Link>
              <Link to="/Garantias" className="action-card">
                <span className="action-icon">🛡️</span>
                <span className="action-text">Garantías</span>
              </Link>
              <Link to="/Facturacion" className="action-card">
                <span className="action-icon">🧾</span>
                <span className="action-text">Facturación</span>
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/Finanzas" className="action-card">
                <span className="action-icon">📈</span>
                <span className="action-text">Finanzas</span>
              </Link>
              <Link to="/Usuarios" className="action-card">
                <span className="action-icon">👥</span>
                <span className="action-text">Usuarios</span>
              </Link>
              <Link to="/Garantias" className="action-card">
                <span className="action-icon">🛡️</span>
                <span className="action-text">Garantías</span>
              </Link>
              <Link to="/Facturacion" className="action-card">
                <span className="action-icon">🧾</span>
                <span className="action-text">Facturación</span>
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Index;