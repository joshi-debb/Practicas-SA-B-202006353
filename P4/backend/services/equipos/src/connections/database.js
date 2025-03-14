const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function insert(nombre, tipo, estado, ubicacion) {
    try {
        const [results] = await pool.query('INSERT INTO equipos (nombre, tipo, estado, ubicacion) VALUES (?, ?, ?, ?)', [nombre, tipo, estado, ubicacion]);
        return results;
    } catch (error) {
        return error.message;
    }
}

async function all() {
    try {
        const [results] = await pool.query('SELECT * FROM equipos');
        return results;
    } catch (error) {
        return error.message;
    }
}

async function update(id, nombre, tipo, estado, ubicacion) {
    try {
        const [results] = await pool.query('UPDATE equipos SET nombre = ?, tipo = ?, estado = ?, ubicacion = ? WHERE id = ?', [nombre, tipo, estado, ubicacion, id]);
        return results;
    } catch (error) {
        return error.message;
    }
}

async function remove(id) {
    try {
        const [results] = await pool.query('DELETE FROM equipos WHERE id = ?', [id]);
        return results;
    } catch (error) {
        return error.message;
    }
}

module.exports = {
    all, insert, update, remove
}  