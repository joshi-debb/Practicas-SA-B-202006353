const express = require('express')
const router = express.Router()

router.get('/home', async (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(403).json({ message: 'No autorizado' });
    res.json({ message: `Bienvenido, ${token.user}` });
})  

module.exports = router