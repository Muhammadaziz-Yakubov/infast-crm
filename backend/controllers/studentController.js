const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const { uploadToR2 } = require('../services/uploadService');
const mongoose = require('mongoose');

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
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const currentDay = now.getDate();

            let billingMonth = currentMonth;
            let billingYear = currentYear;

            if (currentDay < student.tolovKuni) {
                billingMonth--;
                if (billingMonth < 1) {
                    billingMonth = 12;
                    billingYear--;
                }
            }

            await Payment.create({
                oquvchi: student._id,
                summa: student.oylikTolov,
                oy: billingMonth,
                yil: billingYear,
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

        // Add level and progress data
        const xp = student.xp || 0;
        const level = Math.floor(xp / 1000) + 1;
        const progress = Math.round(((xp % 1000) / 1000) * 100);
        const nextXP = (Math.floor(xp / 1000) + 1) * 1000;

        const studentData = {
            ...student.toObject(),
            level,
            progress,
            nextXP
        };

        const payments = await Payment.find({ oquvchi: student._id }).sort({ sana: -1 });
        const attendance = await Attendance.find({
            guruh: student.guruh?._id,
            'oquvchilar.oquvchi': student._id
        }).sort({ sana: -1 }).limit(30);

        // Attendance processing to get student status only
        const processedAttendance = attendance.map(a => ({
            sana: a.sana,
            keldi: a.oquvchilar.find(o => o.oquvchi.toString() === student._id.toString())?.keldi,
            izoh: a.oquvchilar.find(o => o.oquvchi.toString() === student._id.toString())?.izoh
        }));

        res.json({
            success: true,
            data: {
                student: studentData,
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
                username: student.username,
                profileImage: student.profileImage
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update student profile image
// @route   PUT /api/students/me/profile-image
exports.updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm tanlanmagan" });
        }

        const imageUrl = await uploadToR2(req.file, 'profiles');

        await Student.findByIdAndUpdate(req.user.id, { profileImage: imageUrl });

        res.json({
            success: true,
            message: "Profil rasmi muvaffaqiyatli yangilandi",
            data: { profileImage: imageUrl }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get classmates
// @route   GET /api/students/classmates
exports.getClassmates = async (req, res) => {
    try {
        if (!req.user.guruh) {
            return res.status(400).json({ success: false, message: "Siz hali guruhga qo'shilmagansiz" });
        }

        const classmates = await Student.find({
            guruh: req.user.guruh,
            holati: 'faol'
        })
            .select('ism xp coins profileImage level progress username')
            .sort({ ism: 1 });

        // Calculate levels manually or use aggregation. For simple list, map is fine.
        const processedClassmates = classmates.map(c => {
            const xp = c.xp || 0;
            return {
                ...c.toObject(),
                level: Math.floor(xp / 1000) + 1,
                progress: Math.round(((xp % 1000) / 1000) * 100)
            };
        });

        res.json({
            success: true,
            data: processedClassmates
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get public profile of another student
// @route   GET /api/students/public-profile/:id
exports.getPublicProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .select('ism xp coins profileImage username guruh')
            .populate('guruh', 'nomi');

        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        // Add level and stats
        const xp = student.xp || 0;
        const level = Math.floor(xp / 1000) + 1;
        const progress = Math.round(((xp % 1000) / 1000) * 100);

        res.json({
            success: true,
            data: {
                ...student.toObject(),
                level,
                progress,
                yutuqlar: "Tez Kunda",
                sertifikatlar: "Tez Kunda"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reyting olish (umumiy va guruh bo'yicha) - Optimized with Aggregation
// @route   GET /api/students/rating
exports.getRating = async (req, res) => {
    try {
        const { guruhId } = req.query;
        const mongoose = require('mongoose');

        let matchQuery = { holati: 'faol' };
        if (guruhId) {
            matchQuery.guruh = new mongoose.Types.ObjectId(guruhId);
        }

        const ratings = await Student.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'groups',
                    localField: 'guruh',
                    foreignField: '_id',
                    as: 'guruhInfo'
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'kurs',
                    foreignField: '_id',
                    as: 'kursInfo'
                }
            },
            {
                $lookup: {
                    from: 'submissions',
                    let: { studentId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$student', '$$studentId'] }, { $eq: ['$status', 'graded'] }] } } },
                        { $count: 'count' }
                    ],
                    as: 'taskStats'
                }
            },
            { $unwind: { path: '$guruhInfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$kursInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    currentXP: { $ifNull: ['$xp', 0] },
                    taskCount: { $ifNull: [{ $arrayElemAt: ['$taskStats.count', 0] }, 0] },
                    // Level calculation: 1000 XP per level
                    level: { $add: [{ $floor: { $divide: [{ $ifNull: ['$xp', 0] }, 1000] } }, 1] },
                    // Progress to next level (0-100)
                    progress: { $multiply: [{ $divide: [{ $mod: [{ $ifNull: ['$xp', 0] }, 1000] }, 10] }, 1] },
                    // Next Level XP
                    nextXP: { $multiply: [{ $add: [{ $floor: { $divide: [{ $ifNull: ['$xp', 0] }, 1000] } }, 1] }, 1000] }
                }
            },
            { $sort: { currentXP: -1, ism: 1 } },
            {
                $project: {
                    _id: 1,
                    ism: 1,
                    xp: '$currentXP',
                    profileImage: { $ifNull: ['$profileImage', ''] },
                    guruh: { nomi: '$guruhInfo.nomi' },
                    kurs: { nomi: '$kursInfo.nomi' },
                    taskCount: 1,
                    level: 1,
                    progress: { $round: ['$progress', 0] },
                    nextXP: 1
                }
            }
        ]);

        // Add rank (o'rin)
        ratings.forEach((r, i) => {
            r.rank = i + 1;
        });

        res.json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Sync all students XP based on history
// @route   POST /api/students/sync-xp
exports.syncAllStudentsXP = async (req, res) => {
    try {
        const CoinLog = require('../models/CoinLog');
        const Submission = require('../models/Submission');

        // 1. Coin logs'lardan jami XP ni hisoblash (Faqat PLUS)
        const coinXPResults = await CoinLog.aggregate([
            { $match: { type: 'plus' } },
            { $group: { _id: '$student', totalCoinXP: { $sum: { $multiply: ['$amount', 5] } } } }
        ]);

        // 2. Graded Submissions'dan jami XP ni hisoblash (Score * 10)
        const submissionXPResults = await Submission.aggregate([
            { $match: { status: 'graded' } },
            { $group: { _id: '$student', totalScoreXP: { $sum: { $multiply: ['$score', 10] } } } }
        ]);

        // O'quvchilar ro'yxatini olish
        const students = await Student.find({ role: 'student' });

        for (const student of students) {
            const coinXP = coinXPResults.find(r => r._id.toString() === student._id.toString())?.totalCoinXP || 0;
            const submissionXP = submissionXPResults.find(r => r._id.toString() === student._id.toString())?.totalScoreXP || 0;

            let totalXP = coinXP + submissionXP;
            if (totalXP > 100000) totalXP = 100000;

            if (student.xp !== totalXP) {
                await Student.findByIdAndUpdate(student._id, { xp: totalXP });
            }
        }

        res.json({
            success: true,
            message: "Barcha o'quvchilarning XP ballari tarixiy ma'lumotlar asosida qayta hisoblandi va yangilandi! 📀🚀"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset all students rating to 0
// @route   POST /api/students/reset-rating
// @access  Admin/Teacher
exports.resetRating = async (req, res) => {
    try {
        await Student.updateMany({ role: 'student' }, { xp: 0 });

        res.json({
            success: true,
            message: "Barcha o'quvchilarning reytingi (XP) 0 ga tushirildi! 🔄"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};