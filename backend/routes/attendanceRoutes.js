const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance, scanAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:groupId/:date', getAttendance);
router.post('/', saveAttendance);
router.post('/scan', scanAttendance);

module.exports = router;
