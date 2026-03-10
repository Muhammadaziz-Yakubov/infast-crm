const { Upload } = require('@aws-sdk/lib-storage');
const r2Client = require('../config/r2');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Student = require('../models/Student');
const Group = require('../models/Group');
const { sendTaskNotification } = require('../services/telegramBot');
const { updateCoins } = require('../services/coinService');
const path = require('path');

// R2 Upload helper
const uploadToR2 = async (file, folder = 'tasks') => {
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const upload = new Upload({
        client: r2Client,
        params: {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        },
    });

    await upload.done();
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return publicUrl;
};

// --- ADMIN CONTROLLERS ---

// Create Task
exports.createTask = async (req, res) => {
    try {
        const { title, description, maxScore, deadline, groupId } = req.body;

        let imageUrl = '';
        if (req.file) {
            imageUrl = await uploadToR2(req.file, 'task-covers');
        }

        const task = await Task.create({
            title,
            description,
            maxScore,
            deadline,
            group: groupId,
            image: imageUrl,
            creator: req.user._id
        });

        // Telegram guruh chatiga xabar yuborish
        try {
            await sendTaskNotification(groupId, {
                title,
                deadline,
                maxScore
            });
        } catch (telegramErr) {
            console.error('Telegram xabar yuborishda xatolik:', telegramErr.message);
            // Telegram xatosi bo'lsa ham vazifa yaratilgan
        }

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Submissions for a Task
exports.getTaskSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ task: req.params.taskId })
            .populate('student', 'ism telefon username')
            .sort('-submittedAt');

        res.json({
            success: true,
            data: submissions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Grade Submission
exports.gradeSubmission = async (req, res) => {
    try {
        const { score } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Topshiriq topilmadi' });
        }

        submission.score = score;
        submission.status = 'graded';
        await submission.save();

        // 1. Coin qo'shish
        await updateCoins(submission.student, 100, `Vazifa baholandi: ${score} ball`);

        res.json({
            success: true,
            data: submission
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Complete/Archive Task
exports.completeTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
        }
        task.status = 'completed';
        await task.save();

        res.json({
            success: true,
            message: 'Vazifa muvaffaqiyatli yakunlandi va arxivga olindi',
            data: task
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reopen Task
exports.reopenTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
        }
        task.status = 'active';
        await task.save();

        res.json({
            success: true,
            message: 'Vazifa muvaffaqiyatli qayta faollashtirildi',
            data: task
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- STUDENT CONTROLLERS ---

// Get Tasks (Admin sees all, Student sees their group's)
exports.getMyTasks = async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'student') {
            // Find tasks for current student's group
            tasks = await Task.find({ group: req.user.guruh }).sort('-createdAt');

            // Check if student has submitted for each task
            const submissions = await Submission.find({ student: req.user._id });

            tasks = tasks.map(task => {
                const submission = submissions.find(s => s.task.toString() === task._id.toString());
                return {
                    ...task.toObject(),
                    submission: submission || null,
                    isSubmitted: !!submission
                };
            });
        } else {
            // Admin sees all tasks
            tasks = await Task.find().populate('group', 'nomi').sort('-createdAt');
            console.log("Admin tasks found:", tasks.length);
        }

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error("Error in getMyTasks:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit Task (Student)
exports.submitTask = async (req, res) => {
    try {
        const { taskId, comment } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
        }
        if (task.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Ushbu vazifa yakunlangan, topshirib bo\'lmaydi' });
        }

        // Multi-file upload
        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToR2(file, 'submissions');
                imageUrls.push(url);
            }
        }

        const submission = await Submission.create({
            task: taskId,
            student: req.user._id,
            images: imageUrls,
            comment,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: submission
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
