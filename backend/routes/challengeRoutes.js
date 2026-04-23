const express = require('express');
const router = express.Router();
const {
    createChallenge,
    getChallenges,
    getChallenge,
    joinChallenge,
    submitChallengeDay,
    getChallengeSubmissions,
    deleteChallenge
} = require('../controllers/challengeController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.route('/')
    .get(getChallenges)
    .post(authorize('superadmin', 'admin', 'teacher'), createChallenge);

router.route('/:id')
    .get(getChallenge)
    .delete(authorize('superadmin', 'admin', 'teacher'), deleteChallenge);

router.post('/:id/join', joinChallenge);
router.post('/:id/submit', upload.single('image'), submitChallengeDay);
router.get('/:id/submissions', getChallengeSubmissions);

module.exports = router;
