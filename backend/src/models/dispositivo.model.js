export class Dispositivo {
    constructor(id_dispositivo, marca, version, tipo_reparacion, tipo_password, password, comentarios, cedula ) {
        // id dispostivo es un numero autoincremental, no se debe de validar, pero se debe de convertir a string y eliminar espacios en blanco
        // al ser un numero autoincremental, se puede recibir como null o undefined, en ese caso se debe de asignar null
        this.id_dispositivo = id_dispositivo ? id_dispositivo.toString().trim() : null; 
        this.marca = marca?.trim() || '';
        this.version = version?.trim() || '';
        this.tipo_reparacion = tipo_reparacion?.trim() || '';
        this.tipo_password = tipo_password?.trim() || '';
        this.password = password?.trim() || '';
        this.comentarios = comentarios?.trim() || '';
        this.cedula = cedula?.trim() || '';
    }

    validacion() {
        // validar id_dispositivo si existe (para actualizaciones), debe ser un numero y no debe de contener espacios en blanco, ademas de tener un maximo de 15 caracteres
        if (this.id_dispositivo !== null) {
            if (!/^\d+$/.test(this.id_dispositivo)) {
                return false;
            }
            if (this.id_dispositivo.length > 15) {  // Ajusta según tu BD (INT = hasta 10 dígitos)
                return false;
            }
        }
        if (!this.marca || !this.version || !this.tipo_reparacion || !this.tipo_password || !this.password || !this.cedula) {
            return false;
        }
        // validar que la cedula solo contenga numeros y un maximo de 15 caracteres
        if (!/^\d+$/.test(this.cedula)) {
            return false;  // solo deben de ser numeros
        }
        if (this.cedula.length > 15) {
            return false;
        }
        // validar que la marca solo contenga letras y un maximo de 45 caracteres
        if (!/^[a-zA-Z\s]+$/.test(this.marca)) {
            return false;
        }
        if (this.marca.length > 45) {
            return false;
        }   
        // validar que la version contenga menos de 45 caracteres
        if (this.version.length > 45) {
            return false;
        } 
        // validar que tipo reparacion contenga menos de 100 caracteres
         if (this.tipo_reparacion.length > 100) {
            return false;
        }
        //validar que  password contenga menos de 40 caracteres
        if (this.password.length > 40) {
            return false;
        }
        
        if (this.comentarios && this.comentarios.length > 65535) {
            return false;
        }
        return true;
    }
     toInsert() {
        return {
            marca: this.marca,
            version: this.version,
            tipo_reparacion: this.tipo_reparacion,
            tipo_password: this.tipo_password,
            password: this.password,
            comentarios: this.comentarios,
            cedula: this.cedula  
        };
    }
    // Método para preparar datos para UPDATE (con ID)
    toUpdate() {
        if (!this.id_dispositivo) {
            throw new Error('Se requiere id_dispositivo para actualizar');
        }
        return {
            id_dispositivo: this.id_dispositivo,
            marca: this.marca,
            version: this.version,
            tipo_reparacion: this.tipo_reparacion,
            tipo_password: this.tipo_password,
            password: this.password,
            comentarios: this.comentarios || null, // Permitir null para comentarios
            cedula: this.cedula
        };
    }
    // Método estático para crear una instancia de Dispositivo a partir de una fila de la base de datos
    // Este método asume que los nombres de las columnas en la base de datos coinciden con los nombres de las propiedades del modelo
    static fromDB(row) {
        return new Dispositivo(
            row.id_dispositivo,
            row.marca,
            row.version,
            row.tipo_reparacion,
            row.tipo_password,
            row.password,
            row.comentarios,
            row.cedula
        );
    }
    // Método estático para crear un array de instancias de Dispositivo a partir de un array de filas de la base de datos
    static fromDBArray(rows) {
        return rows.map(row => Dispositivo.fromDB(row));
    }
}