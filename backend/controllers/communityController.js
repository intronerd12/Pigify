const fs = require('fs');
const communityStore = require('../services/communityStore');
const { cloudinary } = require('../config/cloudinary');
const { supabaseAdmin } = require('../config/supabase');

const BAD_WORD_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|motherfucker|cunt)\b/ig,
  /\b(puta|putangina|putang\s*ina|gago|tanga|ulol|pakyu|bobo)\b/ig,
];

const maskBadLanguage = (text) => {
  let masked = String(text || '');
  BAD_WORD_PATTERNS.forEach((pattern) => {
    masked = masked.replace(pattern, (match) => '*'.repeat(match.length));
  });
  return masked;
};

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
    const rawLimit = Number(req.query?.limit || 50);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 120)) : 50;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const posts = await communityStore.getPosts(limit);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch community posts' });
  }
};

// @desc    Create community forum post
// @route   POST /api/community
// @access  Public
const createCommunityPost = async (req, res) => {
  try {
    const {
      text,
      userId,
      authorName,
      authorEmail,
      authorAvatar,
      source,
      scanSnapshot,
    } = req.body || {};

    let normalizedText = normalizeText(text);
    const cleanSnapshot = scanSnapshot && typeof scanSnapshot === 'object' ? scanSnapshot : null;

    if (!normalizedText && !cleanSnapshot) {
      return res.status(400).json({ message: 'Post text or scan snapshot is required' });
    }

    if (normalizedText) {
      normalizedText = normalizeText(maskBadLanguage(normalizedText));
    }

    if (cleanSnapshot && cleanSnapshot.notes) {
      cleanSnapshot.notes = maskBadLanguage(cleanSnapshot.notes);
    }

    const resolvedUser = await resolveUser({ userId, authorEmail });
    const safeAuthorName = normalizeText(authorName) || resolvedUser?.name || 'Backyard Swine Farmer';
    const safeAuthorEmail = normalizeText(authorEmail)?.toLowerCase() || resolvedUser?.email || '';
    const safeAuthorAvatar = normalizeText(authorAvatar) || resolvedUser?.avatar || '';

    const payload = {
      authorName: safeAuthorName,
      authorEmail: safeAuthorEmail,
      authorAvatar: safeAuthorAvatar,
      text: normalizedText,
      source: normalizeText(source) || 'mobile_app',
      user: resolvedUser?._id || userId || undefined,
    };

    if (cleanSnapshot) {
      payload.scanSnapshot = {
        localScanId: normalizeText(cleanSnapshot.localScanId),
        grade: normalizeGrade(cleanSnapshot.grade),
        swineCondition: normalizeText(cleanSnapshot.swineCondition || cleanSnapshot.notes),
        notes: normalizeText(cleanSnapshot.notes),
        estimatedPricePerKg: Number(cleanSnapshot.estimatedPricePerKg) || 0,
        sizeCategory: normalizeText(cleanSnapshot.sizeCategory),
        shelfLifeLabel: normalizeText(cleanSnapshot.shelfLifeLabel),
        scanTimestamp: parseDateOrNow(cleanSnapshot.scanTimestamp),
        imageUrl: normalizeText(cleanSnapshot.imageUrl),
      };
    }

    const created = await communityStore.createPost(payload);

    // Notify community of new swine diagnosis post
    await communityStore.createNotifications([
      {
        recipientEmail: 'all',
        actorUser: resolvedUser?._id || userId,
        actorName: safeAuthorName,
        actorEmail: safeAuthorEmail,
        type: 'post',
        message: `${safeAuthorName} shared a new swine clinical case report.`,
        post: created.id,
      },
    ]);

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create community post' });
  }
};

// @desc    Add comment to a community post
// @route   POST /api/community/:postId/comments
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
      commenterName,
      commenterEmail,
      commenterAvatar,
    } = req.body || {};

    let normalizedText = normalizeText(text);
    if (!normalizedText) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    normalizedText = normalizeText(maskBadLanguage(normalizedText));

    const post = await communityStore.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const resolvedUser = await resolveUser({ userId, authorEmail: commenterEmail });
    const safeCommenterName = normalizeText(commenterName) || resolvedUser?.name || 'Operator';
    const safeCommenterEmail = normalizeText(commenterEmail)?.toLowerCase() || resolvedUser?.email || '';
    const safeCommenterAvatar = normalizeText(commenterAvatar) || resolvedUser?.avatar || '';

    const result = await communityStore.addComment(postId, {
      commenterUser: resolvedUser?._id || userId,
      commenterName: safeCommenterName,
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
          actorUser: resolvedUser?._id || userId,
          actorName: safeCommenterName,
          actorEmail: safeCommenterEmail,
          type: 'comment',
          message: `${safeCommenterName} replied to your swine clinical post.`,
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
// @route   POST /api/community/:postId/reactions
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
      reactorName,
      reactorEmail,
    } = req.body || {};

    const resolvedUser = await resolveUser({ userId, authorEmail: reactorEmail });
    const safeReactorName = normalizeText(reactorName) || resolvedUser?.name || 'Operator';
    const safeReactorEmail = normalizeText(reactorEmail)?.toLowerCase() || resolvedUser?.email || '';

    const result = await communityStore.toggleReaction(postId, {
      userId: resolvedUser?._id || userId,
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

    // Direct Cloudinary upload with automatic optimization
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
