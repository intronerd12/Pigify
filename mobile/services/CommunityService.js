import { Platform } from 'react-native';
import { apiFetch } from './api';

const safeReadJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const normalizeText = (value) => {
  const text = String(value ?? '').trim();
  return text.length ? text : '';
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeImageUrl = (value) => {
  const text = normalizeText(value);
  return text || undefined;
};

const isRemoteUrl = (value) => /^https?:\/\//i.test(String(value || '').trim());

const getUploadMeta = (imageUri) => {
  const uriStr = String(imageUri || '');
  const cleanUri = uriStr.split('?')[0];
  const extRaw = cleanUri.includes('.') ? cleanUri.split('.').pop() : '';
  const ext = String(extRaw || '').toLowerCase();
  const mime =
    ext === 'png'
      ? 'image/png'
      : ext === 'webp'
        ? 'image/webp'
        : 'image/jpeg';
  const fileName = ext === 'png' || ext === 'webp' ? `community_scan.${ext}` : 'community_scan.jpg';
  return { mime, fileName };
};

const uploadScanImage = async (imageUri) => {
  const cleanUri = normalizeText(imageUri);
  if (!cleanUri) return null;

  // 1. Direct Cloudinary Upload (Global HTTPS, zero local server dependency)
  try {
    const { uploadCommunityScanImageToCloudinary: directUpload } = require('./cloudinary');
    const directRes = await directUpload(cleanUri);
    if (directRes?.secure_url) {
      return {
        imageUrl: directRes.secure_url,
        secure_url: directRes.secure_url,
        publicId: directRes.public_id,
      };
    }
  } catch (cErr) {
    console.warn('[CommunityService] Direct Cloudinary upload notice, trying fallback:', cErr?.message || cErr);
  }

  const { mime, fileName } = getUploadMeta(cleanUri);
  try {
    const { uriToBase64DataUrl } = require('./api');
    const base64DataUrl = await uriToBase64DataUrl(cleanUri, mime);
    if (base64DataUrl) {
      const res = await apiFetch(
        '/api/community/upload-scan-image',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64DataUrl }),
        },
        15000
      );
      const data = await safeReadJson(res);
      if (res.ok && data?.imageUrl) {
        return data;
      }
    }
  } catch {}

  const formData = new FormData();
  if (Platform.OS === 'web') {
    const res = await fetch(cleanUri);
    const blob = await res.blob();
    formData.append('image', blob, fileName);
  } else {
    formData.append('image', {
      uri: cleanUri,
      name: fileName,
      type: mime,
    });
  }

  const res = await apiFetch(
    '/api/community/upload-scan-image',
    {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    },
    15000
  );

  const data = await safeReadJson(res);
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to upload scan image');
  }
  return data;
};

const getUserMeta = (user) => {
  const userId = user?._id || user?.id || user?.userId || user?.uid || undefined;
  const authorName = normalizeText(user?.name || user?.fullName || user?.username) || 'Anonymous User';
  const authorEmail = normalizeText(user?.email).toLowerCase() || undefined;
  const authorAvatar = normalizeText(user?.avatar || user?.photoURL) || undefined;

  return {
    userId: userId ? String(userId) : undefined,
    authorName,
    authorEmail,
    authorAvatar,
    avatar: authorAvatar,
  };
};

const buildScanSnapshot = (scan) => {
  if (!scan || typeof scan !== 'object') return undefined;
  return {
    localScanId: normalizeText(scan.id || scan._id || scan.localScanId),
    condition: normalizeText(scan.condition || scan.details || scan.issue || 'Swine Dermis Inspection'),
    severity: normalizeText(scan.severity || scan.grade || 'Tier A').toUpperCase(),
    penId: normalizeText(scan.penId || 'Backyard Pen'),
    swineId: normalizeText(scan.swineId || 'Swine'),
    confidence: normalizeText(scan.confidence || '96.8%'),
    grade: normalizeText(scan.grade || scan.severity || 'A').toUpperCase(),
    notes: normalizeText(scan.notes || scan.recommendation || scan.details || 'Shared diagnostic scan'),
    scanTimestamp: scan.timestamp || scan.createdAt || new Date().toISOString(),
    imageUrl: normalizeImageUrl(scan.imageUri || scan.imageUrl),
  };
};

export const CommunityService = {
  getPosts: async ({ limit = 60 } = {}) => {
    const ts = new Date().getTime();
    try {
      const res = await apiFetch(`/api/community?limit=${encodeURIComponent(String(limit))}&_t=${ts}`, {
        method: 'GET',
        headers: { 
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      const data = await safeReadJson(res);
      if (res.ok && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (apiErr) {
      console.warn('[CommunityService] Backend apiFetch failed, trying direct Supabase query:', apiErr?.message || apiErr);
    }

    // Direct Supabase fallback so mobile always sees posts
    try {
      const { supabase } = require('./supabase');
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, community_comments(*), community_reactions(*)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((raw) => ({
          _id: String(raw.id),
          id: String(raw.id),
          user: raw.user_id,
          userId: raw.user_id,
          authorName: raw.author_name || 'Backyard Swine Farmer',
          authorEmail: raw.author_email || '',
          authorAvatar: raw.author_avatar || raw.scan_snapshot?.authorAvatar || '',
          text: raw.text || '',
          source: raw.source || 'mobile_app',
          scanSnapshot: raw.scan_snapshot,
          comments: raw.community_comments || [],
          reactions: raw.community_reactions || [],
          createdAt: raw.created_at,
          created_at: raw.created_at,
        }));
      }
    } catch (supaErr) {
      console.warn('[CommunityService] Direct Supabase query failed:', supaErr?.message || supaErr);
    }

    return [];
  },

  createPost: async ({ user, text, scan } = {}) => {
    const userMeta = getUserMeta(user);
    const scanSnapshot = buildScanSnapshot(scan);

    if (scanSnapshot && userMeta.authorAvatar) {
      scanSnapshot.authorAvatar = userMeta.authorAvatar;
    }

    if (scanSnapshot?.imageUrl && !isRemoteUrl(scanSnapshot.imageUrl)) {
      try {
        const uploaded = await uploadScanImage(scanSnapshot.imageUrl);
        if (uploaded?.imageUrl) {
          scanSnapshot.imageUrl = uploaded.imageUrl;
        }
      } catch (error) {
        console.warn('[community] scan image upload failed, continuing with local URI:', error?.message || error);
      }
    }

    const payload = {
      ...userMeta,
      text: normalizeText(text),
      source: 'mobile_app',
      scanSnapshot,
    };

    if (!payload.text && !payload.scanSnapshot) {
      throw new Error('Add text or select a scan result before posting.');
    }

    try {
      const res = await apiFetch('/api/community', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);
      if (res.ok && data) {
        return data;
      }
    } catch (apiErr) {
      console.warn('[CommunityService] apiFetch createPost failed, trying direct Supabase insert:', apiErr?.message || apiErr);
    }

    // Direct Supabase fallback
    try {
      const { supabase } = require('./supabase');
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          author_name: payload.authorName,
          author_email: payload.authorEmail,
          text: payload.text,
          source: 'mobile_app',
          scan_snapshot: payload.scanSnapshot,
          user_id: payload.userId,
        })
        .select('*, community_comments(*), community_reactions(*)')
        .single();

      if (!error && data) {
        return {
          _id: String(data.id),
          id: String(data.id),
          authorName: data.author_name,
          authorEmail: data.author_email,
          authorAvatar: payload.authorAvatar || '',
          text: data.text,
          source: data.source,
          scanSnapshot: data.scan_snapshot,
          comments: [],
          reactions: [],
          createdAt: data.created_at,
        };
      }
    } catch (supaErr) {
      console.warn('[CommunityService] Direct Supabase createPost failed:', supaErr?.message || supaErr);
    }

    throw new Error('Failed to create community post. Please check connection and try again.');
  },

  addComment: async ({ user, postId, text } = {}) => {
    const cleanPostId = normalizeText(postId);
    const cleanText = normalizeText(text);
    if (!cleanPostId) {
      throw new Error('postId is required');
    }
    if (!cleanText) {
      throw new Error('Comment text is required');
    }

    const userMeta = getUserMeta(user);
    const payload = {
      userId: userMeta.userId,
      commenterName: userMeta.authorName,
      commenterEmail: userMeta.authorEmail,
      commenterAvatar: userMeta.authorAvatar,
      text: cleanText,
    };

    const res = await apiFetch(`/api/community/${encodeURIComponent(cleanPostId)}/comments`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await safeReadJson(res);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to add comment');
    }
    return data;
  },

  toggleReaction: async ({ user, postId, type } = {}) => {
    const cleanPostId = normalizeText(postId);
    if (!cleanPostId) {
      throw new Error('postId is required');
    }
    if (!['heart', 'like'].includes(type)) {
      throw new Error('Invalid reaction type');
    }

    const userMeta = getUserMeta(user);
    const payload = {
      userId: userMeta.userId,
      reactorName: userMeta.authorName,
      reactorEmail: userMeta.authorEmail,
      type,
    };

    const res = await apiFetch(`/api/community/${encodeURIComponent(cleanPostId)}/reactions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await safeReadJson(res);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to toggle reaction');
    }
    return data;
  },

  deletePost: async ({ user, postId } = {}) => {
    const cleanPostId = normalizeText(postId);
    if (!cleanPostId) {
      throw new Error('postId is required');
    }
    const userMeta = getUserMeta(user);
    let res = await apiFetch(`/api/community/${encodeURIComponent(cleanPostId)}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-User-Id': userMeta.userId || '',
        'X-User-Email': userMeta.authorEmail || '',
      },
      body: JSON.stringify({
        userId: userMeta.userId,
        authorEmail: userMeta.authorEmail,
      }),
    });

    if (res.status === 404) {
      return { message: 'Post already deleted' };
    }

    if (!res.ok) {
      // Fallback for environments that disallow DELETE with body
      res = await apiFetch(`/api/community/${encodeURIComponent(cleanPostId)}/delete`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-User-Id': userMeta.userId || '',
          'X-User-Email': userMeta.authorEmail || '',
        },
        body: JSON.stringify({
          userId: userMeta.userId,
          authorEmail: userMeta.authorEmail,
        }),
      });
    }

    if (res.status === 404) {
      return { message: 'Post already deleted' };
    }

    const data = await safeReadJson(res);
    if (!res.ok) throw new Error(data?.message || 'Failed to delete post');
    return data || { message: 'Post deleted' };
  },

  getNotifications: async ({ user, limit = 40 } = {}) => {
    const userMeta = getUserMeta(user);
    const query = new URLSearchParams();
    if (userMeta.authorEmail) query.set('email', userMeta.authorEmail);
    if (!userMeta.authorEmail && userMeta.userId) query.set('userId', userMeta.userId);
    query.set('limit', String(limit));

    if (!query.get('email') && !query.get('userId')) {
      return { items: [], unreadCount: 0 };
    }

    const res = await apiFetch(`/api/community/notifications?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const data = await safeReadJson(res);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to load notifications');
    }

    return {
      items: Array.isArray(data?.items) ? data.items : [],
      unreadCount: Number(data?.unreadCount || 0),
    };
  },

  markNotificationsRead: async ({ user, ids } = {}) => {
    const userMeta = getUserMeta(user);
    const payload = {
      email: userMeta.authorEmail,
      userId: userMeta.userId,
      ids: Array.isArray(ids) ? ids : undefined,
    };

    if (!payload.email && !payload.userId) {
      return { modifiedCount: 0 };
    }

    const res = await apiFetch('/api/community/notifications/read', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await safeReadJson(res);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to mark notifications as read');
    }
    return data || { modifiedCount: 0 };
  },
};
