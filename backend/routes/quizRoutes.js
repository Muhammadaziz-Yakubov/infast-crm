const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// Student & Admin can get questions (though mostly for students)
router.get('/questions/random', quizController.getRandomQuestions);

// Student submits quiz
router.post('/submit', quizController.submitQuiz);

// Student gets their results
router.get('/my-results', quizController.getMyQuizResults);

// Admin gets all results
router.get('/admin/all-results', restrictTo('admin', 'teacher'), quizController.getAllQuizResults);

module.exports = router;
