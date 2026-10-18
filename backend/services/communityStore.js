const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'community_backup.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache for rapid serving and network glitch resilience
let memoryStore = {
  posts: [],
  notifications: [],
};

const loadBackup = () => {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.posts)) memoryStore.posts = parsed.posts;
      if (Array.isArray(parsed.notifications)) memoryStore.notifications = parsed.notifications;
    }
  } catch {}
};

const saveBackup = () => {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch {}
};

loadBackup();

const isUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

/**
 * Standardize post shape to ensure 100% compatibility across both Web & Mobile
 */
const formatPost = (raw) => {
  if (!raw) return null;
  const id = String(raw.id || raw._id || '');
  const createdAt = raw.created_at || raw.createdAt || new Date().toISOString();
  const updatedAt = raw.updated_at || raw.updatedAt || createdAt;

  const comments = (raw.community_comments || raw.comments || []).map((c) => ({
    _id: String(c.id || c._id || ''),
    id: String(c.id || c._id || ''),
    postId: id,
    commenterUser: c.commenter_user || c.commenterUser || null,
    commenterName: c.commenter_name || c.commenterName || c.authorName || 'Backyard Farmer',
    authorName: c.commenter_name || c.commenterName || c.authorName || 'Backyard Farmer',
    commenterEmail: c.commenter_email || c.commenterEmail || '',
    text: c.text || '',
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
    created_at: c.created_at || c.createdAt || new Date().toISOString(),
  }));

  // Sort comments chronologically
  comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const reactions = (raw.community_reactions || raw.reactions || []).map((r) => {
    const rType = r.type || r.emoji || 'heart';
    const email = r.user_email || r.reactorEmail || r.email || '';
    const userId = r.user_id || r.userId || r.user || null;
    return {
      _id: String(r.id || r._id || ''),
      id: String(r.id || r._id || ''),
      postId: id,
      user: userId,
      userId: userId,
      userName: r.user_name || r.reactorName || 'Farmer',
      reactorName: r.user_name || r.reactorName || 'Farmer',
      email: email,
      reactorEmail: email,
      user_email: email,
      type: rType,
      emoji: rType,
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    };
  });

  const scan = raw.scan_snapshot || raw.scanSnapshot || null;

  return {
    _id: id,
    id: id,
    user: raw.user_id || raw.user || null,
    userId: raw.user_id || raw.userId || null,
    authorName: raw.author_name || raw.authorName || 'Backyard Swine Farmer',
    author_name: raw.author_name || raw.authorName || 'Backyard Swine Farmer',
    authorEmail: raw.author_email || raw.authorEmail || '',
    author_email: raw.author_email || raw.authorEmail || '',
    authorAvatar: raw.author_avatar || raw.authorAvatar || '',
    text: raw.text || '',
    source: raw.source || 'mobile_app',
    scanSnapshot: scan,
    scan_snapshot: scan,
    comments,
    reactions,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
  };
};

const communityStore = {
  /**
   * Fetch all posts from Supabase (with nested comments and reactions)
   */
  async getPosts(limit = 70) {
    try {
      const { data, error } = await supabaseAdmin
        .from('community_posts')
        .select('*, community_comments(*), community_reactions(*)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data)) {
        const formatted = data.map(formatPost);
        memoryStore.posts = formatted;
        saveBackup();
        return formatted;
      }
      if (error) {
        console.warn('[communityStore] Supabase getPosts notice:', error.message);
      }
    } catch (err) {
      console.warn('[communityStore] Supabase query failed, falling back to backup:', err.message);
    }

    return memoryStore.posts.slice(0, limit);
  },

  /**
   * Create a new post in Supabase
   */
  async createPost(payload) {
    const postInsert = {
      author_name: payload.authorName || 'Backyard Swine Farmer',
      author_email: payload.authorEmail ? String(payload.authorEmail).toLowerCase() : null,
      text: payload.text || null,
      source: payload.source || 'mobile_app',
      scan_snapshot: payload.scanSnapshot || null,
    };

    if (payload.user && isUUID(payload.user)) {
      postInsert.user_id = payload.user;
    }

    let createdPost = null;

    try {
      let { data, error } = await supabaseAdmin
        .from('community_posts')
        .insert(postInsert)
        .select('*, community_comments(*), community_reactions(*)')
        .single();

      // If foreign key violation on user_id, retry without user_id
      if (error && (error.code === '23503' || String(error.message).includes('user_id'))) {
        delete postInsert.user_id;
        const retry = await supabaseAdmin
          .from('community_posts')
          .insert(postInsert)
          .select('*, community_comments(*), community_reactions(*)')
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        createdPost = formatPost(data);
      } else if (error) {
        console.warn('[communityStore] Supabase createPost insert warning:', error.message);
      }
    } catch (err) {
      console.warn('[communityStore] Supabase insert failed:', err.message);
    }

    // Fallback if Supabase call failed
    if (!createdPost) {
      const fallbackId = crypto.randomUUID ? crypto.randomUUID() : 'post_' + Date.now();
      const now = new Date().toISOString();
      createdPost = formatPost({
        id: fallbackId,
        author_name: postInsert.author_name,
        author_email: postInsert.author_email,
        text: postInsert.text,
        source: postInsert.source,
        scan_snapshot: postInsert.scan_snapshot,
        created_at: now,
        updated_at: now,
      });
    }

    memoryStore.posts.unshift(createdPost);
    saveBackup();

    return createdPost;
  },

  /**
   * Get post by ID from Supabase
   */
  async getPostById(postId) {
    if (!postId) return null;
    const cleanId = String(postId).trim();

    try {
      if (isUUID(cleanId)) {
        const { data, error } = await supabaseAdmin
          .from('community_posts')
          .select('*, community_comments(*), community_reactions(*)')
          .eq('id', cleanId)
          .maybeSingle();

        if (!error && data) {
          return formatPost(data);
        }
      }
    } catch {}

    return memoryStore.posts.find((p) => p.id === cleanId || p._id === cleanId) || null;
  },

  /**
   * Add comment to post in Supabase
   */
  async addComment(postId, commentData) {
    const cleanPostId = String(postId || '').trim();
    if (!cleanPostId) return null;

    const commentInsert = {
      post_id: cleanPostId,
      commenter_name: commentData.commenterName || commentData.authorName || 'Backyard Farmer',
      commenter_email: commentData.commenterEmail ? String(commentData.commenterEmail).toLowerCase() : null,
      text: String(commentData.text || '').trim(),
    };

    if (commentData.commenterUser && isUUID(commentData.commenterUser)) {
      commentInsert.commenter_user = commentData.commenterUser;
    }

    let newComment = null;

    try {
      if (isUUID(cleanPostId)) {
        let { data, error } = await supabaseAdmin
          .from('community_comments')
          .insert(commentInsert)
          .select('*')
          .single();

        if (error && (error.code === '23503' || String(error.message).includes('commenter_user'))) {
          delete commentInsert.commenter_user;
          const retry = await supabaseAdmin
            .from('community_comments')
            .insert(commentInsert)
            .select('*')
            .single();
          data = retry.data;
          error = retry.error;
        }

        if (!error && data) {
          newComment = data;
          // Touch post updated_at
          await supabaseAdmin
            .from('community_posts')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', cleanPostId);
        }
      }
    } catch (err) {
      console.warn('[communityStore] addComment Supabase failed:', err.message);
    }

    // Refresh post
    const updatedPost = await this.getPostById(cleanPostId);
    if (updatedPost) {
      const idx = memoryStore.posts.findIndex((p) => p.id === cleanPostId || p._id === cleanPostId);
      if (idx > -1) {
        memoryStore.posts[idx] = updatedPost;
      } else {
        memoryStore.posts.unshift(updatedPost);
      }
      saveBackup();
      return { post: updatedPost, comment: newComment || { id: 'c_' + Date.now(), text: commentInsert.text } };
    }

    return null;
  },

  /**
   * Toggle reaction in Supabase
   */
  async toggleReaction(postId, { userId, reactorName, reactorEmail, emoji = 'heart' }) {
    const cleanPostId = String(postId || '').trim();
    if (!cleanPostId) return null;

    const cleanEmail = reactorEmail ? String(reactorEmail).toLowerCase().trim() : '';
    const cleanType = emoji === 'like' ? 'like' : 'heart';
    let action = 'added';

    try {
      if (isUUID(cleanPostId)) {
        // Check for existing reaction by this user/email
        let findQuery = supabaseAdmin
          .from('community_reactions')
          .select('id, type')
          .eq('post_id', cleanPostId);

        if (cleanEmail) {
          findQuery = findQuery.eq('user_email', cleanEmail);
        } else if (userId && isUUID(userId)) {
          findQuery = findQuery.eq('user_id', userId);
        }

        const { data: existingList } = await findQuery;

        if (existingList && existingList.length > 0) {
          // Remove existing reaction
          const existingId = existingList[0].id;
          await supabaseAdmin.from('community_reactions').delete().eq('id', existingId);
          action = 'removed';
        } else {
          // Insert new reaction
          const reactionInsert = {
            post_id: cleanPostId,
            user_name: reactorName || 'Backyard Farmer',
            user_email: cleanEmail || null,
            type: cleanType,
          };
          if (userId && isUUID(userId)) {
            reactionInsert.user_id = userId;
          }
          await supabaseAdmin.from('community_reactions').insert(reactionInsert);
          action = 'added';
        }
      }
    } catch (err) {
      console.warn('[communityStore] toggleReaction Supabase warning:', err.message);
    }

    const updatedPost = await this.getPostById(cleanPostId);
    if (updatedPost) {
      const idx = memoryStore.posts.findIndex((p) => p.id === cleanPostId || p._id === cleanPostId);
      if (idx > -1) memoryStore.posts[idx] = updatedPost;
      saveBackup();
      return { post: updatedPost, action };
    }

    return null;
  },

  /**
   * Delete post in Supabase
   */
  async deletePost(postId) {
    const cleanId = String(postId || '').trim();
    if (!cleanId) return false;

    let deleted = false;
    try {
      if (isUUID(cleanId)) {
        const { error } = await supabaseAdmin.from('community_posts').delete().eq('id', cleanId);
        if (!error) deleted = true;
      }
    } catch {}

    const memIdx = memoryStore.posts.findIndex((p) => p.id === cleanId || p._id === cleanId);
    if (memIdx > -1) {
      memoryStore.posts.splice(memIdx, 1);
      deleted = true;
    }
    saveBackup();

    return deleted;
  },

  /**
   * Notification helpers
   */
  async createNotifications(notifs) {
    if (!Array.isArray(notifs) || !notifs.length) return;
    const now = new Date().toISOString();

    const formatted = notifs.map((n) => ({
      _id: crypto.randomUUID ? crypto.randomUUID() : 'n_' + Date.now(),
      id: crypto.randomUUID ? crypto.randomUUID() : 'n_' + Date.now(),
      recipientEmail: (n.recipientEmail || '').toLowerCase(),
      recipientUser: n.recipientUser || '',
      actorUser: n.actorUser || '',
      actorName: n.actorName || 'Backyard Farmer',
      actorEmail: (n.actorEmail || '').toLowerCase(),
      type: n.type || 'post',
      message: n.message || '',
      post: n.post || null,
      commentId: n.commentId || null,
      readAt: null,
      createdAt: now,
    }));

    memoryStore.notifications.unshift(...formatted);
    if (memoryStore.notifications.length > 500) {
      memoryStore.notifications = memoryStore.notifications.slice(0, 500);
    }
    saveBackup();
  },

  async getNotifications({ email, userId, limit = 50 }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanUser = String(userId || '').trim();

    const matching = memoryStore.notifications.filter((n) => {
      if (cleanEmail && (n.recipientEmail === cleanEmail || n.recipientEmail === 'all')) return true;
      if (cleanUser && n.recipientUser === cleanUser) return true;
      return false;
    });

    const unreadCount = matching.filter((n) => !n.readAt).length;
    return {
      items: matching.slice(0, limit),
      unreadCount,
    };
  },

  async markNotificationsRead({ email, userId, ids = [] }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanUser = String(userId || '').trim();
    const idSet = new Set(ids.map((id) => String(id)));
    const now = new Date().toISOString();

    let count = 0;
    memoryStore.notifications.forEach((n) => {
      const match =
        (cleanEmail && (n.recipientEmail === cleanEmail || n.recipientEmail === 'all')) ||
        (cleanUser && n.recipientUser === cleanUser);

      if (match && !n.readAt) {
        if (!ids.length || idSet.has(String(n._id)) || idSet.has(String(n.id))) {
          n.readAt = now;
          count++;
        }
      }
    });

    if (count > 0) saveBackup();
    return count;
  },
};

module.exports = communityStore;
