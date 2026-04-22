const Battle = require('../models/Battle');
const QuizQuestion = require('../models/QuizQuestion');
const Student = require('../models/Student');
const { updateCoins } = require('../services/coinService');

// Create a new battle
exports.createBattle = async (req, res) => {
    try {
        const { betAmount, isRandom } = req.body;
        const student = await Student.findById(req.user._id);

        if (!student) {
            return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
        }

        if (student.coins < betAmount) {
            return res.status(400).json({ success: false, message: "Mablag' yetarli emas" });
        }

        // Deduct coins immediately
        await updateCoins(req.user._id, -betAmount, `Octagon battle yaratish: ${betAmount}`);

        // Get 10 random questions
        let questions = await QuizQuestion.aggregate([{ $sample: { size: 10 } }]);
        
        if (questions.length < 10) {
            // Try to seed questions if they are missing
            const quizController = require('./quizController');
            await quizController.seedQuestions();
            // Try again
            questions = await QuizQuestion.aggregate([{ $sample: { size: 10 } }]);
        }

        if (questions.length < 10) {
            // If still not enough questions, return coins and error
            await updateCoins(req.user._id, betAmount, `Savollar yetarli emasligi sababli qaytarildi`);
            return res.status(400).json({ success: false, message: "Tizimda savollar yetarli emas (kamida 10 ta bo'lishi kerak). Iltimos, bazaga savollar qo'shing." });
        }

        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const battle = await Battle.create({
            player1: req.user._id,
            betAmount,
            isRandom,
            inviteCode,
            questions: questions.map(q => q._id),
            status: 'waiting'
        });

        const populatedBattle = await Battle.findById(battle._id).populate('questions');

        res.status(201).json({
            success: true,
            data: populatedBattle
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Join a battle
exports.joinBattle = async (req, res) => {
    try {
        const { inviteCode, battleId } = req.body;
        let battle;

        if (inviteCode) {
            battle = await Battle.findOne({ inviteCode, status: 'waiting' });
        } else if (battleId) {
            battle = await Battle.findById(battleId);
        }

        if (!battle || battle.status !== 'waiting') {
            return res.status(404).json({ success: false, message: "Battle topilmadi yoki allaqachon boshlangan" });
        }

        if (battle.player1.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "O'z battlengizga qo'shila olmaysiz" });
        }

        const student = await Student.findById(req.user._id);
        if (student.coins < battle.betAmount) {
            return res.status(400).json({ success: false, message: "Mablag' yetarli emas" });
        }

        // Deduct coins
        await updateCoins(req.user._id, -battle.betAmount, `Octagon battlega qo'shilish: ${battle.betAmount}`);

        battle.player2 = req.user._id;
        battle.status = 'ongoing';
        await battle.save();

        const populatedBattle = await Battle.findById(battle._id)
            .populate('player1', 'ism profileImage')
            .populate('player2', 'ism profileImage')
            .populate('questions');

        res.json({
            success: true,
            data: populatedBattle
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get random waiting battle
exports.getRandomBattle = async (req, res) => {
    try {
        const { betAmount } = req.query;
        const battle = await Battle.findOne({ 
            isRandom: true, 
            status: 'waiting', 
            betAmount,
            player1: { $ne: req.user._id }
        });

        res.json({
            success: true,
            data: battle
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit battle score
exports.submitScore = async (req, res) => {
    try {
        const { battleId, score } = req.body;
        const battle = await Battle.findById(battleId);

        if (!battle) {
            return res.status(404).json({ success: false, message: "Battle topilmadi" });
        }

        if (battle.player1.toString() === req.user._id.toString()) {
            if (battle.player1Completed) return res.status(400).json({ success: false, message: "Siz allaqachon topshirgansiz" });
            battle.player1Score = score;
            battle.player1Completed = true;
        } else if (battle.player2 && battle.player2.toString() === req.user._id.toString()) {
            if (battle.player2Completed) return res.status(400).json({ success: false, message: "Siz allaqachon topshirgansiz" });
            battle.player2Score = score;
            battle.player2Completed = true;
        } else {
            return res.status(403).json({ success: false, message: "Siz ushbu battle ishtirokchisi emassiz" });
        }

        if (battle.player1Completed && battle.player2Completed) {
            battle.status = 'completed';
            
            if (battle.player1Score > battle.player2Score) {
                battle.winner = battle.player1;
                await updateCoins(battle.player1, battle.betAmount * 2, `Octagon yutug'i: ${battle.betAmount * 2}`);
            } else if (battle.player2Score > battle.player1Score) {
                battle.winner = battle.player2;
                await updateCoins(battle.player2, battle.betAmount * 2, `Octagon yutug'i: ${battle.betAmount * 2}`);
            } else {
                // Tie: return coins to both
                await updateCoins(battle.player1, battle.betAmount, `Octagon durang: ${battle.betAmount} qaytarildi`);
                await updateCoins(battle.player2, battle.betAmount, `Octagon durang: ${battle.betAmount} qaytarildi`);
            }
        }

        await battle.save();

        res.json({
            success: true,
            data: battle
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get battle details
exports.getBattle = async (req, res) => {
    try {
        const battle = await Battle.findById(req.params.id)
            .populate('player1', 'ism profileImage')
            .populate('player2', 'ism profileImage')
            .populate('questions');

        res.json({
            success: true,
            data: battle
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my battles
exports.getMyBattles = async (req, res) => {
    try {
        const battles = await Battle.find({
            $or: [
                { player1: req.user._id },
                { player2: req.user._id }
            ]
        })
        .populate('player1', 'ism')
        .populate('player2', 'ism')
        .sort('-createdAt')
        .limit(20);

        res.json({
            success: true,
            data: battles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
