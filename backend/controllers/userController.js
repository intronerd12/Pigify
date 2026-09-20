const { supabaseAdmin } = require('../config/supabase');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const { pool } = require('../config/postgres');
const { normalizeStatus } = require('../utils/accountStatus');

// @desc    Get all users (registered in Supabase auth + profiles table)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const search = (req.query.search || '').trim();
    const offset = (page - 1) * limit;

    // Direct Postgres pool query ensures 100% of registered auth.users are fetched
    if (pool) {
      try {
        // 1. Auto-sync any users in auth.users that don't have a profile yet
        await pool.query(`
          INSERT INTO public.profiles (id, name, avatar, role, status)
          SELECT 
            u.id, 
            COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Backyard Raiser'),
            COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
            CASE WHEN u.email = 'admin@pigify.com' THEN 'admin' ELSE 'user' END,
            'active'
          FROM auth.users u
          LEFT JOIN public.profiles p ON u.id = p.id
          WHERE p.id IS NULL
          ON CONFLICT (id) DO NOTHING;
        `);

        // 2. Count total users matching search
        const countRes = await pool.query(`
          SELECT COUNT(*) 
          FROM auth.users u
          LEFT JOIN public.profiles p ON u.id = p.id
          WHERE ($1::text IS NULL OR $1 = '' OR p.name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
        `, [search]);

        const totalUsers = parseInt(countRes.rows[0]?.count || 0, 10);

        // 3. Fetch paginated users
        const rowsRes = await pool.query(`
          SELECT 
            u.id,
            u.email,
            COALESCE(p.name, u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Backyard Raiser') AS name,
            COALESCE(p.avatar, u.raw_user_meta_data->>'avatar_url', '') AS avatar,
            COALESCE(p.role, 'user') AS role,
            COALESCE(p.status, 'active') AS status,
            COALESCE(p.status_reason, '') AS status_reason,
            COALESCE(p.last_login_at, u.last_sign_in_at) AS last_login_at,
            COALESCE(p.created_at, u.created_at) AS created_at
          FROM auth.users u
          LEFT JOIN public.profiles p ON u.id = p.id
          WHERE ($1::text IS NULL OR $1 = '' OR p.name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
          ORDER BY COALESCE(p.created_at, u.created_at) DESC
          LIMIT $2 OFFSET $3
        `, [search, limit, offset]);

        const users = rowsRes.rows.map((p) => ({
          _id: p.id,
          id: p.id,
          name: p.name,
          email: p.email || '',
          avatar: p.avatar,
          role: p.role,
          status: p.status,
          status_reason: p.status_reason,
          last_login_at: p.last_login_at,
          createdAt: p.created_at,
        }));

        return res.json({
          users,
          totalPages: Math.ceil(totalUsers / limit) || 1,
          currentPage: page,
          totalUsers,
        });
      } catch (poolErr) {
        console.error('Postgres pool query error, falling back to Supabase PostgREST:', poolErr);
      }
    }

    // Fallback if pool query fails:
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

    const users = (profiles || []).map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      email: '',
      avatar: p.avatar,
      role: p.role,
      status: p.status,
      status_reason: p.status_reason,
      last_login_at: p.last_login_at,
      createdAt: p.created_at,
    }));

    return res.json({
      users,
      totalPages: Math.ceil((count || 0) / limit) || 1,
      currentPage: page,
      totalUsers: count || 0,
    });
  } catch (err) {
    console.error('Get Users Error:', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Update user (role, status, status_reason, name, avatar)
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

    if (has('name')) updates.name = String(req.body.name).trim();
    if (has('role')) {
      const allowedRoles = ['admin', 'user', 'veterinarian', 'moderator', 'viewer'];
      const nextRole = String(req.body.role || '').toLowerCase();
      if (allowedRoles.includes(nextRole)) {
        updates.role = nextRole;
      }
    }
    if (has('avatar')) updates.avatar = req.body.avatar;

    if (has('status')) {
      const nextStatus = normalizeStatus(req.body.status);
      updates.status = nextStatus;

      if (nextStatus === 'active') {
        updates.status_reason = '';
      } else {
        const defaultReason = nextStatus === 'banned' ? 'Suspended by administrator' : 'Deactivated by administrator';
        const reason = String(req.body.status_reason || '').trim() || currentProfile.status_reason || defaultReason;
        updates.status_reason = reason;
      }
    } else if (has('status_reason')) {
      updates.status_reason = String(req.body.status_reason || '').trim();
    }

    // Direct Postgres update for maximum reliability
    if (pool) {
      try {
        const fields = [];
        const values = [];
        let idx = 1;
        for (const [col, val] of Object.entries(updates)) {
          fields.push(`${col} = $${idx}`);
          values.push(val);
          idx++;
        }
        if (fields.length > 0) {
          values.push(id);
          await pool.query(
            `UPDATE public.profiles SET ${fields.join(', ')} WHERE id = $${idx}`,
            values
          );
        }
      } catch (poolErr) {
        console.error('Postgres pool update error:', poolErr);
      }
    }

    // Also update via Supabase Admin PostgREST
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

    // Also update full_name in auth user_metadata if name changed
    if (has('name') && pool) {
      try {
        await pool.query(
          `UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{full_name}', to_jsonb($1::text)) WHERE id = $2`,
          [req.body.name, id]
        );
      } catch (e) {}
    }

    // Fetch user email
    let email = '';
    if (pool) {
      try {
        const uRes = await pool.query('SELECT email FROM auth.users WHERE id = $1', [id]);
        email = uRes.rows[0]?.email || '';
      } catch (e) {}
    }

    return res.json({
      _id: updatedProfile.id,
      id: updatedProfile.id,
      name: updatedProfile.name,
      email,
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

// @desc    Delete user or admin
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from accidentally deleting their own logged-in account
    if (req.user && (req.user.id === id || req.user._id === id)) {
      return res.status(400).json({
        message: 'You cannot delete your own active administrator account. Ask another administrator or use a different account.',
      });
    }

    // Delete from auth.users (cascades automatically to public.profiles, sessions, identities)
    if (pool) {
      try {
        await pool.query('DELETE FROM auth.users WHERE id = $1', [id]);
        await pool.query('DELETE FROM public.profiles WHERE id = $1', [id]);
      } catch (poolErr) {
        console.error('Postgres pool delete error:', poolErr);
      }
    }

    // Also call supabaseAdmin to ensure consistency
    try {
      await supabaseAdmin.from('profiles').delete().eq('id', id);
    } catch (e) {}

    return res.json({
      success: true,
      message: 'User account permanently deleted from database',
      id,
    });
  } catch (err) {
    console.error('Delete User Error:', err);
    return res.status(500).json({ message: 'Failed to delete user: ' + err.message });
  }
};

module.exports = { getUsers, updateUser, uploadAvatar, deleteUser };
