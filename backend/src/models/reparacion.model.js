export class Reparacion {
    constructor(id_reparacion, fecha_ingreso, fecha_salida, estado, costo_repuesto, precio_reparacion, comentarios, id_dispositivo) {
        this.id_reparacion = id_reparacion ? id_reparacion.toString().trim() : null;
        this.fecha_ingreso = fecha_ingreso || '';
        this.fecha_salida = fecha_salida || null;
        this.estado = estado?.trim() || 'pendiente';
        this.costo_repuesto = parseInt(costo_repuesto) || 0;
        this.precio_reparacion = parseInt(precio_reparacion) || 0;
        this.comentarios = comentarios?.trim() || '';
        this.id_dispositivo = id_dispositivo ? id_dispositivo.toString().trim() : null;
    }

    validacion() {
        // Validar ID si existe (para actualizaciones)
        if (this.id_reparacion !== null) {
            if (!/^\d+$/.test(this.id_reparacion)) {
                return false;
            }
            if (this.id_reparacion.length > 10) {
                return false;
            }
        }

        // Validar campos obligatorios
        if (!this.fecha_ingreso || !this.estado || !this.id_dispositivo) {
            return false;
        }

        // Validar id_dispositivo
        if (!/^\d+$/.test(this.id_dispositivo)) {
            return false;
        }

        // Validar estado
        const estadosValidos = ['pendiente',, 'completada', 'cancelada'];
        if (!estadosValidos.includes(this.estado)) {
            return false;
        }
        if (this.estado.length > 20) {
            return false;
        }

        // Validar que fecha_salida no sea menor a fecha_ingreso
        if (this.fecha_salida && this.fecha_salida < this.fecha_ingreso) {
            return false;
        }

        // Validar costos no negativos
        if (this.costo_repuesto < 0 || this.precio_reparacion < 0) {
            return false;
        }

        // Validar que precio_reparacion sea mayor a costo_repuesto 
        if (this.precio_reparacion < this.costo_repuesto) {
            return false;  
        }

        // Validar comentarios no exceda 65535 caracteres (tamaño máximo de TEXT en MySQL)
        if (this.comentarios && this.comentarios.length > 65535) {
            return false;
        }

        return true;
    }

    toInsert() {
        return {
            fecha_ingreso: this.fecha_ingreso,
            estado: this.estado,
            costo_repuesto: this.costo_repuesto,
            precio_reparacion: this.precio_reparacion,
            comentarios: this.comentarios || null,
            id_dispositivo: this.id_dispositivo
            // fecha_salida no se incluye (sera NULL hasta completar la reparacion)
        };
    }

    toUpdate() {
        if (!this.id_reparacion) {
            throw new Error('Se requiere id_reparacion para actualizar');
        }
        return {
            fecha_ingreso: this.fecha_ingreso,
            fecha_salida: this.fecha_salida,
            estado: this.estado,
            costo_repuesto: this.costo_repuesto,
            precio_reparacion: this.precio_reparacion,
            comentarios: this.comentarios || null,
            id_dispositivo: this.id_dispositivo
        };
    }

    // Método para completar una reparación
    completar() {
        this.estado = 'completada';
        this.fecha_salida = new Date().toISOString().split('T')[0];  // Fecha actual YYYY-MM-DD
        return this;
    }

    static fromDB(row) {
        return new Reparacion(
            row.id_reparacion,
            row.fecha_ingreso,
            row.fecha_salida,
            row.estado,
            row.costo_repuesto,
            row.precio_reparacion,
            row.comentarios,
            row.id_dispositivo
        );
    }

    static fromDBArray(rows) {
        return rows.map(row => this.fromDB(row));
    }
}