const express = require('express');
const {
    getNotes,
    getNote,
    createNote,
    toggleLike,
    deleteNote,
    togglePin
} = require('../controllers/noteController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', getNotes);
router.get('/:id', getNote);

// Apply protection to mutation routes
router.use(protect);

router.post('/', createNote);
router.post('/:id/like', toggleLike);
router.patch('/:id/pin', authorize('superadmin', 'admin', 'teacher'), togglePin);
router.delete('/:id', deleteNote);

module.exports = router;
