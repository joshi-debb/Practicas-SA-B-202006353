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

async function insert(nombre, direccion, responsable) {
    try {
        const [results] = await pool.query('INSERT INTO ubicaciones (nombre, direccion, responsable) VALUES (?, ?, ?)', [nombre, direccion, responsable]);
        return results;
    } catch (error) {
        return error.message;
    }
}

async function all() {
    try {
        const [results] = await pool.query('SELECT * FROM ubicaciones');
        return results;
    } catch (error) {
        return error.message;
    }
}

async function update(id, nombre, direccion, responsable) {
    try {
        const [results] = await pool.query('UPDATE ubicaciones SET nombre = ?, direccion = ?, responsable = ? WHERE id = ?', [nombre, direccion, responsable, id]);
        return results;
    } catch (error) {
        return error.message;
    }
}

async function remove(id) {
    try {
        const [results] = await pool.query('DELETE FROM ubicaciones WHERE id = ?', [id]);
        return results;
    } catch (error) {
        return error.message;
    }
}

module.exports = {
    insert, all, update, remove
};