const express = require('express');
const router = express.Router();
const {
    getGroups, getGroup, createGroup, updateGroup, deleteGroup, updateGroupProgress
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getGroups).post(createGroup);
router.route('/:id').get(getGroup).put(updateGroup).delete(deleteGroup);
router.route('/:id/progress').put(updateGroupProgress);

module.exports = router;
