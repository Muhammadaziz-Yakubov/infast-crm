const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

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
            // Ballarni qayta hisoblash uchun
            const oldMap = new Map();
            attendance.oquvchilar.forEach(o => oldMap.set(o.oquvchi.toString(), o.keldi));

            // Yangilash
            attendance.oquvchilar = oquvchilar;
            attendance.izoh = izoh;
            await attendance.save();

            // Ballarni yangilash
            for (const item of oquvchilar) {
                const oquvchiId = item.oquvchi._id || item.oquvchi;
                const wasPresent = oldMap.get(oquvchiId.toString());
                const isPresent = item.keldi;

                if (isPresent && !wasPresent) {
                    // Yangi keldi -> Ball +1
                    await Student.findByIdAndUpdate(oquvchiId, { $inc: { ball: 1 } });
                } else if (!isPresent && wasPresent) {
                    // Keldi edi, endi kelmagan -> Ball -1
                    await Student.findByIdAndUpdate(oquvchiId, { $inc: { ball: -1 } });
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

            // Ballarni qo'shish
            for (const item of oquvchilar) {
                if (item.keldi) {
                    const oquvchiId = item.oquvchi._id || item.oquvchi;
                    await Student.findByIdAndUpdate(oquvchiId, { $inc: { ball: 1 } });
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
