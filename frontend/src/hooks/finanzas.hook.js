import { useState, useCallback, useEffect } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const finanzasHook = () => {
    const [dashboard, setDashboard] = useState(null);
    const [mensual, setMensual] = useState(null);
    const [torta, setTorta] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState({ 
        anio: new Date().getFullYear(), 
        mes: new Date().getMonth() + 1,
        fecha_desde: '',
        fecha_hasta: ''
    });

    const cargarTodo = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (filtro.fecha_desde) params.append('fecha_desde', filtro.fecha_desde);
            if (filtro.fecha_hasta) params.append('fecha_hasta', filtro.fecha_hasta);
            if (filtro.anio) params.append('anio', filtro.anio);
            if (filtro.mes) params.append('mes', filtro.mes);

            const [dashRes, menRes, tortaRes] = await Promise.all([
                fetch(`${API_URL}/finanzas/dashboard?${params}`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/finanzas/mensual?${params}`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/finanzas/torta?${params}`, { headers: getAuthHeaders() })
            ]);

            const [dashData, menData, tortaData] = await Promise.all([
                dashRes.json(),
                menRes.json(),
                tortaRes.json()
            ]);

            if (dashData.success) setDashboard(dashData.data);
            if (menData.success) setMensual(menData.data);
            if (tortaData.success) setTorta(tortaData.data);
        } catch (err) {
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [filtro]);

    useEffect(() => {
        cargarTodo();
    }, [cargarTodo]);

    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });

    return {
        dashboard,
        mensual,
        torta,
        loading,
        error,
        filtro,
        setFiltro,
        cargarTodo,
        formatter
    };
};