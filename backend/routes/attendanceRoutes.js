const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance, scanAttendance, sendAttendanceReport } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:groupId/:date', getAttendance);
router.post('/', saveAttendance);
router.post('/scan', scanAttendance);
router.post('/report/:groupId/:date', sendAttendanceReport);

module.exports = router;
