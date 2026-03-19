const express = require('express');
const { getUsers, getWatchHistory, getAnalytics } = require('../controllers/userController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminOnly, getUsers);
router.get('/history/:userId', authMiddleware, getWatchHistory);
router.get('/analytics', authMiddleware, adminOnly, getAnalytics);

module.exports = router;
