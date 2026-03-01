const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:groupId/:date', getAttendance);
router.post('/', saveAttendance);

module.exports = router;
