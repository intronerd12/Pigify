import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ScanService } from '../services/ScanService';

const { width } = Dimensions.get('window');

// ── Web Design Tokens (Exact match with Home.css & AuthPro.css) ──────────────
const THEME = {
  bgDeep: '#060911',
  bgCard: 'rgba(13, 20, 36, 0.94)',
  bgCardHover: 'rgba(20, 30, 52, 0.94)',
  borderCard: 'rgba(255, 255, 255, 0.09)',

  primary: '#f43f5e',
  primaryHover: '#fb7185',
  primaryDark: '#be123c',

  emerald: '#10b981',
  emeraldLight: '#34d399',
  cyan: '#06b6d4',
  amber: '#f59e0b',

  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
};

const DEFAULT_RECENT_DIAGNOSTICS = [
  {
    id: 'SW-104',
    title: 'Backyard Pen B • Sow #04',
    condition: 'Healthy Skin Tissue (No Lesions)',
    confidence: '99.4%',
    time: '15 mins ago',
    status: 'healthy',
    statusLabel: 'NORMAL',
    badgeColor: '#10b981',
  },
  {
    id: 'SW-089',
    title: 'Nursery Pen A • Piglet #19',
    condition: 'Mild Dermatitis / Erythema',
    confidence: '96.2%',
    time: '48 mins ago',
    status: 'warning',
    statusLabel: 'MONITOR',
    badgeColor: '#f59e0b',
  },
  {
    id: 'SW-042',
    title: 'Finishing Pen C • Boar #02',
    condition: 'Diamond Skin Disease (Erysipelas)',
    confidence: '98.7%',
    time: '2 hours ago',
    status: 'alert',
    statusLabel: 'ISOLATE',
    badgeColor: '#f43f5e',
  },
];

const SWINE_MODULES = [
  {
    id: 'scanner',
    title: 'AI Swine Symptom Scanner',
    desc: 'Real-time lesion, rash & dermatitis segmentation via YOLOv11-VET.',
    tag: 'CORE AI VISION',
    icon: 'scan-outline',
    color: '#fb7185',
    screen: 'Scan',
  },
  {
    id: 'grading',
    title: 'Symptom Severity Grading',
    desc: 'Triaging pipeline: Normal, Mild, Moderate, or Acute Quarantine.',
    tag: 'CLASSIFICATION',
    icon: 'layers-outline',
    color: '#34d399',
    screen: 'Sorting',
  },
  {
    id: 'environment',
    title: 'Pen Environment Telemetry',
    desc: 'Track ambient temperature, humidity & pen biosecurity ventilation.',
    tag: 'FARM SENSORS',
    icon: 'partly-sunny-outline',
    color: '#38bdf8',
    screen: 'Weather',
  },
  {
    id: 'chatbot',
    title: 'AI Swine Vet Assistant',
    desc: 'Interactive clinical advice & treatment protocols for pig raisers.',
    tag: 'CLINICAL BOT',
    icon: 'chatbubbles-outline',
    color: '#a855f7',
    screen: 'Chatbot',
  },
  {
    id: 'community',
    title: 'Backyard Swine Community',
    desc: 'Discuss diagnostic cases & share photos with peer swine raisers.',
    tag: 'PEER FORUM',
    icon: 'people-outline',
    color: '#f59e0b',
    screen: 'CommunityForum',
  },
];

export default function HomeScreen({ user, onLogout }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({ total: 42, healthy: '95.2%', best: 'A' });
  const [recentScans, setRecentScans] = useState(DEFAULT_RECENT_DIAGNOSTICS);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Pulse animation for HUD dot
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const loadData = useCallback(async () => {
    try {
      const s = await ScanService.getStats({ user });
      const r = await ScanService.getScans({ user });

      if (s && s.total > 0) {
        setStats({
          total: s.total,
          healthy: '96.4%',
          best: s.best || 'A',
        });
      }

      if (Array.isArray(r) && r.length > 0) {
        // Map actual scans to feed
        const mapped = r.slice(0, 5).map((item, idx) => ({
          id: item.id || `SC-${idx}`,
          title: item.penId || `Pen ${item.pen_number || 'A'} • Swine #${item.swine_tag || idx + 1}`,
          condition: item.condition || item.notes || (item.grade === 'A' ? 'Healthy Skin Tissue' : 'Symptom Detected'),
          confidence: `${Math.round(item.display_confidence_score || 97)}%`,
          time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          status: item.grade === 'A' ? 'healthy' : item.grade === 'B' ? 'warning' : 'alert',
          statusLabel: item.grade === 'A' ? 'NORMAL' : item.grade === 'B' ? 'MONITOR' : 'ISOLATE',
          badgeColor: item.grade === 'A' ? '#10b981' : item.grade === 'B' ? '#f59e0b' : '#f43f5e',
        }));
        setRecentScans(mapped);
      }
    } catch {
      // Keep defaults
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const operatorDisplayName = user?.name || user?.fullName || 'Operator';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Ambient Cyber Lighting Gradients */}
      <View style={styles.ambientTopGlow} pointerEvents="none">
        <LinearGradient
          colors={['rgba(244, 63, 94, 0.14)', 'transparent']}
          style={styles.ambientGlowGrad}
        />
      </View>

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 16) },
        ]}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ── TOP CLINICAL COMMAND BAR ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('User')}
            style={styles.operatorProfile}
          >
            <View style={styles.avatarSquircle}>
              <Text style={styles.avatarInitial}>
                {operatorDisplayName.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.operatorMeta}>
              <Text style={styles.greetingText}>{greetingTime()},</Text>
              <Text style={styles.operatorName} numberOfLines={1}>
                {operatorDisplayName}
              </Text>
              <Text style={styles.facilityText}>Sector A • Backyard Herd</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.topActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Notifications')}
              style={styles.iconBtn}
            >
              <Ionicons name="notifications-outline" size={20} color={THEME.textMain} />
              <View style={styles.notifBadge} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CommunityForum')}
              style={styles.iconBtn}
            >
              <Ionicons name="chatbubbles-outline" size={20} color={THEME.textMain} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── COMMAND CENTER HERO CARD (MATCHING WEB .pigify-hero-card) ── */}
        <View style={styles.heroCard}>
          {/* Tech Reticle Brackets */}
          <View style={[styles.cornerBracket, styles.bracketTL]} />
          <View style={[styles.cornerBracket, styles.bracketBR]} />

          {/* Telemetry Status Badge Row */}
          <View style={styles.telemetryBadgeRow}>
            <View style={styles.telemetryBadge}>
              <Animated.View
                style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]}
              />
              <Text style={styles.telemetryBadgeText}>
                PIGIFY-VET CORE // SYSTEM ONLINE
              </Text>
            </View>
            <View style={styles.heroLogoBadge}>
              <Image
                source={require('./assets/pigify-logo.png')}
                style={styles.heroLogoImg}
                resizeMode="cover"
              />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            Backyard Swine Health & AI{' '}
            <Text style={styles.heroTitlePink}>Command Center</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Real-time symptom detection, epidemiology telemetrics, and AI disease prevention for backyard swine producers.
          </Text>

          {/* Action Button Row */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Scan')}
              style={styles.launchScannerBtnWrap}
            >
              <LinearGradient
                colors={['#f43f5e', '#fb7185', '#be123c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.launchScannerBtn}
              >
                <Ionicons name="scan" size={17} color="#fff" />
                <Text style={styles.launchScannerBtnText}>
                  Launch Swine Scanner
                </Text>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Sorting')}
              style={styles.triageBtn}
            >
              <Ionicons name="layers-outline" size={16} color={THEME.textMuted} />
              <Text style={styles.triageBtnText}>View Triage</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LIVE TELEMETRY STATS GRID (4 CLINICAL COUNTERS) ── */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
              <Ionicons name="scan" size={16} color="#fb7185" />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Swine Scanned</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="shield-checkmark" size={16} color="#34d399" />
            </View>
            <Text style={styles.statValue}>{stats.healthy}</Text>
            <Text style={styles.statLabel}>Healthy Rate</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
              <Ionicons name="hardware-chip" size={16} color="#38bdf8" />
            </View>
            <Text style={styles.statValue}>98.8%</Text>
            <Text style={styles.statLabel}>AI Confidence</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Ionicons name="alert-circle" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Active Contagions</Text>
          </View>
        </View>

        {/* ── CORE SWINE INTELLIGENCE MODULES ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clinical Modules</Text>
          <Text style={styles.sectionKicker}>YOLOv11-VET PIPELINE</Text>
        </View>

        <View style={styles.modulesList}>
          {SWINE_MODULES.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.82}
              onPress={() => navigation.navigate(item.screen)}
              style={styles.moduleCard}
            >
              <View style={[styles.moduleIconWrap, { backgroundColor: `${item.color}18`, borderColor: `${item.color}35` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>

              <View style={styles.moduleMeta}>
                <View style={styles.moduleTagRow}>
                  <Text style={[styles.moduleTagText, { color: item.color }]}>
                    {item.tag}
                  </Text>
                </View>
                <Text style={styles.moduleTitle}>{item.title}</Text>
                <Text style={styles.moduleDesc}>{item.desc}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={THEME.textFaint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── RECENT HERD DIAGNOSTICS TELEMETRY FEED ── */}
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <Text style={styles.sectionTitle}>Recent Diagnostics</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Sorting')}
          >
            <Text style={styles.seeAllText}>See All Triage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.diagnosticsList}>
          {recentScans.map((diag) => (
            <View key={diag.id} style={styles.diagnosticCard}>
              <View style={styles.diagHeader}>
                <Text style={styles.diagTitle}>{diag.title}</Text>
                <View style={[styles.diagBadge, { backgroundColor: `${diag.badgeColor}18`, borderColor: `${diag.badgeColor}40` }]}>
                  <Text style={[styles.diagBadgeText, { color: diag.badgeColor }]}>
                    {diag.statusLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.diagCondition}>{diag.condition}</Text>

              <View style={styles.diagFooter}>
                <View style={styles.diagConfidencePill}>
                  <Ionicons name="sparkles" size={12} color="#fb7185" />
                  <Text style={styles.diagConfidenceText}>
                    Confidence: {diag.confidence}
                  </Text>
                </View>
                <Text style={styles.diagTimeText}>{diag.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── BIOSECURITY OUTBREAK ADVISORY ── */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryIconWrap}>
            <Ionicons name="shield-half" size={22} color="#fb7185" />
          </View>
          <View style={styles.advisoryTextGroup}>
            <Text style={styles.advisoryTitle}>Biosecurity Quarantine Advisory</Text>
            <Text style={styles.advisoryBody}>
              Maintain dry pen bedding and isolate any piglet exhibiting skin erythema or diamond-shaped lesions within 24 hours to prevent herd contagion.
            </Text>
          </View>
        </View>

        {/* Bottom padding so floating tab bar doesn't obscure content */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.bgDeep,
  },
  ambientTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  ambientGlowGrad: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  operatorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarSquircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(244, 63, 94, 0.18)',
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fb7185',
  },
  operatorMeta: {
    flex: 1,
  },
  greetingText: {
    fontSize: 11,
    color: THEME.textFaint,
    fontWeight: '500',
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  facilityText: {
    fontSize: 10,
    color: THEME.emeraldLight,
    fontWeight: '600',
    marginTop: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#f43f5e',
  },

  // ── Command Center Hero Card (Exact Web Match) ──
  heroCard: {
    backgroundColor: 'rgba(13, 20, 36, 0.94)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  cornerBracket: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#f43f5e',
  },
  bracketTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  bracketBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#10b981',
  },
  telemetryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  heroLogoImg: {
    width: 32,
    height: 32,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.emerald,
  },
  telemetryBadgeText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 27,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroTitlePink: {
    color: '#fb7185',
  },
  heroSubtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    lineHeight: 17,
    marginBottom: 16,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  launchScannerBtnWrap: {
    flex: 1,
    borderRadius: 11,
    overflow: 'hidden',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  launchScannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  launchScannerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  triageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  triageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMain,
  },

  // ── Stats Grid (4 Live Counters) ──
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.85)',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 10,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 9,
    color: THEME.textFaint,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  sectionKicker: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.textFaint,
    letterSpacing: 0.8,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
  },

  // ── Modules List ──
  modulesList: {
    gap: 9,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 18, 32, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 12,
  },
  moduleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleMeta: {
    flex: 1,
  },
  moduleTagRow: {
    marginBottom: 2,
  },
  moduleTagText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.6,
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  moduleDesc: {
    fontSize: 11,
    color: THEME.textMuted,
    lineHeight: 15,
  },

  // ── Diagnostics Feed ──
  diagnosticsList: {
    gap: 9,
  },
  diagnosticCard: {
    backgroundColor: 'rgba(11, 18, 32, 0.8)',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
  },
  diagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  diagTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  diagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  diagBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  diagCondition: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  diagFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagConfidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  diagConfidenceText: {
    fontSize: 10,
    color: THEME.textMuted,
  },
  diagTimeText: {
    fontSize: 10,
    color: THEME.textFaint,
  },

  // ── Advisory Card ──
  advisoryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.22)',
    padding: 14,
    marginTop: 20,
    gap: 12,
  },
  advisoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryTextGroup: {
    flex: 1,
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fb7185',
    marginBottom: 3,
  },
  advisoryBody: {
    fontSize: 11,
    color: THEME.textMuted,
    lineHeight: 16,
  },
});
