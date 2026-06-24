const express = require('express');
const router = express.Router();
const {
    getUsers, getUser, createUser, updateUser, deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Hamma user marşrutlarini faqat login bo'lgan superadmin va adminlar ishlata oladi
router.use(protect);
router.use(authorize('superadmin', 'admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
