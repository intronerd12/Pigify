import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Text, Surface, ActivityIndicator, Portal, Dialog, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ScanService } from '../services/ScanService';
import { CommunityService } from '../services/CommunityService';

const THEME = {
  bg: '#F6F7FB',
  cardBg: '#FFFFFF',
  cardBgAlt: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#C71585',
  rose: '#FF69B4',
  emerald: '#00B894',
  cyan: '#0284C7',
  amber: '#D97706',
  text: '#1E293B',
  textSub: '#64748B',
  textMuted: '#94A3B8',
};

const BAD_WORD_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|motherfucker|cunt)\b/gi,
  /\b(puta|putangina|putang\s*ina|gago|tanga|ulol|pakyu|bobo)\b/gi,
];

const maskBadLanguage = (text) => {
  let masked = String(text || '');
  BAD_WORD_PATTERNS.forEach((pattern) => {
    masked = masked.replace(pattern, (match) => '*'.repeat(match.length));
  });
  return masked;
};

const formatDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const UserAvatar = ({ url, name, size = 36 }) => {
  const initial = name ? name.charAt(0).toUpperCase() : 'O';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(244, 63, 94, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(244, 63, 94, 0.35)',
        overflow: 'hidden',
      }}
    >
      {url ? (
        <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ color: '#fb7185', fontWeight: '800', fontSize: size * 0.42 }}>
          {initial}
        </Text>
      )}
    </View>
  );
};

export default function CommunityForumScreen({ navigation, user }) {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [scans, setScans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [postText, setPostText] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [formError, setFormError] = useState('');
  const [feedError, setFeedError] = useState('');
  const [expandedComments, setExpandedComments] = useState({});

  const selectedScan = useMemo(
    () => scans.find((scan) => String(scan?.id || scan?._id) === String(selectedScanId)) || null,
    [scans, selectedScanId]
  );

  const loadNotifications = useCallback(async () => {
    try {
      const data = await CommunityService.getNotifications({ user, limit: 40 });
      setNotifications(Array.isArray(data?.items) ? data.items : []);
      setUnreadCount(Number(data?.unreadCount || 0));
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    const [postsResult, scansResult, notifResult] = await Promise.allSettled([
      CommunityService.getPosts({ limit: 70 }),
      ScanService.getScans({ user }),
      CommunityService.getNotifications({ user, limit: 40 }),
    ]);

    if (postsResult.status === 'fulfilled') {
      setPosts(Array.isArray(postsResult.value) ? postsResult.value : []);
      setFeedError('');
    } else {
      setPosts([]);
      setFeedError(postsResult.reason?.message || 'Failed to load community discussions.');
    }

    if (scansResult.status === 'fulfilled') {
      const safeScans = Array.isArray(scansResult.value) ? scansResult.value : [];
      setScans(safeScans);
    } else {
      setScans([]);
    }

    if (notifResult.status === 'fulfilled') {
      setNotifications(Array.isArray(notifResult.value?.items) ? notifResult.value.items : []);
      setUnreadCount(Number(notifResult.value?.unreadCount || 0));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
      const poll = setInterval(() => {
        void loadNotifications();
      }, 20000);
      return () => clearInterval(poll);
    }, [loadData, loadNotifications])
  );

  const handleOpenNotifications = async () => {
    setNotificationsVisible(true);
    if (unreadCount <= 0) return;
    try {
      await CommunityService.markNotificationsRead({ user });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n?.readAt || new Date().toISOString() }))
      );
    } catch {
      // Ignore
    }
  };

  const handlePost = async () => {
    if (posting) return;
    const cleanText = String(postText || '').trim();

    if (!cleanText && !selectedScan) {
      setFormError('Please add an observation note or attach a swine clinical scan.');
      return;
    }

    const maskedText = maskBadLanguage(cleanText);

    try {
      setPosting(true);
      setFormError('');
      const created = await CommunityService.createPost({
        user,
        text: maskedText,
        scan: selectedScan,
      });
      setPosts((prev) => [created, ...prev]);
      setPostText('');
      setSelectedScanId(null);
      void loadNotifications();
    } catch (error) {
      setFormError(error?.message || 'Could not publish post to Swine Community.');
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (post, type) => {
    try {
      const postId = post._id || post.id;
      const updated = await CommunityService.toggleReaction({ user, postId, type });
      setPosts((prev) =>
        prev.map((p) => {
          const pid = String(p._id || p.id);
          const uid = String(updated._id || updated.id);
          return pid === uid ? updated : p;
        })
      );
    } catch (error) {
      console.warn('Failed to react:', error);
    }
  };

  const handleCommentSubmit = async (post) => {
    const postId = String(post?._id || post?.id || '');
    const text = String(commentDrafts[postId] || '').trim();
    if (!postId || !text) return;

    const maskedText = maskBadLanguage(text);

    try {
      setCommentingPostId(postId);
      const updatedPost = await CommunityService.addComment({ user, postId, text: maskedText });
      setPosts((prev) =>
        prev.map((item) => {
          const id = String(item?._id || item?.id || '');
          return id === postId ? updatedPost : item;
        })
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      void loadNotifications();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Could not publish comment.');
    } finally {
      setCommentingPostId(null);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const renderPost = ({ item }) => {
    const scan = item?.scanSnapshot || null;
    const authorName = item?.authorName || item?.user?.name || 'Backyard Swine Farmer';
    const postId = String(item?._id || item?.id || '');
    const comments = Array.isArray(item?.comments) ? item.comments : [];
    const isCommentsOpen = Boolean(expandedComments[postId]);

    const reactions = Array.isArray(item?.reactions) ? item.reactions : [];
    const heartCount = reactions.filter((r) => r.type === 'heart').length;
    const likeCount = reactions.filter((r) => r.type === 'like').length;

    const hasLiked = reactions.some(
      (r) => r.type === 'like' && (r.user === user?._id || r.email === user?.email)
    );
    const hasHearted = reactions.some(
      (r) => r.type === 'heart' && (r.user === user?._id || r.email === user?.email)
    );

    return (
      <Surface style={styles.postCard} elevation={0}>
        {/* Post Author Header */}
        <View style={styles.postHeader}>
          <UserAvatar url={item?.authorAvatar} name={authorName} size={38} />
          <View style={styles.authorMeta}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{authorName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Operator</Text>
              </View>
            </View>
            <Text style={styles.postDate}>{formatDate(item.createdAt || item.timestamp)}</Text>
          </View>
        </View>

        {/* Post Body Content */}
        {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}

        {/* Attached Swine Clinical Diagnostic Snapshot */}
        {scan && (
          <View style={styles.scanAttachment}>
            <View style={styles.scanAttachmentHeader}>
              <View style={styles.scanTypeRow}>
                <Ionicons name="scan" size={14} color="#fb7185" />
                <Text style={styles.scanConditionTitle}>
                  {scan.condition || scan.details || 'Swine Dermis Inspection'}
                </Text>
              </View>
              <View style={styles.severityBadge}>
                <Text style={styles.severityBadgeText}>
                  {scan.severity || scan.grade || 'Tier A'}
                </Text>
              </View>
            </View>

            <View style={styles.scanMetaRow}>
              <Text style={styles.scanMetaChip}>
                <Ionicons name="home-outline" size={11} color="#64748b" /> {scan.penId || 'Sector A'}
              </Text>
              <Text style={styles.scanMetaChip}>
                <Ionicons name="pricetag-outline" size={11} color="#64748b" /> {scan.swineId || 'Swine #01'}
              </Text>
              {scan.confidence && (
                <Text style={[styles.scanMetaChip, { color: '#10b981' }]}>
                  {scan.confidence} Conf.
                </Text>
              )}
            </View>

            {scan.imageUrl ? (
              <Image source={{ uri: scan.imageUrl }} style={styles.scanImagePreview} />
            ) : null}

            {scan.notes ? <Text style={styles.scanNotesText}>"{scan.notes}"</Text> : null}
          </View>
        )}

        {/* Reactions & Actions Row */}
        <View style={styles.reactionsBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleReaction(item, 'like')}
            style={[styles.reactBtn, hasLiked && styles.reactBtnActive]}
          >
            <Ionicons
              name={hasLiked ? 'thumbs-up' : 'thumbs-up-outline'}
              size={16}
              color={hasLiked ? '#10b981' : '#94a3b8'}
            />
            <Text style={[styles.reactCount, hasLiked && { color: '#10b981' }]}>
              {likeCount > 0 ? likeCount : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleReaction(item, 'heart')}
            style={[styles.reactBtn, hasHearted && styles.reactBtnActive]}
          >
            <Ionicons
              name={hasHearted ? 'heart' : 'heart-outline'}
              size={16}
              color={hasHearted ? '#f43f5e' : '#94a3b8'}
            />
            <Text style={[styles.reactCount, hasHearted && { color: '#f43f5e' }]}>
              {heartCount > 0 ? heartCount : 'Heart'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleComments(postId)}
            style={styles.reactBtn}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#06b6d4" />
            <Text style={styles.reactCount}>
              {comments.length > 0 ? `${comments.length} Comments` : 'Comment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expandable Comments Drawer */}
        {isCommentsOpen && (
          <View style={styles.commentsDrawer}>
            {comments.map((comment, cIdx) => (
              <View key={cIdx} style={styles.commentItem}>
                <UserAvatar
                  url={comment.authorAvatar}
                  name={comment.authorName || 'Operator'}
                  size={26}
                />
                <View style={styles.commentBubble}>
                  <Text style={styles.commentAuthor}>{comment.authorName || 'Operator'}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}

            {/* Comment Input */}
            <View style={styles.commentInputRow}>
              <TextInput
                value={commentDrafts[postId] || ''}
                onChangeText={(txt) =>
                  setCommentDrafts((prev) => ({ ...prev, [postId]: txt }))
                }
                placeholder="Write a clinical reply..."
                placeholderTextColor="#64748b"
                style={styles.commentTextInput}
              />
              <TouchableOpacity
                onPress={() => handleCommentSubmit(item)}
                disabled={commentingPostId === postId}
                style={styles.sendCommentBtn}
              >
                {commentingPostId === postId ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={15} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Cyber Telemetry Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.brandRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.brandSubtitle}>PIGIFY OPERATOR & VET NETWORK</Text>
            </View>
            <Text style={styles.headerTitle}>Swine Clinical Forum</Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenNotifications}
            style={styles.notifBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="notifications" size={18} color="#f8fafc" />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item, index) => String(item?._id || item?.id || index)}
        renderItem={renderPost}
        contentContainerStyle={[styles.feedContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData({ silent: true })}
            tintColor="#f43f5e"
          />
        }
        ListHeaderComponent={
          <View style={styles.composeSection}>
            {/* Create Post Card */}
            <Surface style={styles.composeCard} elevation={0}>
              <View style={styles.composeTopRow}>
                <UserAvatar
                  url={user?.avatar}
                  name={user?.name || user?.fullName}
                  size={36}
                />
                <TextInput
                  value={postText}
                  onChangeText={setPostText}
                  placeholder="Share a swine lesion case, pen observation, or question..."
                  placeholderTextColor="#64748b"
                  multiline
                  style={styles.composeInput}
                />
              </View>

              {/* Attach Scan Selector */}
              {scans.length > 0 && (
                <View style={styles.attachSection}>
                  <Text style={styles.attachLabel}>ATTACH RECENT CLINICAL SCAN:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.attachScroll}
                  >
                    {scans.slice(0, 5).map((s) => {
                      const isSel = String(s.id || s._id) === String(selectedScanId);
                      return (
                        <TouchableOpacity
                          key={s.id || s._id}
                          activeOpacity={0.8}
                          onPress={() =>
                            setSelectedScanId(isSel ? null : String(s.id || s._id))
                          }
                          style={[styles.scanChip, isSel && styles.scanChipActive]}
                        >
                          <Ionicons
                            name={isSel ? 'checkmark-circle' : 'scan'}
                            size={14}
                            color={isSel ? '#fb7185' : '#64748b'}
                          />
                          <Text
                            style={[
                              styles.scanChipText,
                              isSel && { color: '#f8fafc', fontWeight: '700' },
                            ]}
                          >
                            {s.condition || s.details || 'Diagnostic Scan'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

              {/* Publish Action Button */}
              <View style={styles.composeBottomBar}>
                <Text style={styles.composeNotice}>YOLOv11-VET Verified Community</Text>
                <TouchableOpacity
                  onPress={handlePost}
                  disabled={posting}
                  style={styles.publishBtn}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#f43f5e', '#be123c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.publishGradient}
                  >
                    {posting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="send" size={14} color="#FFFFFF" />
                        <Text style={styles.publishText}>Post to Forum</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Surface>

            {feedError ? <Text style={styles.feedErrorBanner}>{feedError}</Text> : null}

            <View style={styles.feedHeadingRow}>
              <Ionicons name="chatbubbles" size={16} color="#fb7185" />
              <Text style={styles.feedHeading}>Herd Clinical Discussions</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#64748b" />
              <Text style={styles.emptyTitle}>No Clinical Posts Yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first operator to share a swine health case or ask a question.
              </Text>
            </View>
          )
        }
      />

      {/* Notifications Modal Tray */}
      <Portal>
        <Dialog
          visible={notificationsVisible}
          onDismiss={() => setNotificationsVisible(false)}
          style={styles.notifDialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Community Notifications</Dialog.Title>
          <Dialog.Content>
            {notifications.length > 0 ? (
              <ScrollView style={{ maxHeight: 300 }}>
                {notifications.map((notif, idx) => (
                  <View key={idx} style={styles.notifItem}>
                    <Ionicons name="notifications-outline" size={18} color="#fb7185" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifMsg}>{notif.message || notif.title}</Text>
                      <Text style={styles.notifTime}>{formatDate(notif.createdAt)}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noNotifsText}>No new notifications.</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor="#fb7185" onPress={() => setNotificationsVisible(false)}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    backgroundColor: 'rgba(11, 18, 32, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#f43f5e',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedContent: {
    padding: 16,
    gap: 14,
  },
  composeSection: {
    marginBottom: 4,
  },
  composeCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 16,
  },
  composeTopRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  composeInput: {
    flex: 1,
    fontSize: 14,
    color: '#f8fafc',
    minHeight: 52,
    textAlignVertical: 'top',
  },
  attachSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
    marginBottom: 12,
  },
  attachLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  attachScroll: {
    gap: 8,
  },
  scanChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  scanChipActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#f43f5e',
  },
  scanChipText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  composeBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 12,
  },
  composeNotice: {
    fontSize: 11,
    color: '#64748b',
  },
  publishBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  publishGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  publishText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: '#f43f5e',
    marginBottom: 8,
  },
  feedErrorBanner: {
    fontSize: 12,
    color: '#f59e0b',
    marginBottom: 10,
  },
  feedHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  feedHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  postCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  authorMeta: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  roleBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#fb7185',
    textTransform: 'uppercase',
  },
  postDate: {
    fontSize: 11,
    color: '#64748b',
  },
  postText: {
    fontSize: 13.5,
    color: '#cbd5e1',
    lineHeight: 19,
    marginBottom: 12,
  },
  scanAttachment: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    padding: 12,
    marginBottom: 12,
  },
  scanAttachmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scanTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scanConditionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  severityBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fb7185',
    textTransform: 'uppercase',
  },
  scanMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  scanMetaChip: {
    fontSize: 11,
    color: '#94a3b8',
  },
  scanImagePreview: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  scanNotesText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94a3b8',
  },
  reactionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
    gap: 16,
  },
  reactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  reactBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  reactCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  commentsDrawer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 12,
    paddingTop: 12,
    gap: 10,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 8,
  },
  commentAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06b6d4',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#f8fafc',
  },
  sendCommentBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 260,
  },
  notifDialog: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
  notifItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  notifMsg: {
    fontSize: 12.5,
    color: '#f8fafc',
    marginBottom: 2,
  },
  notifTime: {
    fontSize: 10,
    color: '#64748b',
  },
  noNotifsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 14,
  },
});
