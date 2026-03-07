const QuizQuestion = require('../models/QuizQuestion');
const QuizResult = require('../models/QuizResult');
const Student = require('../models/Student');
const { updateCoins } = require('../services/coinService');

// Seed base questions if none exist
const seedQuestions = async () => {
    const count = await QuizQuestion.countDocuments();
    if (count === 0) {
        const baseQuestions = [
            { question: "HTML nima?", options: ["HyperText Markup Language", "HighText Machine Language", "Hyperlink and Text Markup Language", "None of these"], correctOption: 0, category: "HTML" },
            { question: "CSS da rang berish uchun qaysi xususiyat ishlatiladi?", options: ["text-color", "color", "font-color", "fill"], correctOption: 1, category: "CSS" },
            { question: "HTML da eng katta sarlavha qaysi?", options: ["<h6>", "<head>", "<h1>", "<header>"], correctOption: 2, category: "HTML" },
            { question: "CSS da elementni o'rtaga keltirish uchun qaysi biri ishlatiladi?", options: ["margin: 0 auto;", "padding: center;", "align: center;", "text-align: middle;"], correctOption: 0, category: "CSS" },
            { question: "JavaScript da o'zgaruvchi e'lon qilish uchun qaysi keyword ishlatiladi?", options: ["var", "let", "const", "Barchasi"], correctOption: 3, category: "JavaScript" },
            { question: "HTML da yangi qatorga o'tish tegini toping?", options: ["<lb>", "<br>", "<break>", "<newline>"], correctOption: 1, category: "HTML" },
            { question: "CSS da 'font-weight' nima uchun ishlatiladi?", options: ["Matn rangini o'zgartirish", "Matn uslubini o'zgartirish", "Matn qalinligini o'zgartirish", "Matn hajmini o'zgartirish"], correctOption: 2, category: "CSS" },
            { question: "HTML da havola (link) yaratish uchun qaysi teg ishlatiladi?", options: ["<link>", "<a>", "<href>", "<nav>"], correctOption: 1, category: "HTML" },
            { question: "JavaScript '5' + 5 natijasi nima bo'ladi?", options: ["10", "55", "Error", "NaN"], correctOption: 1, category: "JavaScript" },
            { question: "CSS da 'display: flex' nima qiladi?", options: ["Elementni yashiradi", "Layoutni flexboxga o'tkazadi", "Elementni aylanib chiqadi", "Matnni kichiklashtiradi"], correctOption: 1, category: "CSS" }
        ];
        await QuizQuestion.insertMany(baseQuestions);
    }
};

// Initial seed
seedQuestions();

// Get 5 random questions
exports.getRandomQuestions = async (req, res) => {
    try {
        const questions = await QuizQuestion.aggregate([{ $sample: { size: 5 } }]);
        res.json({
            success: true,
            data: questions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit Quiz Result
exports.submitQuiz = async (req, res) => {
    try {
        const { score, totalQuestions, answers } = req.body;

        const quizResult = await QuizResult.create({
            student: req.user._id,
            score,
            totalQuestions,
            answers
        });

        // Award coins for good score (e.g., 20 coins per correct answer)
        const coinReward = score * 20;
        if (coinReward > 0) {
            await updateCoins(req.user._id, coinReward, `Quiz natijasi: ${score}/${totalQuestions}`);
        }

        res.status(201).json({
            success: true,
            data: quizResult,
            reward: coinReward
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Admin Results
exports.getAllQuizResults = async (req, res) => {
    try {
        const results = await QuizResult.find()
            .populate('student', 'ism telefon username guruh')
            .populate({
                path: 'student',
                populate: { path: 'guruh', select: 'nomi' }
            })
            .sort('-completedAt');

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get My Results (Student)
exports.getMyQuizResults = async (req, res) => {
    try {
        const results = await QuizResult.find({ student: req.user._id })
            .sort('-completedAt');

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
