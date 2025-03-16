CREATE DATABASE equipos_db;
USE equipos_db;

CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    estado VARCHAR(50),
    ubicacion VARCHAR(255)
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

CREATE TABLE historial_movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT,
    ubicacion_anterior VARCHAR(255),
    ubicacion_nueva VARCHAR(255),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

CREATE TABLE responsables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT,
    nombre VARCHAR(255) NOT NULL,
    departamento VARCHAR(255),
    correo VARCHAR(255) UNIQUE,
    telefono VARCHAR(50),
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);
