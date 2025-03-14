const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const equipoRoute = require('./routes/equipos');

app.use('/equipos', equipoRoute);

app.listen(8080)