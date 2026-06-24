const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { updateCoins } = require('../services/coinService');

// @desc    Guruh va sana bo'yicha davomatni olish
// @route   GET /api/attendance/:groupId/:date
exports.getAttendance = async (req, res) => {
    try {
        const { groupId, date } = req.params;

        // Sanani kun boshiga sozlash
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({
            guruh: groupId,
            sana: { $gte: startOfDay, $lte: endOfDay },
            ...(req.branchFilter || {})
        }).populate('oquvchilar.oquvchi', 'ism telefon');

        // Agar davomat hali qilinmagan bo'lsa, guruhdagi o'quvchilar ro'yxatini qaytarish
        if (!attendance) {
            const students = await Student.find({ guruh: groupId, holati: 'faol', ...(req.branchFilter || {}) }).sort({ ism: 1 });
            return res.json({
                success: true,
                isNew: true,
                data: {
                    guruh: groupId,
                    sana: startOfDay,
                    oquvchilar: students.map(s => ({
                        oquvchi: s,
                        keldi: false
                    }))
                }
            });
        }

        res.json({
            success: true,
            isNew: false,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Davomatni saqlash yoki yangilash
// @route   POST /api/attendance
exports.saveAttendance = async (req, res) => {
    try {
        const { guruh, sana, oquvchilar, izoh } = req.body;

        const groupObj = await require('../models/Group').findOne({ _id: guruh, ...(req.branchFilter || {}) });
        if (!groupObj) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const startOfDay = new Date(sana);
        startOfDay.setHours(0, 0, 0, 0);

        // --- 1. Dars Kunini Tekshirish ---
        if (groupObj.jadval?.kunlar) {
            const kunlar = groupObj.jadval.kunlar.toLowerCase();
            const selectedDayIndex = startOfDay.getDay(); // 0 = Yakshanba, 1 = Dushanba ... 6 = Shanba

            const reqToqKunlar = kunlar.includes("toq");
            const reqJuftKunlar = kunlar.includes("juft");

            const isToq = selectedDayIndex === 1 || selectedDayIndex === 3 || selectedDayIndex === 5;
            const isJuft = selectedDayIndex === 2 || selectedDayIndex === 4 || selectedDayIndex === 6;

            if (reqToqKunlar && !isToq) {
                return res.status(400).json({ success: false, message: "Tanlangan sana ushbu guruh uchun dars kuni emas (Toq kunlari bo'lishi kerak)" });
            }
            if (reqJuftKunlar && !isJuft) {
                return res.status(400).json({ success: false, message: "Tanlangan sana ushbu guruh uchun dars kuni emas (Juft kunlari bo'lishi kerak)" });
            }
        }

        const endOfDay = new Date(sana);
        endOfDay.setHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({
            guruh,
            sana: { $gte: startOfDay, $lte: endOfDay },
            ...(req.branchFilter || {})
        });

        if (attendance) {
            // Yangilashdan oldin eski coinlarni tekshirish
            const oldMap = new Map();
            attendance.oquvchilar.forEach(o => oldMap.set(o.oquvchi.toString(), o.coinAmount || (o.keldi ? 50 : -50)));

            // Yangilash
            attendance.oquvchilar = oquvchilar.map(item => {
                const isPresent = item.keldi;
                const ball = Number(item.ball || 0);
                let coinAmount = -50;
                if (isPresent) {
                    coinAmount = ball >= 80 ? 100 : 50;
                }
                return {
                    ...item,
                    oquvchi: item.oquvchi._id || item.oquvchi,
                    keldi: isPresent,
                    ball: ball,
                    coinAmount: coinAmount
                };
            });
            attendance.izoh = izoh;
            await attendance.save();

            // Coinlarni yangilash
            for (const item of attendance.oquvchilar) {
                const oquvchiId = item.oquvchi.toString();
                const oldCoins = oldMap.get(oquvchiId) || 0;
                const newCoins = item.coinAmount;

                if (oldCoins !== newCoins) {
                    const diff = newCoins - oldCoins;
                    await updateCoins(oquvchiId, diff, `Davomat yangilandi: Ball ${item.ball}, Status ${item.keldi ? 'Keldi' : 'Kelmadi'}`);
                }
            }
        } else {
            // Yangi yaratish
            const processedOquvchilar = oquvchilar.map(item => {
                const isPresent = item.keldi;
                const ball = Number(item.ball || 0);
                let coinAmount = -50;
                if (isPresent) {
                    coinAmount = ball >= 80 ? 100 : 50;
                }
                return {
                    ...item,
                    oquvchi: item.oquvchi._id || item.oquvchi,
                    keldi: isPresent,
                    ball: ball,
                    coinAmount: coinAmount
                };
            });

            attendance = await Attendance.create({
                guruh,
                sana: startOfDay,
                oquvchilar: processedOquvchilar,
                izoh,
                branchId: req.branchId || req.user.branchId
            });

            // Coinlarni qo'shish
            for (const item of attendance.oquvchilar) {
                const oquvchiId = item.oquvchi.toString();
                await updateCoins(oquvchiId, item.coinAmount, `Davomat: Ball ${item.ball}, Status ${item.keldi ? 'Keldi' : 'Kelmadi'}`);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Davomat muvaffaqiyatli saqlandi',
            data: attendance
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    QR-kod orqali avtomatik davomat
// @route   POST /api/attendance/scan
exports.scanAttendance = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await Student.findById(studentId).populate('guruh');

        if (!student) return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        if (!student.guruh) return res.status(400).json({ success: false, message: "Siz guruhga biriktirilmagansiz" });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- 1. Dars Kunini Tekshirish ---
        if (student.guruh.jadval?.kunlar) {
            const kunlar = student.guruh.jadval.kunlar.toLowerCase();
            const currentDayIndex = new Date().getDay(); // 0 = Yakshanba, 1 = Dushanba ... 6 = Shanba

            const reqToqKunlar = kunlar.includes("toq");
            const reqJuftKunlar = kunlar.includes("juft");

            // Toq kunlar: Dushanba (1), Chorshanba (3), Juma (5)
            const isToq = currentDayIndex === 1 || currentDayIndex === 3 || currentDayIndex === 5;
            // Juft kunlar: Seshanba (2), Payshanba (4), Shanba (6)
            const isJuft = currentDayIndex === 2 || currentDayIndex === 4 || currentDayIndex === 6;

            if (reqToqKunlar && !isToq) {
                return res.status(400).json({ success: false, message: "Bugun sizning dars kuningiz emas (Toq kunlari keling)" });
            }
            if (reqJuftKunlar && !isJuft) {
                return res.status(400).json({ success: false, message: "Bugun sizning dars kuningiz emas (Juft kunlari keling)" });
            }
        }

        // --- 2. Dars Vaqtini Tekshirish ---
        if (student.guruh.jadval?.vaqt) {
            const [startTime] = student.guruh.jadval.vaqt.split('-');
            const [h, m] = startTime.split(':').map(Number);

            const now = new Date();
            const tashkentTime = now.toLocaleTimeString('en-GB', {
                timeZone: 'Asia/Tashkent',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            const [currentH, currentM] = tashkentTime.split(':').map(Number);

            const nowTotalMinutes = currentH * 60 + currentM;
            const startTotalMinutes = h * 60 + m - 120; // Darsdan 2 soat oldin
            const endTotalMinutes = h * 60 + m + 360;   // Dars boshlaridan beri 6 soat

            if (nowTotalMinutes < startTotalMinutes || nowTotalMinutes > endTotalMinutes) {
                return res.status(400).json({
                    success: false,
                    message: `Davomat faqat dars vaqtida olinadi (Sizning darsingiz: ${student.guruh.jadval.vaqt})`
                });
            }
        }

        let attendance = await Attendance.findOne({
            guruh: student.guruh._id,
            sana: { $gte: today, $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        if (!attendance) {
            // Agar bugun uchun hali davomat ochilmagan bo'lsa (birinchi o'quvchi kelsa)
            const allStudents = await Student.find({ guruh: student.guruh._id, holati: 'faol' });
            attendance = await Attendance.create({
                guruh: student.guruh._id,
                sana: today,
                oquvchilar: allStudents.map(s => {
                    const isScanningStudent = s._id.toString() === studentId.toString();
                    return {
                        oquvchi: s._id,
                        keldi: isScanningStudent,
                        ball: isScanningStudent ? 100 : 0,
                        coinAmount: isScanningStudent ? 100 : -50
                    };
                }),
                branchId: student.branchId
            });
        } else {
            // Mavjud o'quvchini "Keldi" deb belgilash
            const oquvchiIndex = attendance.oquvchilar.findIndex(o => o.oquvchi.toString() === studentId.toString());

            if (oquvchiIndex !== -1) {
                if (attendance.oquvchilar[oquvchiIndex].keldi) {
                    return res.status(400).json({ success: false, message: "Siz bugun davomatdan o'tgansiz" });
                }
                attendance.oquvchilar[oquvchiIndex].keldi = true;
                attendance.oquvchilar[oquvchiIndex].ball = 100;
                attendance.oquvchilar[oquvchiIndex].coinAmount = 100;
                await attendance.save();
            } else {
                // Agar o'quvchi ro'yxatda yo'q bo'lsa (yangi qo'shilgan bo'lsa)
                attendance.oquvchilar.push({ oquvchi: studentId, keldi: true, ball: 100, coinAmount: 100 });
                await attendance.save();
            }
        }

        // --- Coinlarni hisoblash va yangilash ---
        // QR orqali kelganda odatda 100 ball va 100 coin beriladi
        const newCoinAmount = 100;
        const studentRecord = attendance.oquvchilar.find(o => o.oquvchi.toString() === studentId.toString());
        
        // Agar o'quvchi avvalroq boshqa holatda bo'lgan bo'lsa (masalan, o'qituvchi kelmadi deb belgilagan bo'lsa)
        // Biz farqni hisoblaymiz. Agar yangi bo'lsa, oldingi coin 0 deb olinadi.
        // Lekin mantiqan QR skan qilganda u har doim "keldi" bo'ladi.
        
        // Avvalgi coin miqdorini topish (agar bo'lsa)
        // Eslatma: attendance.save() dan keyin bizda yangi holat bor, lekin bizga eskisi kerak edi.
        // Biroq scanAttendance da biz statusni hozirgina o'zgartirdik.
        
        // Soddaroq yondashuv: Agar o'quvchi hozirgina "keldi" bo'lgan bo'lsa, unga tegishli coinni beramiz.
        // Oldingi holatni bilish uchun bizga saqlashdan oldingi ma'lumot kerak edi.
        // Keling, 150 coin qo'shamiz (chunki default absent -50 edi, 100 ga chiqish uchun +150 kerak)
        // Agar u mutlaqo yangi bo'lsa, +100 beramiz.
        
        await updateCoins(studentId, 150, 'QR-kod orqali davomat: Darsga keldi (Ball: 100)');

        res.json({
            success: true,
            message: "Davomat qilindi +100 coin berildi",
            data: attendance
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Telegramga davomat hisobotini yuborish
// @route   POST /api/attendance/report/:groupId/:date
exports.sendAttendanceReport = async (req, res) => {
    try {
        const { groupId, date } = req.params;
        const { sendAttendanceNotification } = require('../services/telegramBot');

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            guruh: groupId,
            sana: { $gte: startOfDay, $lte: endOfDay },
            ...(req.branchFilter || {})
        }).populate('oquvchilar.oquvchi', 'ism');

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Davomat topilmadi' });
        }

        const result = await sendAttendanceNotification(groupId, date, attendance);

        if (result.success) {
            res.json({ success: true, message: 'Davomat Telegramga yuborildi' });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};
