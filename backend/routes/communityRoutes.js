const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  getCommunityPosts,
  createCommunityPost,
  addCommunityComment,
  uploadCommunityScanImage,
  getCommunityNotifications,
  markCommunityNotificationsRead,
  toggleCommunityReaction,
  deleteCommunityPost,
  getCommunityAnalytics,
} = require('../controllers/communityController');

// @desc    Get community analytics
// @route   GET /api/community/analytics
router.get('/analytics', getCommunityAnalytics);

// @desc    Get community notifications
// @route   GET /api/community/notifications
router.get('/notifications', getCommunityNotifications);

// @desc    Mark community notifications read
// @route   POST /api/community/notifications/read
router.post('/notifications/read', markCommunityNotificationsRead);

// @desc    Get community posts
// @route   GET /api/community
router.get('/', getCommunityPosts);

// @desc    Create community post
// @route   POST /api/community
router.post('/', createCommunityPost);

const optionalCommunityUpload = (req, res, next) => {
  const ct = String(req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  return next();
};

// @desc    Upload scan image used in community post
// @route   POST /api/community/upload-scan-image
router.post('/upload-scan-image', optionalCommunityUpload, uploadCommunityScanImage);

// @desc    Add comment to post (supports both :postId/comments and :postId/comment)
router.post('/:postId/comments', addCommunityComment);
router.post('/:postId/comment', addCommunityComment);

// @desc    Toggle reaction (supports both :postId/reactions and :postId/react)
router.post('/:postId/reactions', toggleCommunityReaction);
router.post('/:postId/react', toggleCommunityReaction);

router.delete('/:postId', deleteCommunityPost);
router.post('/:postId/delete', deleteCommunityPost);

module.exports = router;
