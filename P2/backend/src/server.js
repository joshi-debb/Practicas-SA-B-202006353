const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const cookieJwtAuth = require('./middleware/cookieJwtAuth');

const userRoute = require('./routes/users');
const protectedRoute = require('./routes/protected');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
))

app.use('/users', userRoute);
app.use('/protected', cookieJwtAuth, protectedRoute);

app.listen(8080)