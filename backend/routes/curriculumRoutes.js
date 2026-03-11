const express = require('express');
const router = express.Router();
const {
    getGroupCurriculum,
    getGroupAllLessons,
    markLessonCompleted,
    undoLessonCompleted,
    setManualProgress,
    getCurriculumCourses
} = require('../controllers/curriculumController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Curriculum kurslar ro'yxati
router.get('/courses', getCurriculumCourses);

// Guruh curriculum ma'lumotlari
router.get('/group/:groupId', getGroupCurriculum);

// Guruhning barcha darslari
router.get('/group/:groupId/all', getGroupAllLessons);

// Darsni o'tildi deb belgilash
router.post('/group/:groupId/complete', markLessonCompleted);

// Darsni qaytarish (undo)
router.post('/group/:groupId/undo', undoLessonCompleted);

// Dars progressni qo'lda o'rnatish
router.put('/group/:groupId/set-progress', setManualProgress);

module.exports = router;
