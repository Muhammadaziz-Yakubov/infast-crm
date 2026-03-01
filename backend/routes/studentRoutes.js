const express = require('express');
const router = express.Router();
const {
    getStudents, getStudent, createStudent, updateStudent, deleteStudent, getDebtors, getMyData, updateMe
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/me/dashboard', getMyData);
router.put('/me/update', updateMe);
router.get('/debtors/list', getDebtors);

router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;


