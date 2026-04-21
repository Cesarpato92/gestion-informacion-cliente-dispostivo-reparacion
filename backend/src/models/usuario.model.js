export class Usuario {
    constructor(email, password, rol, nombre, celular) {
        this.email = email?.trim() || '';
        this.password = password?.trim() || '';
        this.rol = rol?.trim() || '';
        this.nombre = nombre?.trim() || '';
        this.celular = celular?.trim() || '';
    }
    toInsert() {
        return {
            email: this.email,
            password: this.password,
            rol: this.rol,
            nombre: this.nombre,
            celular: this.celular
        }
    }
    static fromDB(row) {
        return new Usuario(row.email, row.password, row.rol, row.nombre, row.celular);
    }
}