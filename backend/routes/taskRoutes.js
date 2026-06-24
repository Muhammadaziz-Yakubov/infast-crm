const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, checkBranchAccess } = require('../middleware/auth');
const {
    createTask,
    getTaskSubmissions,
    gradeSubmission,
    completeTask,
    reopenTask,
    getMyTasks,
    submitTask,
    deleteTask
} = require('../controllers/taskController');

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(protect);
router.use(checkBranchAccess);

// Admin routes
router.post('/', upload.single('image'), createTask);
router.get('/:taskId/submissions', getTaskSubmissions);
router.patch('/submissions/:id/grade', gradeSubmission);
router.patch('/:id/complete', completeTask);
router.patch('/:id/reopen', reopenTask);
router.delete('/:id', deleteTask);

// Student routes
router.get('/my', getMyTasks);
router.post('/submit', upload.array('images', 5), submitTask);

module.exports = router;
