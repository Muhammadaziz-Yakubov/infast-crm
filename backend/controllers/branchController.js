const Branch = require('../models/Branch');
const User = require('../models/User');

// @desc    Barcha filiallarni olish
// @route   GET /api/branches
// @access  Private (superadmin, admin)
exports.getBranches = async (req, res) => {
    try {
        let query = {};
        
        // Agar superadmin bo'lmasa, faqat o'z filialini ko'radi
        if (req.user.role !== 'superadmin') {
            query._id = req.user.branchId;
        }

        const branches = await Branch.find(query)
            .populate('adminId', 'fullName username')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Bitta filialni olish
// @route   GET /api/branches/:id
// @access  Private (superadmin, admin)
exports.getBranch = async (req, res) => {
    try {
        // Ruxsatni tekshirish
        if (req.user.role !== 'superadmin' && req.user.branchId?.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Ruxsat etilmagan' });
        }

        const branch = await Branch.findById(req.params.id).populate('adminId', 'fullName username');
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Filial topilmadi' });
        }

        res.json({ success: true, data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Yangi filial qo'shish
// @route   POST /api/branches
// @access  Private (superadmin)
exports.createBranch = async (req, res) => {
    try {
        const { name, address, phone, logo, adminId } = req.body;

        const branch = await Branch.create({
            name,
            address,
            phone,
            logo,
            adminId: adminId || null
        });

        // Agar adminId berilgan bo'lsa, o'sha userning branchId sini yangilaymiz
        if (adminId) {
            await User.findByIdAndUpdate(adminId, { branchId: branch._id });
        }

        res.status(201).json({
            success: true,
            message: "Filial muvaffaqiyatli qo'shildi",
            data: branch
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Filialni tahrirlash
// @route   PUT /api/branches/:id
// @access  Private (superadmin)
exports.updateBranch = async (req, res) => {
    try {
        const { name, address, phone, logo, adminId, status } = req.body;

        let branch = await Branch.findById(req.params.id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Filial topilmadi' });
        }

        const oldAdminId = branch.adminId;

        branch.name = name || branch.name;
        branch.address = address !== undefined ? address : branch.address;
        branch.phone = phone !== undefined ? phone : branch.phone;
        branch.logo = logo !== undefined ? logo : branch.logo;
        branch.status = status || branch.status;
        branch.adminId = adminId !== undefined ? adminId : branch.adminId;

        await branch.save();

        // Agar admin o'zgargan bo'lsa, foydalanuvchilarning branchId sini moslaymiz
        if (adminId !== undefined && oldAdminId?.toString() !== adminId?.toString()) {
            // Eskisidan filialni olib tashlaymiz
            if (oldAdminId) {
                await User.findByIdAndUpdate(oldAdminId, { branchId: null });
            }
            // Yangisiga biriktiramiz
            if (adminId) {
                await User.findByIdAndUpdate(adminId, { branchId: branch._id });
            }
        }

        res.json({
            success: true,
            message: "Filial muvaffaqiyatli tahrirlandi",
            data: branch
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Filialni o'chirish/faolsizlantirish
// @route   DELETE /api/branches/:id
// @access  Private (superadmin)
exports.deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Filial topilmadi' });
        }

        // O'chirish o'rniga statusini 'inactive' qilamiz yoki to'liq o'chiramiz
        // To'liq o'chirish:
        if (branch.adminId) {
            await User.findByIdAndUpdate(branch.adminId, { branchId: null });
        }
        
        await Branch.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Filial muvaffaqiyatli o'chirildi"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};
