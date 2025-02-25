const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const queries = require('../connections/database')
const bcrypt = require('bcrypt')
const { encrypt, decrypt } = require('../utils/encryption');


const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION;

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await queries.getUsers();
        
        const User = users.find(u => decrypt(u.user) === username);
        if (User) return res.status(401).json({ message: 'Usuario ya existe!' });
        
        const user = await queries.createUser(encrypt(username), encrypt(password))
        res.json(user)
    } catch (error) {
        res.json({ error: error.message })
    }
})



router.post('/login', async (req, res) => {
    try {

        const { username, password } = req.body;
        const users = await queries.getUsers();
        
        const User = users.find(u => decrypt(u.user) === username);
        if (!User) return res.status(401).json({ message: 'Usuario no encontrado' });

        if (decrypt(User.pass) !== password) return res.status(401).json({ message: 'Credenciales inválidas' });
    
        const token = jwt.sign({ id: User.id, username: decrypt(User.user) }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

        res.cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.json({ error: error.message })
    }
})

router.get('/logout', async (req, res) => {
    res.clearCookie('access_token');
    res.json({ message: 'Logout exitoso' });
})

module.exports = router