const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Student = require('../models/Student');
const User = require('../models/User');
const { uploadToR2 } = require('../services/uploadService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Yangi chellenj yaratish
// @route   POST /api/challenges
// @access  Private (Admin)
exports.createChallenge = asyncHandler(async (req, res) => {
    const { title, description, duration, days } = req.body;

    const challenge = await Challenge.create({
        title,
        description,
        duration,
        days,
        createdBy: req.user.id
    });

    res.status(201).json({
        success: true,
        data: challenge
    });
});

// @desc    Barcha chellenjlarni olish
// @route   GET /api/challenges
// @access  Private
exports.getChallenges = asyncHandler(async (req, res) => {
    const challenges = await Challenge.find({ status: 'active' }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: challenges
    });
});

// @desc    Bitta chellenjni olish
// @route   GET /api/challenges/:id
// @access  Private
exports.getChallenge = asyncHandler(async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
        return res.status(404).json({ success: false, message: "Chellenj topilmadi" });
    }

    res.status(200).json({
        success: true,
        data: challenge
    });
});

// @desc    Chellenjga qo'shilish
// @route   POST /api/challenges/:id/join
// @access  Private
exports.joinChallenge = asyncHandler(async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
        return res.status(404).json({ success: false, message: "Chellenj topilmadi" });
    }

    // Is participant already joined?
    const alreadyJoined = challenge.participants.some(
        p => p.participantId.toString() === req.user.id.toString()
    );

    if (alreadyJoined) {
        return res.status(400).json({ success: false, message: "Siz allaqachon qo'shilgansiz" });
    }

    // Determine participant type from req.user.role (assuming students have 'student' role)
    const participantType = req.user.role === 'student' ? 'Student' : 'User';

    challenge.participants.push({
        participantId: req.user.id,
        participantType
    });

    await challenge.save();

    res.status(200).json({
        success: true,
        message: "Chellenjga muvaffaqiyatli qo'shildingiz"
    });
});

// @desc    Kunlik loyiha yuklash
// @route   POST /api/challenges/:id/submit
// @access  Private
exports.submitChallengeDay = asyncHandler(async (req, res) => {
    const { dayNumber, note } = req.body;
    const challengeId = req.params.id;

    if (!req.file) {
        return res.status(400).json({ success: false, message: "Rasm yuklash shart" });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
        return res.status(404).json({ success: false, message: "Chellenj topilmadi" });
    }

    // Check if user is participant
    const isParticipant = challenge.participants.some(
        p => p.participantId.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
        return res.status(403).json({ success: false, message: "Avval chellenjga qo'shiling" });
    }

    // Upload image
    const imageUrl = await uploadToR2(req.file, 'challenges');

    // Get user info for easier display
    let userName = req.user.ism || req.user.fullName || req.user.username;
    let userImage = req.user.profileImage || '';

    const submission = await ChallengeSubmission.create({
        challenge: challengeId,
        user: req.user.id,
        userType: req.user.role === 'student' ? 'Student' : 'User',
        userName,
        userImage,
        dayNumber,
        image: imageUrl,
        note
    });

    res.status(201).json({
        success: true,
        data: submission
    });
});

// @desc    Chellenj topshiriqlarini olish
// @route   GET /api/challenges/:id/submissions
// @access  Private
exports.getChallengeSubmissions = asyncHandler(async (req, res) => {
    const { dayNumber } = req.query;
    let query = { challenge: req.params.id };
    
    if (dayNumber) {
        query.dayNumber = dayNumber;
    }

    const submissions = await ChallengeSubmission.find(query).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: submissions
    });
});

// @desc    Chellenjni o'chirish
// @route   DELETE /api/challenges/:id
// @access  Private (Admin)
exports.deleteChallenge = asyncHandler(async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
        return res.status(404).json({ success: false, message: "Chellenj topilmadi" });
    }

    await Challenge.findByIdAndDelete(req.params.id);
    // Also delete submissions
    await ChallengeSubmission.deleteMany({ challenge: req.params.id });

    res.status(200).json({
        success: true,
        message: "Chellenj o'chirildi"
    });
});
