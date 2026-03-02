const express = require('express');
const router = express.Router();
const { spinWheel, getSpinLogs } = require('../controllers/wheelController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/spin', spinWheel);
router.get('/logs', getSpinLogs);

module.exports = router;
