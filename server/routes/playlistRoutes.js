const express = require('express');
const {
  getPlaylists,
  createPlaylist,
  addVideoToPlaylist
} = require('../controllers/playlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getPlaylists);
router.post('/', authMiddleware, createPlaylist);
router.post('/:id/videos', authMiddleware, addVideoToPlaylist);

module.exports = router;
