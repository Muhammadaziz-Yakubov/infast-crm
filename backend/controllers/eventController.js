const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const EventAttendanceLog = require('../models/EventAttendanceLog');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Helper for coin processing
const processEventCoin = async (studentId, event, newStatus, oldStatus = null) => {
    let coinChange = 0;

    // Revert old effect if needed
    if (oldStatus === 'ATTENDED') coinChange -= event.coinReward;
    if (oldStatus === 'ABSENT') coinChange += event.coinPenalty;

    // Apply new effect
    if (newStatus === 'ATTENDED') coinChange += event.coinReward;
    if (newStatus === 'ABSENT') coinChange -= event.coinPenalty;

    if (coinChange !== 0) {
        await Student.findByIdAndUpdate(studentId, { $inc: { coins: coinChange } });
    }

    return coinChange;
};

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
    try {
        const { status, activeOnly } = req.query;
        let query = {};
        if (status) query.status = status;
        if (activeOnly === 'true') query.isActive = true;

        const events = await Event.find(query).populate('registrationsCount').sort({ startDate: -1 });

        res.json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json({ success: true, message: "Tadbir muvaffaqiyatli yaratildi", data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!event) return res.status(404).json({ success: false, message: "Tadbir topilmadi" });
        res.json({ success: true, message: "Tadbir muvaffaqiyatli yangilandi", data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete event (Soft delete)
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!event) return res.status(404).json({ success: false, message: "Tadbir topilmadi" });
        res.json({ success: true, message: "Tadbir arxivlandi" });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Register student for event
// @route   POST /api/events/:id/register
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: "Tadbir topilmadi" });
        if (!event.isActive || event.status !== 'UPCOMING') {
            return res.status(400).json({ success: false, message: "Bu tadbirga yozilish imkoni yo'q" });
        }

        // Check if event is full
        const regCount = await EventRegistration.countDocuments({ event: event._id, status: { $ne: 'CANCELLED' } });
        if (event.maxParticipants && regCount >= event.maxParticipants) {
            return res.status(400).json({ success: false, message: "Tadbir to'lgan" });
        }

        const registration = await EventRegistration.create({
            event: event._id,
            student: req.user.id
        });

        res.status(201).json({ success: true, message: "Siz tadbirga muvaffaqiyatli yozildingiz", data: registration });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Siz allaqachon yozilgansiz" });
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Save attendance
// @route   POST /api/events/:id/attendance/save
exports.saveAttendance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { attendanceData } = req.body; // Array of { studentId, status }
        const event = await Event.findById(req.params.id);
        if (!event) throw new Error("Tadbir topilmadi");

        for (const data of attendanceData) {
            const registration = await EventRegistration.findOne({ event: event._id, student: data.studentId });
            if (!registration) continue;

            const oldStatus = registration.status;
            const newStatus = data.status;

            if (oldStatus !== newStatus) {
                const coinChange = await processEventCoin(data.studentId, event, newStatus, oldStatus);
                
                registration.status = newStatus;
                registration.attendanceMarkedAt = new Date();
                registration.coinProcessed = true;
                await registration.save({ session });

                await EventAttendanceLog.create([{
                    event: event._id,
                    student: data.studentId,
                    action: newStatus,
                    coinChange,
                    note: "Admin tomonidan belgilandi"
                }], { session });
            }
        }

        await session.commitTransaction();
        res.json({ success: true, message: "Yo'qlama saqlandi" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

// @desc    Get event analytics
// @route   GET /api/events/:id/analytics
exports.getEventAnalytics = async (req, res) => {
    try {
        const eventId = req.params.id;
        const registrations = await EventRegistration.find({ event: eventId });
        
        const stats = {
            total: registrations.length,
            attended: registrations.filter(r => r.status === 'ATTENDED').length,
            absent: registrations.filter(r => r.status === 'ABSENT').length,
            rewardedCoins: 0,
            penalizedCoins: 0
        };

        const logs = await EventAttendanceLog.find({ event: eventId });
        logs.forEach(log => {
            if (log.coinChange > 0) stats.rewardedCoins += log.coinChange;
            if (log.coinChange < 0) stats.penalizedCoins += Math.abs(log.coinChange);
        });

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Get upcoming events for student
// @route   GET /api/student/events/upcoming
exports.getStudentUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.find({
            isActive: true,
            status: { $in: ['UPCOMING', 'ONGOING'] }
        }).sort({ startDate: 1 });

        // Check which ones student is registered for
        const registrations = await EventRegistration.find({ student: req.user.id });
        const registeredEventIds = registrations.map(r => r.event.toString());

        const data = events.map(event => {
            const e = event.toObject();
            e.isRegistered = registeredEventIds.includes(event._id.toString());
            return e;
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
exports.getEventRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ event: req.params.id })
            .populate('student', 'ism username guruh telefon')
            .populate({
                path: 'student',
                populate: { path: 'guruh', select: 'nomi' }
            });
        res.json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};
