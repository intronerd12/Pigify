const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, uploadAvatar } = require('../controllers/userController');
const { protect, ensureActiveAccount, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Custom guard: allow admins OR users updating their own resource
const requireAdminOrSelf = (req, res, next) => {
  const targetId = String(req.params.id);
  const requesterId = String(req.user?.id || req.user?._id || '');
  const isAdmin = req.user?.role === 'admin';
  if (requesterId === targetId || isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
};

// All user management routes require authentication
router.get('/', protect, ensureActiveAccount, requireAdmin, getUsers);
router.put('/:id', protect, ensureActiveAccount, requireAdminOrSelf, updateUser);
router.post('/:id/avatar', protect, ensureActiveAccount, requireAdminOrSelf, upload.single('avatar'), uploadAvatar);
router.delete('/:id', protect, ensureActiveAccount, requireAdmin, deleteUser);

module.exports = router;
