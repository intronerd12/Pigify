import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { Text, Surface, Avatar, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

import { ScanService } from '../services/ScanService';

const { width } = Dimensions.get('window');

// ── Vibrant Signature Mobile Palette ──────────────────────────────────────────
const THEME = {
  primary: '#C71585',       // Deep Rose / Dragon Pink
  primaryDark: '#8B008B',   // Dark Magenta
  primaryLight: '#FF69B4',  // Hot Pink
  secondary: '#FFC0CB',    // Soft Pink
  accent: '#00B894',       // Emerald
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  success: '#00B894',
  border: '#E2E8F0',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const PRO_TIPS = [
  { id: 1, key: 'symptoms', title: 'Symptom Recognition', icon: 'medkit', color: '#FF7675' },
  { id: 2, key: 'ventilation', title: 'Pen Climate & THI', icon: 'thermometer', color: '#74B9FF' },
  { id: 3, key: 'biosecurity', title: 'Biosecurity Protocol', icon: 'shield-checkmark', color: '#55EFC4' },
  { id: 4, key: 'nutrition', title: 'Swine Feed & Growth', icon: 'nutrition', color: '#FDCB6E' },
];

const getGradeColor = (grade) => {
  const value = String(grade || 'N/A').toUpperCase();
  if (value === 'A') return '#00B894';
  if (value === 'B') return '#8BC34A';
  if (value === 'C') return '#FF9800';
  if (value === 'D') return '#EF5350';
  return '#90A4AE';
};

export default function HomeScreen({ user, onLogout }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({ total: 0, best: 'A', avg: '96%' });
  const [recentScans, setRecentScans] = useState([]);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Initial Entry Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Pulse animation for hero scan button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.07,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim]);

  const loadData = useCallback(async () => {
    try {
      const s = await ScanService.getStats({ user });
      const r = await ScanService.getScans({ user });
      if (s) {
        setStats({
          total: s.total || 0,
          best: s.best || 'A',
          avg: s.avg || (s.total > 0 ? '96%' : '0%'),
        });
      }
      if (Array.isArray(r) && r.length > 0) {
        setRecentScans(r.slice(0, 5));
      }
    } catch {
      // Keep state
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleLogoutPress = () => setLogoutVisible(true);

  const handleLogoutConfirm = async () => {
    setLogoutVisible(false);
    try {
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCommunityPress = () => navigation.navigate('CommunityForum');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Immersive Curved Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[THEME.primaryDark, THEME.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Ambient Decorative Circles */}
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />

        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate('User')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Avatar.Image
                  size={46}
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={46}
                  label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'SW'}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.username}>{user?.name || 'Swine Operator'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleCommunityPress} style={styles.headerBtn}>
              <BlurView intensity={24} style={styles.blurBtn}>
                <Ionicons name="people-outline" size={20} color={THEME.white} />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogoutPress} style={styles.headerBtn}>
              <BlurView intensity={24} style={styles.blurBtn}>
                <Ionicons name="log-out-outline" size={20} color={THEME.white} />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={() => setLogoutVisible(false)}
          style={{ backgroundColor: THEME.white, borderRadius: 20 }}
        >
          <Dialog.Icon icon="alert-circle-outline" color={THEME.primary} size={36} />
          <Dialog.Title style={{ textAlign: 'center', color: THEME.textDark, fontWeight: '700' }}>
            Logout of Pigify?
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ textAlign: 'center', color: THEME.textLight }}>
              Are you sure you want to log out of your Pigify Swine account?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 }}>
            <Button onPress={() => setLogoutVisible(false)} textColor={THEME.textLight}>
              Cancel
            </Button>
            <Button onPress={handleLogoutConfirm} mode="contained" buttonColor={THEME.primary}>
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Main Scroll Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Floating Telemetry Stats Cards */}
        <View style={styles.statsRow}>
          <Surface style={styles.statCard} elevation={3}>
            <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.statGradient}>
              <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="time" size={20} color="#2196F3" />
              </View>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </LinearGradient>
          </Surface>

          <Surface style={styles.statCard} elevation={3}>
            <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.statGradient}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#00B894" />
              </View>
              <Text style={styles.statValue}>{stats.best}</Text>
              <Text style={styles.statLabel}>Best Health</Text>
            </LinearGradient>
          </Surface>

          <Surface style={styles.statCard} elevation={3}>
            <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.statGradient}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="pulse" size={20} color="#FF9F43" />
              </View>
              <Text style={styles.statValue}>{stats.avg}</Text>
              <Text style={styles.statLabel}>Health Avg</Text>
            </LinearGradient>
          </Surface>
        </View>

        {/* Hero Central Pulsating SCAN Section */}
        <View style={styles.heroSection}>
          <Text style={styles.sectionTitle}>Swine Health Check</Text>
          <Text style={styles.sectionSubtitle}>Tap to analyze swine symptoms with YOLOv11-VET</Text>
          <View style={styles.scanWrapper}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.scanButtonContainer}
                onPress={() => navigation.navigate('Scan')}
                activeOpacity={0.9}
              >
                <View style={styles.scanGlow} />
                <LinearGradient
                  colors={[THEME.primary, THEME.primaryDark]}
                  style={styles.scanButtonOuter}
                >
                  <View style={styles.scanButtonInner}>
                    {/* Corner Reticle Accents */}
                    <View style={styles.reticleTopLeft} />
                    <View style={styles.reticleTopRight} />
                    <View style={styles.reticleBottomLeft} />
                    <View style={styles.reticleBottomRight} />

                    <Ionicons name="scan" size={44} color={THEME.primary} />
                    <Text style={styles.scanText}>SCAN</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Pen Climate & Environmental Telemetry */}
        <View style={styles.mapEnvSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pen Climate & GIS Telemetry</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MappingEnvironment')}
              activeOpacity={0.8}
              style={styles.headerPillBtn}
            >
              <Ionicons name="open-outline" size={15} color={THEME.primary} />
              <Text style={styles.seeAllText}>Open</Text>
            </TouchableOpacity>
          </View>

          <Surface style={styles.mapEnvCard} elevation={3}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F4F8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mapEnvGradient}
            >
              <View style={styles.mapEnvTopRow}>
                <View style={styles.mapEnvIcon}>
                  <Ionicons name="earth" size={24} color={THEME.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapEnvHeadline}>Swine Pen Biosecurity & Climate</Text>
                  <Text style={styles.mapEnvSubtext} numberOfLines={2}>
                    Live heat stress index (THI), ventilation alerts, and farm GIS mapping.
                  </Text>
                </View>
              </View>

              <View style={styles.mapEnvActionsRow}>
                <TouchableOpacity
                  style={[styles.mapEnvAction, { backgroundColor: '#E3F2FD' }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('MappingEnvironment', { openMap: true })}
                >
                  <Ionicons name="map-outline" size={17} color="#1565C0" />
                  <Text style={[styles.mapEnvActionText, { color: '#1565C0' }]}>GIS Map</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mapEnvAction, { backgroundColor: '#E8F5E9' }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Weather')}
                >
                  <Ionicons name="partly-sunny-outline" size={17} color="#2E7D32" />
                  <Text style={[styles.mapEnvActionText, { color: '#2E7D32' }]}>Climate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mapEnvAction, { backgroundColor: '#F3E5F5' }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('MappingEnvironment')}
                >
                  <Ionicons name="analytics-outline" size={17} color={THEME.primaryDark} />
                  <Text style={[styles.mapEnvActionText, { color: THEME.primaryDark }]}>Telemetry</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        {/* Clinical Swine Pathology Pro Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Swine Clinical Guide</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Guide')}
              activeOpacity={0.8}
              style={styles.headerPillBtn}
            >
              <Ionicons name="book-outline" size={15} color={THEME.primary} />
              <Text style={styles.seeAllText}>View Guide</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScroll}>
            {PRO_TIPS.map((tip) => (
              <TouchableOpacity
                key={tip.id}
                style={[styles.tipCard, { marginRight: 14 }]}
                onPress={() => navigation.navigate('Guide', { initialTab: tip.key })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[tip.color, '#FFFFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tipGradient}
                >
                  <Ionicons name={tip.icon} size={22} color="#FFFFFF" style={styles.tipIcon} />
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Swine Diagnostic Scans */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Diagnostic Scans</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Sorting')}
              activeOpacity={0.8}
              style={styles.headerPillBtn}
            >
              <Ionicons name="funnel-outline" size={15} color={THEME.primary} />
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentScans.length === 0 ? (
            <Surface style={styles.emptyCard} elevation={1}>
              <Ionicons name="scan-circle-outline" size={44} color={THEME.primaryLight} />
              <Text style={styles.emptyTitle}>No swine scans recorded yet</Text>
              <Text style={styles.emptySub}>
                Tap the SCAN button above to diagnose lesions or verify pig health status.
              </Text>
            </Surface>
          ) : (
            recentScans.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                onPress={() => navigation.navigate('Sorting')}
                activeOpacity={0.88}
              >
                <Surface style={styles.recentItem} elevation={2}>
                  <View style={styles.recentLeft}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.recentImage} />
                    ) : (
                      <View style={styles.recentIconBox}>
                        <Ionicons name="shield-checkmark" size={24} color={THEME.primary} />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.recentName} numberOfLines={1}>
                        {item.disease_detected || item.condition || item.notes || 'Swine Health Scan'}
                      </Text>
                      <Text style={styles.recentDate}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Today'} •{' '}
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Recorded'}
                      </Text>
                      <Text numberOfLines={1} style={styles.recentSubText}>
                        {item.triage_recommendation || item.severity || 'Normal physiological baseline'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recentRight}>
                    <View
                      style={[
                        styles.gradeContainer,
                        { backgroundColor: `${getGradeColor(item.grade)}18` },
                      ]}
                    >
                      <Text style={[styles.gradeValue, { color: getGradeColor(item.grade) }]}>
                        {String(item.grade || 'A').toUpperCase()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </View>
                </Surface>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerContainer: {
    height: 118,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    zIndex: 10,
  },
  patternCircle1: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  patternCircle3: {
    position: 'absolute',
    top: 30,
    left: '42%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    backgroundColor: THEME.surface,
  },
  avatarLabel: {
    color: THEME.primary,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: THEME.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
  },
  username: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: THEME.white,
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statGradient: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 18,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textDark,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.textDark,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 3,
  },
  scanWrapper: {
    marginTop: 18,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonContainer: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: THEME.primary,
    opacity: 0.22,
    transform: [{ scale: 1.12 }],
  },
  scanButtonOuter: {
    width: 156,
    height: 156,
    borderRadius: 78,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 14,
  },
  scanButtonInner: {
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: THEME.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
  },
  reticleTopLeft: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primaryLight,
  },
  reticleTopRight: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primaryLight,
  },
  reticleBottomLeft: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primaryLight,
  },
  reticleBottomRight: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primaryLight,
  },
  scanText: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.primary,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  mapEnvSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(199, 21, 133, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
    marginLeft: 4,
  },
  mapEnvCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: THEME.white,
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  mapEnvGradient: {
    padding: 16,
    borderRadius: 20,
  },
  mapEnvTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mapEnvIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(199, 21, 133, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mapEnvHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },
  mapEnvSubtext: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 2,
    lineHeight: 16,
  },
  mapEnvActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mapEnvAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  mapEnvActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipsScroll: {
    marginTop: 4,
  },
  tipCard: {
    width: 140,
    height: 86,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  tipGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  tipIcon: {
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
    lineHeight: 15,
  },
  recentSection: {
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: THEME.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginTop: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#1E293B',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  recentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(199, 21, 133, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },
  recentDate: {
    fontSize: 11,
    color: THEME.textLight,
    marginTop: 2,
  },
  recentSubText: {
    fontSize: 11,
    color: THEME.primaryDark,
    marginTop: 2,
    fontWeight: '500',
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  gradeContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  gradeValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
