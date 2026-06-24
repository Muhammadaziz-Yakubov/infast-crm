const Group = require('../models/Group');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @desc    Barcha guruhlarni olish
// @route   GET /api/groups
exports.getGroups = async (req, res) => {
    try {
        const query = { ...(req.branchFilter || {}) };
        
        const groups = await Group.find(query)
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
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const group = await Group.findOne(query)
            .populate('kurs', 'nomi narx davomiyligi')
            .populate('oquvchilarSoni');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        // Guruh o'quvchilarini ham olish (faqat shu filial o'quvchilari)
        const students = await Student.find({ guruh: req.params.id, ...(req.branchFilter || {}) })
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
        // Filial ID sini biriktirish
        const groupData = {
            ...req.body,
            branchId: req.branchId || req.body.branchId || req.user.branchId
        };

        if (!groupData.branchId && req.user.role !== 'superadmin') {
            return res.status(400).json({ success: false, message: 'Filial tanlanishi shart' });
        }

        const group = await Group.create(groupData);
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
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const oldGroup = await Group.findOne(query);
        if (!oldGroup) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const group = await Group.findOneAndUpdate(query, req.body, {
            new: true,
            runValidators: true
        }).populate('kurs', 'nomi narx');

        // Kurs yoki curriculumKalit o'zgarganda o'quvchilarni va progressni yangilash
        const kursOzgardi = req.body.kurs && req.body.kurs.toString() !== oldGroup.kurs?.toString();
        const curriculumOzgardi = req.body.curriculumKalit && req.body.curriculumKalit !== oldGroup.curriculumKalit;

        if (kursOzgardi || curriculumOzgardi) {
            // 1. Progressni dars progressiga bog'liq holatda tushirish
            if (req.body.darsProgress === undefined) {
                group.darsProgress = 0;
                await group.save();
            }

            // 2. Agar Kurs o'zgargan bo'lsa, o'quvchilarni ham yangilash (faqat shu filial doirasida)
            if (kursOzgardi) {
                const newCourse = await Course.findOne({ _id: req.body.kurs, ...(req.branchFilter || {}) });
                if (newCourse) {
                    // 2a. Bacha o'quvchilarning kursini yangilash
                    await Student.updateMany(
                        { guruh: group._id, ...(req.branchFilter || {}) },
                        {
                            kurs: newCourse._id,
                            tolovHolati: 'tolanmagan'
                        }
                    );
                    
                    // 2b. FAQAT maxsus narxi yo'q o'quvchilar narxini yangilash
                    await Student.updateMany(
                        { guruh: group._id, maxsusNarx: { $ne: true }, ...(req.branchFilter || {}) },
                        { oylikTolov: newCourse.narx }
                    );
                }
            }
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
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const group = await Group.findOneAndDelete(query);
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

// @desc    Guruh progressini yangilash
// @route   PUT /api/groups/:id/progress
exports.updateGroupProgress = async (req, res) => {
    try {
        const { completedLessons, currentTopic, nextLesson } = req.body;
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const group = await Group.findOne(query);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        // Progress obyektini yangilash
        if (completedLessons !== undefined) {
            group.progress.completedLessons = Number(completedLessons);
            group.darsProgress = Number(completedLessons); // Sync with curriculum system
        }
        if (currentTopic !== undefined) group.progress.currentTopic = currentTopic;
        if (nextLesson !== undefined) group.progress.nextLesson = nextLesson;

        await group.save();

        res.json({
            success: true,
            message: 'Progress muvaffaqiyatli yangilandi',
            data: group
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
