export class Usuario {
    constructor(id, username, password, rol, nombre = null, celular = null) {
        this.id = id;
        this.username = username?.trim() || '';
        this.password = password || '';
        this.rol = rol?.trim().toLowerCase() || '';
        this.nombre = nombre?.trim() || null;
        this.celular = celular || null;
    }

    validarPassword(password) {
        if (!password || password.length < 6) {
            return { valida: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
        }
        
        const tieneMayuscula = /[A-Z]/.test(password);
        const tieneNumero = /\d/g;
        const numeros = password.match(tieneNumero) || [];
        const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        if (!tieneMayuscula) {
            return { valida: false, mensaje: 'La contraseña debe tener al menos una mayúscula' };
        }
        if (numeros.length < 2) {
            return { valida: false, mensaje: 'La contraseña debe tener al menos 2 números' };
        }
        if (!tieneEspecial) {
            return { valida: false, mensaje: 'La contraseña debe tener al menos un carácter especial' };
        }
        
        return { valida: true, mensaje: 'Contraseña válida' };
    }

    validacion() {
        if (!this.username || this.username.length < 3) {
            return false;
        }
        if (!this.password || this.password.length < 6) {
            return false;
        }
        if (!['administrador', 'tecnico'].includes(this.rol)) {
            return false;
        }
        if (!this.nombre || this.nombre.length < 2) {
            return false;
        }
        if (!this.celular || this.celular.length < 8) {
            return false;
        }
        return true;
    }

    validacionPassword(password) {
        return this.validarPassword(password).valida;
    }

    toInsert() {
        return {
            username: this.username,
            password: this.password,
            rol: this.rol,
            nombre: this.nombre,
            celular: this.celular
        };
    }

    toUpdate() {
        if (!this.id) {
            throw new Error('Se requiere id para actualizar');
        }
        return {
            username: this.username,
            password: this.password,
            rol: this.rol,
            nombre: this.nombre,
            celular: this.celular
        };
    }

    static fromDB(row) {
        return new Usuario(
            row.id,
            row.username,
            row.password,
            row.rol,
            row.nombre,
            row.celular
        );
    }
}