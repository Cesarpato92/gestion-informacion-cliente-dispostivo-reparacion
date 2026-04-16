import { useEffect, useRef } from 'react';
import { finanzasHook } from '../hooks/finanzas.hook';
import './css/Finanzas.css';

function Finanzas() {
    const {
        dashboard,
        mensual,
        torta,
        loading,
        error,
        filtro,
        setFiltro,
        cargarTodo,
        formatter
    } = finanzasHook();

    const tortaRef = useRef(null);

    useEffect(() => {
        if (torta.length > 0 && tortaRef.current) {
            dibujarGraficoTorta();
        }
    }, [torta]);

    const dibujarGraficoTorta = () => {
        const canvas = tortaRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const total = torta.reduce((acc, item) => acc + item.cantidad, 0);
        if (total === 0) return;

        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const radio = Math.min(centroX, centroY) - 20;
        
        let anguloInicio = 0;
        const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];
        
        torta.forEach((item, i) => {
            constporcion = item.cantidad / total;
            const anguloFin = anguloInicio + (porcion * 2 * Math.PI);
            
            ctx.beginPath();
            ctx.moveTo(centroX, centroY);
            ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
            ctx.closePath();
            ctx.fillStyle = colores[i % colores.length];
            ctx.fill();
            
            anguloInicio = anguloFin;
        });
    };

    return (
        <div className="contenedor-finanzas">
            <h2>Panel Financiero</h2>
            
            <div className="filtros">
                <label>
                    Desde:
                    <input
                        type="date"
                        value={filtro.fecha_desde}
                        onChange={(e) => setFiltro({ ...filtro, fecha_desde: e.target.value })}
                    />
                </label>
                <label>
                    Hasta:
                    <input
                        type="date"
                        value={filtro.fecha_hasta}
                        onChange={(e) => setFiltro({ ...filtro, fecha_hasta: e.target.value })}
                    />
                </label>
                <button onClick={cargarTodo} disabled={loading}>
                    {loading ? 'Cargando...' : 'Filtrar'}
                </button>
                <button onClick={() => setFiltro({ anio: '', mes: '', fecha_desde: '', fecha_hasta: '' })}>
                    Limpiar
                </button>
            </div>

            {error && <div className="mensaje error">{error}</div>}

            {dashboard && (
                <>
                    <div className="tarjetas-resumen">
                        <div className="tarjeta">
                            <h3>Ingresos Totales</h3>
                            <p className="valor">{formatter.format(dashboard.ingresos_totales)}</p>
                        </div>
                        <div className="tarjeta">
                            <h3>Costo Repuestos</h3>
                            <p className="valor">{formatter.format(dashboard.costo_repuestos)}</p>
                        </div>
                        <div className="tarjeta">
                            <h3>Ganancia Neta</h3>
                            <p className="valor">{formatter.format(dashboard.ganancia_neta)}</p>
                        </div>
                        <div className="tarjeta">
                            <h3>Pérdidas</h3>
                            <p className="valor">{formatter.format(dashboard.perdidas)}</p>
                        </div>
                    </div>

                    <div className="tarjetas-resumen">
                        <div className="tarjeta">
                            <h3>Garantías</h3>
                            <p className="valor">{dashboard.garantias_count}</p>
                            <p className="sub">Costo: {formatter.format(dashboard.garantias_costo)}</p>
                        </div>
                        <div className="tarjeta">
                            <h3>Reparaciones Completadas</h3>
                            <p className="valor">{dashboard.reparaciones_completadas}</p>
                        </div>
                    </div>

                    <div className="graficos-row">
                        <div className="grafico">
                            <h3>Reparaciones por Tipo</h3>
                            <canvas ref={tortaRef} width={300} height={300}></canvas>
                            <div className="leyenda">
                                {torta.map((item, i) => (
                                    <div key={i} className="leyenda-item">
                                        <span className="color" style={{ backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][i % 6] }}></span>
                                        <span>{item.tipo_reparacion}: {item.cantidad}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grafico">
                            <h3>Facturas Recientes</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Orden</th>
                                        <th>Cliente</th>
                                        <th>Ingreso</th>
                                        <th>Costo</th>
                                        <th>Ganancia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.facturas_recientes.map((f, i) => (
                                        <tr key={i}>
                                            <td>{f.n_orden}</td>
                                            <td>{f.cliente}</td>
                                            <td>{formatter.format(f.precio_reparacion)}</td>
                                            <td>{formatter.format(f.costo_repuesto)}</td>
                                            <td>{formatter.format(f.ganancia)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {mensual && mensual.mes_actual && (
                <div className="resumen-mes">
                    <h3>Resumen {mensual.mes_actual.mes}</h3>
                    <p>Reparaciones: {mensual.mes_actual.reparaciones}</p>
                    <p>Ingresos: {formatter.format(mensual.mes_actual.ingresos)}</p>
                    <p>Costos: {formatter.format(mensual.mes_actual.costos)}</p>
                    <p>Ganancia: {formatter.format(mensual.mes_actual.ganancia)}</p>
                </div>
            )}
        </div>
    );
}

export default Finanzas;