import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Avatar, Dialog, Portal, Button, Paragraph } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  getActiveApiUrl,
  setActiveApiUrl,
  resetActiveApiUrl,
  checkBackendHealth,
  getBackendEnvironments,
} from '../services/api';

const { width } = Dimensions.get('window');

// ── Web Design Tokens (Exact match with Home.css & AuthPro.css) ───────────────
const THEME = {
  bgDeep: '#070A13',
  bgCard: 'rgba(13, 20, 36, 0.92)',
  borderCard: 'rgba(255, 255, 255, 0.10)',
  borderCardHover: 'rgba(244, 63, 94, 0.35)',

  primary: '#F43F5E',
  primaryHover: '#FB7185',
  primaryDark: '#BE123C',
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',

  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
};

export default function UserScreen({ navigation, user, onLogout }) {
  const insets = useSafeAreaInsets();
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Backend Environment State
  const [backendModalVisible, setBackendModalVisible] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(getActiveApiUrl());
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    setCurrentApiUrl(getActiveApiUrl());
  }, [backendModalVisible]);

  const handleTestConnection = async (targetUrl) => {
    setTestingBackend(true);
    setBackendHealth(null);
    try {
      const urlToTest = targetUrl || currentApiUrl || getActiveApiUrl();
      const res = await checkBackendHealth(urlToTest);
      setBackendHealth(res);
    } catch (err) {
      setBackendHealth({ ok: false, error: err?.message || 'Failed to ping backend' });
    } finally {
      setTestingBackend(false);
    }
  };

  const handleSelectEnvironment = async (url) => {
    await setActiveApiUrl(url, true);
    setCurrentApiUrl(url);
    handleTestConnection(url);
  };

  const handleApplyCustomUrl = async () => {
    const trimmed = String(customUrlInput || '').trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      Alert.alert('Invalid URL', 'Please enter a valid HTTP or HTTPS URL (e.g. http://192.168.8.153:5000)');
      return;
    }
    await setActiveApiUrl(trimmed, true);
    setCurrentApiUrl(trimmed);
    setCustomUrlInput('');
    handleTestConnection(trimmed);
  };

  const handleResetEnvironment = async () => {
    await resetActiveApiUrl();
    const defaultUrl = getActiveApiUrl();
    setCurrentApiUrl(defaultUrl);
    handleTestConnection(defaultUrl);
  };

  const operatorName = user?.name || user?.fullName || 'Swine Operator';
  const operatorEmail = user?.email || 'operator@pigify.ai';
  const operatorRole = user?.role || 'Swine Operator';

  const handleLogoutConfirm = () => {
    setLogoutVisible(false);
    if (onLogout) onLogout();
  };

  const MENU_SECTIONS = [
    {
      title: 'OPERATOR CREDENTIALS',
      items: [
        {
          id: 'edit_profile',
          icon: 'person-outline',
          title: 'Operator Profile',
          subtitle: 'Update clinical identity and credentials',
          action: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Outbreak Alerts',
          subtitle: 'Manage swine disease outbreak push alerts',
          action: () => navigation.navigate('Notifications'),
        },
        {
          id: 'community',
          icon: 'people-outline',
          title: 'Swine Community',
          subtitle: 'Peer discussions with backyard pig raisers',
          action: () => navigation.navigate('CommunityForum'),
        },
      ],
    },
    {
      title: 'FARM TELEMETRY & GIS',
      items: [
        {
          id: 'pen_sensors',
          icon: 'partly-sunny-outline',
          title: 'Pen Climate & Heat Stress',
          subtitle: 'Ambient temperature, humidity & THI index',
          action: () => navigation.navigate('Weather'),
        },
        {
          id: 'gis_mapping',
          icon: 'map-outline',
          title: 'Farm GIS & Pen Mapping',
          subtitle: 'Spatial telemetry and quarantine sectors',
          action: () => navigation.navigate('MappingEnvironment'),
        },
      ],
    },
    {
      title: 'CLINICAL PROTOCOLS',
      items: [
        {
          id: 'guide',
          icon: 'book-outline',
          title: 'Swine Pathology Manual',
          subtitle: 'Erysipelas, Greasy Pig & PDNS lesion guides',
          action: () => navigation.navigate('Guide'),
        },
        {
          id: 'ai_vet',
          icon: 'chatbubble-ellipses-outline',
          title: 'AI Swine Vet Assistant',
          subtitle: 'Interactive diagnostic consultations',
          action: () => navigation.navigate('Chatbot'),
        },
      ],
    },
    {
      title: 'SYSTEM & BACKEND TELEMETRY',
      items: [
        {
          id: 'backend_env',
          icon: 'server-outline',
          title: 'Backend Environments',
          subtitle: `Active: ${currentApiUrl || 'Auto-detecting...'}`,
          action: () => {
            setBackendModalVisible(true);
            handleTestConnection(currentApiUrl);
          },
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Atmospheric Multi-radial Glow Overlays */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowTopRight} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
        {/* Operator Profile Card with Corner Reticles */}
        <View style={styles.profileCard}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Avatar.Image
                  size={76}
                  source={{ uri: user.avatar }}
                  style={{ backgroundColor: '#0D1424' }}
                />
              ) : (
                <Avatar.Text
                  size={76}
                  label={operatorName ? operatorName.substring(0, 2).toUpperCase() : 'SW'}
                  style={{ backgroundColor: '#0D1424', borderWidth: 1.5, borderColor: THEME.primary }}
                  labelStyle={{ color: THEME.primaryHover, fontWeight: 'bold', fontSize: 26 }}
                />
              )}
              <TouchableOpacity
                style={styles.editBadge}
                onPress={() => navigation.navigate('EditProfile')}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{operatorName}</Text>
            <Text style={styles.userEmail}>{operatorEmail}</Text>

            <View style={styles.roleChip}>
              <Ionicons name="shield-checkmark" size={12} color="#34D399" style={{ marginRight: 4 }} />
              <Text style={styles.roleText}>{operatorRole.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Telemetry Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
              <Ionicons name="scan-outline" size={18} color="#38BDF8" />
            </View>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="pulse" size={18} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>96.4%</Text>
            <Text style={styles.statLabel}>Herd Health</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
              <Ionicons name="ribbon-outline" size={18} color="#FB7185" />
            </View>
            <Text style={styles.statNumber}>Grade A</Text>
            <Text style={styles.statLabel}>Optimal</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.menuSection}>
            <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.action}
                    activeOpacity={0.75}
                  >
                    <View style={styles.menuIconBox}>
                      <Ionicons name={item.icon} size={20} color={THEME.primaryHover} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={THEME.textFaint} />
                  </TouchableOpacity>
                  {iIdx < section.items.length - 1 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Action */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setLogoutVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={19} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out of Pigify</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Pigify Swine Telemetry • Web-Aligned Theme • SDK 57</Text>
      </ScrollView>

      {/* Backend Environment & Diagnostic Dialog */}
      <Portal>
        <Dialog
          visible={backendModalVisible}
          onDismiss={() => setBackendModalVisible(false)}
          style={{ backgroundColor: '#0D1424', borderRadius: 20, borderWidth: 1, borderColor: THEME.borderCard, maxHeight: '90%' }}
        >
          <Dialog.Title style={{ color: THEME.textMain, fontWeight: '700', fontSize: 18, paddingBottom: 4 }}>
            Backend Environments
          </Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              {/* Active URL Status Box */}
              <View style={{ backgroundColor: 'rgba(20, 29, 48, 0.9)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 14 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: THEME.textMuted, letterSpacing: 1, marginBottom: 4 }}>
                  ACTIVE TARGET URL
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#38BDF8', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }} numberOfLines={1}>
                  {currentApiUrl || 'None configured'}
                </Text>

                {/* Health ping badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  {testingBackend ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#F43F5E" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 12, color: THEME.textMuted }}>Testing connection...</Text>
                    </View>
                  ) : backendHealth ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: backendHealth.ok ? '#10B981' : '#EF4444',
                        marginRight: 6
                      }} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: backendHealth.ok ? '#10B981' : '#EF4444' }}>
                        {backendHealth.ok ? `Online (${backendHealth.latency}ms)` : 'Unreachable / Offline'}
                      </Text>
                      {backendHealth.components && (
                        <Text style={{ fontSize: 11, color: THEME.textMuted, marginLeft: 8 }}>
                          [DB: {backendHealth.components.database ? 'OK' : 'Off'} | AI: {backendHealth.components.ai_service ? 'OK' : 'Off'}]
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 11, color: THEME.textFaint }}>Tap 'Test Connection' below to probe</Text>
                  )}
                </View>
              </View>

              {/* Preset Environments */}
              <Text style={{ fontSize: 11, fontWeight: '700', color: THEME.textMuted, letterSpacing: 1, marginBottom: 8 }}>
                SELECT ENVIRONMENT PRESET
              </Text>
              {getBackendEnvironments().map((env) => {
                const isSelected = currentApiUrl === env.url;
                return (
                  <TouchableOpacity
                    key={env.id}
                    onPress={() => handleSelectEnvironment(env.url)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255,255,255,0.03)',
                      borderWidth: 1,
                      borderColor: isSelected ? THEME.primary : 'rgba(255,255,255,0.08)',
                      padding: 10,
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? THEME.primary : THEME.textFaint}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: isSelected ? '#FFFFFF' : THEME.textMain }}>
                        {env.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: THEME.textMuted }} numberOfLines={1}>
                        {env.url}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Custom URL Input */}
              <Text style={{ fontSize: 11, fontWeight: '700', color: THEME.textMuted, letterSpacing: 1, marginTop: 8, marginBottom: 6 }}>
                CUSTOM BACKEND URL
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TextInput
                  value={customUrlInput}
                  onChangeText={setCustomUrlInput}
                  placeholder="e.g. http://192.168.8.153:5000"
                  placeholderTextColor={THEME.textFaint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(20, 29, 48, 0.85)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    color: '#F8FAFC',
                    fontSize: 12,
                    marginRight: 8,
                  }}
                />
                <Button
                  mode="contained"
                  buttonColor={THEME.primary}
                  compact
                  onPress={handleApplyCustomUrl}
                  disabled={!customUrlInput.trim()}
                >
                  Apply
                </Button>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Button
                  mode="outlined"
                  textColor="#38BDF8"
                  compact
                  loading={testingBackend}
                  disabled={testingBackend}
                  onPress={() => handleTestConnection()}
                  style={{ borderColor: '#38BDF8', flex: 1, marginRight: 6 }}
                >
                  Test Connection
                </Button>
                <Button
                  mode="text"
                  textColor={THEME.textMuted}
                  compact
                  onPress={handleResetEnvironment}
                  style={{ flex: 1, marginLeft: 6 }}
                >
                  Reset Auto
                </Button>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
            <Button onPress={() => setBackendModalVisible(false)} textColor={THEME.textMain}>
              Done
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={() => setLogoutVisible(false)}
          style={{ backgroundColor: '#0D1424', borderRadius: 20, borderWidth: 1, borderColor: THEME.borderCard }}
        >
          <Dialog.Icon icon="alert-circle-outline" color="#EF4444" size={36} />
          <Dialog.Title style={{ textAlign: 'center', color: THEME.textMain, fontWeight: '700' }}>
            Sign Out?
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ textAlign: 'center', color: THEME.textMuted }}>
              Are you sure you want to sign out of this session?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 }}>
            <Button onPress={() => setLogoutVisible(false)} textColor={THEME.textFaint}>
              Cancel
            </Button>
            <Button onPress={handleLogoutConfirm} mode="contained" buttonColor="#EF4444">
              Sign Out
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
    backgroundColor: THEME.bgDeep,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(244, 63, 94, 0.14)',
  },
  glowTopRight: {
    position: 'absolute',
    top: 60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  profileCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  cornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primary,
  },
  profileHeader: {
    alignItems: 'center',
    zIndex: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.primaryDark,
    borderWidth: 2,
    borderColor: '#0D1424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  roleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: THEME.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    paddingVertical: 14,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textMain,
  },
  statLabel: {
    fontSize: 10.5,
    color: THEME.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuSection: {
    marginTop: 10,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.textFaint,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textMain,
  },
  menuSubtitle: {
    fontSize: 11.5,
    color: THEME.textMuted,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 68,
  },
  logoutWrapper: {
    marginTop: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 11,
    color: THEME.textFaint,
    textAlign: 'center',
    marginTop: 18,
  },
});
