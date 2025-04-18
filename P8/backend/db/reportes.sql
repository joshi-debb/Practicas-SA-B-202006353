CREATE DATABASE reportes_db;
USE reportes_db;

CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(255),
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios_reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporte_id INT,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE,
    telefono VARCHAR(50),
    FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
);

CREATE TABLE detalles_reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporte_id INT,
    detalle TEXT,
    estado VARCHAR(50),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
);

CREATE TABLE historial_reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporte_id INT,
    accion VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    realizado_por VARCHAR(255),
    FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
);