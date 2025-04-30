const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

const chatbotRoutes = require('./routes/chatbotRoutes');

app.use('/chatbot', chatbotRoutes);

const PORT = 8085;
app.listen(PORT, () => console.log(`Chatbot server running on port ${PORT}`));
