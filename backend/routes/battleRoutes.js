const express = require('express');
const router = express.Router();
const {
    createBattle,
    joinBattle,
    getRandomBattle,
    submitScore,
    getBattle,
    getMyBattles
} = require('../controllers/battleController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create', createBattle);
router.post('/join', joinBattle);
router.get('/random', getRandomBattle);
router.post('/submit', submitScore);
router.get('/my', getMyBattles);
router.get('/:id', getBattle);

module.exports = router;
