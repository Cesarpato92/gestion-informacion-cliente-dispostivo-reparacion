export class Garantia {
    constructor(id_garantia, id_reparacion, tipo_movimiento, fecha_movimiento, observaciones, id_tecnico) {
        this.id_garantia = id_garantia ? id_garantia.toString().trim() : null;
        this.id_reparacion = id_reparacion ? id_reparacion.toString().trim() : null;
        this.tipo_movimiento = tipo_movimiento?.trim() || '';
        this.fecha_movimiento = fecha_movimiento || new Date().toISOString().split('T')[0];
        this.observaciones = observaciones?.trim() || '';
        this.id_tecnico = id_tecnico ? id_tecnico.toString().trim() : null;
    }

    validacion() {
        if (!this.id_reparacion || !this.tipo_movimiento) {
            return false;
        }

        if (!/^\d+$/.test(this.id_reparacion)) {
            return false;
        }

        const tiposValidos = ['entrada', 'salida'];
        if (!tiposValidos.includes(this.tipo_movimiento.toLowerCase())) {
            return false;
        }

        if (this.id_garantia && !/^\d+$/.test(this.id_garantia)) {
            return false;
        }

        if (this.id_tecnico && !/^\d+$/.test(this.id_tecnico)) {
            return false;
        }

        return true;
    }

    toInsert() {
        return {
            id_reparacion: this.id_reparacion,
            tipo_movimiento: this.tipo_movimiento,
            fecha_movimiento: this.fecha_movimiento || new Date().toISOString().split('T')[0],
            observaciones: this.observaciones || null,
            id_tecnico: this.id_tecnico || null
        };
    }

    static fromDB(row) {
        return new Garantia(
            row.id_garantia,
            row.id_reparacion,
            row.tipo_movimiento,
            row.fecha_movimiento,
            row.observaciones,
            row.id_tecnico
        );
    }

    static fromDBArray(rows) {
        return rows.map(row => Garantia.fromDB(row));
    }
}