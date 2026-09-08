const express = require('express');
const router = express.Router();
const { supabaseSync, getSessionStatus, getMe, socialLogin } = require('../controllers/authController');
const { protect, ensureActiveAccount } = require('../middleware/authMiddleware');

// ─── Public routes ───────────────────────────────────────────────────────────

// Supabase Auth sync — called by frontend after Supabase login/signup
// Verifies the Supabase JWT and upserts the profile in Supabase DB
router.post('/supabase-sync', supabaseSync);

// Social login (Google via Firebase — kept for Firebase Google button)
router.post('/social-login', socialLogin);

// ─── Protected routes (require valid Supabase JWT) ───────────────────────────

// Validate session & get user info
router.get('/session', protect, ensureActiveAccount, getSessionStatus);
router.get('/me', protect, getMe);

module.exports = router;
