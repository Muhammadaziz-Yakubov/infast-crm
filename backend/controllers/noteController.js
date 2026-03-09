const Note = require('../models/Note');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all community notes with author info
// @route   GET /api/notes
// @access  Authenticated
exports.getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find()
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(100);

        // Populate authors manually based on type
        const populatedNotes = await Promise.all(notes.map(async (note) => {
            let author = null;
            if (note.authorType === 'Student') {
                author = await Student.findById(note.authorId).select('ism profileImage username');
            } else if (note.authorType === 'User') {
                author = await User.findById(note.authorId).select('fullName username role');
            }

            const authorInfo = author ? {
                id: author._id,
                name: author.ism || author.fullName,
                username: author.username,
                profileImage: author.profileImage || '',
                role: author.role // 'student' or the user's role
            } : { name: 'Noma\'lum', role: 'system' };

            return {
                ...note.toObject(),
                authorInfo
            };
        }));

        res.status(200).json({
            success: true,
            count: populatedNotes.length,
            data: populatedNotes
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Authenticated
exports.createNote = async (req, res, next) => {
    try {
        const { content, category } = req.body;

        // Determine user type and ID from req.user
        // Assuming req.user is populated by protect middleware
        const authorId = req.user.id;
        const authorType = req.user.role === 'student' ? 'Student' : 'User';

        const note = await Note.create({
            content,
            category,
            authorId,
            authorType,
            isPinned: req.user.role !== 'student' && req.body.isPinned // Only admins can pin
        });

        res.status(201).json({
            success: true,
            data: note
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Toggle like for a note
// @route   POST /api/notes/:id/like
// @access  Authenticated
exports.toggleLike = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Eslatma topilmadi' });
        }

        const userId = req.user.id;
        const userType = req.user.role === 'student' ? 'Student' : 'User';

        const likeIndex = note.likes.findIndex(l => l.userId.toString() === userId.toString());

        if (likeIndex > -1) {
            // Unlike
            note.likes.splice(likeIndex, 1);
        } else {
            // Like
            note.likes.push({ userId, userType });
        }

        await note.save();

        res.status(200).json({
            success: true,
            liked: likeIndex === -1,
            likesCount: note.likes.length
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Owner or Admin
exports.deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Eslatma topilmadi' });
        }

        // Check if author or admin
        const isAuthor = note.authorId.toString() === req.user.id.toString();
        const isAdmin = req.user.role !== 'student';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Harakat cheklangan' });
        }

        await Note.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Eslatma o\'chirildi'
        });
    } catch (err) {
        next(err);
    }
};
