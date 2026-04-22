const QuizQuestion = require('../models/QuizQuestion');
const QuizResult = require('../models/QuizResult');
const Student = require('../models/Student');
const { updateCoins } = require('../services/coinService');

const fs = require('fs');
const path = require('path');

// Seed base questions if none exist or too few
const seedQuestions = async (req, res) => {
    try {
        const force = req.body && req.body.force;
        const count = await QuizQuestion.countDocuments();
        if (count < 10 || force) {
            const filePath = path.join(__dirname, '../data/questions_seed.json');
            if (fs.existsSync(filePath)) {
                const questionsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                if (force) {
                    await QuizQuestion.deleteMany({});
                }
                
                await QuizQuestion.insertMany(questionsData);
                console.log('Questions seeded successfully');
                if (res) return res.json({ success: true, message: 'Savollar muvaffaqiyatli yangilandi' });
            } else {
                if (res) return res.status(404).json({ success: false, message: 'Seed fayli topilmadi' });
            }
        } else {
            if (res) return res.json({ success: true, message: `Tizimda allaqachon ${count} ta savol bor` });
        }
    } catch (error) {
        console.error('Error seeding questions:', error);
        if (res) res.status(500).json({ success: false, message: error.message });
    }
};

// Initial seed
seedQuestions();

exports.seedQuestions = seedQuestions;

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
