const { supabaseAdmin, verifySupabaseToken } = require('../config/supabase');
const { isBlockedAccountStatus, getAccountStatusMessage, normalizeStatus } = require('../utils/accountStatus');

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) return '';
  return String(authHeader).split(' ')[1].trim();
};

/**
 * protect — verifies Supabase JWT and attaches full profile from Supabase profiles table.
 * req.user will be: { id, email, name, avatar, role, status, status_reason, last_login_at }
 */
const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    // Verify JWT via Supabase
    const { user: supabaseUser, error } = await verifySupabaseToken(token);
    if (error || !supabaseUser) {
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }

    // Fetch profile from Supabase profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, avatar, role, status, status_reason, last_login_at')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        message: 'Not authorized, user profile not found. Please log in again.',
      });
    }

    req.user = {
      id: profile.id,
      _id: profile.id, // alias for backward compatibility
      email: supabaseUser.email,
      name: profile.name,
      avatar: profile.avatar,
      role: profile.role,
      status: profile.status,
      status_reason: profile.status_reason,
      last_login_at: profile.last_login_at,
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

/**
 * ensureActiveAccount — blocks banned/inactive users after protect() has run.
 */
const ensureActiveAccount = (req, res, next) => {
  const status = normalizeStatus(req.user?.status);
  if (isBlockedAccountStatus(status)) {
    const reason = req.user?.status_reason || '';
    return res.status(403).json({
      message: getAccountStatusMessage({ status, reason }),
      status,
      reason,
    });
  }
  return next();
};

/**
 * requireAdmin — ensures the authenticated user has the admin role.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  return next();
};

module.exports = { protect, ensureActiveAccount, requireAdmin };
