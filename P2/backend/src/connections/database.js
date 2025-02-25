const mysql = require('mysql2/promise')

async function connect_to_db(){
    return await mysql.createConnection(
        {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }
    );
}

async function getUsers() {
    const connection = await connect_to_db();
    try {
        const [results] = await connection.query('SELECT * FROM users');
        return results;
    } catch(error){
        return error.message
    } finally{
        connection.end();
    }
}

async function getUserByUserName(username) {
    const connection = await connect_to_db();
    try {
        const [results] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        return results;
    } catch(error){
        return error.message
    } finally{
        connection.end();
    }
}

async function createUser(username, password) {
    const connection = await connect_to_db();
    try {
        const [results] = await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        return results;
    } catch(error){
        return error.message
    } finally{
        connection.end();
    }
}

module.exports = {
    getUserByUserName,
    getUsers,
    createUser
}