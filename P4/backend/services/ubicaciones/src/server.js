const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const ubicacionRoute = require('./routes/ubicaciones');

app.use('/ubicaciones', ubicacionRoute);

app.listen(8081)