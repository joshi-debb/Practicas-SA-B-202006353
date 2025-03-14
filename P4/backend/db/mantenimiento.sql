CREATE DATABASE mantenimiento_db;
USE mantenimiento_db;

CREATE TABLE mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT,
    descripcion TEXT,
    estado VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);