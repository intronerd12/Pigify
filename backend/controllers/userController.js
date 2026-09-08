const { supabaseAdmin } = require('../config/supabase');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const { STATUS_REASON_CHOICES, normalizeStatus } = require('../utils/accountStatus');

// @desc    Get all users (from Supabase profiles table)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = (req.query.search || '').trim().toLowerCase();
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('profiles')
      .select('id, name, avatar, role, status, status_reason, last_login_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Get Users Error:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    // Get emails from Supabase auth — merge with profiles
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    const emailMap = {};
    if (!authError && authUsers) {
      authUsers.forEach((u) => { emailMap[u.id] = u.email; });
    }

    const users = (profiles || []).map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      email: emailMap[p.id] || '',
      avatar: p.avatar,
      role: p.role,
      status: p.status,
      status_reason: p.status_reason,
      last_login_at: p.last_login_at,
      createdAt: p.created_at,
    }));

    // Apply email search (can't do in Supabase query easily for auth users)
    const filtered = search
      ? users.filter((u) =>
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search)
        )
      : users;

    return res.json({
      users: filtered,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
      totalUsers: count || 0,
    });
  } catch (err) {
    console.error('Get Users Error:', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Update user (role, status, name, avatar)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch current profile
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    const has = (key) => Object.prototype.hasOwnProperty.call(req.body, key);
    const updates = {};

    if (has('name')) updates.name = req.body.name;
    if (has('role')) updates.role = req.body.role;
    if (has('avatar')) updates.avatar = req.body.avatar;

    if (has('status')) {
      const nextStatus = normalizeStatus(req.body.status);
      updates.status = nextStatus;

      if (nextStatus === 'active') {
        updates.status_reason = '';
      } else if (has('status_reason')) {
        const allowedReasons = STATUS_REASON_CHOICES[nextStatus] || [];
        const reason = String(req.body.status_reason || '').trim();

        if (!reason) {
          return res.status(400).json({ message: `Reason is required when status is ${nextStatus}` });
        }
        if (!allowedReasons.includes(reason)) {
          return res.status(400).json({ message: `Invalid reason for ${nextStatus} status`, allowedReasons });
        }
        updates.status_reason = reason;
      } else if (nextStatus !== 'active' && !currentProfile.status_reason) {
        return res.status(400).json({ message: `Reason is required when status is ${nextStatus}` });
      }
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('id, name, avatar, role, status, status_reason, last_login_at')
      .single();

    if (updateError) {
      console.error('Update User Error:', updateError);
      return res.status(500).json({ message: 'Failed to update user' });
    }

    // Also update email in auth if needed (name update in user_metadata)
    if (has('name')) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { full_name: req.body.name },
      }).catch(() => {});
    }

    return res.json({
      _id: updatedProfile.id,
      id: updatedProfile.id,
      name: updatedProfile.name,
      avatar: updatedProfile.avatar,
      role: updatedProfile.role,
      status: updatedProfile.status,
      status_reason: updatedProfile.status_reason,
      last_login_at: updatedProfile.last_login_at,
    });
  } catch (err) {
    console.error('Update User Error:', err);
    return res.status(500).json({ message: 'Failed to update user' });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/:id/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { id } = req.params;

    // Verify profile exists
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'pigify/avatars',
      width: 300,
      crop: 'scale',
    });

    // Remove local file
    fs.unlinkSync(req.file.path);

    // Update avatar in profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ avatar: result.secure_url })
      .eq('id', id)
      .select('id, name, avatar, role, status')
      .single();

    if (updateError) throw new Error(updateError.message);

    return res.json({
      _id: updatedProfile.id,
      name: updatedProfile.name,
      email: '',
      avatar: updatedProfile.avatar,
      role: updatedProfile.role,
      status: updatedProfile.status,
    });
  } catch (err) {
    console.error('Upload Avatar Error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  // Soft-disable only — actual deletion disabled for data safety
  return res.status(403).json({ message: 'User deletion is disabled. Use status=banned to restrict access.' });
};

module.exports = { getUsers, updateUser, uploadAvatar, deleteUser };
