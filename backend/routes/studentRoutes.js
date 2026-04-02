const express = require('express');
const router = express.Router();
const {
    getStudents, getStudent, createStudent, updateStudent, deleteStudent,
    getDebtors, getMyData, updateMe, updateProfileImage, getClassmates,
    getPublicProfile, bulkDeleteStudents, getLeaderboard, resetPaymentsStatus,
    sendDebtSMS
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get('/me/dashboard', getMyData);
router.put('/me/update', updateMe);
router.put('/me/profile-image', upload.single('image'), updateProfileImage);
router.get('/classmates', getClassmates);
router.get('/public-profile/:id', getPublicProfile);
router.get('/debtors/list', getDebtors);
router.get('/leaderboard', getLeaderboard);
router.post('/bulk-delete', authorize('superadmin', 'admin'), bulkDeleteStudents);
router.put('/reset-payments-status', authorize('superadmin', 'admin'), resetPaymentsStatus);

router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);
router.post('/:id/send-debt-sms', authorize('superadmin', 'admin'), sendDebtSMS);


module.exports = router;
