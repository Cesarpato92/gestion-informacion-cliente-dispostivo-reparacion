import React, { useState, useEffect } from 'react';
import './css/reparacion.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const Reparacion = () => {
    const [numeroOrden, setNumeroOrden] = useState('');
    const [datosOrden, setDatosOrden] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [reparacionesEditadas, setReparacionesEditadas] = useState({});
    const [dispositivosExpandidos, setDispositivosExpandidos] = useState({});

    useEffect(() => {
        if (mensaje.texto) {
            const timer = setTimeout(() => {
                setMensaje({ texto: '', tipo: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [mensaje.texto]);

    const buscarOrden = async (e) => {
        e.preventDefault();

        if (!numeroOrden.trim()) {
            setMensaje({ texto: 'Ingrese un número de orden', tipo: 'error' });
            return;
        }

        setLoading(true);
        setMensaje({ texto: 'Buscando...', tipo: 'info' });
        setDatosOrden(null);
        setReparacionesEditadas({});
        setDispositivosExpandidos({});

        try {
            const response = await fetch(`${API_URL}/registro/buscar-orden/${encodeURIComponent(numeroOrden.trim())}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setDatosOrden(data.data);
                const expandidos = {};
                data.data.dispositivos.forEach((d, i) => { expandidos[d.id_dispositivo] = i < 2; });
                setDispositivosExpandidos(expandidos);
                setMensaje({ texto: 'Orden encontrada', tipo: 'success' });
            } else {
                setMensaje({ texto: data.message || 'No se encontró ninguna orden', tipo: 'error' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error de conexión con el servidor', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const limpiarBusqueda = () => {
        setNumeroOrden('');
        setDatosOrden(null);
        setMensaje({ texto: '', tipo: '' });
        setReparacionesEditadas({});
        setDispositivosExpandidos({});
    };

    const getEstadoClase = (estado) => {
        const estadoLower = estado?.toLowerCase().replace(/\s+/g, '-') || '';
        return `estado-badge estado-${estadoLower}`;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Pendiente';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatearMoneda = (valor) => {
        if (valor === null || valor === undefined) return '$0.00';
        return `$${parseFloat(valor).toFixed(2)}`;
    };

    const calcularTotal = () => {
        if (!datosOrden?.dispositivos) return 0;
        return datosOrden.dispositivos.reduce((total, disp) => {
            return total + disp.reparaciones.reduce((subtotal, rep) => subtotal + (parseFloat(rep.precio_reparacion) || 0), 0);
        }, 0);
    };

    const handleReparacionChange = (idReparacion, field, value) => {
        setReparacionesEditadas(prev => ({
            ...prev,
            [idReparacion]: { ...prev[idReparacion], [field]: value }
        }));
    };

    const tieneCambios = (idReparacion) => !!reparacionesEditadas[idReparacion];

    const toggleDispositivo = (idDispositivo) => {
        setDispositivosExpandidos(prev => ({ ...prev, [idDispositivo]: !prev[idDispositivo] }));
    };

    const validarCambios = () => {
        if (!datosOrden?.dispositivos) return null;
        for (const dispositivo of datosOrden.dispositivos) {
            for (const reparacion of dispositivo.reparaciones) {
                const dataEditada = reparacionesEditadas[reparacion.id_reparacion];
                if (!dataEditada) continue;

                const estado = dataEditada?.estado || reparacion.estado;
                const costoRepuesto = dataEditada?.costo_repuesto;
                const costoNum = costoRepuesto !== undefined && costoRepuesto !== '' ? parseFloat(costoRepuesto) : null;

                if (estado === 'completada' && (costoNum === null || costoNum <= 0)) {
                    return `Para estado "Completada", el costo de repuesto debe ser mayor a cero`;
                }

                if (estado === 'cancelada' && costoNum !== null && costoNum > 0) {
                    return `Para estado "Cancelada", el costo de repuesto debe ser cero`;
                }

                if (costoNum !== null && reparacion.precio_reparacion && costoNum > reparacion.precio_reparacion) {
                    return `El costo de repuesto no puede ser mayor al precio de reparación (${formatearMoneda(reparacion.precio_reparacion)})`;
                }

                if (costoRepuesto !== undefined && costoRepuesto !== '' && isNaN(parseFloat(costoRepuesto))) {
                    return `Costo repuesto reparación #${reparacion.id_reparacion} debe ser número`;
                }
                if (costoRepuesto !== undefined && costoRepuesto !== '' && parseFloat(costoRepuesto) < 0) {
                    return `Costo repuesto reparación #${reparacion.id_reparacion} no puede ser negativo`;
                }
            }
        }
        return null;
    };

    const guardarTodosCambios = async () => {
        const errorValidacion = validarCambios();
        if (errorValidacion) {
            setMensaje({ texto: errorValidacion, tipo: 'error' });
            return;
        }

        if (!datosOrden?.dispositivos) return;

        const reparacionesAActualizar = [];

        for (const dispositivo of datosOrden.dispositivos) {
            for (const reparacion of dispositivo.reparaciones) {
                const dataEditada = reparacionesEditadas[reparacion.id_reparacion];
                let estado, costo_repuesto, comentarios_tecnico;

                estado = dataEditada?.estado || reparacion.estado;

                if (estado !== 'completada' && estado !== 'cancelada') {
                    setMensaje({ texto: 'Solo puede guardar cuando el estado sea Completada o Cancelada', tipo: 'error' });
                    return;
                }

                costo_repuesto = dataEditada?.costo_repuesto !== undefined
                    ? (dataEditada.costo_repuesto === '' ? 0 : parseFloat(dataEditada.costo_repuesto))
                    : (reparacion.costo_repuesto || 0);
                comentarios_tecnico = dataEditada?.comentarios_tecnico ?? reparacion.comentarios_tecnico ?? '';

                reparacionesAActualizar.push({ id_reparacion: reparacion.id_reparacion, estado, costo_repuesto, comentarios_tecnico });
            }
        }

        if (reparacionesAActualizar.length === 0) {
            setMensaje({ texto: 'No hay cambios para guardar', tipo: 'info' });
            return;
        }

        setGuardando(true);
        let exitosos = 0;
        let errores = 0;

        try {
            for (const rep of reparacionesAActualizar) {
                const response = await fetch(`${API_URL}/registro/actualizar-estado/${rep.id_reparacion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: rep.estado, costo_repuesto: rep.costo_repuesto, comentarios_tecnico: rep.comentarios_tecnico })
                });
                const data = await response.json();
                if (response.ok && data.success) { exitosos++; } else { errores++; }
            }

            if (errores === 0) {
                setMensaje({ texto: 'Cambios guardados exitosamente', tipo: 'success' });
                setReparacionesEditadas({});
                setNumeroOrden('');
                setDatosOrden(null);
            } else {
                setMensaje({ texto: `${exitosos} guardado(s), ${errores} error(es)`, tipo: 'error' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error de conexión con el servidor', tipo: 'error' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <main className="contenedor-reparacion">
            <form onSubmit={buscarOrden}>
                <div className="grupo grupo-busqueda">
                    <h2>Buscar Orden de Reparación</h2>
                    <div className="busqueda-container">
                        <div className="textos">
                            <input type="text" id="numeroOrden" value={numeroOrden} onChange={(e) => setNumeroOrden(e.target.value)} placeholder=" " disabled={loading} />
                            <span className="input-placeholder">Número de Orden (ej: ORD-20260415-0001)</span>
                        </div>
                        <div className="botones-busqueda">
                            <button type="submit" className="btn-buscar" disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
                            {datosOrden && <button type="button" className="btn-limpiar" onClick={limpiarBusqueda}>Limpiar</button>}
                        </div>
                    </div>
                </div>
            </form>

            {datosOrden && (
                <>
                    <div className="grupo">
                        <h2>Información de la Orden</h2>
                        <div className="datos-grid">
                            <div className="dato-item"><label>Número de Orden</label><p className="orden-numero">{datosOrden.n_orden}</p></div>
                            <div className="dato-item"><label>Dispositivos</label><p className="numero-grande">{datosOrden.total_dispositivos}</p></div>
                            <div className="dato-item"><label>Reparaciones</label><p className="numero-grande">{datosOrden.total_reparaciones}</p></div>
                            <div className="dato-item"><label>Total a Pagar</label><p className="total-pagar">{formatearMoneda(calcularTotal())}</p></div>
                        </div>
                    </div>

                    <div className="grupo">
                        <h2>Cliente: {datosOrden.cliente.nombre}</h2>
                        <div className="datos-grid">
                            <div className="dato-item"><label>Cédula</label><p>{datosOrden.cliente.cedula}</p></div>
                            <div className="dato-item"><label>Teléfono</label><p>{datosOrden.cliente.telefono}</p></div>
                            <div className="dato-item"><label>Email</label><p>{datosOrden.cliente.email}</p></div>
                        </div>
                    </div>

                    {datosOrden.dispositivos.map((dispositivo, dIndex) => (
                        <div key={dispositivo.id_dispositivo} className="grupo">
                            <div className="dispositivo-header" onClick={() => toggleDispositivo(dispositivo.id_dispositivo)}>
                                <h2>📱 Dispositivo #{dIndex + 1}: {dispositivo.marca} {dispositivo.version}</h2>
                                <span className="expand-icon">{dispositivosExpandidos[dispositivo.id_dispositivo] ? '▼' : '▶'}</span>
                            </div>
                            {dispositivosExpandidos[dispositivo.id_dispositivo] && (
                                <div className="dispositivo-contenido">
                                    <div className="datos-grid">
                                        <div className="dato-item"><label>Tipo de contraseña</label><p>{dispositivo.tipo_password}</p></div>
                                        {dispositivo.password && <div className="dato-item"><label>Contraseña</label><p>{dispositivo.password}</p></div>}
                                    </div>
                                    {dispositivo.comentarios && <div className="comentarios-box"><label>Comentarios</label><p>{dispositivo.comentarios}</p></div>}

                                    <div className="reparaciones-list">
                                        {dispositivo.reparaciones.map((reparacion, rIndex) => {
                                            const dataEditada = reparacionesEditadas[reparacion.id_reparacion];
                                            const hayCambios = tieneCambios(reparacion.id_reparacion);
                                            const estadoInicial = reparacion.estado;
                                            const estadoActual = dataEditada?.estado || reparacion.estado;
                                            const estadoNoEditable = estadoInicial === 'completada' || estadoInicial === 'cancelada';
                                            const costoActual = dataEditada?.costo_repuesto ?? reparacion.costo_repuesto;
                                            const comentariosActual = dataEditada?.comentarios_tecnico ?? reparacion.comentarios_tecnico ?? '';

                                            return (
                                                <div key={reparacion.id_reparacion} className={`reparacion-compacta ${hayCambios ? 'tiene-cambios' : ''}`}>
                                                    <div className="rep-header">
                                                        <span className="rep-tipo">{reparacion.tipo_reparacion}</span>
                                                        <span className={getEstadoClase(estadoActual)}>{estadoActual}</span>
                                                    </div>
                                                    <div className="rep-campos">
                                                        <div className="campo"><label>Precio</label><span>{formatearMoneda(reparacion.precio_reparacion)}</span></div>
                                                        <div className="campo"><label>Costo Rep.</label><input type="number" className="input-edicion" value={costoActual} onChange={(e) => handleReparacionChange(reparacion.id_reparacion, 'costo_repuesto', e.target.value)} step="0.01" min="0" disabled={estadoNoEditable} /></div>
                                                        <div className="campo"><label>Estado</label><select className="select-edicion" value={estadoActual} onChange={(e) => handleReparacionChange(reparacion.id_reparacion, 'estado', e.target.value)} disabled={estadoNoEditable}><option value="pendiente" disabled={estadoNoEditable}>Pendiente</option><option value="en proceso" disabled={estadoNoEditable}>En Proceso</option><option value="completada">Completada</option><option value="cancelada">Cancelada</option></select></div>
                                                        <div className="campo"><label>Ingreso</label><span>{formatearFecha(reparacion.fecha_ingreso)}</span></div>
                                                        <div className="campo"><label>Salida</label><span className={reparacion.fecha_salida ? 'fecha-completada' : 'fecha-pendiente'}>{formatearFecha(reparacion.fecha_salida)}</span></div>
                                                    </div>
                                                    <div className="campo-comentario"><label>Comentarios Técnico</label><textarea className="textarea-edicion" value={comentariosActual} onChange={(e) => handleReparacionChange(reparacion.id_reparacion, 'comentarios_tecnico', e.target.value)} placeholder="Agregar comentarios..." rows="2" disabled={estadoNoEditable} /></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <button type="button" className="btn-guardar-todos" onClick={guardarTodosCambios} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
                </>
            )}

            {mensaje.texto && <div className={`mensaje mensaje-footer ${mensaje.tipo}`}>{mensaje.texto}</div>}
        </main>
    );
};
