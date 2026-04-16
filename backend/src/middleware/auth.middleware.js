import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const verificarToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};

export const verificarAdminOTecnico = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.rol !== 'administrador' && decoded.rol !== 'tecnico') {
            return res.status(403).json({ success: false, message: 'Solo administradores o técnicos pueden realizar esta acción' });
        }
        
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};

export const verificarTecnico = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.rol !== 'tecnico') {
            return res.status(403).json({ success: false, message: 'Solo técnicos pueden realizar esta acción' });
        }
        
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};

export const verificarAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.rol !== 'administrador') {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden realizar esta acción' });
        }
        
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};
