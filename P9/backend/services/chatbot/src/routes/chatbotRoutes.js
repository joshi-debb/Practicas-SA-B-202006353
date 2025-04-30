// routes/chatbotRoutes.js
const express = require('express');
const router  = express.Router();
const chat    = require('../controllers/chatController');

/* ───── Chat principal ───── */
router.post('/chat', chat.handleMessage);

module.exports = router;
