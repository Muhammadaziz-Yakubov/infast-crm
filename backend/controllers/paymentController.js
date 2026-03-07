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
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        // Billing oyini aniqlash: Agar bugun to'lov kunidan oldin bo'lsa,
        // demak bu o'quvchi hali o'tgan oydagi sikl uchun to'layapti
        let billingMonth = currentMonth;
        let billingYear = currentYear;

        if (currentDay < student.tolovKuni) {
            billingMonth--;
            if (billingMonth < 1) {
                billingMonth = 12;
                billingYear--;
            }
        }

        const payment = await Payment.create({
            oquvchi,
            summa: summa || student.kurs?.narx || 0,
            oy: req.body.oy || billingMonth,
            yil: req.body.yil || billingYear,
            tolovTuri: tolovTuri || 'naqd',
            izoh: izoh || '',
            kurs: student.kurs?._id || student.kurs,
            guruh: student.guruh
        });

        // O'quvchi to'lov holatini yangilash
        student.tolovHolati = 'tolangan';
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
        const { studentIds, tolovTuri, izoh } = req.body;
        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ success: false, message: "O'quvchilar tanlanmagan" });
        }

        const now = new Date();
        let successCount = 0;
        let failCount = 0;

        for (const studentId of studentIds) {
            try {
                const student = await Student.findById(studentId).populate('kurs', 'narx');
                if (!student) { failCount++; continue; }

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
                    oquvchi: studentId,
                    summa,
                    oy: billingMonth,
                    yil: billingYear,
                    tolovTuri: tolovTuri || 'naqd',
                    izoh: izoh || 'Ommaviy to\'lov',
                    kurs: student.kurs?._id || student.kurs,
                    guruh: student.guruh
                });

                student.tolovHolati = 'tolangan';
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

        // Oylik statistika (oxirgi 6 oy)
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

        // Guruhlar soni
        const Group = require('../models/Group');
        const totalGroups = await Group.countDocuments({ holati: 'faol' });

        // Kurslar soni
        const Course = require('../models/Course');
        const totalCourses = await Course.countDocuments({ holati: 'faol' });

        res.json({
            success: true,
            data: {
                umumiyOquvchilar: totalStudents,
                qarzdorlar: totalDebtors,
                oyliqTushum: monthlyRevenue,
                kutilayotganTushum: expectedRevenue,
                guruhlar: totalGroups,
                kurslar: totalCourses,
                songgiTolovlar: recentPayments,
                oylikStatistika: monthlyStats
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
        const paymentOy = payment.oy;
        const paymentYil = payment.yil;

        // To'lovni o'chirish
        await Payment.findByIdAndDelete(req.params.id);

        // O'quvchining shu oy uchun boshqa to'lovi bormi tekshirish
        const otherPayment = await Payment.findOne({
            oquvchi: studentId,
            oy: paymentOy,
            yil: paymentYil
        });

        // Agar boshqa to'lov yo'q bo'lsa, o'quvchi holatini yangilash
        if (!otherPayment) {
            const student = await Student.findById(studentId);
            if (student) {
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                // Faqat joriy oy uchun to'lov o'chirilgan bo'lsa holatni o'zgartirish
                if (paymentOy === currentMonth && paymentYil === currentYear) {
                    const currentDay = now.getDate();
                    if (currentDay >= student.tolovKuni) {
                        student.tolovHolati = 'qarzdor';
                    } else {
                        student.tolovHolati = 'tolanmagan';
                    }
                    await student.save();
                }
            }
        }

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
