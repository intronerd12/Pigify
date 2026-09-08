const { supabaseAdmin, verifySupabaseToken } = require('../config/supabase');
const { isBlockedAccountStatus, normalizeStatus, getAccountStatusMessage } = require('../utils/accountStatus');

// ─────────────────────────────────────────────────────────────────────────────
// Helper — fetch profile from Supabase profiles table
// ─────────────────────────────────────────────────────────────────────────────
const fetchProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, avatar, role, status, status_reason, last_login_at')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — build the user response object
// ─────────────────────────────────────────────────────────────────────────────
const buildUserResponse = (profile, email, supabaseToken) => ({
  _id: profile.id,
  id: profile.id,
  name: profile.name,
  email,
  avatar: profile.avatar || '',
  role: profile.role,
  status: profile.status,
  supabaseToken, // frontend uses this for session management
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Sync Supabase Auth user → Supabase profiles table
// @route   POST /api/auth/supabase-sync
// @access  Public (token verified here)
// ─────────────────────────────────────────────────────────────────────────────
const supabaseSync = async (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1].trim() : '';

  if (!token) {
    return res.status(401).json({ message: 'No Supabase token provided' });
  }

  // Verify Supabase JWT
  const { user: supabaseUser, error: tokenError } = await verifySupabaseToken(token);
  if (tokenError || !supabaseUser) {
    return res.status(401).json({ message: 'Invalid Supabase token: ' + (tokenError || 'unknown') });
  }

  const { id, email, user_metadata } = supabaseUser;
  const name =
    user_metadata?.full_name ||
    user_metadata?.name ||
    req.body?.name ||
    email.split('@')[0];
  const avatar = user_metadata?.avatar_url || user_metadata?.picture || '';

  try {
    // Upsert profile in Supabase profiles table
    const { data: profile, error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id,
          name,
          avatar,
          last_login_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        }
      )
      .select('id, name, avatar, role, status, status_reason, last_login_at')
      .single();

    if (upsertError) {
      console.error('Profile upsert error:', upsertError);
      return res.status(500).json({ message: 'Failed to sync user profile' });
    }

    // Check account status
    const status = normalizeStatus(profile.status);
    if (isBlockedAccountStatus(status)) {
      return res.status(403).json({
        message: getAccountStatusMessage({ status, reason: profile.status_reason }),
        status,
        reason: profile.status_reason || '',
      });
    }

    return res.status(200).json(buildUserResponse(profile, email, token));
  } catch (error) {
    console.error('Supabase Sync Error:', error);
    return res.status(500).json({ message: 'Server error during account sync' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Validate active session
// @route   GET /api/auth/session
// @access  Private (uses protect middleware → req.user is populated)
// ─────────────────────────────────────────────────────────────────────────────
const getSessionStatus = async (req, res) => {
  const status = normalizeStatus(req.user?.status);
  if (isBlockedAccountStatus(status)) {
    return res.status(403).json({
      message: getAccountStatusMessage({ status, reason: req.user?.status_reason }),
      status,
      reason: req.user?.status_reason || '',
    });
  }

  return res.status(200).json({
    _id: req.user.id,
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role,
    status,
    status_reason: req.user.status_reason || '',
    last_login_at: req.user.last_login_at,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current user (me)
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  return res.status(200).json({
    _id: req.user.id,
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role,
    status: req.user.status,
    status_reason: req.user.status_reason,
    last_login_at: req.user.last_login_at,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Social Login (Google via Firebase — kept for backward compat)
// @route   POST /api/auth/social-login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const socialLogin = async (req, res) => {
  const { name, email, avatar } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required for social login' });
  }

  try {
    // Look up the Supabase auth user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw new Error(listError.message);

    let supabaseUser = users.find((u) => u.email === email);

    if (!supabaseUser) {
      // Create the Supabase auth user
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: name || email.split('@')[0], avatar_url: avatar || '' },
      });
      if (createError) throw new Error(createError.message);
      supabaseUser = created.user;
    }

    // Upsert profile
    const { data: profile, error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: supabaseUser.id,
          name: name || supabaseUser.user_metadata?.full_name || email.split('@')[0],
          avatar: avatar || supabaseUser.user_metadata?.avatar_url || '',
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )
      .select('id, name, avatar, role, status, status_reason')
      .single();

    if (upsertError) throw new Error(upsertError.message);

    const status = normalizeStatus(profile.status);
    if (isBlockedAccountStatus(status)) {
      return res.status(403).json({
        message: getAccountStatusMessage({ status, reason: profile.status_reason }),
      });
    }

    // Create a short-lived session token for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    // Return profile (no Supabase session token for social via Firebase — frontend uses Firebase token)
    return res.status(200).json({
      _id: profile.id,
      id: profile.id,
      name: profile.name,
      email,
      avatar: profile.avatar,
      role: profile.role,
      status: profile.status,
    });
  } catch (error) {
    console.error('Social Login Error:', error);
    return res.status(500).json({ message: 'Server error during social login: ' + error.message });
  }
};

module.exports = {
  supabaseSync,
  getSessionStatus,
  getMe,
  socialLogin,
};
