const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');
const QuizResult = require('../models/QuizResult');
const { uploadToR2 } = require('../services/uploadService');
const mongoose = require('mongoose');
const smsService = require('../services/smsService');


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
        } else if (holat === 'blocklangan') {
            query.isBlocked = true;
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { shuOyTolagan, ...studentData } = req.body;

        // Kursni tekshirish
        if (!studentData.kurs) {
            throw new Error("Kurs tanlanishi shart");
        }

        const course = await Course.findById(studentData.kurs);
        if (!course) {
            throw new Error("Tanlangan kurs topilmadi");
        }

        // Guruhni tekshirish
        if (!studentData.guruh) {
            throw new Error("Guruh tanlanishi shart");
        }

        // Oylik to'lovni sozlash
        if (!studentData.oylikTolov || studentData.oylikTolov === '') {
            studentData.oylikTolov = course.narx;
            studentData.maxsusNarx = false;
        } else {
            studentData.oylikTolov = Number(studentData.oylikTolov);
            if (studentData.oylikTolov !== course.narx) {
                studentData.maxsusNarx = true;
            } else {
                studentData.maxsusNarx = false;
            }
        }

        // To'lov holatini belgilash
        if (shuOyTolagan === false || shuOyTolagan === 'yoq') {
            studentData.tolovHolati = 'qarzdor';
        } else if (shuOyTolagan === true || shuOyTolagan === 'ha') {
            studentData.tolovHolati = 'tolangan';
        } else {
            studentData.tolovHolati = 'tolanmagan';
        }

        // Username uniqueligini tekshirish
        if (studentData.username) {
            const exists = await Student.findOne({ username: studentData.username });
            if (exists) {
                return res.status(400).json({ success: false, message: "Ushbu foydalanuvchi nomi (login) band, boshqasini tanlang" });
            }
        } else {
            if (!studentData.telefon) {
                throw new Error("Telefon raqam kiritilishi shart");
            }
            const generatedUsername = studentData.telefon.replace(/\D/g, '').slice(-9);
            const exists = await Student.findOne({ username: generatedUsername });
            if (exists) {
                studentData.username = generatedUsername + Math.floor(Math.random() * 100);
            } else {
                studentData.username = generatedUsername;
            }
        }

        if (!studentData.password) {
            studentData.password = 'std123';
        } else if (studentData.password.length < 6) {
            throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
        }

        const [student] = await Student.create([studentData], { session });

        // Agar to'lov qilgan bo'lsa - payment yaratish
        // TO'G'RI LOGIKA: Hozir to'lov kuni o'tmagan bo'lsa = joriy oy, o'tgan bo'lsa = keyingi oy
        if (shuOyTolagan === true || shuOyTolagan === 'ha') {
            const now = new Date();
            const currentDay = now.getDate();
            const tolovKuni = student.tolovKuni || 15;

            let billingMonth = now.getMonth() + 1;
            let billingYear = now.getFullYear();

            // Agar to'lov kuni hali kelmagan bo'lsa - joriy oy uchun to'lov
            // Agar to'lov kuni o'tib ketgan bo'lsa - keyingi oy uchun to'lov
            if (currentDay >= tolovKuni) {
                // To'lov kuni o'tgan, keyingi oyga to'lov
                billingMonth++;
                if (billingMonth > 12) {
                    billingMonth = 1;
                    billingYear++;
                }
            }
            // Agar currentDay < tolovKuni => billingMonth = joriy oy (o'zgartirishsiz)

            await Payment.create([{
                oquvchi: student._id,
                summa: student.oylikTolov,
                oy: billingMonth,
                yil: billingYear,
                tolovTuri: 'naqd',
                izoh: "Ro'yxatga olishda to'langan",
                kurs: student.kurs,
                guruh: student.guruh
            }], { session });
        }

        await session.commitTransaction();
        session.endSession();

        const populated = await Student.findById(student._id)
            .populate('kurs', 'nomi narx')
            .populate('guruh', 'nomi');

        res.status(201).json({
            success: true,
            message: "O'quvchi muvaffaqiyatli qo'shildi",
            data: populated
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Create Student Error:', error);
        res.status(400).json({ 
            success: false, 
            message: error.name === 'ValidationError' 
                ? Object.values(error.errors).map(val => val.message).join(', ') 
                : error.message 
        });
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

        // Kurs va narxni tekshirish (agar oylikTolov o'zgargan bo'lsa)
        if (req.body.oylikTolov && student.kurs) {
            const course = await Course.findById(student.kurs);
            if (course && Number(req.body.oylikTolov) !== course.narx) {
                student.maxsusNarx = true;
            } else if (course && Number(req.body.oylikTolov) === course.narx) {
                student.maxsusNarx = false;
            }
        }

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

        const studentData = {
            ...student.toObject()
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
            .select('ism coins profileImage username')
            .sort({ ism: 1 });

        // Calculate levels manually or use aggregation. For simple list, map is fine.
        const processedClassmates = classmates.map(c => {
            return {
                ...c.toObject()
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
            .select('ism coins profileImage username guruh')
            .populate('guruh', 'nomi');

        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        res.json({
            success: true,
            data: {
                ...student.toObject(),
                yutuqlar: "Tez Kunda",
                sertifikatlar: "Tez Kunda"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student leaderboard
// @route   GET /api/students/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Student.aggregate([
            { $match: { holati: 'faol' } },

            // Attendance points (5 points for each 'keldi: true')
            {
                $lookup: {
                    from: 'attendances',
                    localField: '_id',
                    foreignField: 'oquvchilar.oquvchi',
                    pipeline: [
                        { $unwind: '$oquvchilar' },
                        { $match: { 'oquvchilar.keldi': true } }
                    ],
                    as: 'att_records'
                }
            },

            // Submission points (sum of graded scores)
            {
                $lookup: {
                    from: 'submissions',
                    localField: '_id',
                    foreignField: 'student',
                    pipeline: [
                        { $match: { status: 'graded' } }
                    ],
                    as: 'sub_records'
                }
            },

            // Quiz points (sum of quiz scores)
            {
                $lookup: {
                    from: 'quizresults',
                    localField: '_id',
                    foreignField: 'student',
                    as: 'quiz_records'
                }
            },

            // Calculate totals
            {
                $addFields: {
                    attendanceCount: { $size: '$att_records' },
                    assignmentScore: { $sum: '$sub_records.score' },
                    quizScore: { $sum: '$quiz_records.score' }
                }
            },

            // Final total points calculation
            {
                $addFields: {
                    totalScore: {
                        $add: [
                            { $multiply: ['$attendanceCount', 5] },
                            '$assignmentScore',
                            '$quizScore'
                        ]
                    }
                }
            },

            // Cleanup fields we don't need in response
            {
                $project: {
                    att_records: 0,
                    sub_records: 0,
                    quiz_records: 0,
                    password: 0
                }
            },

            // Sort by totalScore
            { $sort: { totalScore: -1 } },
            { $limit: 100 },

            // Populate guruh separately if needed, or join it here
            {
                $lookup: {
                    from: 'groups',
                    localField: 'guruh',
                    foreignField: '_id',
                    as: 'guruhInfo'
                }
            },
            { $unwind: { path: '$guruhInfo', preserveNullAndEmptyArrays: true } }
        ]);

        // Map back to a clean object if necessary to match populate structure
        const cleanedLeaderboard = leaderboard.map(s => ({
            ...s,
            guruh: s.guruhInfo ? { _id: s.guruhInfo._id, nomi: s.guruhInfo.nomi } : null,
            coins: s.totalScore // Override coins with totalScore for frontend compatibility or add new field
        }));

        res.json({
            success: true,
            data: cleanedLeaderboard
        });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Barcha o'quvchilar to'lov holatini 'tolanmagan' ga o'tkazish
// @route   PUT /api/students/reset-payments-status
exports.resetPaymentsStatus = async (req, res) => {
    try {
        await Student.updateMany(
            { holati: 'faol' },
            { $set: { tolovHolati: 'tolanmagan' } }
        );


        res.json({
            success: true,
            message: "Barcha faol o'quvchilar to'lov holati 'To'lanmagan' ga o'zgartirildi"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Qarzdorga SMS yuborish
// @route   POST /api/students/:id/send-debt-sms
exports.sendDebtSMS = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('kurs');
        
        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        if (!student.telefon) {
            return res.status(400).json({ success: false, message: "O'quvchining telefon raqami yo'q" });
        }

        // To'lov summasini aniqlash (oylikTolov bo'lmasa kurs narxi)
        const qarzSummasi = student.oylikTolov || (student.kurs && student.kurs.narx) || 0;

        const message = `Hurmatli ${student.ism}! Sizning qarzingiz ${qarzSummasi} so'm. To'lov qiling bo'lmasa darsga kiritilmaysiz. InFast IT-Academy`;
        
        await smsService.sendSMS(student.telefon, message);


        res.json({
            success: true,
            message: "SMS muvaffaqiyatli yuborildi"
        });
    } catch (error) {
        console.error('Send SMS Controller Error:', error);
        res.status(500).json({ success: false, message: error.message || 'SMS yuborishda server xatosi' });
    }
};

// @desc    O'quvchini blocklash/blokdan chiqarish
// @route   PUT /api/students/:id/toggle-block
exports.toggleBlock = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        student.isBlocked = !student.isBlocked;
        await student.save();

        res.json({
            success: true,
            message: `O'quvchi muvaffaqiyatli ${student.isBlocked ? 'bloklandi' : 'blokdan chiqarildi'}`,
            data: student
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};
