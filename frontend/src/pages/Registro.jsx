import './css/registro.css';
import { registroHook } from '../hooks/registro.hook';

export const Registro = () => {
  const {
    cliente,
    dispositivos,
    mensaje,
    numeroOrden,
    handleClienteChange,
    handleDispositivoChange,
    handleReparacionChange,
    agregarDispositivo,
    removerDispositivo,
    agregarReparacion,
    removerReparacion,
    buscarCliente,
    limpiarCliente,
    limpiarNumeroOrden,
    handleSubmit
  } = registroHook();

  return (
    <>
      <main className="contenedor-registro">
        <form id="registroForm" onSubmit={handleSubmit}>
          {/* DATOS DEL CLIENTE */}
          <div className="grupo">
            <h2>Datos del cliente</h2>
            <div className="busqueda-row">
              <div className="campo">
                <label>Cédula</label>
                <input
                  type="number"
                  placeholder=" "
                  id="cedula"
                  name="cedula"
                  value={cliente.cedula}
                  onChange={handleClienteChange}
                  required
                />
              </div>
              <button type="button" className="btn-buscar" onClick={buscarCliente}>
                Buscar
              </button>
              <button type="button" className="btn-limpiar" onClick={limpiarCliente}>
                Limpiar
              </button>
            </div>
            <div className="fila-inputs">
              <div className="campo">
                <label>Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder=" "
                  value={cliente.nombre}
                  onChange={handleClienteChange}
                  required
                />
              </div>
              <div className="campo">
                <label>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=" "
                  value={cliente.email}
                  onChange={handleClienteChange}
                  required
                />
              </div>
              <div className="campo">
                <label>Celular</label>
                <input
                  type="number"
                  id="celular"
                  name="celular"
                  placeholder=" "
                  value={cliente.celular}
                  onChange={handleClienteChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN DE DISPOSITIVOS */}
          <div className="grupo">
            <h2>Dispositivos y Reparaciones</h2>
            {dispositivos.map((dispositivo, dIndex) => (
              <div key={dIndex} className="dispositivo-container">
                <h3>Dispositivo {dIndex + 1}</h3>

                <div className="fila-inputs">
                  <div className="campo">
                    <label>Marca</label>
                    <select
                      name="marca"
                      value={dispositivo.marca}
                      onChange={(e) => handleDispositivoChange(dIndex, e)}
                      required
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Huawei">Huawei</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Oppo">Oppo</option>
                      <option value="Motorola">Motorola</option>
                      <option value="Realme">Realme</option>
                      <option value="Honor">Honor</option>
                      <option value="Chino">Chino</option>
                    </select>
                  </div>
                  <div className="campo">
                    <label>Versión / Modelo</label>
                    <input
                      type="text"
                      name="version"
                      placeholder=" "
                      value={dispositivo.version}
                      onChange={(e) => handleDispositivoChange(dIndex, e)}
                      required
                    />
                  </div>
                </div>

                <div className="fila-inputs">
                  <div className="campo">
                    <label>Tipo de contraseña</label>
                    <select
                      name="tipo_password"
                      value={dispositivo.tipo_password}
                      onChange={(e) => handleDispositivoChange(dIndex, e)}
                      required
                    >
                      <option value="Sin contraseña">Sin contraseña</option>
                      <option value="Patron">Patrón</option>
                      <option value="PIN">PIN</option>
                      <option value="Numeros / letras">Números / Letras</option>
                    </select>
                  </div>
                  <div className="campo">
                    <label>Contraseña / Patrón</label>
                    <input
                      type="text"
                      name="password"
                      placeholder=" "
                      value={dispositivo.password}
                      onChange={(e) => handleDispositivoChange(dIndex, e)}
                      disabled={dispositivo.tipo_password === 'Sin contraseña'}
                    />
                  </div>
                </div>

                <div className="campo">
                  <label>Comentarios del dispositivo</label>
                  <textarea
                    name="comentarios"
                    placeholder=" "
                    value={dispositivo.comentarios}
                    onChange={(e) => handleDispositivoChange(dIndex, e)}
                    required
                  />
                </div>

                {/* REPARACIONES */}
                <div className="reparaciones-container">
                  <h4>Reparaciones</h4>
                  {dispositivo.reparaciones.map((reparacion, rIndex) => (
                    <div key={rIndex} className="rep-item">
                      <div className="rep-header">
                        <h5>Reparación {rIndex + 1}</h5>
                        {dispositivo.reparaciones.length > 1 && (
                          <button
                            type="button"
                            className="btn-del-rep"
                            onClick={() => removerReparacion(dIndex, rIndex)}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="rep-campos">
                        <div className="campo">
                          <label>Tipo</label>
                          <select
                            name="tipo_reparacion"
                            value={reparacion.tipo_reparacion}
                            onChange={(e) => handleReparacionChange(dIndex, rIndex, e)}
                            required
                          >
                            <option value="Cambio de Pantalla">Cambio de Pantalla</option>
                            <option value="Cambio de Batería">Cambio de Batería</option>
                            <option value="Pin de Carga">Pin de Carga</option>
                            <option value="Cámara Trasera">Cámara Trasera</option>
                            <option value="Cámara Frontal">Cámara Frontal</option>
                            <option value="Tapa Trasera">Tapa Trasera</option>
                            <option value="Visor / Glass">Visor / Glass</option>
                            <option value="Software / Desbloqueo">Software / Desbloqueo</option>
                            <option value="Limpieza / Mantenimiento">Limpieza / Mantenimiento</option>
                            <option value="Daño por Humedad">Daño por Humedad</option>
                            <option value="Diagnóstico">Diagnóstico</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        <div className="campo">
                          <label>Precio ($)</label>
                          <input
                            type="number"
                            name="precio_reparacion"
                            value={reparacion.precio_reparacion}
                            onChange={(e) => handleReparacionChange(dIndex, rIndex, e)}
                            required
                          />
                        </div>

                        <div className="campo campo-garantia">
                          <label>Garantía</label>
                          <select
                            name="vigencia_garantia"
                            value={reparacion.vigencia_garantia || ''}
                            onChange={(e) => handleReparacionChange(dIndex, rIndex, e)}
                          >
                            <option value="">Sin garantía</option>
                            <option value="30">30 días</option>
                            <option value="60">60 días</option>
                            <option value="90">90 días</option>
                            <option value="120">120 días</option>
                            <option value="180">180 días</option>
                            <option value="365">365 días</option>
                          </select>
                        </div>

                        <div className="campo campo-detalle">
                          <label>Detalles</label>
                          <textarea
                            name="comentarios"
                            value={reparacion.comentarios}
                            onChange={(e) => handleReparacionChange(dIndex, rIndex, e)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-agregar-reparacion"
                    onClick={() => agregarReparacion(dIndex)}
                  >
                    + Agregar Otra Reparación
                  </button>
                </div>

                {dispositivos.length > 1 && (
                  <button
                    type="button"
                    className="btn-eliminar-dispositivo"
                    onClick={() => removerDispositivo(dIndex)}
                  >
                    Eliminar Dispositivo
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="btn-agregar-dispositivo"
              onClick={agregarDispositivo}
            >
              + Agregar Nuevo Dispositivo
            </button>
          </div>

          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          {numeroOrden && (
            <div className="orden-exito">
              <div className="orden-label">Número de Orden Generado:</div>
              <div className="orden-numero">{numeroOrden}</div>
              <br />
              <button 
                type="button" 
                className="btn-copiar" 
                onClick={() => navigator.clipboard.writeText(numeroOrden)}
              >
                Copiar
              </button>
              <button 
                type="button" 
                className="btn-cerrar-orden" 
                onClick={limpiarNumeroOrden}
              >
                Cerrar
              </button>
            </div>
          )}

          <button type="submit" className="btn-submit">
            Registrar Todo
          </button>
        </form>
      </main>
    </>
  );
};