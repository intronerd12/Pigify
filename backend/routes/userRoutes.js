const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, uploadAvatar } = require('../controllers/userController');
const { protect, ensureActiveAccount, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All user management routes require authentication + admin role
router.get('/', protect, ensureActiveAccount, requireAdmin, getUsers);
router.put('/:id', protect, ensureActiveAccount, requireAdmin, updateUser);
router.post('/:id/avatar', protect, uploadAvatar);
router.delete('/:id', protect, ensureActiveAccount, requireAdmin, deleteUser);

module.exports = router;
