const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public or student routes
router.use(protect);
router.get('/upcoming', eventController.getStudentUpcomingEvents);
router.post('/:id/register', eventController.registerForEvent);

// Admin routes
router.use(authorize('admin', 'teacher'));
router.route('/')
    .get(eventController.getEvents)
    .post(eventController.createEvent);

router.route('/:id')
    .get(eventController.getEvent)
    .put(eventController.updateEvent)
    .delete(eventController.deleteEvent);

router.post('/:id/attendance/save', eventController.saveAttendance);
router.get('/:id/analytics', eventController.getEventAnalytics);
router.get('/:id/registrations', eventController.getEventRegistrations);

module.exports = router;
