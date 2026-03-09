const Group = require('../models/Group');
const Student = require('../models/Student');

// @desc    Barcha guruhlarni olish
// @route   GET /api/groups
exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('kurs', 'nomi narx')
            .populate('oquvchilarSoni')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Bitta guruhni olish
// @route   GET /api/groups/:id
exports.getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('kurs', 'nomi narx davomiyligi')
            .populate('oquvchilarSoni');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        // Guruh o'quvchilarini ham olish
        const students = await Student.find({ guruh: req.params.id })
            .populate('kurs', 'nomi')
            .sort({ ism: 1 });

        res.json({
            success: true,
            data: {
                ...group.toObject(),
                oquvchilar: students
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Yangi guruh qo'shish
// @route   POST /api/groups
exports.createGroup = async (req, res) => {
    try {
        const group = await Group.create(req.body);
        const populated = await Group.findById(group._id)
            .populate('kurs', 'nomi narx');

        res.status(201).json({
            success: true,
            message: "Guruh muvaffaqiyatli qo'shildi",
            data: populated
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Guruhni tahrirlash
// @route   PUT /api/groups/:id
exports.updateGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('kurs', 'nomi narx');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }
        res.json({
            success: true,
            message: 'Guruh muvaffaqiyatli yangilandi',
            data: group
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Guruhni o'chirish
// @route   DELETE /api/groups/:id
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }
        res.json({
            success: true,
            message: "Guruh muvaffaqiyatli o'chirildi"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};


