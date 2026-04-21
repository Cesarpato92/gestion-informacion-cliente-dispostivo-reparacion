import { Fragment } from 'react';
import '../css/registro.css';
import { Navbar } from '../../../components/Navbar';
import { registroHook } from '../../../hooks/registro.hook';

export const Registro = () => {
  const {
    cliente,
    dispositivos,
    mensaje,
    handleClienteChange,
    handleDispositivoChange,
    handleReparacionChange,
    agregarDispositivo,
    removerDispositivo,
    agregarReparacion,
    removerReparacion,
    buscarCliente,
    limpiarCliente,
    handleSubmit
  } = registroHook();

  return (
    <Fragment>
      <Navbar />
      
      <main className="contenedor-registro">
        <form id="registroForm" onSubmit={handleSubmit}>
          {/* DATOS DEL CLIENTE */}
          <div className="grupo">
            <h2>Datos del cliente</h2>
            <div className="textos busqueda">
              <input
                type="number"
                placeholder=" "
                id="cedula"
                name="cedula"
                value={cliente.cedula}
                onChange={handleClienteChange}
                required
              />
              <span className="input-placeholder">Cédula</span>
              <button type="button" className="busqueda" onClick={buscarCliente}>
                Buscar
              </button>
              <button type="button" className="busqueda" onClick={limpiarCliente}>
                Limpiar
              </button>
            </div>
            <div className="fila-inputs">
              <div className="textos">
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder=" "
                  value={cliente.nombre}
                  onChange={handleClienteChange}
                  required
                />
                <span className="input-placeholder">Nombre</span>
              </div>
              <div className="textos">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=" "
                  value={cliente.email}
                  onChange={handleClienteChange}
                  required
                />
                <span className="input-placeholder">Email</span>
              </div>
              <div className="textos">
                <input
                  type="number"
                  id="celular"
                  name="celular"
                  placeholder=" "
                  value={cliente.celular}
                  onChange={handleClienteChange}
                  required
                />
                <span className="input-placeholder">Celular</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE DISPOSITIVOS */}
          <div className="grupo mt-4">
            <h2>Dispositivos y Reparaciones</h2>
            {dispositivos.map((dispositivo, dIndex) => (
              <div key={dIndex} className="dispositivo-container">
                <h3>Dispositivo {dIndex + 1}</h3>

                <div className="fila-inputs">
                  <div className="select-group">
                    <label htmlFor={`marca-${dIndex}`}>Marca</label>
                    <select
                      id={`marca-${dIndex}`}
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

                  <div className="textos mt-md-4">
                    <input
                      type="text"
                      name="version"
                      placeholder=" "
                      value={dispositivo.version}
                      onChange={(e) => handleDispositivoChange(dIndex, e)}
                      required
                    />
                    <span className="input-placeholder">Versión / Modelo</span>
                  </div>
                </div>

                <div className="fila-inputs mt-2">
                  <div className="select-group">
                    <label htmlFor={`tipo_password-${dIndex}`}>Tipo de contraseña:</label>
                    <select
                      id={`tipo_password-${dIndex}`}
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

                  <div className="textos mt-md-4" style={{ opacity: dispositivo.tipo_password === 'Sin contraseña' ? 0.5 : 1 }}>
                    <input
                      type="text"
                      name="password"
                      placeholder=" "
                      value={dispositivo.password}
                      onChange={(e) => handleDispositivoChange(dIndex, e)}
                      disabled={dispositivo.tipo_password === 'Sin contraseña'}
                    />
                    <span className="input-placeholder">Contraseña / Patrón</span>
                  </div>
                </div>

                <div className="textos">
                  <textarea
                    name="comentarios"
                    placeholder=" "
                    value={dispositivo.comentarios}
                    onChange={(e) => handleDispositivoChange(dIndex, e)}
                    required
                  ></textarea>
                  <span className="input-placeholder">Comentarios del Dispositivo</span>
                </div>

                {/* SUB SECCIÓN DE REPARACIONES */}
                <div className="reparaciones-container">
                  <h4>Reparaciones</h4>
                  {dispositivo.reparaciones.map((reparacion, rIndex) => (
                    <div key={rIndex} className="reparacion-item">
                      <h5>Reparación {rIndex + 1}</h5>

                      <div className="fila-inputs">
                        <div className="textos">
                          <input
                            type="number"
                            name="precio_reparacion"
                            placeholder=" "
                            value={reparacion.precio_reparacion}
                            onChange={(e) => handleReparacionChange(dIndex, rIndex, e)}
                            required
                          />
                          <span className="input-placeholder">Precio Reparación</span>
                        </div>
                        <div className="select-group">
                          <label htmlFor={`tipo_reparacion-${dIndex}-${rIndex}`}>Tipo de Reparación</label>
                          <select
                            id={`tipo_reparacion-${dIndex}-${rIndex}`}
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
                      </div>

                      <div className="textos">
                        <textarea
                          name="comentarios"
                          placeholder=" "
                          value={reparacion.comentarios}
                          onChange={(e) => handleReparacionChange(dIndex, rIndex, e)}
                          required
                        ></textarea>
                        <span className="input-placeholder">Detalles de esta reparación</span>
                      </div>

                      {dispositivo.reparaciones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerReparacion(dIndex, rIndex)}
                          className="btn-eliminar-reparacion"
                        >
                          Eliminar Reparación
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => agregarReparacion(dIndex)}
                    className="btn-agregar-reparacion"
                  >
                    + Agregar Otra Reparación
                  </button>
                </div>

                {dispositivos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerDispositivo(dIndex)}
                    className="btn-eliminar-dispositivo"
                  >
                    Eliminar Dispositivo
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={agregarDispositivo}
              className="btn-agregar-dispositivo"
            >
              + Agregar Nuevo Dispositivo
            </button>
          </div>

          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo === 'error' ? 'error' : 'success'}`} style={{ padding: '10px', marginTop: '15px', textAlign: 'center', fontWeight: 'bold', color: mensaje.tipo === 'error' ? 'red' : 'green' }}>
              {mensaje.texto}
            </div>
          )}

          <button type="submit" className="btn-submit">
            Registrar Todo
          </button>
        </form>
      </main>
    </Fragment>
  );
};

