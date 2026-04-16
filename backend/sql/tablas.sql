-- Añadir columnas nombre y celular a usuario si no existen
ALTER TABLE usuario ADD COLUMN nombre VARCHAR(100) NULL AFTER rol;
ALTER TABLE usuario ADD COLUMN celular VARCHAR(20) NULL AFTER nombre;

-- Añadir columna vigencia_garantia a reparacion si no existe
ALTER TABLE reparacion ADD COLUMN vigencia_garantia DATE NULL;

-- Tabla de garantías para registrar ingresos y salidas
CREATE TABLE IF NOT EXISTS garantia (
    id_garantia INT AUTO_INCREMENT PRIMARY KEY,
    id_reparacion INT UNSIGNED NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida') NOT NULL,
    fecha_movimiento DATE NOT NULL,
    observaciones TEXT,
    id_tecnico INT,
    FOREIGN KEY (id_reparacion) REFERENCES reparacion(id_reparacion) ON DELETE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar usuario administrador inicial (password: admin123)
INSERT INTO usuario (username, password, rol) 
VALUES ('admin', '$2b$10$rqVF8LxXK7xKxKxKxKxKxO.xKxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'administrador')
ON DUPLICATE KEY UPDATE username = username;

-- Insertar usuario técnico inicial (password: tecnico123)
INSERT INTO usuario (username, password, rol) 
VALUES ('tecnico', '$2b$10$rqVF8LxXK7xKxKxKxKxKxO.xKxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'tecnico')
ON DUPLICATE KEY UPDATE username = username;