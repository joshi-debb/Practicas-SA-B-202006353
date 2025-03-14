CREATE DATABASE ubicaciones_db;
USE ubicaciones_db;

CREATE TABLE ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    responsable VARCHAR(255)
);