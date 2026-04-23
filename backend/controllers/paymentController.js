const Payment = require('../models/Payment');
const Student = require('../models/Student');
const XLSX = require('xlsx');

// @desc    Barcha to'lovlar
// @route   GET /api/payments
exports.getPayments = async (req, res) => {
    try {
        const { oy, yil, search, page = 1, limit = 50 } = req.query;

        let query = {};
        if (oy) query.oy = parseInt(oy);
        if (yil) query.yil = parseInt(yil);

        // Search by student name
        if (search) {
            const students = await Student.find({
                ism: { $regex: search, $options: 'i' }
            }).select('_id');
            query.oquvchi = { $in: students.map(s => s._id) };
        }

        const total = await Payment.countDocuments(query);
        const payments = await Payment.find(query)
            .populate({
                path: 'oquvchi',
                select: 'ism telefon',
                populate: [
                    { path: 'kurs', select: 'nomi' },
                    { path: 'guruh', select: 'nomi' }
                ]
            })
            .sort({ sana: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: payments.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    To'lov qilish (to'langan deb belgilash)
// @route   POST /api/payments
exports.createPayment = async (req, res) => {
    try {
        const { oquvchi, summa, tolovTuri, izoh } = req.body;

        const student = await Student.findById(oquvchi).populate('kurs', 'narx');
        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

const now = new Date();
        const currentDay = now.getDate();
        const tolovKuni = student.tolovKuni || 15;

        let billingMonth = req.body.oy;
        let billingYear = req.body.yil;

        // Agar oy/yil berilmagan bo'lsa - avtomatik hisoblash
        if (!billingMonth || !billingYear) {
            billingMonth = now.getMonth() + 1;
            billingYear = now.getFullYear();

            // AGAR to'lov kuni o'tib ketgan bo'lsa => KEYINGI oyga to'lov
            if (currentDay >= tolovKuni) {
                billingMonth++;
                if (billingMonth > 12) {
                    billingMonth = 1;
                    billingYear++;
                }
            }
        }

        const payment = await Payment.create({
            oquvchi,
            summa: summa || student.oylikTolov || student.kurs?.narx || 0,
            oy: billingMonth,
            yil: billingYear,
            sana: req.body.sana || now,
            tolovTuri: tolovTuri || 'naqd',
            izoh: izoh || '',
            kurs: student.kurs?._id || student.kurs,
            guruh: student.guruh
        });

        // O'quvchi to'lov holatini yangilash va blokdan chiqarish
        student.tolovHolati = 'tolangan';
        student.isBlocked = false;
        await student.save();

        const populated = await Payment.findById(payment._id)
            .populate({
                path: 'oquvchi',
                select: 'ism telefon',
                populate: [
                    { path: 'kurs', select: 'nomi' },
                    { path: 'guruh', select: 'nomi' }
                ]
            });

        res.status(201).json({
            success: true,
            message: "To'lov muvaffaqiyatli amalga oshirildi",
            data: populated
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Bir necha o'quvchiga birdan to'lov qilish
// @route   POST /api/payments/bulk
exports.bulkCreatePayment = async (req, res) => {
    try {
        const { studentIds, summa, tolovTuri, izoh } = req.body;
        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ success: false, message: "O'quvchilar tanlanmagan" });
        }

        const now = new Date();
        const currentDay = now.getDate();
        let successCount = 0;
        let failCount = 0;

        for (const studentId of studentIds) {
            try {
                const student = await Student.findById(studentId).populate('kurs', 'narx tolovKuni');
                if (!student) { failCount++; continue; }

                const tolovKuni = student.tolovKuni || 15;
                const studentSumma = summa || student.oylikTolov || student.kurs?.narx || 0;

                // Billing oy ni hisoblash
                let billingMonth = now.getMonth() + 1;
                let billingYear = now.getFullYear();
                if (currentDay >= tolovKuni) {
                    billingMonth++;
                    if (billingMonth > 12) {
                        billingMonth = 1;
                        billingYear++;
                    }
                }

                await Payment.create({
                    oquvchi: studentId,
                    summa: studentSumma,
                    oy: billingMonth,
                    yil: billingYear,
                    sana: req.body.sana || now,
                    tolovTuri: tolovTuri || 'naqd',
                    izoh: izoh || 'Ommaviy to\'lov',
                    kurs: student.kurs?._id || student.kurs,
                    guruh: student.guruh
                });

                student.tolovHolati = 'tolangan';
                student.isBlocked = false;
                await student.save();
                successCount++;
            } catch (err) {
                failCount++;
            }
        }

        res.status(201).json({
            success: true,
            message: `${successCount} ta to'lov muvaffaqiyatli amalga oshirildi${failCount > 0 ? `, ${failCount} ta xatolik` : ''}`,
            successCount,
            failCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Dashboard statistika
// @route   GET /api/payments/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Umumiy o'quvchilar
        const totalStudents = await Student.countDocuments({ holati: 'faol' });

        // Qarzdorlar
        const totalDebtors = await Student.countDocuments({
            tolovHolati: { $in: ['tolanmagan', 'qarzdor'] },
            holati: 'faol'
        });

        // Oyliq tushum
        const monthlyPayments = await Payment.aggregate([
            {
                $match: {
                    oy: currentMonth,
                    yil: currentYear
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$summa' }
                }
            }
        ]);
        const monthlyRevenue = monthlyPayments[0]?.total || 0;

        // Kutilayotgan tushum (faol o'quvchilar * kurs narxi - to'langan)
        const activeStudents = await Student.find({ holati: 'faol' }).populate('kurs', 'narx');
        const expectedRevenue = activeStudents.reduce((sum, s) => sum + (s.oylikTolov || s.kurs?.narx || 0), 0);

        // So'nggi to'lovlar
        const recentPayments = await Payment.find()
            .populate({
                path: 'oquvchi',
                select: 'ism',
                populate: { path: 'kurs', select: 'nomi' }
            })
            .sort({ sana: -1 })
            .limit(10);

        // Oyliq statistika (oxirgi 6 oy)
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
            let m = currentMonth - i;
            let y = currentYear;
            if (m <= 0) { m += 12; y -= 1; }

            const monthPayments = await Payment.aggregate([
                { $match: { oy: m, yil: y } },
                { $group: { _id: null, total: { $sum: '$summa' }, count: { $sum: 1 } } }
            ]);

            const oyNomlar = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
                'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

            monthlyStats.push({
                oy: m,
                yil: y,
                oyNomi: oyNomlar[m],
                tushum: monthPayments[0]?.total || 0,
                tolovlarSoni: monthPayments[0]?.count || 0
            });
        }

        // Bugungi tushum (Uzbekistan vaqti bilan)
        const offset = 5 * 60 * 60 * 1000; // Tashkent is UTC+5
        const tashkentTime = new Date(now.getTime() + offset);

        const y = tashkentTime.getUTCFullYear();
        const m = tashkentTime.getUTCMonth();
        const d = tashkentTime.getUTCDate();

        const startOfToday = new Date(Date.UTC(y, m, d, 0, 0, 0) - offset);
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

        const todayPayments = await Payment.aggregate([
            {
                $match: {
                    sana: { $gte: startOfToday, $lt: endOfToday }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$summa' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const todayRevenue = todayPayments[0]?.total || 0;
        const todayCount = todayPayments[0]?.count || 0;

        // Lead statistika
        const Lead = require('../models/Lead');
        const leadStats = await Lead.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const leadSourceStats = await Lead.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            }
        ]);

        const newLeadsToday = await Lead.countDocuments({
            createdAt: { $gte: startOfToday, $lt: endOfToday }
        });

        // Guruhlar va Kurslar soni
        const Group = require('../models/Group');
        const Course = require('../models/Course');
        const totalGroups = await Group.countDocuments({ holati: 'faol' });
        const totalCourses = await Course.countDocuments({ holati: 'faol' });

        // Kurslar bo'yicha o'quvchilar soni
        const courseStudentStats = await Student.aggregate([
            { $match: { holati: 'faol' } },
            {
                $group: {
                    _id: '$kurs',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'kursData'
                }
            },
            { $unwind: '$kursData' },
            {
                $project: {
                    nomi: '$kursData.nomi',
                    count: 1
                }
            }
        ]);

        // Top o'quvchilar (coinlar bo'yicha)
        const topStudents = await Student.find({ holati: 'faol' })
            .select('ism coins profileImage')
            .sort({ coins: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                umumiyOquvchilar: totalStudents,
                qarzdorlar: totalDebtors,
                oyliqTushum: monthlyRevenue,
                bugunTushum: todayRevenue,
                bugunTolovlarSoni: todayCount,
                kutilayotganTushum: expectedRevenue,
                guruhlar: totalGroups,
                kurslar: totalCourses,
                songgiTolovlar: recentPayments,
                oylikStatistika: monthlyStats,
                leadStats: leadStats,
                leadSourceStats: leadSourceStats,
                yangiLeadlar: newLeadsToday,
                kursStatistika: courseStudentStats,
                topTalabalar: topStudents
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    To'lovni o'chirish (xato to'lov uchun)
// @route   DELETE /api/payments/:id
exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "To'lov topilmadi" });
        }

        const studentId = payment.oquvchi;
        const deletedOy = payment.oy;
        const deletedYil = payment.yil;

        // To'lovni o'chirish
        await Payment.findByIdAndDelete(req.params.id);

        // O'quvchini topish
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        const now = new Date();
        const currentDay = now.getDate();
        const tolovKuni = student.tolovKuni || 15;

        // Billing oy ni hisoblash (yangi mantiq): to'lov kuni o'tgan bo'lsa = keyingi oy
        let billingMonth = now.getMonth() + 1;
        let billingYear = now.getFullYear();
        if (currentDay >= tolovKuni) {
            billingMonth++;
            if (billingMonth > 12) {
                billingMonth = 1;
                billingYear++;
            }
        }

        // Agar o'chirilgan to'lov billing oy ga to'g'ri kelsa, holatni yangilash kerak
        if (deletedOy === billingMonth && deletedYil === billingYear) {
            // O'chirilgan to'lov joriy billing oy uchun edi
            // Boshqa to'lov bormi tekshirish
            const stillHasPayment = await Payment.findOne({
                oquvchi: studentId,
                oy: billingMonth,
                yil: billingYear
            });

            if (!stillHasPayment) {
                // Boshqa to'lov yo'q, qarzdor qilish kerak
                student.tolovHolati = 'qarzdor';
                await student.save();
            }
            // Agar stillHasPayment mavjud bo'lsa, to'lov holati o'zgarishsiz qoladi ('tolangan')
        }
        // Agar o'chirilgan to'lov billing oy ga tegishli bo'lmasa, holatni o'zgartirmaslik

        res.json({
            success: true,
            message: "To'lov muvaffaqiyatli o'chirildi"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Qarzdorlarni Excel ga eksport qilish
// @route   GET /api/payments/export/debtors
exports.exportDebtors = async (req, res) => {
    try {
        const debtors = await Student.find({
            tolovHolati: { $in: ['tolanmagan', 'qarzdor'] },
            holati: 'faol'
        })
            .populate('kurs', 'nomi narx')
            .populate('guruh', 'nomi')
            .sort({ ism: 1 });

        const data = debtors.map((d, i) => ({
            '№': i + 1,
            'F.I.O': d.ism,
            'Telefon': d.telefon,
            'Kurs': d.kurs?.nomi || '',
            'Guruh': d.guruh?.nomi || '',
            "To'lov kuni": d.tolovKuni,
            "Oylik to'lov": d.oylikTolov || d.kurs?.narx || 0,
            'Holati': d.tolovHolati === 'qarzdor' ? 'Qarzdor' : "To'lanmagan",
            'Eslatmalar': d.eslatmalar || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Qarzdorlar');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=qarzdorlar.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Barcha to'lovlarni o'chirish (filter bo'yicha)
// @route   DELETE /payments/all?oy=&yil=
exports.deleteAllPayments = async (req, res) => {
    try {
        const { oy, yil } = req.query;

        let query = {};
        if (oy) query.oy = parseInt(oy);
        if (yil) query.yil = parseInt(yil);

        if (!oy && !yil) {
            return res.status(400).json({
                success: false,
                message: "Oy va/yil ko'rsatilishi shart. Barcha to'lovlarni o'chirish mumkin emas."
            });
        }

        const result = await Payment.deleteMany(query);

        res.json({
            success: true,
            message: `${result.deletedCount} ta to'lov o'chirildi`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};
