const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Configurar conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});

const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION;

// Registro de usuario
app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error registrando usuario' });
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    });
});

// Inicio de sesión
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) return res.status(401).json({ message: 'Credenciales inválidas' });
        
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
        
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.json({ message: 'Inicio de sesión exitoso' });
    });
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(403).json({ message: 'No autorizado' });
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
};

// Ruta protegida
app.get('/home', authenticateToken, (req, res) => {
    res.json({ message: `Bienvenido, ${req.user.username}` });
});

// Servidor en puerto 3000
app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
