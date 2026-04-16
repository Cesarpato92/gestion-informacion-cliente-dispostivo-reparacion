import { useState, useCallback, useEffect } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const garantiaHook = () => {
    const [garantias, setGarantias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [busqueda, setBusqueda] = useState('');
    const [reparacionData, setReparacionData] = useState(null);

    useEffect(() => {
        if (mensaje.texto) {
            const timer = setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [mensaje.texto]);

    const buscarPorOrden = async (nOrden) => {
        if (!nOrden) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/garantia/por-orden/${nOrden}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setReparacionData(data.data);
                setMensaje({ texto: 'Reparación encontrada', tipo: 'success' });
            } else {
                setReparacionData(null);
                setMensaje({ texto: data.message || 'No encontrada', tipo: 'error' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error al buscar', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const registrarGarantia = async (idReparacion, tipoMovimiento, observaciones = '') => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/garantia/registrar`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    id_reparacion: idReparacion,
                    tipo_movimiento: tipoMovimiento,
                    observaciones
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setMensaje({ texto: data.message, tipo: 'success' });
                return true;
            } else {
                setMensaje({ texto: data.message, tipo: 'error' });
                return false;
            }
        } catch (error) {
            setMensaje({ texto: 'Error al registrar', tipo: 'error' });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const listarGarantias = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/garantia/listar`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setGarantias(data.data);
            }
        } catch (error) {
            setMensaje({ texto: 'Error al listar', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const limpiarBusqueda = () => {
        setBusqueda('');
        setReparacionData(null);
    };

    return {
        garantias,
        loading,
        mensaje,
        busqueda,
        setBusqueda,
        reparacionData,
        buscarPorOrden,
        registrarGarantia,
        listarGarantias,
        limpiarBusqueda
    };
};