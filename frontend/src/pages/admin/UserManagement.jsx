import React, { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Users,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Stethoscope,
  KeyRound,
  ShieldAlert,
  ArrowUpDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { supabase } from '../../utils/supabase';
import './Admin.css';

const statusReasonOptions = {
  inactive: [
    'Deactivated by administrator',
    'Requested by smallholder',
    'No recent pen activity',
    'Pending farm verification',
    'Temporary biosecurity hold',
  ],
  banned: [
    'Suspended by administrator',
    'Suspected fraudulent swine data',
    'Biosecurity protocol violation',
    'Harassment or abuse in community',
    'Unauthorized commercial advertising',
  ],
};

const roles = [
  { value: 'admin', label: 'System Admin', badgeClass: 'admin-badge-grade-b' },
  { value: 'user', label: 'Backyard Farmer', badgeClass: 'admin-badge-grade-a' },
  { value: 'veterinarian', label: 'Veterinary Officer', badgeClass: 'admin-badge-grade-c' },
  { value: 'moderator', label: 'Field Researcher', badgeClass: 'admin-badge-grade-d' },
];

/**
 * Robustly acquire the active authentication headers
 */
const getAuthHeaders = async () => {
  let token = '';

  // 1. Try Supabase Client session
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      token = data.session.access_token;
    }
  } catch (e) {
    // ignore
  }

  // 2. Try localStorage user item
  if (!token) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        token = parsed.token || parsed.supabaseToken || parsed.accessToken || '';
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Fallback: check sb-*-auth-token keys in localStorage
  if (!token) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const item = JSON.parse(localStorage.getItem(key));
          if (item?.access_token) {
            token = item.access_token;
            break;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [savingUserId, setSavingUserId] = useState(null);

  // Current logged in admin ID to prevent self-deletion
  const [currentAdminId, setCurrentAdminId] = useState('');

  // Modals state
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [disableModalUser, setDisableModalUser] = useState(null);
  const [disableStatusType, setDisableStatusType] = useState('inactive'); // 'inactive' or 'banned'
  const [disableReason, setDisableReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [disabling, setDisabling] = useState(false);

  // Get current user ID on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setCurrentAdminId(parsed.id || parsed._id || '');
      }
    } catch (e) {}

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setCurrentAdminId(data.user.id);
    });
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  // Fetch users from backend with token
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: query.trim(),
      });

      const res = await fetch(`${API_BASE_URL}/api/users?${params}`, {
        method: 'GET',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');

      setUsers(data.users || []);
      setTotal(data.totalUsers || 0);
    } catch (e) {
      console.error('loadUsers error:', e);
      setError(e?.message || 'Failed to load users');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadUsers();
    }, 300);
    return () => clearTimeout(handle);
  }, [query, page, loadUsers]);

  // Update user helper (role, status, reason)
  const handleUpdateUser = async (userId, patch, successMsg) => {
    setSavingUserId(userId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(patch),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user');

      setUsers((prev) => prev.map((u) => (u.id === userId || u._id === userId ? { ...u, ...data } : u)));
      toast.success(successMsg || 'Operator record updated successfully');
      return data;
    } catch (e) {
      toast.error(e?.message || 'Failed to update user');
      throw e;
    } finally {
      setSavingUserId(null);
    }
  };

  // Undisable / Re-enable login immediately
  const handleUndisableUser = async (user) => {
    try {
      await handleUpdateUser(
        user.id || user._id,
        { status: 'active', status_reason: '' },
        `Login access restored for ${user.name || user.email}`
      );
    } catch (e) {}
  };

  // Open disable modal
  const openDisableModal = (user, type = 'inactive') => {
    setDisableModalUser(user);
    setDisableStatusType(type);
    const presets = statusReasonOptions[type] || [];
    setDisableReason(presets[0] || '');
    setCustomReason('');
  };

  // Submit disable
  const submitDisable = async () => {
    if (!disableModalUser) return;
    setDisabling(true);
    const finalReason = customReason.trim() || disableReason;

    try {
      await handleUpdateUser(
        disableModalUser.id || disableModalUser._id,
        {
          status: disableStatusType,
          status_reason: finalReason,
        },
        `Account login disabled (${disableStatusType}) for ${disableModalUser.name || disableModalUser.email}`
      );
      setDisableModalUser(null);
    } catch (e) {
      // toast shown in handleUpdateUser
    } finally {
      setDisabling(false);
    }
  };

  // Change Role toggle (User <-> Admin)
  const toggleUserRole = async (user) => {
    const currentRole = (user.role || 'user').toLowerCase();
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    const label = nextRole === 'admin' ? 'System Administrator' : 'Backyard Farmer';

    try {
      await handleUpdateUser(
        user.id || user._id,
        { role: nextRole },
        `Role changed to ${label} for ${user.name || user.email}`
      );
    } catch (e) {}
  };

  // Handle User Deletion
  const confirmDeleteUser = async () => {
    if (!deleteModalUser) return;
    setDeleting(true);

    try {
      const targetId = deleteModalUser.id || deleteModalUser._id;
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/users/${targetId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user');

      toast.success(`User ${deleteModalUser.email || deleteModalUser.name} permanently deleted.`);
      setUsers((prev) => prev.filter((u) => u.id !== targetId && u._id !== targetId));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteModalUser(null);
    } catch (e) {
      toast.error(e?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // Filter users in view if role/status filter selected
  const displayedUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || (u.role || 'user').toLowerCase() === roleFilter;
      const matchesStatus = statusFilter === 'all' || (u.status || 'active').toLowerCase() === statusFilter;
      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  // Summary counts
  const stats = useMemo(() => {
    const activeCount = users.filter((u) => (u.status || 'active').toLowerCase() === 'active').length;
    const blockedCount = users.filter((u) => ['inactive', 'banned'].includes((u.status || '').toLowerCase())).length;
    const adminCount = users.filter((u) => (u.role || '').toLowerCase() === 'admin').length;
    return {
      total: total || users.length,
      active: activeCount,
      blocked: blockedCount,
      admins: adminCount,
    };
  }, [users, total]);

  const formatLastLogin = (iso) => {
    if (!iso) return 'Never logged in';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="admin-shell-page">
      {/* Hero Header */}
      <section className="admin-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="admin-hero-badge">OPERATOR DIRECTORY</span>
            <span className="admin-meta-tag">
              <span className="telemetry-pulse" />
              SUPABASE AUTH & PROFILES REGISTRY
            </span>
          </div>
          <h1 className="admin-hero-title">
            <Users size={28} color="#34d399" />
            Farm Operators & Veterinary Directory
          </h1>
          <p className="admin-hero-sub">
            Manage smallholder swine raisers, attending veterinary officers, biosecurity researchers, and system administrators with live Supabase database synchronization.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="admin-btn-secondary"
          style={{ alignSelf: 'flex-start' }}
          title="Refresh operator list from Supabase"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Sync Registry
        </button>
      </section>

      {/* KPI Overview Grid */}
      <div className="admin-kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Registered In Supabase</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="admin-kpi-val">{stats.total}</div>
          <div className="admin-kpi-sub">Total smallholder & admin accounts</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Login Enabled (Active)</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <UserCheck size={22} />
            </div>
          </div>
          <div className="admin-kpi-val" style={{ color: '#34d399' }}>{stats.active}</div>
          <div className="admin-kpi-sub">Authorized for app & telemetry upload</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Login Disabled / Suspended</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <UserX size={22} />
            </div>
          </div>
          <div className="admin-kpi-val" style={{ color: stats.blocked > 0 ? '#fb7185' : '#94a3b8' }}>
            {stats.blocked}
          </div>
          <div className="admin-kpi-sub">Blocked from logging into Pigify</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">System Administrators</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Shield size={22} />
            </div>
          </div>
          <div className="admin-kpi-val" style={{ color: '#a78bfa' }}>{stats.admins}</div>
          <div className="admin-kpi-sub">Full access to telemetry command center</div>
        </div>
      </div>

      {/* Error notification banner if any */}
      {error && (
        <div style={{
          marginBottom: '20px',
          backgroundColor: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          color: '#fb7185',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button
            onClick={loadUsers}
            className="admin-btn-secondary"
            style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.78rem' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filter / Search Bar */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--admin-border-subtle)',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: 'rgba(14, 23, 42, 0.7)'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }}
            />
            <input
              type="text"
              placeholder="Search by farm operator name, email, or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                border: '1px solid var(--admin-border-subtle)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                outline: 'none',
                fontSize: '0.88rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--admin-border-subtle)',
                backgroundColor: '#15223c',
                color: '#cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">System Admin</option>
              <option value="user">Backyard Farmer</option>
              <option value="veterinarian">Veterinary Officer</option>
              <option value="moderator">Field Researcher</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Login Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--admin-border-subtle)',
                backgroundColor: '#15223c',
                color: '#cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Login Allowed)</option>
              <option value="inactive">Deactivated (Disabled)</option>
              <option value="banned">Suspended (Blocked)</option>
            </select>
          </div>
        </div>

        {/* Telemetry Table */}
        <div className="admin-table-shell" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Operator & Identity</th>
                <th>Role & Access</th>
                <th>Login Access & Status</th>
                <th>Status Reason</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => {
                const userId = user.id || user._id;
                const isSelf = currentAdminId && userId === currentAdminId;
                const currentStatus = (user.status || 'active').toLowerCase();
                const isBlocked = ['inactive', 'banned'].includes(currentStatus);
                const currentRole = (user.role || 'user').toLowerCase();
                const isUserAdmin = currentRole === 'admin';
                const isSaving = savingUserId === userId;

                return (
                  <tr key={userId} style={{ opacity: isSaving ? 0.6 : 1 }}>
                    {/* Operator & Identity */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: isUserAdmin ? 'rgba(139, 92, 246, 0.2)' : '#15223c',
                          border: `1px solid ${isUserAdmin ? 'rgba(139, 92, 246, 0.4)' : 'var(--admin-border-strong)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isUserAdmin ? '#c084fc' : '#34d399',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          flexShrink: 0
                        }}>
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
                            />
                          ) : (
                            (user.name || user.email || 'U').toString().charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.92rem' }}>
                              {user.name || 'Backyard Raiser'}
                            </span>
                            {isSelf && (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: '#34d399',
                                fontWeight: 700
                              }}>
                                YOU
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {user.email || 'No email registered'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'var(--admin-font-mono)', marginTop: '2px' }}>
                            ID: {userId.substring(0, 12)}…
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Access (Change role between admin and user) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={currentRole}
                            onChange={(e) => handleUpdateUser(userId, { role: e.target.value }, `Role updated to ${e.target.value}`)}
                            disabled={isSaving}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '7px',
                              border: '1px solid var(--admin-border-subtle)',
                              backgroundColor: '#15223c',
                              color: isUserAdmin ? '#c084fc' : '#34d399',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            {roles.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quick role toggle button: user <-> admin */}
                        <div>
                          <button
                            onClick={() => toggleUserRole(user)}
                            disabled={isSaving}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isUserAdmin ? '#fb923c' : '#a78bfa',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '2px 0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'underline'
                            }}
                            title={isUserAdmin ? 'Demote admin to user' : 'Promote user to administrator'}
                          >
                            <ArrowUpDown size={12} />
                            {isUserAdmin ? 'Demote to User' : 'Make Admin'}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Login Access & Status (Disable / Undisable) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className={
                              currentStatus === 'active'
                                ? 'admin-badge-grade-a'
                                : currentStatus === 'inactive'
                                ? 'admin-badge-grade-c'
                                : 'admin-badge-grade-e'
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}
                          >
                            {currentStatus === 'active' ? (
                              <>
                                <span className="telemetry-pulse" style={{ width: '6px', height: '6px' }} />
                                Active
                              </>
                            ) : currentStatus === 'inactive' ? (
                              'Deactivated'
                            ) : (
                              'Suspended'
                            )}
                          </span>

                          {/* Instant Undisable / Enable Login button */}
                          {isBlocked ? (
                            <button
                              onClick={() => handleUndisableUser(user)}
                              disabled={isSaving}
                              className="admin-btn-success"
                              style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: '6px' }}
                              title="Enable login access for this operator"
                            >
                              <Unlock size={12} />
                              Undisable Login
                            </button>
                          ) : (
                            <button
                              onClick={() => openDisableModal(user, 'inactive')}
                              disabled={isSaving || isSelf}
                              style={{
                                background: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                color: '#fb7185',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={isSelf ? 'Cannot disable your own active account' : 'Disable operator from logging in'}
                            >
                              <Lock size={12} />
                              Disable Login
                            </button>
                          )}
                        </div>

                        {/* Status dropdown fallback */}
                        <div>
                          <select
                            value={currentStatus}
                            onChange={(e) => {
                              const nextStatus = e.target.value;
                              if (nextStatus === 'active') {
                                handleUndisableUser(user);
                              } else {
                                openDisableModal(user, nextStatus);
                              }
                            }}
                            disabled={isSaving || (isSelf && currentStatus === 'active')}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '5px',
                              border: '1px solid var(--admin-border-subtle)',
                              backgroundColor: 'rgba(0, 0, 0, 0.25)',
                              color: '#94a3b8',
                              fontSize: '0.74rem',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="active">Status: Active</option>
                            <option value="inactive">Status: Deactivated</option>
                            <option value="banned">Status: Suspended</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Status Reason */}
                    <td>
                      {currentStatus === 'active' ? (
                        <span style={{ color: '#64748b', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={13} color="#10b981" />
                          Normal Operation
                        </span>
                      ) : (
                        <div style={{ maxWidth: '240px' }}>
                          <span style={{
                            color: currentStatus === 'banned' ? '#fb7185' : '#fbbf24',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'block'
                          }}>
                            {user.status_reason || (currentStatus === 'banned' ? 'Suspended by admin' : 'Deactivated by admin')}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Last Active */}
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontFamily: 'var(--admin-font-mono)' }}>
                        {formatLastLogin(user.last_login_at || user.createdAt)}
                      </span>
                    </td>

                    {/* Actions: Delete Operator */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setDeleteModalUser(user)}
                          disabled={isSaving || isSelf}
                          className="admin-icon-btn danger"
                          title={isSelf ? 'Cannot delete your own logged-in account' : 'Permanently delete this user/admin'}
                          style={{ opacity: isSelf ? 0.35 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '44px 20px', color: '#64748b', textAlign: 'center' }}>
                    <div style={{ marginBottom: '8px', color: '#94a3b8', fontWeight: 600 }}>
                      No registered smallholder farm operators match current filters.
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      Try adjusting your search keywords or role/status filters above.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--admin-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#64748b',
          fontSize: '0.82rem',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            {loading
              ? 'Synchronizing registry with Supabase...'
              : `Showing ${displayedUsers.length} of ${total} registered operators`}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="admin-btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              Previous
            </button>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 12px',
              height: '30px',
              borderRadius: '6px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="admin-btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL: DISABLE LOGIN ────────────────────────────────────────── */}
      {disableModalUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <Lock size={18} color="#fb7185" />
                Disable Operator Login Access
              </h3>
              <button
                onClick={() => setDisableModalUser(null)}
                className="admin-icon-btn"
                style={{ padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}>
                You are about to block <strong>{disableModalUser.name || disableModalUser.email}</strong> from logging into Pigify. Their active session will be invalidated immediately.
              </p>

              {/* Status Type Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                  Restriction Severity:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${disableStatusType === 'inactive' ? '#f59e0b' : 'var(--admin-border-subtle)'}`,
                    backgroundColor: disableStatusType === 'inactive' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '0.85rem'
                  }}>
                    <input
                      type="radio"
                      name="disableStatus"
                      value="inactive"
                      checked={disableStatusType === 'inactive'}
                      onChange={() => {
                        setDisableStatusType('inactive');
                        setDisableReason(statusReasonOptions.inactive[0]);
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fbbf24' }}>Deactivate</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Temporary hold (can be re-enabled)</div>
                    </div>
                  </label>

                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${disableStatusType === 'banned' ? '#f43f5e' : 'var(--admin-border-subtle)'}`,
                    backgroundColor: disableStatusType === 'banned' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '0.85rem'
                  }}>
                    <input
                      type="radio"
                      name="disableStatus"
                      value="banned"
                      checked={disableStatusType === 'banned'}
                      onChange={() => {
                        setDisableStatusType('banned');
                        setDisableReason(statusReasonOptions.banned[0]);
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fb7185' }}>Suspend</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Biosecurity or fraud violation</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preset Reason Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                  Select Reason:
                </label>
                <select
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--admin-border-subtle)',
                    backgroundColor: '#15223c',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  {(statusReasonOptions[disableStatusType] || []).map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Reason Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                  Or Custom Administrative Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Under observation for Pen #4 swine pox quarantine..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--admin-border-subtle)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                onClick={() => setDisableModalUser(null)}
                className="admin-btn-secondary"
                disabled={disabling}
              >
                Cancel
              </button>
              <button
                onClick={submitDisable}
                className="admin-btn-danger"
                disabled={disabling}
              >
                {disabling ? 'Applying Restriction...' : 'Confirm & Disable Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE USER / ADMIN ──────────────────────────────────── */}
      {deleteModalUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
              <h3 className="admin-modal-title" style={{ color: '#fb7185' }}>
                <AlertTriangle size={20} color="#fb7185" />
                Confirm Permanent Account Deletion
              </h3>
              <button
                onClick={() => setDeleteModalUser(null)}
                className="admin-icon-btn"
                style={{ padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '14px 16px',
                borderRadius: '10px',
                marginBottom: '16px',
                color: '#fecdd3',
                fontSize: '0.86rem',
                lineHeight: 1.5
              }}>
                <strong>Warning:</strong> This will permanently delete the operator account from both <strong>Supabase Auth</strong> and the <strong>Pigify Database</strong>. This action cannot be undone.
              </div>

              <div style={{
                padding: '14px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border-subtle)',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Target Operator Details:
                </div>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                  {deleteModalUser.name || 'Unnamed Operator'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                  Email: {deleteModalUser.email || '-'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                  Role: <span style={{ textTransform: 'capitalize', color: '#c084fc' }}>{deleteModalUser.role || 'User'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--admin-font-mono)', marginTop: '4px' }}>
                  ID: {deleteModalUser.id || deleteModalUser._id}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="admin-btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="admin-btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting Account...' : 'Permanently Delete Operator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
