const express = require('express');
const multer = require('multer');
const {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  getUserVideos,
  getLikedVideos,
  deleteVideo,
  streamVideo,
  trackVideoView,
  getRecommendedVideos,
  postComment,
  getCommentsByVideo,
  addWatchHistory,
  likeVideo,
  getVideoLikeStatus
} = require('../controllers/videoController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 250 * 1024 * 1024 } });

router.get('/stream/:id', streamVideo);
router.post('/:id/view', trackVideoView);
router.get('/recommended/:userId', getRecommendedVideos);
router.post('/comments', authMiddleware, postComment);
router.get('/comments/:videoId', getCommentsByVideo);
router.post('/history', authMiddleware, addWatchHistory);
router.post(
  '/upload',
  authMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadVideo
);

// Fixed: Put /my-videos BEFORE /:id so it's not caught as an invalid UUID
router.get('/my-videos', authMiddleware, getUserVideos);
router.get('/liked', authMiddleware, getLikedVideos);
router.get('/:id/like-status', authMiddleware, getVideoLikeStatus);

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.patch('/:id', authMiddleware, upload.single('thumbnail'), updateVideo);
router.post('/:id/like', authMiddleware, likeVideo);
router.delete('/:id', authMiddleware, deleteVideo);

module.exports = router;
