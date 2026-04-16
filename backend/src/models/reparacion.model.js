export class Reparacion {
    constructor(id_reparacion, fecha_ingreso, fecha_salida, estado, costo_repuesto, precio_reparacion, tipo_reparacion, comentarios, n_orden, id_dispositivo, vigencia_garantia = null, comentarios_tecnico = null) {
        this.id_reparacion = id_reparacion ? id_reparacion.toString().trim() : null;
        this.fecha_ingreso = fecha_ingreso || '';
        this.fecha_salida = fecha_salida || null;
        this.estado = estado?.trim() || 'pendiente';
        this.costo_repuesto = parseFloat(costo_repuesto) || 0;
        this.precio_reparacion = parseFloat(precio_reparacion) || 0;
        this.tipo_reparacion = tipo_reparacion?.trim() || '';
        this.comentarios = comentarios?.trim() || '';
        this.n_orden = n_orden?.trim() || '';
        this.id_dispositivo = id_dispositivo ? id_dispositivo.toString().trim() : null;
        this.vigencia_garantia = vigencia_garantia || null;
        this.comentarios_tecnico = comentarios_tecnico?.trim() || null;
    }

    validacion() {
        // Validar ID si existe
        if (this.id_reparacion !== null) {
            if (!/^\d+$/.test(this.id_reparacion)) {
                return false;
            }
            if (this.id_reparacion.length > 10) {
                return false;
            }
        }



        if (!this.fecha_ingreso || !this.estado || !this.id_dispositivo || !this.tipo_reparacion) {
            return false;
        }

        // Validar id_dispositivo
        if (!/^\d+$/.test(this.id_dispositivo)) {
            return false;
        }

        // Validar estado
        const estadosValidos = ['pendiente', 'completada', 'cancelada'];
        const estadoLower = this.estado.toLowerCase();
        if (!estadosValidos.includes(estadoLower)) {
            return false;
        }
        if (estadoLower.length > 20) {
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
            tipo_reparacion: this.tipo_reparacion,
            comentarios: this.comentarios || null,
            n_orden: this.n_orden || null,
            id_dispositivo: this.id_dispositivo,
            vigencia_garantia: this.vigencia_garantia || null
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
            tipo_reparacion: this.tipo_reparacion,
            comentarios: this.comentarios || null,
            id_dispositivo: this.id_dispositivo,
            vigencia_garantia: this.vigencia_garantia || null,
            comentarios_tecnico: this.comentarios_tecnico || null
        };
    }

    // Método para completar una reparación
    completar() {
        this.estado = 'Completada';
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
            row.tipo_reparacion,
            row.comentarios,
            row.n_orden,
            row.id_dispositivo
        );
    }

    static fromDBArray(rows) {
        return rows.map(row => this.fromDB(row));
    }
}