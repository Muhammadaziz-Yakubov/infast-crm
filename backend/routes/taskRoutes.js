const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
    createTask,
    getTaskSubmissions,
    gradeSubmission,
    completeTask,
    getMyTasks,
    submitTask
} = require('../controllers/taskController');

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin routes
router.post('/', protect, upload.single('image'), createTask);
router.get('/:taskId/submissions', protect, getTaskSubmissions);
router.patch('/submissions/:id/grade', protect, gradeSubmission);
router.patch('/:id/complete', protect, completeTask);

// Student routes
router.get('/my', protect, getMyTasks);
router.post('/submit', protect, upload.array('images', 5), submitTask);

module.exports = router;
