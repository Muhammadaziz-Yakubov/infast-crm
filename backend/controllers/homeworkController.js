const Group = require('../models/Group');
const Task = require('../models/Task');
const curriculum = require('../data/curriculum.json');
const { sendTaskNotification } = require('../services/telegramBot');

// Curriculum dan dars olish
const getDars = (kalit, darsRaqam) => {
    const kursData = curriculum[kalit];
    if (!kursData) return null;

    for (const d of kursData.darajalar) {
        for (const hafta of d.haftalar) {
            const dars = hafta.darslar.find(d => d.dars_raqam === darsRaqam);
            if (dars) return { ...dars, hafta: hafta.hafta, darajaNomi: d.nomi };
        }
    }
    return null;
};

// AI orqali homework generatsiya qilish (lokal, API kerak emas)
const generateHomework = (kursNomi, darajaText, dars) => {
    const mavzular = dars.mavzular;

    // Mavzularga asoslangan professional vazifa generatsiyasi
    const mavzuStr = mavzular.join(', ');

    // Daraja bo'yicha murakkablik - ism bo'yicha izlaymiz
    let qiyinlik = '';
    let bonusText = '';

    if (darajaText && darajaText.toLowerCase().includes('boshlang\'ich')) {
        qiyinlik = 'Oddiy va tushunarli tarzda bajaring. Har bir elementni alohida sinab ko\'ring.';
        bonusText = generateBonusForLevel1(mavzular);
    } else if (darajaText && darajaText.toLowerCase().includes('o\'rta')) {
        qiyinlik = 'Interaktiv elementlar va JavaScript funksiyalar qo\'shing. Kodni toza va tartibli yozing.';
        bonusText = generateBonusForLevel2(mavzular);
    } else {
        qiyinlik = 'Professional darajada, real-world loyiha sifatida bajaring. Best practices ga rioya qiling.';
        bonusText = generateBonusForLevel3(mavzular);
    }

    const title = generateTitle(mavzular, kursNomi);
    const description = generateDescription(mavzular, darajaText, kursNomi);
    const requirements = generateRequirements(mavzular, darajaText);

    return {
        title,
        description,
        requirements,
        bonus: bonusText,
        mavzular,
        daraja: darajaText,
        darsRaqam: dars.dars_raqam,
        haftaRaqam: dars.hafta,
        kurs: kursNomi,
        fullText: formatFullHomework(title, description, requirements, bonusText)
    };
};

// Sarlavha generatsiya
const generateTitle = (mavzular, kursNomi) => {
    const asosiyMavzu = mavzular[0];

    const titlePatterns = [
        `"${asosiyMavzu}" amaliy loyiha`,
        `${asosiyMavzu} — Mustaqil ish`,
        `Amaliyot: ${asosiyMavzu}`,
        `${asosiyMavzu} bo'yicha vazifa`,
        `Mini-loyiha: ${asosiyMavzu}`
    ];

    return titlePatterns[Math.floor(Math.random() * titlePatterns.length)];
};

// Tavsif generatsiya
const generateDescription = (mavzular, darajaText, kursNomi) => {
    const mavzuStr = mavzular.join(', ');

    const descriptions = [
        `Bugungi darsda o'tilgan mavzularni mustahkamlash uchun amaliy vazifa. Quyidagi mavzular bo'yicha ishlab chiqing: ${mavzuStr}. Daraja: ${darajaText}. Har bir mavzuni kamida bir marta qo'llang.`,
        `Ushbu vazifa ${mavzuStr} mavzulari bo'yicha bilimingizni sinash va mustahkamlash uchun mo'ljallangan. Real loyiha ko'rinishida bajaring.`,
        `${kursNomi} kursining ${darajaText} darajasi uchun amaliy topshiriq. Mavzular: ${mavzuStr}. Barcha mavzularni bitta loyihada birlashtiring.`
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Talablar generatsiya
const generateRequirements = (mavzular, darajaText) => {
    const reqs = [];

    mavzular.forEach(mavzu => {
        const lowerMavzu = mavzu.toLowerCase();

        // HTML mavzular
        if (lowerMavzu.includes('html') || lowerMavzu.includes('teg') || lowerMavzu.includes('form') || lowerMavzu.includes('jadval') || lowerMavzu.includes('table')) {
            reqs.push(`${mavzu} ni to'g'ri va semantic tarzda qo'llang`);
        }
        // CSS mavzular
        else if (lowerMavzu.includes('css') || lowerMavzu.includes('flex') || lowerMavzu.includes('grid') || lowerMavzu.includes('position') || lowerMavzu.includes('animation') || lowerMavzu.includes('responsive')) {
            reqs.push(`${mavzu} yordamida chiroyli va zamonaviy dizayn yarating`);
        }
        // JS mavzular
        else if (lowerMavzu.includes('javascript') || lowerMavzu.includes('dom') || lowerMavzu.includes('event') || lowerMavzu.includes('function') || lowerMavzu.includes('array') || lowerMavzu.includes('object') || lowerMavzu.includes('funksiya') || lowerMavzu.includes('massiv')) {
            reqs.push(`${mavzu} dan foydalanib interaktiv funksiya yarating`);
        }
        // React mavzular
        else if (lowerMavzu.includes('react') || lowerMavzu.includes('component') || lowerMavzu.includes('hook') || lowerMavzu.includes('state') || lowerMavzu.includes('props') || lowerMavzu.includes('router')) {
            reqs.push(`${mavzu} amaliy qo'llang va yangi komponent yarating`);
        }
        // Git/GitHub
        else if (lowerMavzu.includes('git') || lowerMavzu.includes('github')) {
            reqs.push(`${mavzu} orqali loyihani boshqaring va push qiling`);
        }
        // Umumiy mavzular
        else {
            reqs.push(`${mavzu} ni amaliy qo'llab, loyihaga integratsiya qiling`);
        }
    });

    // Daraja bo'yicha qo'shimcha talablar
    if (darajaText && (darajaText.toLowerCase().includes("o'rta") || darajaText.toLowerCase().includes("yuqori"))) {
        reqs.push('Kodni toza va o\'qilishi oson qilib yozing');
        reqs.push('README.md fayl yarating va loyihani GitHub ga push qiling');
    }
    if (darajaText && darajaText.toLowerCase().includes("yuqori")) {
        reqs.push('Mobile-responsive dizayn bo\'lishi shart');
        reqs.push('Error handling va edge case larni inobatga oling');
    }

    return reqs;
};

// Bonus vazifalar
const generateBonusForLevel1 = (mavzular) => {
    const bonuses = [
        'Sahifaga chiroyli rang sxemasi va gradient qo\'shing',
        'Hover effektlar va smooth transition qo\'shing',
        'Loyihani GitHub Pages ga deploy qiling',
        'Qo\'shimcha sahifa yarating va ularni bir-biri bilan bog\'lang',
        'Google Fonts dan professional shrift tanlang va qo\'llang'
    ];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
};

const generateBonusForLevel2 = (mavzular) => {
    const bonuses = [
        'Dark mode funksiyasini qo\'shing',
        'LocalStorage dan foydalanib ma\'lumotlarni saqlang',
        'Animatsiyali loading spinner yarating',
        'Form validation xabarlarini chiroyli ko\'rsating',
        'Keyboard shortcuts qo\'shing (Esc, Enter va boshqalar)'
    ];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
};

const generateBonusForLevel3 = (mavzular) => {
    const bonuses = [
        'Unit testlar yozing',
        'TypeScript da qayta yozing',
        'PWA (Progressive Web App) sifatida sozlang',
        'CI/CD pipeline qarang (GitHub Actions)',
        'Performance optimization (Lighthouse score 90+ ga yetkazing)',
        'Accessibility (a11y) standartlariga rioya qiling'
    ];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
};

// To'liq formatlangan vazifa matni
const formatFullHomework = (title, description, requirements, bonus) => {
    let text = `📋 **${title}**\n\n`;
    text += `📝 **Tavsif:**\n${description}\n\n`;
    text += `✅ **Talablar:**\n`;
    requirements.forEach((req, i) => {
        text += `${i + 1}. ${req}\n`;
    });
    text += `\n⭐ **Bonus vazifa:**\n${bonus}`;
    return text;
};

// ============= CONTROLLERS =============

// @desc    AI Homework generatsiya qilish
// @route   POST /api/homework/generate
exports.generateAIHomework = async (req, res) => {
    try {
        const { groupId } = req.body;

        const group = await Group.findById(groupId)
            .populate('kurs', 'nomi');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const kalit = group.curriculumKalit || 'frontend';
        const joriyDarsRaqam = (group.darsProgress || 0) + 1; // bu endi global dars raqami (1..117)

        const kursData = curriculum[kalit];
        if (!kursData) {
            return res.status(404).json({ success: false, message: 'Curriculum topilmadi' });
        }

        const dars = getDars(kalit, joriyDarsRaqam);
        if (!dars) {
            return res.status(400).json({
                success: false,
                message: `${joriyDarsRaqam}-dars topilmadi. Barcha darslar tugatilgan bo'lishi mumkin.`
            });
        }

        // Qaysi darajaga tushishini string orqali olamiz (Frontend Boshlang'ich, Frontend O'rta, vs)
        const darajaText = dars.darajaNomi || "Asosiy daraja";
        
        const homework = generateHomework(kursData.nomi, darajaText, dars);

        res.json({
            success: true,
            data: homework
        });
    } catch (error) {
        console.error('generateAIHomework error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    AI orqali generatsiya qilingan vazifani saqlash va tayinlash
// @route   POST /api/homework/assign
exports.assignAIHomework = async (req, res) => {
    try {
        const { groupId, title, description, maxScore, deadline } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const task = await Task.create({
            title,
            description,
            maxScore: maxScore || 100,
            deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta
            group: groupId,
            creator: req.user._id
        });

        // Telegram xabarnoma
        try {
            await sendTaskNotification(groupId, {
                title,
                deadline: task.deadline,
                maxScore: task.maxScore
            });
        } catch (telegramErr) {
            console.error('Telegram xabar xatosi:', telegramErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Vazifa muvaffaqiyatli tayinlandi! 🎯',
            data: task
        });
    } catch (error) {
        console.error('assignAIHomework error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Ma'lum bir dars uchun homework generatsiya qilish (manual dars tanlash)
// @route   POST /api/homework/generate-for-lesson
exports.generateForLesson = async (req, res) => {
    try {
        const { groupId, darsRaqam } = req.body;

        const group = await Group.findById(groupId)
            .populate('kurs', 'nomi');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
        }

        const kalit = group.curriculumKalit || 'frontend';
        const daraja = group.daraja || 1;

        const kursData = curriculum[kalit];
        if (!kursData) {
            return res.status(404).json({ success: false, message: 'Curriculum topilmadi' });
        }

        const dars = getDars(kalit, darsRaqam);
        if (!dars) {
            return res.status(400).json({
                success: false,
                message: `${darsRaqam}-dars topilmadi`
            });
        }

        const darajaText = dars.darajaNomi || "Asosiy daraja";
        
        const homework = generateHomework(kursData.nomi, darajaText, dars);

        res.json({
            success: true,
            data: homework
        });
    } catch (error) {
        console.error('generateForLesson error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};
