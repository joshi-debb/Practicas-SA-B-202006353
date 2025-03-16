CREATE DATABASE mantenimiento_db;
USE mantenimiento_db;

CREATE TABLE mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT,
    descripcion TEXT,
    estado VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipos_mantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    FOREIGN KEY (equipo_id) REFERENCES mantenimientos(id) ON DELETE CASCADE    
);

CREATE TABLE proveedores_mantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT,
    nombre VARCHAR(255) NOT NULL,
    contacto VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    direccion TEXT,
    FOREIGN KEY (equipo_id) REFERENCES mantenimientos(id) ON DELETE CASCADE
);