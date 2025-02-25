const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const queries = require('../connections/database')
const bcrypt = require('bcrypt')

const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION;

router.post('/register', async (req, res) => {
    try {

        const checkUser = await queries.getUserByUserName(req.body.username)
        if (checkUser.length > 0) return res.status(401).json({ message: 'Usuario ya existe' });
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await queries.createUser(req.body.username, hashedPassword)
        res.json(user)
    } catch (error) {
        res.json({ error: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await queries.getUserByUserName(req.body.username)
        if (user.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(req.body.password, user[0].password);
        if (!validPassword) return res.status(401).json({ message: 'Credenciales inválidas' });
        
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

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