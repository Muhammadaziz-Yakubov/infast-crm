const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Token yaratish
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Login (Admin or Student)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Foydalanuvchi nomi va parol kiritilishi shart'
            });
        }

        // 1. Try to find as admin/staff
        let account = await User.findOne({ username });
        let role = 'admin';

        // 2. If not found, try to find as student
        if (!account) {
            account = await Student.findOne({ username });
            role = 'student';
        }

        if (!account) {
            return res.status(401).json({
                success: false,
                message: "Noto'g'ri foydalanuvchi nomi yoki parol"
            });
        }

        const isMatch = await account.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Noto'g'ri foydalanuvchi nomi yoki parol"
            });
        }

        const token = generateToken(account._id);

        res.json({
            success: true,
            message: 'Muvaffaqiyatli kirildi!',
            data: {
                token,
                user: {
                    id: account._id,
                    username: account.username,
                    fullName: account.fullName || account.ism,
                    role: account.role || role,
                    coins: account.coins || 0,
                    ball: account.ball || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        // Try finding in User first
        let account = await User.findById(req.user.id).select('-password');

        // If not found, look in Student
        if (!account) {
            account = await Student.findById(req.user.id).select('-password');
        }

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        res.json({
            success: true,
            data: account
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
};

