const express = require('express');
const {
    getNotes,
    createNote,
    toggleLike,
    deleteNote
} = require('../controllers/noteController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.post('/:id/like', toggleLike);
router.delete('/:id', deleteNote);

module.exports = router;
