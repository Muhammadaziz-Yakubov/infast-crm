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
            sana: { $gte: startOfDay, $lte: endOfDay }
        }).populate('oquvchilar.oquvchi', 'ism telefon');

        // Agar davomat hali qilinmagan bo'lsa, guruhdagi o'quvchilar ro'yxatini qaytarish
        if (!attendance) {
            const students = await Student.find({ guruh: groupId, holati: 'faol' }).sort({ ism: 1 });
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

        const startOfDay = new Date(sana);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(sana);
        endOfDay.setHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({
            guruh,
            sana: { $gte: startOfDay, $lte: endOfDay }
        });

        if (attendance) {
            // Yangilashdan oldin eski davomatni tekshirish
            const oldMap = new Map();
            attendance.oquvchilar.forEach(o => oldMap.set(o.oquvchi.toString(), o.keldi));

            // Yangilash
            attendance.oquvchilar = oquvchilar;
            attendance.izoh = izoh;
            await attendance.save();

            // Coinlarni yangilash
            for (const item of oquvchilar) {
                const oquvchiId = (item.oquvchi._id || item.oquvchi).toString();
                const wasPresent = oldMap.get(oquvchiId);
                const isPresent = item.keldi;

                if (isPresent && !wasPresent) {
                    // Yangi keldi -> Coin +100 (oldin kelmadi edi, endi keldi, demak -50 edi, uni +50 ga o'zgartirish uchun +100)
                    await updateCoins(oquvchiId, 100, `Davomat: Kelmagandan Keldi holatiga o'zgartirildi (+50)`);
                } else if (!isPresent && wasPresent) {
                    // Keldi edi, endi kelmagan -> Coin -100
                    await updateCoins(oquvchiId, -100, `Davomat: Keldidan Kelmadi holatiga o'zgartirildi (-50)`);
                }
            }
        } else {
            // Yangi yaratish
            attendance = await Attendance.create({
                guruh,
                sana: startOfDay,
                oquvchilar,
                izoh
            });

            // Coinlarni qo'shish
            for (const item of oquvchilar) {
                const oquvchiId = (item.oquvchi._id || item.oquvchi).toString();
                if (item.keldi) {
                    await updateCoins(oquvchiId, 50, 'Davomat: Darsga keldi');
                } else {
                    await updateCoins(oquvchiId, -50, 'Davomat: Darsga kelmadi');
                }
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

        // Guruh jadvalini tekshirish (Vaqt cheklovi - ixtiyoriy lekin xavfsiz)
        // Hozircha sodda: faqat bugun dars bo'lsa va dars vaqtiga yaqin bo'lsa
        // Agar guruh jadvalida vaqt bo'lsa, tekshiramiz (Masalan: 14:30-16:00)
        if (student.guruh.jadval?.vaqt) {
            const [startTime] = student.guruh.jadval.vaqt.split('-');
            const [h, m] = startTime.split(':').map(Number);

            // Hozirgi vaqtni Asia/Tashkent vaqtida olish
            const now = new Date();
            const tashkentTime = now.toLocaleTimeString('en-GB', {
                timeZone: 'Asia/Tashkent',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            const [currentH, currentM] = tashkentTime.split(':').map(Number);

            // Jami minutlarda hisoblash (kunning boshidan boshlab)
            const nowTotalMinutes = currentH * 60 + currentM;
            const startTotalMinutes = h * 60 + m - 120; // Darsdan 2 soat oldin boshlanadi
            const endTotalMinutes = h * 60 + m + 360; // Dars boshlanganidan keyin 6 soatgacha davom etadi

            console.log(`Time Check: Now=${tashkentTime} (${nowTotalMinutes}), ClassStart=${startTime}, Range=[${startTotalMinutes}, ${endTotalMinutes}]`);

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
                oquvchilar: allStudents.map(s => ({
                    oquvchi: s._id,
                    keldi: s._id.toString() === studentId.toString() ? true : false
                }))
            });
        } else {
            // Mavjud o'quvchini "Keldi" deb belgilash
            const oquvchiIndex = attendance.oquvchilar.findIndex(o => o.oquvchi.toString() === studentId.toString());

            if (oquvchiIndex !== -1) {
                if (attendance.oquvchilar[oquvchiIndex].keldi) {
                    return res.status(400).json({ success: false, message: "Siz bugun davomatdan o'tgansiz" });
                }
                attendance.oquvchilar[oquvchiIndex].keldi = true;
                await attendance.save();
            } else {
                // Agar o'quvchi ro'yxatda yo'q bo'lsa (yangi qo'shilgan bo'lsa)
                attendance.oquvchilar.push({ oquvchi: studentId, keldi: true });
                await attendance.save();
            }
        }

        // Coin qo'shish
        await updateCoins(studentId, 50, 'QR-kod orqali davomat: Darsga keldi');

        res.json({
            success: true,
            message: "Davomat qilindi +50 berildi",
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
            sana: { $gte: startOfDay, $lte: endOfDay }
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
