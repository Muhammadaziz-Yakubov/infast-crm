const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Course = require('../models/Course');
const { sendTestNotification } = require('../services/telegramBot');

// @desc    Yangi test yaratish
// @route   POST /api/tests
// @access  Private (Admin/Teacher)
exports.createTest = async (req, res) => {
    try {
        const { nomi, kurs, guruhlar, vaqtLimiti, boshlanishVaqti, tugashVaqti, savollar, urinishlarSoni } = req.body;

        if (!savollar || savollar.length === 0) {
            return res.status(400).json({ success: false, message: 'Testda kamida bitta savol bo\'lishi shart' });
        }

        const test = await Test.create({
            nomi,
            kurs,
            guruhlar,
            vaqtLimiti,
            boshlanishVaqti,
            tugashVaqti,
            savollar,
            urinishlarSoni: urinishlarSoni || 1,
            yaratuvchi: req.user._id
        });

        // Telegram guruhlariga e'lon yuborish (fon rejimida)
        try {
            await sendTestNotification(test._id, 'created');
        } catch (botErr) {
            console.error('Telegram bot notification error:', botErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Test muvaffaqiyatli yaratildi va Telegram guruhlariga e\'lon qilindi 🚀',
            data: test
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Barcha testlarni olish (Admin)
// @route   GET /api/tests
// @access  Private (Admin/Teacher)
exports.getAdminTests = async (req, res) => {
    try {
        const { kurs, guruh, search } = req.query;
        let query = {};

        if (kurs) query.kurs = kurs;
        if (guruh) query.guruhlar = guruh;
        if (search) {
            query.nomi = { $regex: search, $options: 'i' };
        }

        const tests = await Test.find(query)
            .populate('kurs', 'nomi')
            .populate('guruhlar', 'nomi')
            .sort({ createdAt: -1 });

        const now = new Date();
        const testsWithStatus = tests.map(test => {
            let status = 'rejalashtirilgan';
            if (now >= new Date(test.boshlanishVaqti) && now < new Date(test.tugashVaqti)) {
                status = 'faol';
            } else if (now >= new Date(test.tugashVaqti)) {
                status = 'tugagan';
            }
            return {
                ...test.toObject(),
                status
            };
        });

        res.json({
            success: true,
            count: testsWithStatus.length,
            data: testsWithStatus
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Bitta testni olish (Admin)
// @route   GET /api/tests/:id
// @access  Private (Admin/Teacher)
exports.getTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('kurs', 'nomi')
            .populate('guruhlar', 'nomi');

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test topilmadi' });
        }

        res.json({
            success: true,
            data: test
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Testni tahrirlash
// @route   PUT /api/tests/:id
// @access  Private (Admin/Teacher)
exports.updateTest = async (req, res) => {
    try {
        const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test topilmadi' });
        }

        res.json({
            success: true,
            message: 'Test muvaffaqiyatli yangilandi ✨',
            data: test
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Testni o'chirish
// @route   DELETE /api/tests/:id
// @access  Private (Admin/Teacher)
exports.deleteTest = async (req, res) => {
    try {
        const test = await Test.findByIdAndDelete(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test topilmadi' });
        }

        // Tegishli natijalarni ham o'chirish
        await TestResult.deleteMany({ test: req.params.id });

        res.json({
            success: true,
            message: 'Test va uning barcha natijalari muvaffaqiyatli o\'chirildi 🗑️'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Testni klonlash
// @route   POST /api/tests/:id/clone
// @access  Private (Admin/Teacher)
exports.cloneTest = async (req, res) => {
    try {
        const original = await Test.findById(req.params.id);
        if (!original) {
            return res.status(404).json({ success: false, message: 'Asl test topilmadi' });
        }

        const cloneData = {
            nomi: `${original.nomi} (Nusxa)`,
            kurs: original.kurs,
            guruhlar: original.guruhlar,
            vaqtLimiti: original.vaqtLimiti,
            boshlanishVaqti: original.boshlanishVaqti,
            tugashVaqti: original.tugashVaqti,
            savollar: original.savollar.map(q => ({
                questionText: q.questionText,
                options: q.options,
                correctOption: q.correctOption,
                score: q.score
            })),
            urinishlarSoni: original.urinishlarSoni,
            yaratuvchi: req.user._id,
            sentNotifications: {
                oneDayBefore: false,
                oneHourBefore: false,
                tenMinutesBefore: false,
                started: false,
                ended: false
            }
        };

        const cloned = await Test.create(cloneData);

        res.status(201).json({
            success: true,
            message: 'Test muvaffaqiyatli klonlandi 📋',
            data: cloned
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Test natijalari va statistikalari (Admin)
// @route   GET /api/tests/:id/results
// @access  Private (Admin/Teacher)
exports.getTestResults = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('guruhlar');
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test topilmadi' });
        }

        const results = await TestResult.find({ test: req.params.id })
            .populate('student', 'ism username telefon')
            .populate('guruh', 'nomi')
            .sort({ score: -1 });

        // Test bog'langan guruhlardagi barcha o'quvchilarni olish
        const totalStudentsInGroups = await Student.find({
            guruh: { $in: test.guruhlar.map(g => g._id) },
            holati: 'faol'
        }).populate('guruh', 'nomi');

        const submittedStudentIds = results.map(r => r.student?._id.toString());
        
        // Topshirmaganlar ro'yxatini shakllantirish
        const nonSubmitters = totalStudentsInGroups.filter(
            s => !submittedStudentIds.includes(s._id.toString())
        ).map(s => ({
            _id: s._id,
            ism: s.ism,
            username: s.username,
            telefon: s.telefon,
            guruh: s.guruh
        }));

        // Analitikalarni hisoblash
        const totalSubmissions = results.length;
        const totalNotSubmitted = nonSubmitters.length;

        let avgPercentage = 0;
        let maxScore = 0;
        let minScore = totalSubmissions > 0 ? results[0].score : 0;
        let sumScore = 0;

        if (totalSubmissions > 0) {
            results.forEach(r => {
                sumScore += r.score;
                if (r.score > maxScore) maxScore = r.score;
                if (r.score < minScore) minScore = r.score;
            });
            avgPercentage = Math.round((results.reduce((acc, r) => acc + r.percentage, 0) / totalSubmissions));
        }

        res.json({
            success: true,
            data: {
                testInfo: {
                    _id: test._id,
                    nomi: test.nomi,
                    vaqtLimiti: test.vaqtLimiti,
                    savollarSoni: test.savollar.length
                },
                results,
                nonSubmitters,
                analytics: {
                    topshirganlarSoni: totalSubmissions,
                    topshirmaganlarSoni: totalNotSubmitted,
                    ortachaFoiz: avgPercentage,
                    ortachaBall: totalSubmissions > 0 ? (sumScore / totalSubmissions).toFixed(1) : 0,
                    engYuqoriBall: maxScore,
                    engPastBall: minScore
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// ==========================================
// O'QUVCHI METODLARI
// ==========================================

// @desc    O'quvchi uchun guruhiga tegishli testlarni olish
// @route   GET /api/tests/my
// @access  Private (Student)
exports.getStudentTests = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'O\'quvchi topilmadi' });
        }

        // Talaba guruhiga ruxsat etilgan barcha testlarni olish
        const tests = await Test.find({ guruhlar: student.guruh })
            .populate('kurs', 'nomi')
            .sort({ boshlanishVaqti: -1 });

        const now = new Date();
        const results = await TestResult.find({ student: student._id });

        const faol = [];
        const rejalashtirilgan = [];
        const tugatilgan = [];

        tests.forEach(test => {
            const hasResult = results.some(r => r.test.toString() === test._id.toString());
            const testStart = new Date(test.boshlanishVaqti);
            const testEnd = new Date(test.tugashVaqti);

            // Natija ma'lumoti
            const myResult = results.find(r => r.test.toString() === test._id.toString());
            const testObj = {
                ...test.toObject(),
                savollarSoni: test.savollar.length,
                savollar: undefined, // Savollarni bu yerda yashirish
                myResult: myResult ? {
                    score: myResult.score,
                    totalScore: myResult.totalScore,
                    percentage: myResult.percentage,
                    completedAt: myResult.completedAt
                } : null
            };

            if (hasResult || now >= testEnd) {
                tugatilgan.push(testObj);
            } else if (now >= testStart && now < testEnd) {
                faol.push(testObj);
            } else if (now < testStart) {
                rejalashtirilgan.push(testObj);
            }
        });

        res.json({
            success: true,
            data: {
                faol,
                rejalashtirilgan,
                tugatilgan
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    O'quvchi test topshirishni boshlashi (Savollarni olish)
// @route   GET /api/tests/:id/take
// @access  Private (Student)
exports.getTestForTaking = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test topilmadi' });
        }

        const now = new Date();
        // Xavfsizlik: Test boshlanish vaqtidan oldin ochilmasin
        if (now < new Date(test.boshlanishVaqti)) {
            return res.status(403).json({ success: false, message: 'Test hali boshlanmagan!' });
        }

        // Xavfsizlik: Tugash vaqtidan keyin topshirib bo'lmasin
        if (now >= new Date(test.tugashVaqti)) {
            return res.status(403).json({ success: false, message: 'Test yakunlangan, topshirib bo\'lmaydi!' });
        }

        // Xavfsizlik: Urinishlar sonini tekshirish
        const existingResults = await TestResult.countDocuments({
            test: test._id,
            student: req.user._id
        });

        if (existingResults >= (test.urinishlarSoni || 1)) {
            return res.status(403).json({ success: false, message: 'Siz ushbu test uchun ruxsat etilgan urinishlar sonidan foydalanib bo\'lgansiz!' });
        }

        // Savollarni o'quvchiga jo'natish (To'g'ri javoblarsiz!)
        const safeQuestions = test.savollar.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            score: q.score
        }));

        res.json({
            success: true,
            data: {
                _id: test._id,
                nomi: test.nomi,
                vaqtLimiti: test.vaqtLimiti,
                tugashVaqti: test.tugashVaqti,
                savollar: safeQuestions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    O'quvchi test javoblarini yuborishi
// @route   POST /api/tests/:id/submit
// @access  Private (Student)
exports.submitTest = async (req, res) => {
    try {
        const { answers } = req.body; // answers: [{ questionId: '...', selectedOption: 0 }]
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test topilmadi' });
        }

        const now = new Date();
        // Xavfsizlik: Tugash vaqtidan keyin topshirishga ruxsat bermaslik
        if (now > new Date(test.tugashVaqti)) {
            return res.status(403).json({ success: false, message: 'Kechirasiz, test topshirish vaqti tugadi!' });
        }

        // Xavfsizlik: Urinishlar sonini tekshirish
        const existingResults = await TestResult.countDocuments({
            test: test._id,
            student: req.user._id
        });
        if (existingResults >= (test.urinishlarSoni || 1)) {
            return res.status(403).json({ success: false, message: 'Siz ushbu testni topshirib bo\'lgansiz!' });
        }

        let totalScore = 0;
        let earnedScore = 0;
        const checkedAnswers = [];

        test.savollar.forEach(q => {
            totalScore += q.score;
            const studentAns = answers?.find(a => a.questionId === q._id.toString());
            const selectedOption = studentAns !== undefined ? studentAns.selectedOption : -1;
            const isCorrect = selectedOption === q.correctOption;

            if (isCorrect) {
                earnedScore += q.score;
            }

            checkedAnswers.push({
                questionId: q._id,
                selectedOption,
                isCorrect
            });
        });

        const percentage = Math.round((earnedScore / totalScore) * 100) || 0;

        const student = await Student.findById(req.user._id);

        const result = await TestResult.create({
            test: test._id,
            student: student._id,
            guruh: student.guruh,
            answers: checkedAnswers,
            score: earnedScore,
            totalScore,
            percentage,
            completedAt: now
        });

        res.status(201).json({
            success: true,
            message: 'Test javoblari qabul qilindi va avtomatik tekshirildi! ✅',
            data: {
                score: earnedScore,
                totalScore,
                percentage,
                completedAt: result.completedAt
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    O'quvchi profiliga oid test statistikalarini olish
// @route   GET /api/tests/my/stats
// @access  Private (Student)
exports.getStudentStats = async (req, res) => {
    try {
        const studentId = req.user._id;

        const results = await TestResult.find({ student: studentId })
            .populate('test', 'nomi')
            .sort({ completedAt: -1 });

        const totalTests = results.length;
        let avgPercentage = 0;
        let maxPercentage = 0;

        if (totalTests > 0) {
            avgPercentage = Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / totalTests);
            maxPercentage = Math.max(...results.map(r => r.percentage));
        }

        const lastTestResult = totalTests > 0 ? results[0] : null;

        res.json({
            success: true,
            data: {
                totalTests,
                avgPercentage,
                maxPercentage,
                lastTestResult: lastTestResult ? {
                    nomi: lastTestResult.test?.nomi || 'Nomsiz Test',
                    score: lastTestResult.score,
                    totalScore: lastTestResult.totalScore,
                    percentage: lastTestResult.percentage,
                    completedAt: lastTestResult.completedAt
                } : null,
                history: results.map(r => ({
                    _id: r._id,
                    nomi: r.test?.nomi || 'Nomsiz Test',
                    score: r.score,
                    totalScore: r.totalScore,
                    percentage: r.percentage,
                    completedAt: r.completedAt
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// ==========================================
// DASHBOARD WIDGETS (ADMIN)
// ==========================================

// @desc    CRM bosh sahifasi (dashboard) uchun test widgetlari ma'lumotlari
// @route   GET /api/tests/dashboard/widgets
// @access  Private (Admin/Teacher)
exports.getDashboardWidgets = async (req, res) => {
    try {
        const now = new Date();

        // 1. Bugungi testlar (boshlanish vaqti bugun bo'lgan yoki hozir davom etayotgan testlar)
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const todayTestsCount = await Test.countDocuments({
            boshlanishVaqti: { $gte: startOfToday, $lte: endOfToday }
        });

        // 2. Shu haftadagi testlar
        // Haftaning boshlanishi (Dushanba) va oxiri (Yakshanba)
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const startOfWeek = new Date(now.setDate(now.getDate() + distanceToMonday));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000);

        const weekTestsCount = await Test.countDocuments({
            boshlanishVaqti: { $gte: startOfWeek, $lte: endOfWeek }
        });

        // 3. Jami topshirilgan testlar bo'yicha o'rtacha natija (foizda)
        const results = await TestResult.find({});
        let avgResultPercentage = 0;
        if (results.length > 0) {
            avgResultPercentage = Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length);
        }

        // 4. Hozirgi faol testlar bo'yicha topshirmagan o'quvchilar sonini hisoblash
        const nowTime = new Date();
        const activeTests = await Test.find({
            boshlanishVaqti: { $lte: nowTime },
            tugashVaqti: { $gte: nowTime }
        });

        let totalNotSubmittedCount = 0;

        for (const test of activeTests) {
            // Guruhlardagi jami active o'quvchilar
            const totalStudentsInGroups = await Student.countDocuments({
                guruh: { $in: test.guruhlar },
                holati: 'faol'
            });

            // Topsirgan o'quvchilar
            const submittedCount = await TestResult.countDocuments({
                test: test._id
            });

            totalNotSubmittedCount += Math.max(0, totalStudentsInGroups - submittedCount);
        }

        res.json({
            success: true,
            data: {
                bugungiTestlar: todayTestsCount,
                haftalikTestlar: weekTestsCount,
                ortachaNatija: avgResultPercentage,
                topshirmaganlarSoni: totalNotSubmittedCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};
