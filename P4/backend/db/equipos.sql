CREATE DATABASE equipos_db;
USE equipos_db;

CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    estado VARCHAR(50),
    ubicacion VARCHAR(255)
);