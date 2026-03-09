const express = require('express');
const {
    getNotes,
    createNote,
    toggleLike,
    deleteNote,
    togglePin
} = require('../controllers/noteController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.post('/:id/like', toggleLike);
router.patch('/:id/pin', authorize('superadmin', 'admin', 'teacher'), togglePin);
router.delete('/:id', deleteNote);

module.exports = router;
