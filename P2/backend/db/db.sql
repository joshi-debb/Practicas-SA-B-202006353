
CREATE DATABASE IF NOT EXISTS practica2;

USE practica2;

-- Table for user data
CREATE TABLE user_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user VARCHAR(50) NOT NULL UNIQUE,
    pass VARCHAR(50) NOT NULL
);
