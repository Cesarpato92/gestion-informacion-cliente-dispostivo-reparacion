export class Cliente {
    constructor(cedula, nombre, email, telefono) {
        this.cedula = cedula?.trim() || '';
        this.nombre = nombre?.trim() || '';
        this.email = email?.trim() || '';
        this.telefono = telefono?.trim() || '';
    }

     validacion() {
        if (!this.cedula || !this.nombre || !this.email || !this.telefono) {
            return false;
        }
        // Validar que la cedula solo contenga numeros y un maximo de 15 caracteres
        if (!/^\d+$/.test(this.cedula)) {
            return false;  // solo deben de ser numeros
        }
        if (this.cedula.length > 15) {
            return false;
        }
        // Validar que el nombre solo contenga letras y un maximo de 150 caracteres
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.nombre)) {
            return false;  // solo deben de ser letras y espacios
        }
        if (this.nombre.length > 150) {
            return false;
        }
        // Validar que el telefono solo contenga numeros y un maximo de 15 caracteres
        if (!/^\d+$/.test(this.telefono)) {
            return false; 
        }
        if (this.telefono.length > 15) {
            return false;
        }
        // Utilizacion de Regex para validar el formato del email, debe contener un @ y un . y un maximo de 100 caracteres
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            return false;
        }
        
        if (this.email.length > 100) {
            return false;
        }
        return true;
    }

        toInsert() {
            return {
                cedula: this.cedula,
                nombre: this.nombre,
                email: this.email,
                telefono: this.telefono
            }
        }
        toUpdate() {
            return {
                nombre: this.nombre,
                email: this.email,
                telefono: this.telefono
            }
        }
        // devuelve solo una fila de la base de datos, por lo que se le pasa un objeto con las propiedades de la tabla cliente
        static fromDB(row) {
            return new Cliente(row.cedula, row.nombre, row.email, row.telefono);
        }
        //retorna un array de objetos cliente a partir de un array de filas de la base de datos
        static fromDBArray(rows) {
            return rows.map(row => Cliente.fromDB(row));
        }

}