const fs = require('fs');
const communityStore = require('../services/communityStore');
const { cloudinary } = require('../config/cloudinary');
const { supabaseAdmin } = require('../config/supabase');
const { maskBadLanguage } = require('../utils/badWords');
const { validatePigTopic } = require('../utils/pigValidator');

const normalizeText = (value) => {
  if (value === undefined || value === null) return undefined;
  const out = String(value).trim();
  return out.length ? out : undefined;
};

const normalizeGrade = (value) => {
  const cleaned = normalizeText(value);
  return cleaned ? cleaned.toUpperCase() : undefined;
};

const parseDateOrNow = (value) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
};

const cleanupLocalFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {}
};

// Helper to resolve user from Supabase profiles
const resolveUser = async ({ userId, authorEmail }) => {
  const cleanId = normalizeText(userId);
  const cleanEmail = normalizeText(authorEmail)?.toLowerCase();

  try {
    if (cleanId) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, avatar')
        .eq('id', cleanId)
        .maybeSingle();
      if (data) return { _id: data.id, id: data.id, name: data.name, email: data.email, avatar: data.avatar };
    }
    if (cleanEmail) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, avatar')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (data) return { _id: data.id, id: data.id, name: data.name, email: data.email, avatar: data.avatar };
    }
  } catch {}

  return null;
};

// @desc    Get community forum posts
// @route   GET /api/community
// @access  Public
const getCommunityPosts = async (req, res) => {
  try {
    const rawLimit = Number(req.query?.limit || 60);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 120)) : 60;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const posts = await communityStore.getPosts(limit);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch community posts' });
  }
};

// @desc    Create community forum post (Pig relevance enforced, Bad words masked, Supabase backed)
// @route   POST /api/community
// @access  Public
const createCommunityPost = async (req, res) => {
  try {
    const {
      text,
      userId,
      user,
      authorName,
      name,
      authorEmail,
      email,
      authorAvatar,
      source,
      scanSnapshot,
    } = req.body || {};

    let normalizedText = normalizeText(text);
    const cleanSnapshot = scanSnapshot && typeof scanSnapshot === 'object' ? scanSnapshot : null;

    if (!normalizedText && !cleanSnapshot) {
      return res.status(400).json({ message: 'Post message or diagnostic scan snapshot is required.' });
    }

    // 1. Enforce Pig / Swine topic relevance
    const topicCheck = validatePigTopic({
      text: normalizedText,
      scanSnapshot: cleanSnapshot,
    });
    if (!topicCheck.isRelevant) {
      return res.status(400).json({
        message: topicCheck.message || 'Posts must be related to pigs or swine farming.'
      });
    }

    // 2. Filter / Mask Bad Words in post text & notes
    if (normalizedText) {
      normalizedText = normalizeText(maskBadLanguage(normalizedText));
    }

    if (cleanSnapshot && cleanSnapshot.notes) {
      cleanSnapshot.notes = maskBadLanguage(cleanSnapshot.notes);
    }
    if (cleanSnapshot && cleanSnapshot.condition) {
      cleanSnapshot.condition = maskBadLanguage(cleanSnapshot.condition);
    }

    const effectiveUserId = normalizeText(userId || user);
    const effectiveEmail = normalizeText(authorEmail || email)?.toLowerCase();
    const resolvedUser = await resolveUser({ userId: effectiveUserId, authorEmail: effectiveEmail });

    const safeAuthorName =
      normalizeText(authorName || name) ||
      resolvedUser?.name ||
      'Backyard Swine Farmer';
    const safeAuthorEmail =
      effectiveEmail ||
      resolvedUser?.email ||
      '';
    const safeAuthorAvatar =
      normalizeText(authorAvatar) ||
      resolvedUser?.avatar ||
      '';

    const payload = {
      authorName: safeAuthorName,
      authorEmail: safeAuthorEmail,
      authorAvatar: safeAuthorAvatar,
      text: normalizedText,
      source: normalizeText(source) || 'mobile_app',
      user: resolvedUser?._id || effectiveUserId || undefined,
    };

    if (cleanSnapshot) {
      payload.scanSnapshot = {
        localScanId: normalizeText(cleanSnapshot.localScanId || cleanSnapshot._id || cleanSnapshot.id),
        grade: normalizeGrade(cleanSnapshot.grade || cleanSnapshot.severity),
        severity: normalizeGrade(cleanSnapshot.severity || cleanSnapshot.grade),
        condition: normalizeText(cleanSnapshot.condition || cleanSnapshot.details || 'Swine Dermis Inspection'),
        swineCondition: normalizeText(cleanSnapshot.swineCondition || cleanSnapshot.condition || cleanSnapshot.notes),
        notes: normalizeText(cleanSnapshot.notes || cleanSnapshot.details),
        penId: normalizeText(cleanSnapshot.penId || 'Backyard Pen'),
        swineId: normalizeText(cleanSnapshot.swineId || 'Swine'),
        confidence: normalizeText(cleanSnapshot.confidence || '96.8%'),
        scanTimestamp: parseDateOrNow(cleanSnapshot.scanTimestamp || cleanSnapshot.timestamp),
        imageUrl: normalizeText(cleanSnapshot.imageUrl || cleanSnapshot.imageUri),
      };
    }

    const created = await communityStore.createPost(payload);

    // Notify community of new swine diagnosis post
    await communityStore.createNotifications([
      {
        recipientEmail: 'all',
        actorUser: resolvedUser?._id || effectiveUserId,
        actorName: safeAuthorName,
        actorEmail: safeAuthorEmail,
        type: 'post',
        message: `${safeAuthorName} shared a swine discussion or clinical case report.`,
        post: created.id,
      },
    ]);

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create community post' });
  }
};

// @desc    Add comment to a community post (Bad words masked, Supabase backed)
// @route   POST /api/community/:postId/comments (or /:postId/comment)
// @access  Public
const addCommunityComment = async (req, res) => {
  try {
    const postId = normalizeText(req.params?.postId);
    if (!postId) {
      return res.status(400).json({ message: 'Valid postId is required' });
    }

    const {
      text,
      userId,
      user,
      commenterName,
      authorName,
      name,
      commenterEmail,
      authorEmail,
      email,
      commenterAvatar,
    } = req.body || {};

    let normalizedText = normalizeText(text);
    if (!normalizedText) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Filter bad words in comment
    normalizedText = normalizeText(maskBadLanguage(normalizedText));

    const post = await communityStore.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const effectiveUserId = normalizeText(userId || user);
    const effectiveEmail = normalizeText(commenterEmail || authorEmail || email)?.toLowerCase();
    const resolvedUser = await resolveUser({ userId: effectiveUserId, authorEmail: effectiveEmail });

    const safeCommenterName =
      normalizeText(commenterName || authorName || name) ||
      resolvedUser?.name ||
      'Backyard Farmer';
    const safeCommenterEmail =
      effectiveEmail ||
      resolvedUser?.email ||
      '';
    const safeCommenterAvatar =
      normalizeText(commenterAvatar) ||
      resolvedUser?.avatar ||
      '';

    const result = await communityStore.addComment(postId, {
      commenterUser: resolvedUser?._id || effectiveUserId,
      commenterName: safeCommenterName,
      authorName: safeCommenterName,
      commenterEmail: safeCommenterEmail,
      commenterAvatar: safeCommenterAvatar,
      text: normalizedText,
    });

    if (!result) {
      return res.status(404).json({ message: 'Failed to add comment to post' });
    }

    // Send notification to post author if not self-comment
    if (post.authorEmail && post.authorEmail.toLowerCase() !== safeCommenterEmail) {
      await communityStore.createNotifications([
        {
          recipientEmail: post.authorEmail,
          actorUser: resolvedUser?._id || effectiveUserId,
          actorName: safeCommenterName,
          actorEmail: safeCommenterEmail,
          type: 'comment',
          message: `${safeCommenterName} replied to your swine post.`,
          post: postId,
          commentId: result.comment.id,
        },
      ]);
    }

    return res.status(201).json(result.post);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to add comment' });
  }
};

// @desc    Toggle reaction (heart/like) on a community post
// @route   POST /api/community/:postId/reactions (or /:postId/react)
// @access  Public
const toggleCommunityReaction = async (req, res) => {
  try {
    const postId = normalizeText(req.params?.postId);
    if (!postId) {
      return res.status(400).json({ message: 'Valid postId is required' });
    }

    const {
      type = 'heart',
      userId,
      user,
      reactorName,
      name,
      reactorEmail,
      email,
    } = req.body || {};

    const effectiveUserId = normalizeText(userId || user);
    const effectiveEmail = normalizeText(reactorEmail || email)?.toLowerCase();
    const resolvedUser = await resolveUser({ userId: effectiveUserId, authorEmail: effectiveEmail });

    const safeReactorName =
      normalizeText(reactorName || name) ||
      resolvedUser?.name ||
      'Backyard Farmer';
    const safeReactorEmail =
      effectiveEmail ||
      resolvedUser?.email ||
      '';

    const result = await communityStore.toggleReaction(postId, {
      userId: resolvedUser?._id || effectiveUserId,
      reactorName: safeReactorName,
      reactorEmail: safeReactorEmail,
      emoji: type,
    });

    if (!result) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    return res.status(200).json(result.post);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to toggle reaction' });
  }
};

// @desc    Upload community scan image to Cloudinary
// @route   POST /api/community/upload-scan-image
// @access  Public
const uploadCommunityScanImage = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      cleanupLocalFile(req.file.path);
      return res.status(503).json({ message: 'Cloud image storage is not configured' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'pigify/community-scans',
      resource_type: 'image',
      quality: 'auto:good',
    });

    cleanupLocalFile(req.file.path);
    return res.status(201).json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    cleanupLocalFile(req.file?.path);
    return res.status(500).json({ message: error.message || 'Failed to upload community image' });
  }
};

// @desc    Get community notifications for a recipient
// @route   GET /api/community/notifications
// @access  Public
const getCommunityNotifications = async (req, res) => {
  try {
    const rawLimit = Number(req.query?.limit || 50);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 120)) : 50;
    const email = req.query?.email;
    const userId = req.query?.userId;

    if (!email && !userId) {
      return res.status(400).json({ message: 'email or userId is required' });
    }

    const result = await communityStore.getNotifications({ email, userId, limit });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load notifications' });
  }
};

// @desc    Mark community notifications as read
// @route   POST /api/community/notifications/read
// @access  Public
const markCommunityNotificationsRead = async (req, res) => {
  try {
    const email = req.body?.email;
    const userId = req.body?.userId;
    const ids = Array.isArray(req.body?.ids) ? req.body?.ids : [];

    if (!email && !userId) {
      return res.status(400).json({ message: 'email or userId is required' });
    }

    const modifiedCount = await communityStore.markNotificationsRead({ email, userId, ids });
    return res.status(200).json({
      message: 'Notifications marked as read',
      modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to mark notifications as read' });
  }
};

// @desc    Delete community post
// @route   DELETE /api/community/:postId
// @access  Public
const deleteCommunityPost = async (req, res) => {
  try {
    const postId = normalizeText(req.params?.postId);
    if (!postId) {
      return res.status(400).json({ message: 'Valid postId is required' });
    }

    const deleted = await communityStore.deletePost(postId);
    if (!deleted) {
      return res.status(404).json({ message: 'Post not found or already deleted' });
    }

    return res.status(200).json({ message: 'Post deleted', id: postId });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete community post' });
  }
};

// @desc    Get community analytics
// @route   GET /api/community/analytics
// @access  Public (Admin)
const getCommunityAnalytics = async (req, res) => {
  try {
    const posts = await communityStore.getPosts(1000);
    const totalPosts = posts.length;
    let totalComments = 0;
    let totalReactions = 0;
    const authorEmails = new Set();
    const authorPostCount = {};

    posts.forEach((p) => {
      totalComments += (p.comments || []).length;
      totalReactions += (p.reactions || []).length;
      if (p.authorEmail) authorEmails.add(p.authorEmail);
      if (p.authorName) {
        authorPostCount[p.authorName] = (authorPostCount[p.authorName] || 0) + 1;
      }
    });

    let topAuthorName = 'None';
    let maxPosts = 0;
    Object.entries(authorPostCount).forEach(([name, count]) => {
      if (count > maxPosts) {
        maxPosts = count;
        topAuthorName = name;
      }
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const postsLast24h = posts.filter(
      (p) => new Date(p.createdAt || 0) >= oneDayAgo
    ).length;

    return res.status(200).json({
      totalPosts,
      totalComments,
      totalReactions,
      activeUsers: authorEmails.size,
      postsLast24h,
      topAuthor: { _id: topAuthorName, count: maxPosts },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch community analytics' });
  }
};

module.exports = {
  getCommunityPosts,
  createCommunityPost,
  addCommunityComment,
  uploadCommunityScanImage,
  getCommunityNotifications,
  toggleCommunityReaction,
  markCommunityNotificationsRead,
  deleteCommunityPost,
  getCommunityAnalytics,
};
