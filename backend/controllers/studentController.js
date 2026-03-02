const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');

// @desc    Barcha o'quvchilarni olish
// @route   GET /api/students
exports.getStudents = async (req, res) => {
    try {
        const { search, guruh, kurs, holat, page = 1, limit = 50 } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { ism: { $regex: search, $options: 'i' } },
                { telefon: { $regex: search, $options: 'i' } }
            ];
        }
        if (guruh) query.guruh = guruh;
        if (kurs) query.kurs = kurs;
        if (holat === 'qarzdor') {
            query.tolovHolati = { $in: ['tolanmagan', 'qarzdor'] };
        } else if (holat) {
            query.tolovHolati = holat;
        }

        const total = await Student.countDocuments(query);
        const students = await Student.find(query)
            .populate('kurs', 'nomi narx')
            .populate('guruh', 'nomi')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: students.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: students
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Bitta o'quvchini olish
// @route   GET /api/students/:id
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('kurs', 'nomi narx davomiyligi')
            .populate('guruh', 'nomi oqituvchi jadval');

        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        // O'quvchi to'lovlar tarixini olish
        const payments = await Payment.find({ oquvchi: req.params.id })
            .sort({ sana: -1 })
            .limit(12);

        res.json({
            success: true,
            data: {
                ...student.toObject(),
                tolovlar: payments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Yangi o'quvchi qo'shish
// @route   POST /api/students
exports.createStudent = async (req, res) => {
    try {
        const { shuOyTolagan, ...studentData } = req.body;

        // Kurs narxini olish
        if (studentData.kurs) {
            const course = await Course.findById(studentData.kurs);
            if (course) {
                studentData.oylikTolov = course.narx;
            }
        }

        // Agar shu oy to'lamagan bo'lsa - qarzdor
        if (shuOyTolagan === false || shuOyTolagan === 'yoq') {
            studentData.tolovHolati = 'qarzdor';
        } else if (shuOyTolagan === true || shuOyTolagan === 'ha') {
            studentData.tolovHolati = 'tolangan';
        }

        // Username uniqueligini tekshirish
        if (studentData.username) {
            const exists = await Student.findOne({ username: studentData.username });
            if (exists) {
                return res.status(400).json({ success: false, message: "Ushbu login band, boshqasini tanlang" });
            }
        } else {
            // Agar login berilmagan bo'lsa raqamidan yasash (yoki majburiy qilish)
            studentData.username = studentData.telefon.replace(/\D/g, '').slice(-9);
        }

        if (!studentData.password) {
            studentData.password = 'std123'; // Default password if not provided
        }

        const student = await Student.create(studentData);

        // Agar to'lov qilgan bo'lsa - payment yaratish
        if (shuOyTolagan === true || shuOyTolagan === 'ha') {
            const now = new Date();
            await Payment.create({
                oquvchi: student._id,
                summa: student.oylikTolov,
                oy: now.getMonth() + 1,
                yil: now.getFullYear(),
                tolovTuri: 'naqd',
                izoh: "Ro'yxatga olishda to'langan",
                kurs: student.kurs,
                guruh: student.guruh
            });
        }

        const populated = await Student.findById(student._id)
            .populate('kurs', 'nomi narx')
            .populate('guruh', 'nomi');

        res.status(201).json({
            success: true,
            message: "O'quvchi muvaffaqiyatli qo'shildi",
            data: populated
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    O'quvchini tahrirlash
// @route   PUT /api/students/:id
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        // Update fields manually to trigger pre('save') if password is changed
        Object.keys(req.body).forEach(key => {
            student[key] = req.body[key];
        });

        await student.save();

        const populated = await Student.findById(student._id)
            .populate('kurs', 'nomi narx')
            .populate('guruh', 'nomi');

        res.json({
            success: true,
            message: "O'quvchi muvaffaqiyatli yangilandi",
            data: populated
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    O'quvchini o'chirish
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }
        res.json({
            success: true,
            message: "O'quvchi muvaffaqiyatli o'chirildi"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Bir necha o'quvchini birdan o'chirish
// @route   POST /api/students/bulk-delete
exports.bulkDeleteStudents = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "O'quvchilar tanlanmagan" });
        }

        const result = await Student.deleteMany({ _id: { $in: ids } });

        res.json({
            success: true,
            message: `${result.deletedCount} ta o'quvchi muvaffaqiyatli o'chirildi`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Qarzdorlar ro'yxati
// @route   GET /api/students/debtors/list
exports.getDebtors = async (req, res) => {
    try {
        const debtors = await Student.find({
            tolovHolati: { $in: ['tolanmagan', 'qarzdor'] },
            holati: 'faol'
        })
            .populate('kurs', 'nomi narx')
            .populate('guruh', 'nomi')
            .sort({ tolovKuni: 1 });

        res.json({
            success: true,
            count: debtors.length,
            data: debtors
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Student cabinet data
// @route   GET /api/students/me/dashboard
exports.getMyData = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .populate('kurs', 'nomi narx davomiyligi tavsif')
            .populate('guruh', 'nomi oqituvchi jadval');

        if (!student) {
            return res.status(404).json({ success: false, message: "Student topilmadi" });
        }

        const payments = await Payment.find({ oquvchi: student._id }).sort({ sana: -1 });
        const attendance = await Attendance.find({
            guruh: student.guruh?._id,
            'students.student': student._id
        }).sort({ sana: -1 }).limit(30);

        // Attendance processing to get student status only
        const processedAttendance = attendance.map(a => ({
            sana: a.sana,
            keldi: a.students.find(s => s.student.toString() === student._id.toString())?.keldi,
            izoh: a.students.find(s => s.student.toString() === student._id.toString())?.izoh
        }));

        res.json({
            success: true,
            data: {
                student,
                payments,
                attendance: processedAttendance
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server xatosi" });
    }
};

// @desc    Update student profile (Me)
// @route   PUT /api/students/me/update
exports.updateMe = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        // Only allow certain fields to be updated by the student themselves
        const allowedUpdates = ['ism', 'telefon', 'password'];
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                student[key] = req.body[key];
            }
        });

        await student.save();

        res.json({
            success: true,
            message: "Profilingiz yangilandi",
            data: {
                id: student._id,
                ism: student.ism,
                telefon: student.telefon,
                username: student.username
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
