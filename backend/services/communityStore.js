const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'community_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + persistent file backing
let memoryStore = {
  posts: [],
  notifications: [],
};

const loadStore = () => {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.posts)) memoryStore.posts = parsed.posts;
      if (Array.isArray(parsed.notifications)) memoryStore.notifications = parsed.notifications;
    }
  } catch (err) {
    console.warn('[communityStore] Could not read local store, initializing fresh:', err.message);
  }
};

const saveStore = () => {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('[communityStore] Failed to persist community store:', err.message);
  }
};

// Initial load
loadStore();

const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
};

const communityStore = {
  async getPosts(limit = 50) {
    // Try Supabase table first if available
    try {
      const { data, error } = await supabaseAdmin
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          ...item,
          _id: item.id || item._id,
        }));
      }
    } catch {}

    // Fall back to memoryStore (sorted newest first)
    const sorted = [...memoryStore.posts].sort(
      (a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
    );
    return sorted.slice(0, limit);
  },

  async createPost(payload) {
    const id = generateId();
    const now = new Date().toISOString();

    const newPost = {
      _id: id,
      id: id,
      authorName: payload.authorName || 'Pigify Operator',
      authorEmail: payload.authorEmail || '',
      authorAvatar: payload.authorAvatar || '',
      user: payload.user || id,
      text: payload.text || '',
      source: payload.source || 'mobile_app',
      scanSnapshot: payload.scanSnapshot || null,
      reactions: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    memoryStore.posts.unshift(newPost);
    saveStore();

    // Also attempt saving to Supabase if configured
    try {
      await supabaseAdmin.from('community_posts').insert({
        id: newPost.id,
        author_name: newPost.authorName,
        author_email: newPost.authorEmail,
        author_avatar: newPost.authorAvatar,
        text: newPost.text,
        source: newPost.source,
        scan_snapshot: newPost.scanSnapshot,
        created_at: now,
        updated_at: now,
      });
    } catch {}

    return newPost;
  },

  async getPostById(id) {
    if (!id) return null;
    const cleanId = String(id).trim();
    return memoryStore.posts.find((p) => String(p._id) === cleanId || String(p.id) === cleanId) || null;
  },

  async addComment(postId, commentData) {
    const post = await this.getPostById(postId);
    if (!post) return null;

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    const commentId = generateId();
    const now = new Date().toISOString();

    const newComment = {
      _id: commentId,
      id: commentId,
      commenterUser: commentData.commenterUser || commentId,
      commenterName: commentData.commenterName || 'Operator',
      commenterEmail: commentData.commenterEmail || '',
      commenterAvatar: commentData.commenterAvatar || '',
      text: commentData.text || '',
      createdAt: now,
    };

    post.comments.push(newComment);
    post.updatedAt = now;
    saveStore();

    return { post, comment: newComment };
  },

  async toggleReaction(postId, { userId, reactorName, reactorEmail, emoji = 'heart' }) {
    const post = await this.getPostById(postId);
    if (!post) return null;

    if (!Array.isArray(post.reactions)) {
      post.reactions = [];
    }

    const cleanUser = String(userId || '').trim();
    const cleanEmail = String(reactorEmail || '').trim().toLowerCase();

    // Check if user already reacted
    const existingIndex = post.reactions.findIndex((r) => {
      if (cleanEmail && r.reactorEmail && r.reactorEmail.toLowerCase() === cleanEmail) return true;
      if (cleanUser && (r.user === cleanUser || r.userId === cleanUser)) return true;
      return false;
    });

    let action = 'added';
    if (existingIndex > -1) {
      post.reactions.splice(existingIndex, 1);
      action = 'removed';
    } else {
      const reactionId = generateId();
      post.reactions.push({
        _id: reactionId,
        id: reactionId,
        user: cleanUser || reactionId,
        userId: cleanUser || reactionId,
        reactorName: reactorName || 'Operator',
        reactorEmail: cleanEmail,
        emoji,
        createdAt: new Date().toISOString(),
      });
      action = 'added';
    }

    post.updatedAt = new Date().toISOString();
    saveStore();

    return { post, action };
  },

  async deletePost(postId) {
    const cleanId = String(postId || '').trim();
    const index = memoryStore.posts.findIndex((p) => String(p._id) === cleanId || String(p.id) === cleanId);
    if (index > -1) {
      memoryStore.posts.splice(index, 1);
      saveStore();
      return true;
    }
    return false;
  },

  async createNotifications(notifs) {
    if (!Array.isArray(notifs) || !notifs.length) return;
    const now = new Date().toISOString();

    const formatted = notifs.map((n) => ({
      _id: generateId(),
      id: generateId(),
      recipientEmail: (n.recipientEmail || '').toLowerCase(),
      recipientUser: n.recipientUser || '',
      actorUser: n.actorUser || '',
      actorName: n.actorName || 'Pigify Operator',
      actorEmail: (n.actorEmail || '').toLowerCase(),
      type: n.type || 'post',
      message: n.message || '',
      post: n.post || null,
      commentId: n.commentId || null,
      readAt: null,
      createdAt: now,
    }));

    memoryStore.notifications.unshift(...formatted);
    // Keep max 500 notifications in memory
    if (memoryStore.notifications.length > 500) {
      memoryStore.notifications = memoryStore.notifications.slice(0, 500);
    }
    saveStore();
  },

  async getNotifications({ email, userId, limit = 50 }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanUser = String(userId || '').trim();

    const matching = memoryStore.notifications.filter((n) => {
      if (cleanEmail && n.recipientEmail === cleanEmail) return true;
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
      const matchRecipient =
        (cleanEmail && n.recipientEmail === cleanEmail) ||
        (cleanUser && n.recipientUser === cleanUser);

      if (matchRecipient && !n.readAt) {
        if (!ids.length || idSet.has(String(n._id)) || idSet.has(String(n.id))) {
          n.readAt = now;
          count++;
        }
      }
    });

    if (count > 0) {
      saveStore();
    }
    return count;
  },
};

module.exports = communityStore;
