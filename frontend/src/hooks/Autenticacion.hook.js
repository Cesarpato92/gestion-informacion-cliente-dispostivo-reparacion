import { useState } from "react"

export const AutenticacionHook = () => {

    const [usuario, setUsuario] = useState({
        username: '',
        password: ''
    })

    const [error, setError] = useState(false)
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

    const handleInputChange = (e) => {
        setUsuario({
            ...usuario,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (usuario.username === '' || usuario.password === '') {
            setError(true)
            return
        }

        setMensaje({ texto: 'Verificando...', tipo: 'info' });
        
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });
            
            const data = await response.json();
            
if (response.ok && data.success) {
                setMensaje({ texto: 'Autenticación exitosa', tipo: 'success' });
                
                // Guardar token en localStorage
                data.token && localStorage.setItem('token', data.token);
                
                // Guardar datos del usuario
                data.user && localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirigir según rol
                const rol = data.user.rol === 'administrador' ? 'admin' : data.user.rol;
                if (rol === 'admin') {
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 1000);
                }
                else if (rol === 'tecnico') {
                    setTimeout(() => {
                        window.location.href = '/tecnico';
                    }, 1000);
                }
                else {
                    setMensaje({ texto: 'Rol no reconocido', tipo: 'error' });
                }
            } else {
                setMensaje({ texto: data.message || 'Error de autenticación', tipo: 'error' });
            }

        } catch (error) {
            console.error('Error en login:', error);
            setMensaje({ texto: 'Error de conexión: ' + error.message, tipo: 'error' });
        }
    }

    return {
        usuario,
        error,
        mensaje,
        handleInputChange,
        handleSubmit
    }
}