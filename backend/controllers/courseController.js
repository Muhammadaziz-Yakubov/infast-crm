const Course = require('../models/Course');

// @desc    Barcha kurslarni olish
// @route   GET /api/courses
exports.getCourses = async (req, res) => {
    try {
        const query = { ...(req.branchFilter || {}) };
        const courses = await Course.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Bitta kursni olish
// @route   GET /api/courses/:id
exports.getCourse = async (req, res) => {
    try {
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const course = await Course.findOne(query);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
        }
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Yangi kurs qo'shish
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            branchId: req.branchId || req.body.branchId || req.user.branchId
        };
        const course = await Course.create(courseData);
        res.status(201).json({
            success: true,
            message: "Kurs muvaffaqiyatli qo'shildi",
            data: course
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Kursni tahrirlash
// @route   PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const course = await Course.findOneAndUpdate(query, req.body, {
            new: true,
            runValidators: true
        });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
        }
        res.json({
            success: true,
            message: 'Kurs muvaffaqiyatli yangilandi',
            data: course
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Kursni o'chirish
// @route   DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
    try {
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const course = await Course.findOneAndDelete(query);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
        }
        res.json({
            success: true,
            message: "Kurs muvaffaqiyatli o'chirildi"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};
