const express = require('express');
const router = express.Router();
const {
    getCourses, getCourse, createCourse, updateCourse, deleteCourse
} = require('../controllers/courseController');
const { protect, checkBranchAccess } = require('../middleware/auth');

router.use(protect);
router.use(checkBranchAccess);
router.route('/').get(getCourses).post(createCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
