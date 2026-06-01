const express = require('express');
const router = express.Router();
const {
    createTest,
    getAdminTests,
    getTest,
    updateTest,
    deleteTest,
    cloneTest,
    getTestResults,
    getStudentTests,
    getTestForTaking,
    submitTest,
    getStudentStats,
    getDashboardWidgets
} = require('../controllers/testController');

const { protect, authorize } = require('../middleware/auth');

// Barcha marshrutlar tizimga kirishni talab qiladi
router.use(protect);

// ==========================================
// O'QUVCHI MARSHRUTLARI (Student) - MUST BE FIRST!
// ==========================================

// O'quvchi kabineti uchun testlar
router.get('/my', authorize('student'), getStudentTests);

// O'quvchi profil statistikasi
router.get('/my/stats', authorize('student'), getStudentStats);

// O'quvchi test topshirishi (savollarni olish)
router.get('/:id/take', authorize('student'), getTestForTaking);

// Test topshirish (javoblarni yuborish)
router.post('/:id/submit', authorize('student'), submitTest);


// ==========================================
// ADMIN MARSHRUTLARI (Superadmin, Admin, Teacher)
// ==========================================

// Dashboard widgetlari ma'lumotlarini olish
router.get('/dashboard/widgets', authorize('superadmin', 'admin', 'teacher'), getDashboardWidgets);

// Test yaratish va barchasini olish
router.route('/')
    .get(authorize('superadmin', 'admin', 'teacher'), getAdminTests)
    .post(authorize('superadmin', 'admin', 'teacher'), createTest);

// Bitta test bo'yicha operatsiyalar
router.route('/:id')
    .get(authorize('superadmin', 'admin', 'teacher'), getTest)
    .put(authorize('superadmin', 'admin', 'teacher'), updateTest)
    .delete(authorize('superadmin', 'admin', 'teacher'), deleteTest);

// Testni klonlash
router.post('/:id/clone', authorize('superadmin', 'admin', 'teacher'), cloneTest);

// Test natijalarini olish
router.get('/:id/results', authorize('superadmin', 'admin', 'teacher'), getTestResults);

module.exports = router;
