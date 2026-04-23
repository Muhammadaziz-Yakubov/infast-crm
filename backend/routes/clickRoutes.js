const express = require('express');
const router = express.Router();
const { handleCallback } = require('../controllers/clickController');

// Click callback route (must be public)
router.post('/callback', handleCallback);

module.exports = router;
