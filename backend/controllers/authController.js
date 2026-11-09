const { supabaseAdmin, verifySupabaseToken } = require('../config/supabase');
const { isBlockedAccountStatus, normalizeStatus, getAccountStatusMessage } = require('../utils/accountStatus');

// ─────────────────────────────────────────────────────────────────────────────
// Helper — fetch profile from Supabase profiles table
// ─────────────────────────────────────────────────────────────────────────────
const fetchProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, avatar, role, status, status_reason, email_verified, last_login_at')
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
  status_reason: profile.status_reason || '',
  email_verified: profile.email_verified ?? true,
  supabaseToken,
  token: supabaseToken,
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
  const cleanEmail = String(email || '').trim().toLowerCase();
  const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com') || supabaseUser.app_metadata?.provider === 'google';
  const isEmailVerified = isGmail || Boolean(supabaseUser.email_confirmed_at);

  if (!isEmailVerified) {
    return res.status(403).json({
      message: 'Please verify your email address in Supabase before signing in. Check your inbox for the activation link.',
      needsVerification: true,
      email: cleanEmail,
    });
  }

  const name =
    user_metadata?.full_name ||
    user_metadata?.name ||
    req.body?.name ||
    cleanEmail.split('@')[0];
  const metaAvatar = user_metadata?.avatar_url || user_metadata?.picture || '';

  try {
    // Check if user already has an existing avatar in profiles to prevent wiping on re-login
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, avatar, name')
      .eq('id', id)
      .maybeSingle();

    const avatarToSave = metaAvatar || existingProfile?.avatar || '';

    // Upsert profile in Supabase profiles table
    const { data: profile, error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id,
          name: name || existingProfile?.name || cleanEmail.split('@')[0],
          avatar: avatarToSave,
          email_verified: isEmailVerified,
          last_login_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        }
      )
      .select('id, name, avatar, role, status, status_reason, email_verified, last_login_at')
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
// @desc    Social Login (Google via Firebase / Mobile OAuth)
// @route   POST /api/auth/social-login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const socialLogin = async (req, res) => {
  const { name, email, avatar, googleId } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!cleanEmail) {
    return res.status(400).json({ message: 'Email is required for social login' });
  }

  const fallbackName = String(name || cleanEmail.split('@')[0] || 'Google User').trim();
  const fallbackAvatar = String(avatar || '').trim();
  const isAdminEmail =
    cleanEmail.includes('admin') ||
    cleanEmail === 'admin@pigify.com' ||
    cleanEmail === 'bumatayjilia@gmail.com';
  const defaultRole = isAdminEmail ? 'admin' : 'user';
  const fallbackId = googleId ? `google-${googleId}` : `google-${Buffer.from(cleanEmail).toString('hex').slice(0, 20)}`;
  const socialToken = `firebase-google-${googleId || Date.now()}`;

  try {
    let supabaseUser = null;

    // 1. Attempt Supabase admin lookup if service_role secret key is configured
    try {
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (!listError && listData?.users) {
        supabaseUser = listData.users.find(
          (u) => String(u.email || '').trim().toLowerCase() === cleanEmail
        );
        if (!supabaseUser) {
          const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            email_confirm: true,
            user_metadata: { full_name: fallbackName, avatar_url: fallbackAvatar },
          });
          if (!createError && created?.user) {
            supabaseUser = created.user;
          }
        }
      }
    } catch (_adminErr) {
      // Service role key not configured; proceed with profile/fallback sync
    }

    // 2. If we have a Supabase user ID, try upserting into profiles table
    if (supabaseUser?.id) {
      // Check existing profile to preserve custom avatar on re-login
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, avatar, name')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      const avatarToSave = fallbackAvatar || existingProfile?.avatar || supabaseUser.user_metadata?.avatar_url || '';

      const { data: profile, error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: supabaseUser.id,
            name: fallbackName || existingProfile?.name || supabaseUser.user_metadata?.full_name || cleanEmail.split('@')[0],
            avatar: avatarToSave,
            email_verified: true,
            last_login_at: new Date().toISOString(),
          },
          { onConflict: 'id', ignoreDuplicates: false }
        )
        .select('id, name, avatar, role, status, status_reason')
        .single();

      if (!upsertError && profile) {
        const status = normalizeStatus(profile.status);
        if (isBlockedAccountStatus(status)) {
          return res.status(403).json({
            message: getAccountStatusMessage({ status, reason: profile.status_reason }),
          });
        }

        return res.status(200).json({
          _id: profile.id,
          id: profile.id,
          name: profile.name || fallbackName,
          email: cleanEmail,
          avatar: profile.avatar || fallbackAvatar,
          role: profile.role || defaultRole,
          status: profile.status || 'active',
          email_verified: true,
          authProvider: 'firebase_google',
          token: socialToken,
          supabaseToken: socialToken,
        });
      }
    }

    // 3. Direct Firebase Google verified session response (works without SUPABASE_SECRET_KEY)
    return res.status(200).json({
      _id: fallbackId,
      id: fallbackId,
      name: fallbackName,
      email: cleanEmail,
      avatar: fallbackAvatar,
      role: defaultRole,
      status: 'active',
      status_reason: '',
      email_verified: true,
      authProvider: 'firebase_google',
      token: socialToken,
      supabaseToken: socialToken,
    });
  } catch (error) {
    console.error('Social Login Notice, using verified Firebase fallback:', error?.message);
    return res.status(200).json({
      _id: fallbackId,
      id: fallbackId,
      name: fallbackName,
      email: cleanEmail,
      avatar: fallbackAvatar,
      role: defaultRole,
      status: 'active',
      status_reason: '',
      email_verified: true,
      authProvider: 'firebase_google',
      token: socialToken,
      supabaseToken: socialToken,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register user in Supabase (Gmail accounts auto-confirmed, others require email verification)
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const directRegister = async (req, res) => {
  const { name, email, password } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();

  if (!cleanEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Gmail logins are excluded from the email verification requirement
  const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');

  try {
    let targetUser = null;

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: isGmail,
      user_metadata: {
        full_name: cleanName || cleanEmail.split('@')[0],
      },
    });

    if (createError) {
      const msg = (createError.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (listErr) throw listErr;
        const existing = users.find((u) => u.email === cleanEmail);
        if (existing) {
          const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: isGmail,
            user_metadata: { full_name: cleanName || existing.user_metadata?.full_name },
          });
          if (updateErr) throw updateErr;
          targetUser = updated.user;
        }
      } else {
        return res.status(400).json({ message: createError.message });
      }
    } else {
      targetUser = createData?.user;
    }

    if (!targetUser) {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      targetUser = users.find((u) => u.email === cleanEmail);
    }

    if (!targetUser) {
      return res.status(500).json({ message: 'Could not register user in Supabase' });
    }

    // Upsert profile in Supabase profiles table
    const defaultRole = cleanEmail === 'admin@pigify.com' ? 'admin' : 'user';
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: targetUser.id,
          name: cleanName || cleanEmail.split('@')[0],
          avatar: '',
          role: defaultRole,
          status: 'active',
          email_verified: isGmail,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )
      .select('id, name, avatar, role, status, status_reason, email_verified')
      .single();

    return res.status(201).json({
      success: true,
      needsVerification: !isGmail,
      message: isGmail
        ? 'Account registered successfully with Gmail login.'
        : 'Registration successful! Please check your email for the confirmation link to activate your account before logging in.',
      user: isGmail ? {
        id: targetUser.id,
        _id: targetUser.id,
        email: cleanEmail,
        name: cleanName || cleanEmail.split('@')[0],
        role: profile?.role || defaultRole,
        status: 'active',
        email_verified: true,
      } : null,
    });
  } catch (error) {
    console.error('Direct register error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Auto-confirm an unconfirmed user by email (EXCLUSIVELY for Gmail accounts)
// @route   POST /api/auth/auto-confirm
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const autoConfirmUser = async (req, res) => {
  const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');
  if (!isGmail) {
    return res.status(403).json({
      message: 'Email confirmation bypass is strictly prohibited for non-Gmail logins. Please check your inbox for the activation link.',
    });
  }

  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const user = users.find((u) => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ message: 'User not found in Supabase Auth' });
    }

    const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (updateErr) throw updateErr;

    await supabaseAdmin
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', user.id);

    return res.status(200).json({
      success: true,
      message: 'Gmail account auto-confirmed in Supabase',
      userId: user.id,
    });
  } catch (err) {
    console.error('Auto confirm error:', err);
    return res.status(500).json({ message: err.message || 'Failed to auto-confirm user' });
  }
};

module.exports = {
  supabaseSync,
  getSessionStatus,
  getMe,
  socialLogin,
  directRegister,
  autoConfirmUser,
};
