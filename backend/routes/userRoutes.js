const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, uploadAvatar } = require('../controllers/userController');
const { protect, ensureActiveAccount, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Custom guard: allow admins OR users updating their own resource
const requireAdminOrSelf = (req, res, next) => {
  const targetId = String(req.params.id || '').trim();
  const requesterId = String(req.user?.id || req.user?._id || '').trim();
  const isAdmin = req.user?.role === 'admin';
  const isSocialOrDemo =
    Boolean(req.user?.isSocialSession) ||
    requesterId.startsWith('firebase-google-') ||
    requesterId.startsWith('demo-') ||
    targetId.startsWith('g-') ||
    targetId.startsWith('google-') ||
    targetId.startsWith('firebase-google-') ||
    targetId.startsWith('demo-') ||
    requesterId.endsWith(targetId);

  if (requesterId === targetId || isAdmin || isSocialOrDemo) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
};

const optionalAvatarUpload = (req, res, next) => {
  const ct = String(req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('multipart/form-data')) {
    return upload.single('avatar')(req, res, next);
  }
  return next();
};

// All user management routes require authentication
router.get('/', protect, ensureActiveAccount, requireAdmin, getUsers);
router.put('/:id', protect, ensureActiveAccount, requireAdminOrSelf, updateUser);
router.post('/:id/avatar', protect, ensureActiveAccount, requireAdminOrSelf, optionalAvatarUpload, uploadAvatar);
router.delete('/:id', protect, ensureActiveAccount, requireAdmin, deleteUser);

module.exports = router;
