const express = require('express');
const router = express.Router();
const {
    generateAIHomework,
    assignAIHomework,
    generateForLesson
} = require('../controllers/homeworkController');
const { protect } = require('../middleware/auth');

router.use(protect);

// AI Homework generatsiya
router.post('/generate', generateAIHomework);

// AI Homework tayinlash
router.post('/assign', assignAIHomework);

// Ma'lum bir dars uchun generatsiya
router.post('/generate-for-lesson', generateForLesson);

module.exports = router;
