import { useState, useCallback, useEffect } from "react";

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

const CLIENTE_INICIAL = {
    cedula: '',
    nombre: '',
    email: '',
    celular: ''
};

const REPARACION_INICIAL = {
    tipo_reparacion: '',
    precio_reparacion: '',
    comentarios: ''
};

const DISPOSITIVO_INICIAL = {
    marca: 'Apple',
    version: '',
    tipo_password: 'Sin contraseña',
    password: '',
    comentarios: '',
    reparaciones: [{ ...REPARACION_INICIAL }]
};

export const registroHook = () => {

    const [cliente, setCliente] = useState({ ...CLIENTE_INICIAL });
    const [dispositivos, setDispositivos] = useState([{ ...DISPOSITIVO_INICIAL }]);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    // Autodesaparecer mensaje luego de 3 segundos
    useEffect(() => {
        if (mensaje.texto) {
            const timer = setTimeout(() => {
                setMensaje({ texto: '', tipo: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensaje.texto]);


    const validarFormulario = useCallback(() => {
        const { cedula, nombre, email, celular } = cliente;
        if (!cedula || !nombre || !email || !celular) {
            return 'Por favor, complete los datos del cliente.';
        }
        if (isNaN(cedula.replace(/\s+/g, '')) || isNaN(celular.replace(/\s+/g, ''))) {
            return 'Los campos cédula y teléfono deben ser numéricos.';
        }
        if (celular.length < 7 || celular.length > 15) {
            return 'El teléfono debe tener entre 7 y 15 dígitos.';
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            return 'El nombre solo puede contener letras y espacios.';
        }

        for (const [dIndex, disp] of dispositivos.entries()) {
            if (!disp.marca || !disp.version || !disp.tipo_password) {
                return `Complete los datos básicos del dispositivo #${dIndex + 1}.`;
            }
            if (disp.tipo_password !== 'Sin contraseña' && !disp.password) {
                return `Proporcione la contraseña para el dispositivo #${dIndex + 1}.`;
            }
            if (!disp.reparaciones || disp.reparaciones.length === 0) {
                return `El dispositivo #${dIndex + 1} debe tener al menos una reparación.`;
            }
            for (const [rIndex, rep] of disp.reparaciones.entries()) {
                if (!rep.tipo_reparacion || !rep.precio_reparacion) {
                    return `Complete el tipo y precio de la reparación #${rIndex + 1} del dispositivo #${dIndex + 1}.`;
                }
            }
        }
        return null;
    }, [cliente, dispositivos]);


    const handleClienteChange = (e) => {
        setCliente(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const buscarCliente = async () => {
        if (!cliente.cedula) {
            setMensaje({ texto: 'Ingrese una cédula para buscar', tipo: 'error' });
            return;
        }
        setMensaje({ texto: 'Buscando cliente...', tipo: 'info' });
        try {
            const response = await fetch(`${API_URL}/buscar-cliente/${cliente.cedula}`);
            const data = await response.json();
            if (response.ok && data.success) {
                setCliente({
                    cedula: cliente.cedula,
                    nombre: data.data.nombre || '',
                    email: data.data.email || '',
                    celular: data.data.telefono || ''
                });
                setMensaje({ texto: 'Cliente encontrado', tipo: 'success' });
            } else {
                setMensaje({ texto: 'Cliente no encontrado, ingrese los datos', tipo: 'info' });
                setCliente({ ...CLIENTE_INICIAL, cedula: cliente.cedula });
            }
        } catch (error) {
            setMensaje({ texto: 'Error al buscar cliente', tipo: 'error' });
        }
    };

    const limpiarCliente = () => {
        setCliente({ ...CLIENTE_INICIAL });
        setMensaje({ texto: '', tipo: '' });
    };


    const handleDispositivoChange = (index, e) => {
        const nuevosDispositivos = [...dispositivos];
        nuevosDispositivos[index] = {
            ...nuevosDispositivos[index],
            [e.target.name]: e.target.value
        };

        if (e.target.name === 'tipo_password' && e.target.value === 'Sin contraseña') {
            nuevosDispositivos[index].password = '';
        }

        setDispositivos(nuevosDispositivos);
    };

    const agregarDispositivo = () => {
        setDispositivos(prev => [...prev, { ...DISPOSITIVO_INICIAL, reparaciones: [{ ...REPARACION_INICIAL }] }]);
    };

    const removerDispositivo = (index) => {
        if (dispositivos.length === 1) return;
        setDispositivos(prev => prev.filter((_, i) => i !== index));
    };


    const handleReparacionChange = (dIndex, rIndex, e) => {
        const nuevosDispositivos = [...dispositivos];
        const nuevasReparaciones = [...nuevosDispositivos[dIndex].reparaciones];
        nuevasReparaciones[rIndex] = {
            ...nuevasReparaciones[rIndex],
            [e.target.name]: e.target.value
        };
        nuevosDispositivos[dIndex].reparaciones = nuevasReparaciones;
        setDispositivos(nuevosDispositivos);
    };

    const agregarReparacion = (dIndex) => {
        const nuevosDispositivos = [...dispositivos];
        nuevosDispositivos[dIndex].reparaciones.push({ ...REPARACION_INICIAL });
        setDispositivos(nuevosDispositivos);
    };

    const removerReparacion = (dIndex, rIndex) => {
        if (dispositivos[dIndex].reparaciones.length === 1) return;
        const nuevosDispositivos = [...dispositivos];
        nuevosDispositivos[dIndex].reparaciones = nuevosDispositivos[dIndex].reparaciones.filter((_, i) => i !== rIndex);
        setDispositivos(nuevosDispositivos);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validarFormulario();
        if (error) {
            setMensaje({ texto: error, tipo: 'error' });
            return;
        }

        setMensaje({ texto: 'Procesando registro...', tipo: 'info' });

        const payload = {
            cliente: {
                cedula: cliente.cedula,
                nombre: cliente.nombre,
                email: cliente.email,
                telefono: cliente.celular
            },
            dispositivos: dispositivos.map(d => ({
                marca: d.marca,
                version: d.version,
                tipo_password: d.tipo_password,
                password: d.password,
                comentarios: d.comentarios,
                reparaciones: d.reparaciones.map(r => ({
                    tipo_reparacion: r.tipo_reparacion,
                    precio_reparacion: parseFloat(r.precio_reparacion) || 0,
                    comentarios: r.comentarios
                }))
            }))
        };

        try {
            const response = await fetch(`${API_URL}/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setMensaje({ texto: 'Registro creado exitosamente', tipo: 'success' });
                // Reset Form
                setCliente({ ...CLIENTE_INICIAL });
                setDispositivos([{ ...DISPOSITIVO_INICIAL, reparaciones: [{ ...REPARACION_INICIAL }] }]);
            } else {
                setMensaje({ texto: data.message || 'Error al registrar', tipo: 'error' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error de conexión con el servidor', tipo: 'error' });
        }
    };

    return {
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
    };
};
