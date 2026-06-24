const User = require('../models/User');

// @desc    Barcha foydalanuvchilarni olish
// @route   GET /api/users
// @access  Private (superadmin, admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Bitta foydalanuvchini olish
// @route   GET /api/users/:id
// @access  Private (superadmin, admin)
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Yangi foydalanuvchi qo'shish (admin bo'lib qo'shiladi yoki kiritilgan rolda)
// @route   POST /api/users
// @access  Private (superadmin, admin)
exports.createUser = async (req, res) => {
    try {
        const { username, password, fullName, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Ushbu foydalanuvchi nomi band' });
        }

        // Create user (default role is 'admin')
        const user = await User.create({
            username,
            password,
            fullName: fullName || 'Administrator',
            role: role || 'admin'
        });

        // Hide password in response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "Foydalanuvchi muvaffaqiyatli qo'shildi",
            data: userResponse
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Foydalanuvchini tahrirlash
// @route   PUT /api/users/:id
// @access  Private (superadmin, admin)
exports.updateUser = async (req, res) => {
    try {
        const { username, fullName, role, password } = req.body;
        
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
        }

        // If username is being changed, check if new username is taken
        if (username && username !== user.username) {
            const userExists = await User.findOne({ username });
            if (userExists) {
                return res.status(400).json({ success: false, message: 'Ushbu foydalanuvchi nomi band' });
            }
            user.username = username;
        }

        if (fullName) user.fullName = fullName;
        if (role) user.role = role;
        if (password) user.password = password; // pre-save will hash it

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Foydalanuvchi ma\'lumotlari muvaffaqiyatli yangilandi',
            data: userResponse
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Foydalanuvchini o'chirish
// @route   DELETE /api/users/:id
// @access  Private (superadmin, admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
        }

        // Prevent self deletion
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({ success: false, message: 'O\'zingizning hisobingizni o\'chira olmaysiz' });
        }

        // Prevent superadmin deletion if the current user is not superadmin
        if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Superadmin hisobini o\'chirishga ruxsat yo\'q' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Foydalanuvchi muvaffaqiyatli o'chirildi"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};
