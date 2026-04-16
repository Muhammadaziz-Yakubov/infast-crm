const Group = require('../models/Group');
const curriculum = require('../data/curriculum.json');

// Kunlar xaritasi - O'zbekcha nomlardan raqamga
const KUN_XARITAS = {
    'du': 1, 'dush': 1, 'dushanba': 1,
    'se': 2, 'sesh': 2, 'seshanba': 2,
    'chor': 3, 'ch': 3, 'chorshanba': 3,
    'pay': 4, 'pa': 4, 'payshanba': 4,
    'ju': 5, 'jum': 5, 'juma': 5,
    'sha': 6, 'sh': 6, 'shanba': 6,
    'yak': 0, 'ya': 0, 'yakshanba': 0
};

const KUN_NOMLARI = {
    0: 'Yakshanba',
    1: 'Dushanba',
    2: 'Seshanba',
    3: 'Chorshanba',
    4: 'Payshanba',
    5: 'Juma',
    6: 'Shanba'
};

// Guruh dars kunlarini aniqlash
const getGuruhDarsKunlari = (group) => {
    // Agar darsKunlari to'g'ridan-to'g'ri saqlangan bo'lsa
    if (group.darsKunlari && group.darsKunlari.length > 0) {
        return group.darsKunlari;
    }
    // Jadval.kunlar dan aniqlash (masalan: "Du, Chor, Jum")
    if (group.jadval && group.jadval.kunlar) {
        const kunlar = group.jadval.kunlar.split(',').map(k => k.trim().toLowerCase());
        const raqamlar = kunlar
            .map(k => KUN_XARITAS[k])
            .filter(k => k !== undefined);
        if (raqamlar.length > 0) return raqamlar;
    }
    // Default: Du, Chor, Jum
    return [1, 3, 5];
};

// Bugun dars bormi yoki yo'qligini aniqlash
const bugunDarsBormi = (group) => {
    const bugun = new Date();
    const bugunKun = bugun.getDay(); // 0=Yakshanba ... 6=Shanba
    const darsKunlari = getGuruhDarsKunlari(group);
    return darsKunlari.includes(bugunKun);
};

// Keyingi dars kuni
const keyingiDarsKuni = (group) => {
    const bugun = new Date();
    const bugunKun = bugun.getDay();
    const darsKunlari = getGuruhDarsKunlari(group).sort((a, b) => a - b);

    // Keyingi dars kunini topish
    for (const kun of darsKunlari) {
        if (kun > bugunKun) {
            return KUN_NOMLARI[kun];
        }
    }
    // Kelasi haftaning birinchi dars kuni
    return KUN_NOMLARI[darsKunlari[0]];
};

// Curriculum ma'lumotlarini olish
const getCurriculumData = (kalit, daraja) => {
    const kursData = curriculum[kalit];
    if (!kursData) return null;

    const darajaData = kursData.darajalar.find(d => d.daraja === daraja);
    return darajaData;
};

// Joriy dars ma'lumotlarini olish - ENDI BARCHA DARAJALARDAN QIDIRADI
const getJoriyDars = (kalit, darsRaqam) => {
    const kursData = curriculum[kalit];
    if (!kursData) return null;

    for (const d of kursData.darajalar) {
        for (const hafta of d.haftalar) {
            const dars = hafta.darslar.find(d => d.dars_raqam === darsRaqam);
            if (dars) {
                return { ...dars, hafta: hafta.hafta, darajaNomi: d.nomi };
            }
        }
    }
    return null;
};

// Jami darslar sonini olish - ENDI KURS BO'YICHA JAMI DARSLARNI QAYTARADI
const getJamiDarslar = (kalit) => {
    const kursData = curriculum[kalit];
    if (!kursData) return 0;

    let jami = 0;
    for (const d of kursData.darajalar) {
        for (const hafta of d.haftalar) {
            jami += hafta.darslar.length;
        }
    }
    return jami;
};

// ============= CONTROLLERS =============

// @desc    Guruh curriculum ma'lumotlarini olish + bugungi dars tekshiruvi
// @route   GET /api/curriculum/group/:groupId
exports.getGroupCurriculum = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('kurs', 'nomi narx davomiyligi');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const kalit = group.curriculumKalit || 'frontend';
        const daraja = group.daraja || 1;
        const joriyDarsRaqam = (group.darsProgress || 0) + 1;
        const jamiDarslar = getJamiDarslar(kalit);

        // Bugungi dars tekshiruvi
        const bugunDarsBor = bugunDarsBormi(group);
        const joriyDars = getJoriyDars(kalit, joriyDarsRaqam);
        const keyingiDars = getJoriyDars(kalit, joriyDarsRaqam + 1);
        const unganDars = getJoriyDars(kalit, joriyDarsRaqam + 2);

        // Dars kunlari nomlarini yaratish
        const darsKunlari = getGuruhDarsKunlari(group);
        const darsKunlariNomlari = darsKunlari.map(k => KUN_NOMLARI[k]);

        res.json({
            success: true,
            data: {
                guruh: {
                    _id: group._id,
                    nomi: group.nomi,
                    kurs: group.kurs,
                    daraja,
                    darsProgress: group.darsProgress || 0,
                    jamiDarslar,
                    darsKunlari: darsKunlariNomlari,
                    curriculumKalit: kalit,
                    oqituvchi: group.oqituvchi
                },
                bugunDarsBor,
                keyingiDarsKuni: !bugunDarsBor ? keyingiDarsKuni(group) : null,
                joriyDars,
                keyingiDars,
                unganDars,
                joriyDarsRaqam,
                progressFoiz: jamiDarslar > 0 ? Math.round(((group.darsProgress || 0) / jamiDarslar) * 100) : 0
            }
        });
    } catch (error) {
        console.error('getGroupCurriculum error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Barcha curriculum darslarini olish (to'liq ro'yxat)
// @route   GET /api/curriculum/group/:groupId/all
exports.getGroupAllLessons = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('kurs', 'nomi');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const kalit = group.curriculumKalit || 'frontend';
        const kursData = curriculum[kalit];

        if (!kursData) {
            return res.status(404).json({ success: false, message: 'Curriculum topilmadi' });
        }

        let allHaftalar = [];
        let globalWeekCount = 1;
        for (const d of kursData.darajalar) {
            for (const h of d.haftalar) {
                allHaftalar.push({
                    hafta: globalWeekCount++, // Ketma-ket haftalar: 1 dan 39 gacha
                    aslHafta: h.hafta,
                    darajaNomi: d.nomi,
                    darslar: h.darslar
                });
            }
        }

        res.json({
            success: true,
            data: {
                guruhNomi: group.nomi,
                daraja: "Barchasi",
                darajaNomi: kursData.nomi,
                darsProgress: group.darsProgress || 0,
                haftalar: allHaftalar
            }
        });
    } catch (error) {
        console.error('getGroupAllLessons error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Darsni "O'tildi" deb belgilash (progress++)
// @route   POST /api/curriculum/group/:groupId/complete
exports.markLessonCompleted = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const kalit = group.curriculumKalit || 'frontend';
        const jamiDarslar = getJamiDarslar(kalit);
        const currentProgress = group.darsProgress || 0;

        if (currentProgress >= jamiDarslar) {
            return res.status(400).json({
                success: false,
                message: `Barcha darslar tugatilgan! (${jamiDarslar}/${jamiDarslar})`
            });
        }

        // O'tilgan dars haqida
        const otilganDarsRaqam = currentProgress + 1;
        const otilganDars = getJoriyDars(kalit, otilganDarsRaqam);

        group.darsProgress = otilganDarsRaqam;
        
        // Sync user-friendly progress object
        const keyingiDarsRaqam = group.darsProgress + 1;
        const keyingiDars = getJoriyDars(kalit, keyingiDarsRaqam);

        group.progress = {
            completedLessons: group.darsProgress,
            totalLessons: jamiDarslar,
            currentTopic: otilganDars?.mavzular?.join(', ') || '',
            nextLesson: keyingiDars?.mavzular?.[0] || 'Tugatildi'
        };

        await group.save();

        res.json({
            success: true,
            message: `${otilganDarsRaqam}-dars muvaffaqiyatli o'tildi! ✅`,
            data: {
                otilganDars: {
                    raqam: otilganDarsRaqam,
                    mavzular: otilganDars?.mavzular || []
                },
                yangiProgress: group.darsProgress,
                jamiDarslar,
                keyingiDars: keyingiDars ? {
                    raqam: keyingiDarsRaqam,
                    mavzular: keyingiDars.mavzular
                } : null,
                progressFoiz: Math.round((group.darsProgress / jamiDarslar) * 100)
            }
        });
    } catch (error) {
        console.error('markLessonCompleted error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Darsni qaytarish (undo otildi)
// @route   POST /api/curriculum/group/:groupId/undo
exports.undoLessonCompleted = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        if ((group.darsProgress || 0) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Progress 0 da, qaytarib bo\'lmaydi'
            });
        }

        group.darsProgress = (group.darsProgress || 0) - 1;
        await group.save();

        res.json({
            success: true,
            message: 'Dars qaytarildi ↩️',
            data: {
                yangiProgress: group.darsProgress
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Dars progressni to'g'ridan-to'g'ri o'rnatish (eski guruhlar uchun)
// @route   PUT /api/curriculum/group/:groupId/set-progress
exports.setManualProgress = async (req, res) => {
    try {
        const { darsProgress } = req.body;
        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const kalit = group.curriculumKalit || 'frontend';
        const jamiDarslar = getJamiDarslar(kalit);

        if (darsProgress < 0 || darsProgress > jamiDarslar) {
            return res.status(400).json({
                success: false,
                message: `Progress 0 dan ${jamiDarslar} gacha bo'lishi kerak`
            });
        }

        group.darsProgress = darsProgress;
        
        // Sync user-friendly progress object
        const joriyDars = getJoriyDars(kalit, darsProgress);
        const keyingiDars = getJoriyDars(kalit, darsProgress + 1);

        group.progress = {
            completedLessons: darsProgress,
            totalLessons: jamiDarslar,
            currentTopic: joriyDars?.mavzular?.join(', ') || '',
            nextLesson: keyingiDars?.mavzular?.[0] || (darsProgress >= jamiDarslar ? 'Kurs yakunlandi' : '')
        };

        await group.save();

        res.json({
            success: true,
            message: `Progress ${darsProgress} ga o'rnatildi ⚡`,
            data: {
                darsProgress: group.darsProgress,
                jamiDarslar,
                progressFoiz: Math.round((darsProgress / jamiDarslar) * 100)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Mavjud curriculum kalitlarini olish
// @route   GET /api/curriculum/courses
exports.getCurriculumCourses = async (req, res) => {
    try {
        const kurslar = Object.keys(curriculum).map(kalit => ({
            kalit,
            nomi: curriculum[kalit].nomi,
            darajalarSoni: curriculum[kalit].darajalar.length,
            darajalar: curriculum[kalit].darajalar.map(d => ({
                daraja: d.daraja,
                nomi: d.nomi,
                davomiyligi: d.davomiyligi,
                haftalarSoni: d.haftalar.length,
                darslarSoni: d.haftalar.reduce((sum, h) => sum + h.darslar.length, 0)
            }))
        }));

        res.json({
            success: true,
            data: kurslar
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};
