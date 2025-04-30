CREATE DATABASE ubicaciones_db;
USE ubicaciones_db;

CREATE TABLE ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    responsable VARCHAR(255)
);

CREATE TABLE zonas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ubicacion_id INT,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE CASCADE
);

CREATE TABLE historial_ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ubicacion_id INT,
    equipo_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE CASCADE
);