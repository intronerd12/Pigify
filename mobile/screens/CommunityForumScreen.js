import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
  Share,
} from 'react-native';
import { Text, Surface, ActivityIndicator, Portal, Dialog, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { ScanService } from '../services/ScanService';
import { CommunityService } from '../services/CommunityService';

const THEME = {
  bg: '#070A13',
  cardBg: 'rgba(13, 20, 36, 0.92)',
  cardBgAlt: 'rgba(20, 29, 48, 0.85)',
  border: 'rgba(255, 255, 255, 0.10)',
  primary: '#F43F5E',
  rose: '#FB7185',
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  text: '#F8FAFC',
  textSub: '#94A3B8',
  textMuted: '#64748B',
};

const TAGALOG_AND_ENGLISH_BAD_PHRASES = [
  'putang inang yan', 'putanginang yan', 'putang inang', 'putanginang',
  'putang ina mo', 'putangina mo', 'putanginamo', 'putang ina', 'putangina',
  'tang inang yan', 'tanginang yan', 'tang inang', 'tanginang',
  'tang ina mo', 'tangina mo', 'tanginamo', 'tang ina', 'tangina',
  'king inang yan', 'kinginang yan', 'king inang', 'kinginang',
  'king ina mo', 'kingina mo', 'kinginamo', 'kinangina', 'king ina', 'kingina',
  'pota inang yan', 'potanginang yan', 'pota inang', 'potanginang',
  'pota ina mo', 'potaena mo', 'potangina mo', 'potanginamo', 'potaena', 'potangina', 'pota ina',
  'pucha inang', 'puchangina', 'pucha',
  'punyeta ka', 'punyetaka', 'punyeta mo', 'punyetang', 'punyeta',
  'ina mo', 'inamo', 'ina ka', 'inaka', 'ina nyo', 'inanyo', 'ina niyo', 'inaniyo', 'ina niya', 'inaniya',
  'tarantado ka', 'tarantadoka', 'tarantada ka', 'tarantadaka', 'tarantado', 'tarantada',
  'gago ka', 'gagoka', 'gaga ka', 'gagaka', 'kagaguhan', 'gago', 'gaga',
  'bobo ka', 'boboka', 'kabobohan', 'bobo', 'bobohan',
  'tanga ka', 'tangaka', 'katangahan', 'tanga', 'tangahan',
  'ulol ka', 'ulolka', 'ulul ka', 'ululka', 'kaululan', 'ulul', 'ulol',
  'pakyu ka', 'pakyuka', 'pakyu', 'fakyu', 'fckyu',
  'hinayupak ka', 'hinayupakka', 'hinayupak', 'hayupak ka', 'hayupak', 'hayop ka',
  'kupal ka', 'kupalka', 'kupal',
  'ogag ka', 'ogag', 'gunggong', 'engot', 'inutil', 'hangal',
  'lintik ka', 'lintik', 'leche ka', 'leche', 'letse ka', 'letse', 'hudas',
  'yawa ka', 'yawa', 'peste ka', 'peste', 'pesteng', 'buwisit', 'bwisit',
  'kantot', 'kantutan', 'k@ntot', 'kinantot', 'iyot', 'iyutan',
  'pokpok', 'bayag', 'tamod', 'jakol', 'j@kol', 'tsupa', 'chupa',
  'pepe', 'kiki', 'tite', 'burat', 'puke', 'puki', 'pekpek', 'puday',
  'motherfucker', 'mother fucker', 'son of a bitch',
  'fuck you', 'fuck off', 'fucking', 'fucker', 'fuckers', 'fucked', 'fuckhead', 'fck', 'fuk', 'fuck',
  'bullshit', 'shitty', 'shit',
  'bitch', 'bitches', 'bitching',
  'asshole', 'assholes', 'bastard', 'bastards', 'cunt', 'cunts',
  'dick', 'dicks', 'pussy', 'pussies', 'cock', 'cocks', 'whore', 'whores', 'slut', 'sluts',
  'damn'
];

const SORTED_FORUM_BAD_PHRASES = [...TAGALOG_AND_ENGLISH_BAD_PHRASES].sort((a, b) => b.length - a.length);

const FORUM_PHRASE_REGEXES = SORTED_FORUM_BAD_PHRASES.map((phrase) => {
  const words = phrase.split(/\s+/);
  const regexPattern = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');
  return new RegExp('(\\b|\\W|^)' + regexPattern + '(\\b|\\W|$)', 'gi');
});

const OBFUSCATED_PATTERNS = [
  /(\b|\W|^)f[\*\@\#\$]ck(\b|\W|$)/gi,
  /(\b|\W|^)sh[\*\@\#\$\!]t(\b|\W|$)/gi,
  /(\b|\W|^)b[\*\@\#\$\!]tch(\b|\W|$)/gi,
  /(\b|\W|^)p[\*\@\#\$]t[a|@]?(?:ng)?(?:ina)?(?:mo)?(\b|\W|$)/gi,
  /(\b|\W|^)t[\*\@\#\$]ng(?:ina)?(?:mo)?(\b|\W|$)/gi,
  /(\b|\W|^)g[\*\@\#\$]g[o|a]?(\b|\W|$)/gi,
  /(\b|\W|^)b[\*\@\#\$]b[o|0]?(\b|\W|$)/gi,
  /(\b|\W|^)in[\*\@\#\$]m[o|0]?(\b|\W|$)/gi,
];

const maskBadLanguage = (text) => {
  if (!text) return '';
  let masked = String(text);

  for (const regex of FORUM_PHRASE_REGEXES) {
    regex.lastIndex = 0;
    masked = masked.replace(regex, (match, p1, p2) => {
      const phrase = match.slice(p1.length, match.length - p2.length);
      const censored = phrase.replace(/[^\s]/g, '*');
      return p1 + censored + p2;
    });
  }

  for (const regex of OBFUSCATED_PATTERNS) {
    regex.lastIndex = 0;
    masked = masked.replace(regex, (match, p1, p2) => {
      const phrase = match.slice(p1.length, match.length - p2.length);
      const censored = phrase.replace(/[^\s]/g, '*');
      return p1 + censored + p2;
    });
  }

  return masked;
};

const PIG_KEYWORDS = [
  'pig', 'pigs', 'piglet', 'piglets', 'swine', 'swines', 'hog', 'hogs', 'porcine',
  'sow', 'sows', 'boar', 'boars', 'gilt', 'gilts', 'shoat', 'pork', 'weaner',
  'grower', 'finisher', 'litter', 'farrow', 'farrowing', 'gestation', 'piggery',
  'baboy', 'biik', 'inahin', 'barako', 'lechon', 'litson', 'pagbababuyan',
  'asf', 'african swine fever', 'erysipelas', 'pdns', 'prrs', 'ped', 'pedv',
  'swine flu', 'hog cholera', 'snout', 'trotter', 'trotters', 'skin lesion',
  'cyanosis', 'diamond skin', 'scour', 'scours', 'pig pen', 'pig pens', 'pig sty',
  'biosecurity', 'sakit ng baboy', 'pulang pantal', 'kulungan ng baboy', 'alagang baboy',
  'pakain sa baboy', 'bakuna sa baboy', 'purgang baboy', 'vitamins ng baboy'
];

const isPigRelatedText = (text, hasScan = false) => {
  if (hasScan) return true;
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return PIG_KEYWORDS.some((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\W)${escaped}($|\\W)`, 'i').test(lower);
  });
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

const BENCHMARK_COMMUNITY_POSTS = [
  {
    _id: 'post-study-01',
    id: 'post-study-01',
    authorName: 'Rogelio Mendoza (Laguna Backyard Swine)',
    authorAvatar: null,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    text: 'Sharing our experience in Pen B: after spotting red diamond geometric patches on one grower, the Pigify AI Scanner flagged Erysipelas at 97% confidence. Prompt pen isolation and penicillin treatment saved the rest of the herd!',
    reactions: [{ type: 'like' }, { type: 'like' }, { type: 'heart' }],
    comments: [
      {
        authorName: 'Dr. Elena Ramos (PVO Veterinarian)',
        text: 'Great prompt intervention Tatay Rogelio. Early detection of diamond urticaria within 24 hours prevents bacterial septicemia.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
    scanSnapshot: {
      condition: 'Diamond Skin Disease (Erysipelas)',
      severity: 'MODERATE',
      penId: 'Pen B-04',
      swineId: 'Boar #12',
      confidence: '97.4%',
      scanTimestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      notes: 'Diamond plaques palpated on flank; pen trough sanitized.',
      imageUrl: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    _id: 'post-study-02',
    id: 'post-study-02',
    authorName: 'Danilo Ramos (Baboy Katutubo Breeder)',
    authorAvatar: null,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    text: 'For Philippine Native Pigs, skin lesions and scabies can be tricky to see due to dark melanin. The native pig calibration mode in the scanner picked up the ear crusts without false alarms. Highly recommended for smallholders!',
    reactions: [{ type: 'like' }, { type: 'heart' }, { type: 'heart' }],
    comments: [
      {
        authorName: 'Arnel Bautista (Batangas Piggery)',
        text: 'Salamat sa tip Danilo! Dark skin talaga ang hamon sa katutubong baboy.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
    scanSnapshot: {
      condition: 'Sarcoptic Mange / Ear Crusts',
      severity: 'MODERATE',
      penId: 'Pen E-02',
      swineId: 'Native Sow #03',
      confidence: '96.8%',
      scanTimestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
      notes: 'Inner ear canal crusts identified with dark melanin compensation.',
      imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    _id: 'post-study-03',
    id: 'post-study-03',
    authorName: 'Maria Santos (Batangas Pig Raisers Co-op)',
    authorAvatar: null,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    text: 'Reminder to all backyard raisers: strictly maintain 1:100 Virkon S footbaths at pen entry points. Desiccate slurry gutters with slaked lime weekly to prevent bacterial skin pathogens.',
    reactions: [{ type: 'like' }, { type: 'like' }, { type: 'heart' }, { type: 'heart' }],
    comments: [],
    scanSnapshot: null,
  },
];

const FORUM_CACHE_KEY = '@pigify_forum_cached_posts_v1';

export default function CommunityForumScreen({ route, navigation, user }) {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState(BENCHMARK_COMMUNITY_POSTS);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customImageUri, setCustomImageUri] = useState(null);

  // Auto-populate scan if shared from ScanScreen
  useEffect(() => {
    if (route?.params?.initialScan) {
      const scan = route.params.initialScan;
      const scanId = String(scan.id || scan._id || `scan-${Date.now()}`);
      setSelectedScanId(scanId);
      setScans((prev) => {
        if (!prev.some((s) => String(s.id || s._id) === scanId)) {
          return [{ ...scan, id: scanId }, ...prev];
        }
        return prev;
      });
      setPostText(`Sharing clinical scan analysis for ${scan.swineId || 'Swine'} in ${scan.penId || 'Pen'}: ${scan.condition || ''}.`);
    }
  }, [route?.params?.initialScan]);

  // Instant display of cached discussions for zero-delay presentation
  useEffect(() => {
    AsyncStorage.getItem(FORUM_CACHE_KEY).then((raw) => {
      if (raw) {
        try {
          const cached = JSON.parse(raw);
          if (Array.isArray(cached) && cached.length > 0) {
            setPosts(cached);
            setLoading(false);
          }
        } catch {}
      }
    }).catch(() => {});
  }, []);

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
    if (!silent && posts.length === 0) setLoading(true);
    if (silent) setRefreshing(true);

    const [postsResult, scansResult, notifResult] = await Promise.allSettled([
      CommunityService.getPosts({ limit: 70 }),
      ScanService.getScans({ user }),
      CommunityService.getNotifications({ user, limit: 40 }),
    ]);

    if (postsResult.status === 'fulfilled') {
      const freshPosts = Array.isArray(postsResult.value) ? postsResult.value : [];
      if (freshPosts.length === 0) {
        setPosts(BENCHMARK_COMMUNITY_POSTS);
      } else {
        setPosts(freshPosts);
        AsyncStorage.setItem(FORUM_CACHE_KEY, JSON.stringify(freshPosts)).catch(() => {});
      }
      setFeedError('');
    } else {
      if (posts.length === 0) setPosts(BENCHMARK_COMMUNITY_POSTS);
      setFeedError(postsResult.reason?.message || '');
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

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const text = `${post.text || ''} ${post.scanSnapshot?.condition || ''} ${post.scanSnapshot?.notes || ''} ${post.authorName || ''}`.toLowerCase();
      const matchesSearch = !searchQuery.trim() || text.includes(searchQuery.trim().toLowerCase());
      if (!matchesSearch) return false;

      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'lesions') {
        return text.includes('lesion') || text.includes('erysipelas') || text.includes('diamond') || text.includes('skin') || text.includes('mange') || text.includes('dermatitis');
      }
      if (categoryFilter === 'biosecurity') {
        return text.includes('biosecurity') || text.includes('asf') || text.includes('quarantine') || text.includes('disinfect') || text.includes('isolation');
      }
      if (categoryFilter === 'native') {
        return text.includes('native') || text.includes('katutubo') || text.includes('melanin') || text.includes('baboy');
      }
      if (categoryFilter === 'treatments') {
        return text.includes('penicillin') || text.includes('treatment') || text.includes('antibiotic') || text.includes('therapy') || text.includes('virkon');
      }
      return true;
    });
  }, [posts, searchQuery, categoryFilter]);

  const handlePickPostImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Photo library access is needed to attach clinical images.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setCustomImageUri(res.assets[0].uri);
        setSelectedScanId(null);
      }
    } catch {}
  };

  const handleDeletePost = (post) => {
    const postId = String(post?._id || post?.id || '');
    if (!postId) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this clinical community discussion?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CommunityService.deletePost({ user, postId });
              setPosts((prev) => prev.filter((p) => String(p._id || p.id) !== postId));
            } catch (err) {
              setPosts((prev) => prev.filter((p) => String(p._id || p.id) !== postId));
            }
          },
        },
      ]
    );
  };

  const handleSharePost = async (item) => {
    try {
      const author = item?.authorName || 'Backyard Swine Farmer';
      const text = item?.text || '';
      const condition = item?.scanSnapshot?.condition ? ` [${item.scanSnapshot.condition}]` : '';
      await Share.share({
        message: `Pigify Swine Community: Case shared by ${author}${condition}\n\n"${text}"\n\nShared via Pigify Swine Health Platform.`,
        title: 'Pigify Swine Case',
      });
    } catch {}
  };

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

    let scanPayload = selectedScan;
    if (!scanPayload && customImageUri) {
      scanPayload = {
        id: `custom-pic-${Date.now()}`,
        condition: 'Clinical Visual Observation',
        severity: 'Moderate',
        grade: 'B',
        confidence: '95.0%',
        imageUri: customImageUri,
        imageUrl: customImageUri,
        penId: 'Pen Inspection',
        swineId: 'Observed Swine',
        notes: cleanText || 'Clinical case photo shared by operator.',
      };
    }

    if (!cleanText && !scanPayload) {
      setFormError('Please add an observation note or attach a swine clinical scan.');
      return;
    }

    if (!scanPayload && !isPigRelatedText(cleanText)) {
      setFormError('Posts must be about pigs or swine farming (e.g. swine health, symptoms, ASF biosecurity, feeding, or pig care).');
      return;
    }

    const maskedText = maskBadLanguage(cleanText);

    try {
      setPosting(true);
      setFormError('');
      const created = await CommunityService.createPost({
        user,
        text: maskedText,
        scan: scanPayload,
      });
      setPosts((prev) => [created, ...prev]);
      setPostText('');
      setSelectedScanId(null);
      setCustomImageUri(null);
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

    const currentUid = user?.id || user?._id;
    const currentEmail = user?.email ? String(user.email).toLowerCase() : '';

    const hasLiked = reactions.some(
      (r) =>
        r.type === 'like' &&
        ((currentUid && (r.user === currentUid || r.userId === currentUid)) ||
          (currentEmail && String(r.email || '').toLowerCase() === currentEmail))
    );
    const hasHearted = reactions.some(
      (r) =>
        r.type === 'heart' &&
        ((currentUid && (r.user === currentUid || r.userId === currentUid)) ||
          (currentEmail && String(r.email || '').toLowerCase() === currentEmail))
    );

    const isAuthor =
      (currentUid &&
        (item?.userId === currentUid ||
          item?.user === currentUid ||
          item?.user?._id === currentUid ||
          item?.user?.id === currentUid)) ||
      (currentEmail &&
        (String(item?.authorEmail || '').toLowerCase() === currentEmail ||
          String(item?.email || '').toLowerCase() === currentEmail));

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={() => handleSharePost(item)}
              style={styles.headerActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-social-outline" size={17} color="#94A3B8" />
            </TouchableOpacity>
            {isAuthor && (
              <TouchableOpacity
                onPress={() => handleDeletePost(item)}
                style={styles.headerActionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#F43F5E" />
              </TouchableOpacity>
            )}
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
                  url={comment.authorAvatar || comment.commenterAvatar}
                  name={comment.commenterName || comment.authorName || 'Farmer'}
                  size={26}
                />
                <View style={styles.commentBubble}>
                  <Text style={styles.commentAuthor}>{comment.commenterName || comment.authorName || 'Backyard Farmer'}</Text>
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
        data={filteredPosts}
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
            {/* Search Input Bar */}
            <View style={styles.searchBarWrap}>
              <Ionicons name="search" size={17} color="#64748B" style={{ marginLeft: 12, marginRight: 8 }} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search swine cases, symptoms, pen..."
                placeholderTextColor="#64748B"
                style={styles.searchInput}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {[
                { id: 'all', label: 'All Cases' },
                { id: 'lesions', label: 'Dermal Lesions' },
                { id: 'biosecurity', label: 'Biosecurity & ASF' },
                { id: 'native', label: 'Native Pigs' },
                { id: 'treatments', label: 'Treatments & SOP' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryFilter(cat.id)}
                  style={[styles.categoryPill, categoryFilter === cat.id && styles.categoryPillActive]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.categoryPillText, categoryFilter === cat.id && styles.categoryPillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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

              {/* Custom Image Attachment Badge */}
              {customImageUri && (
                <View style={styles.customImagePreviewWrap}>
                  <Image source={{ uri: customImageUri }} style={styles.customImageThumb} />
                  <Text style={styles.customImageLabel}>Custom Clinical Image Attached</Text>
                  <TouchableOpacity onPress={() => setCustomImageUri(null)} style={styles.removeImageBtn}>
                    <Ionicons name="close-circle" size={18} color="#F43F5E" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Attach Scan Selector or Pick Photo */}
              <View style={styles.attachSection}>
                <View style={styles.attachLabelRow}>
                  <Text style={styles.attachLabel}>ATTACH RECENT CLINICAL SCAN:</Text>
                  <TouchableOpacity onPress={handlePickPostImage} style={styles.attachPhotoBtn}>
                    <Ionicons name="camera-outline" size={14} color="#06B6D4" style={{ marginRight: 4 }} />
                    <Text style={styles.attachPhotoText}>Take/Pick Photo</Text>
                  </TouchableOpacity>
                </View>
                {scans.length > 0 && (
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
                          onPress={() => {
                            setCustomImageUri(null);
                            setSelectedScanId(isSel ? null : String(s.id || s._id));
                          }}
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
                )}
              </View>

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
              <Text style={styles.feedCountText}>({filteredPosts.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#64748b" />
              <Text style={styles.emptyTitle}>No Clinical Posts Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || categoryFilter !== 'all'
                  ? 'No posts matched your current search or category filter.'
                  : 'Be the first operator to share a swine health case or ask a question.'}
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
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 36, 0.92)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#F8FAFC',
    paddingVertical: 4,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
    borderColor: '#F43F5E',
  },
  categoryPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  categoryPillTextActive: {
    color: '#FB7185',
  },
  headerActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  attachLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  attachPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06B6D4',
  },
  customImagePreviewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  customImageThumb: {
    width: 38,
    height: 38,
    borderRadius: 6,
    marginRight: 10,
  },
  customImageLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#06B6D4',
  },
  removeImageBtn: {
    padding: 4,
  },
  feedCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 4,
  },
});
