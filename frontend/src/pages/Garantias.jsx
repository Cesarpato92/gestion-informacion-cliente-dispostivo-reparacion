import React, { useEffect, useState } from 'react';
import { garantiaHook } from '../hooks/garantia.hook';
import './css/Garantias.css';

const verificarVigencia = (vigencia) => {
    if (!vigencia) return { valida: false, mensaje: 'Sin garantía' };
    const fechaVigencia = new Date(vigencia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil((fechaVigencia - hoy) / (1000 * 60 * 60 * 24));
    if (diasRestantes < 0) return { valida: false, mensaje: 'Vencida' };
    if (diasRestantes === 0) return { valida: true, mensaje: 'Vence hoy' };
    return { valida: true, mensaje: `${diasRestantes} días` };
};

function Garantias() {
    const {
        garantias,
        loading,
        mensaje,
        busqueda,
        setBusqueda,
        reparacionData,
        buscarPorOrden,
        registrarGarantia,
        limpiarBusqueda
    } = garantiaHook();

    const [showForm, setShowForm] = useState(false);
    const [tipoMovimiento, setTipoMovimiento] = useState('entrada');
    const [observaciones, setObservaciones] = useState('');
    const [selectedReparacion, setSelectedReparacion] = useState(null);
    const [garantiaExpandida, setGarantiaExpandida] = useState(null);

    const garantiasOrden = reparacionData?.garantias || [];

    const toggleGarantia = (index) => {
        setGarantiaExpandida(garantiaExpandida === index ? null : index);
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        buscarPorOrden(busqueda);
    };

    const handleRegistrar = async () => {
        if (!selectedReparacion) return;
        const success = await registrarGarantia(selectedReparacion.id_reparacion, tipoMovimiento, observaciones);
        if (success) {
            setShowForm(false);
            setObservaciones('');
            setSelectedReparacion(null);
            buscarPorOrden(busqueda);
        }
    };

    const seleccionarReparacion = (rep) => {
        setSelectedReparacion(rep);
        setShowForm(true);
    };

    return (
        <div className="contenedor-garantias">
            <h2>Gestión de Garantías</h2>

            <form onSubmit={handleBuscar} className="busqueda-form">
                <div className="fila-inputs">
                    <input
                        type="text"
                        placeholder="Número de orden (ej: ORD-20240415-0001)"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        Buscar
                    </button>
                    <button type="button" onClick={limpiarBusqueda}>
                        Limpiar
                    </button>
                </div>
            </form>

            {mensaje.texto && (
                <div className={`mensaje ${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            {reparacionData && !showForm && (
                <div className="resultado-busqueda">
                    <h3>Orden: {reparacionData.n_orden}</h3>
                    <p><strong>Cliente:</strong> {reparacionData.cliente.nombre}</p>
                    <p><strong>Teléfono:</strong> {reparacionData.cliente.telefono}</p>

                    <h4>Reparaciones:</h4>
                    {reparacionData.dispositivos.map((disp, dIndex) => (
                        <div key={dIndex} className="dispositivo-garantia">
                            <p><strong>Dispositivo:</strong> {disp.marca} {disp.version}</p>
                            {disp.reparaciones.map((rep, rIndex) => {
                                const vigencia = verificarVigencia(rep.vigencia_garantia);
                                const tieneGarantia = rep.vigencia_garantia && rep.estado === 'completada';
                                const tieneGarantiaVenctica = tieneGarantia && vigencia.valida;
                                return (
                                    <div key={rIndex} className={`reparacion-item ${!vigencia.valida ? 'vencida' : ''}`}>
                                        <div className="rep-info">
                                            <p><strong>{rep.tipo_reparacion}</strong></p>
                                            <p className="rep-detalle">Estado: {rep.estado} - ${rep.precio_reparacion}</p>
                                            {tieneGarantia && (
                                                <p className={`vigencia ${vigencia.valida ? 'activa' : 'vencida'}`}>
                                                    Garantía: {vigencia.mensaje} ({rep.vigencia_garantia})
                                                </p>
                                            )}
                                        </div>
                                        {rep.estado === 'completada' && tieneGarantiaVenctica && (
                                            <button
                                                onClick={() => seleccionarReparacion(rep)}
                                                disabled={loading}
                                            >
                                                + Garantía
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {showForm && selectedReparacion && (
                <div className="form-garantia">
                    <h3>Registrar en Garantía</h3>
                    <div className="info-reparacion">
                        <p><strong>Reparación:</strong> {selectedReparacion.tipo_reparacion}</p>
                        <p><strong>Orden:</strong> {reparacionData?.n_orden}</p>
                        <p><strong>Vigencia:</strong> {selectedReparacion.vigencia_garantia || 'Sin garantía'}</p>
                    </div>

                    <div className="fila-inputs">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="tipo"
                                value="entrada"
                                checked={tipoMovimiento === 'entrada'}
                                onChange={(e) => setTipoMovimiento(e.target.value)}
                            />
                            Entrada (ingresa a garantía)
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="tipo"
                                value="salida"
                                checked={tipoMovimiento === 'salida'}
                                onChange={(e) => setTipoMovimiento(e.target.value)}
                            />
                            Salida (retorno)
                        </label>
                    </div>

                    <textarea
                        placeholder="Observaciones..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                    />

                    <div className="fila-inputs">
                        <button onClick={handleRegistrar} disabled={loading}>
                            {loading ? 'Guardando...' : 'Confirmar'}
                        </button>
                        <button onClick={() => { setShowForm(false); setSelectedReparacion(null); }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {busqueda && (
                <div className="lista-garantias">
                    <h3>Garantías de orden: {busqueda}</h3>
                    {loading && <p>Cargando...</p>}
                    {!loading && garantiasOrden.length === 0 && <p>No hay garantías para esta orden</p>}
                    {!loading && garantiasOrden.length > 0 && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Técnico</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {garantiasOrden.map((g, i) => (
                                    <React.Fragment key={i}>
                                        <tr onClick={() => toggleGarantia(i)} style={{ cursor: 'pointer' }}>
                                            <td>{g.fecha_movimiento}</td>
                                            <td className={g.tipo_movimiento === 'entrada' ? 'tipo-entrada' : 'tipo-salida'}>
                                                {g.tipo_movimiento === 'entrada' ? 'Entrada' : 'Salida'}
                                            </td>
                                            <td>{g.tecnico || 'N/A'}</td>
                                            <td>{g.observaciones ? (garantiaExpandida === i ? '▲' : '▼') : '-'}</td>
                                        </tr>
                                        {garantiaExpandida === i && g.observaciones && (
                                            <tr>
                                                <td colSpan="4" style={{ background: '#f5f5f5', padding: '8px', fontSize: '13px' }}>
                                                    <strong>Obs:</strong> {g.observaciones}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default Garantias;