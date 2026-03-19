const express = require('express');
const multer = require('multer');
const {
  uploadVideo,
  getVideos,
  getVideoById,
  deleteVideo,
  streamVideo,
  getRecommendedVideos,
  postComment,
  getCommentsByVideo,
  addWatchHistory
} = require('../controllers/videoController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 250 * 1024 * 1024 } });

router.get('/stream/:id', streamVideo);
router.get('/recommended/:userId', getRecommendedVideos);
router.post('/comments', authMiddleware, postComment);
router.get('/comments/:videoId', getCommentsByVideo);
router.post('/history', authMiddleware, addWatchHistory);
router.post('/upload', authMiddleware, upload.single('video'), uploadVideo);
router.get('/', getVideos);
router.get('/:id', getVideoById);
router.delete('/:id', authMiddleware, deleteVideo);

module.exports = router;
