import React, { useState, useEffect, useMemo } from 'react';
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

import { useTheme } from '../context/ThemeContext';
import {
  getActiveApiUrl,
  setActiveApiUrl,
  resetActiveApiUrl,
  checkBackendHealth,
  getBackendEnvironments,
} from '../services/api';

const { width } = Dimensions.get('window');

export default function UserScreen({ navigation, user, onLogout }) {
  const insets = useSafeAreaInsets();
  const { theme, isDark, setTheme, toggleTheme, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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
      Alert.alert(
        'Invalid URL',
        'Please enter a valid HTTP or HTTPS URL (e.g. http://192.168.8.153:5000)'
      );
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
          action: () => navigation.navigate('EditProfile', { user }),
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
      <StatusBar style={colors.statusBarStyle} />

      {/* Atmospheric Multi-radial Glow Overlays */}
      <View style={[styles.glowTopLeft, { backgroundColor: colors.glowTopLeft }]} />
      <View style={[styles.glowTopRight, { backgroundColor: colors.glowTopRight }]} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
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
                  style={{ backgroundColor: colors.bgCardSolid }}
                />
              ) : (
                <Avatar.Text
                  size={76}
                  label={operatorName ? operatorName.substring(0, 2).toUpperCase() : 'SW'}
                  style={{
                    backgroundColor: colors.bgCardSolid,
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                  }}
                  labelStyle={{ color: colors.primaryHover, fontWeight: 'bold', fontSize: 26 }}
                />
              )}
              <TouchableOpacity
                style={styles.editBadge}
                onPress={() => navigation.navigate('EditProfile', { user })}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{operatorName}</Text>
            <Text style={styles.userEmail}>{operatorEmail}</Text>

            <View style={styles.roleChip}>
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={colors.emerald}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleText}>{operatorRole.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Telemetry Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(14, 165, 233, 0.12)' },
              ]}
            >
              <Ionicons name="scan-outline" size={18} color={isDark ? '#38BDF8' : '#0284C7'} />
            </View>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.12)' },
              ]}
            >
              <Ionicons name="pulse" size={18} color={colors.emerald} />
            </View>
            <Text style={styles.statNumber}>96.4%</Text>
            <Text style={styles.statLabel}>Herd Health</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(225, 29, 72, 0.12)' },
              ]}
            >
              <Ionicons name="ribbon-outline" size={18} color={colors.primaryHover} />
            </View>
            <Text style={styles.statNumber}>Grade A</Text>
            <Text style={styles.statLabel}>Optimal</Text>
          </View>
        </View>

        {/* ── APPEARANCE & THEME SECTION (PROFESSIONAL THEME PICKER) ── */}
        <View style={styles.appearanceSection}>
          <View style={styles.appearanceHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={15}
                color={colors.primaryHover}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionHeaderTitle}>APPEARANCE & THEME</Text>
            </View>
            <View
              style={[
                styles.themeStatusBadge,
                {
                  backgroundColor: isDark
                    ? 'rgba(168, 85, 247, 0.14)'
                    : 'rgba(245, 158, 11, 0.14)',
                  borderColor: isDark
                    ? 'rgba(168, 85, 247, 0.35)'
                    : 'rgba(245, 158, 11, 0.35)',
                },
              ]}
            >
              <View
                style={[
                  styles.themeBadgeDot,
                  { backgroundColor: isDark ? '#C084FC' : '#F59E0B' },
                ]}
              />
              <Text
                style={[
                  styles.themeStatusBadgeText,
                  { color: isDark ? '#C084FC' : '#D97706' },
                ]}
              >
                {isDark ? 'DARK TELEMETRY' : 'DAYLIGHT MODE'}
              </Text>
            </View>
          </View>

          {/* Theme Visual Preview Dual Cards */}
          <View style={styles.themeCardsRow}>
            {/* Dark Mode Card */}
            <TouchableOpacity
              style={[
                styles.themeOptionCard,
                isDark && styles.themeOptionCardActive,
                {
                  borderColor: isDark ? colors.primary : colors.borderCard,
                  backgroundColor: isDark
                    ? isDark
                      ? 'rgba(244, 63, 94, 0.08)'
                      : colors.bgCard
                    : colors.bgCard,
                },
              ]}
              onPress={() => setTheme('dark')}
              activeOpacity={0.82}
              accessibilityRole="radio"
              accessibilityState={{ selected: isDark }}
              accessibilityLabel="Dark Telemetry Mode"
            >
              {/* Miniature Dark Mode UI Preview Mockup */}
              <View style={styles.mockupContainerDark}>
                <View style={styles.mockupHeaderDark}>
                  <View style={styles.mockupDotsRow}>
                    <View style={[styles.mockupDot, { backgroundColor: '#EF4444' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#10B981' }]} />
                  </View>
                  <View style={styles.mockupStatusPillDark} />
                </View>
                <View style={styles.mockupBodyDark}>
                  <View style={styles.mockupAccentLineDark} />
                  <View style={styles.mockupCardDark}>
                    <View style={styles.mockupMiniIconDark} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.mockupTextDark1} />
                      <View style={styles.mockupTextDark2} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Theme Meta Info */}
              <View style={styles.themeOptionMeta}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Ionicons
                      name="moon"
                      size={13}
                      color={isDark ? colors.primaryHover : colors.textMuted}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.themeOptionTitle,
                        isDark && { color: colors.textMain, fontWeight: '800' },
                      ]}
                    >
                      Dark Mode
                    </Text>
                  </View>
                  <Text style={styles.themeOptionSubtitle}>OLED night contrast</Text>
                </View>

                {/* Selection Radio Circle */}
                <View
                  style={[
                    styles.radioCircle,
                    isDark && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  {isDark && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Light Mode Card */}
            <TouchableOpacity
              style={[
                styles.themeOptionCard,
                !isDark && styles.themeOptionCardActive,
                {
                  borderColor: !isDark ? colors.primary : colors.borderCard,
                  backgroundColor: !isDark
                    ? isDark
                      ? colors.bgCard
                      : 'rgba(225, 29, 72, 0.05)'
                    : colors.bgCard,
                },
              ]}
              onPress={() => setTheme('light')}
              activeOpacity={0.82}
              accessibilityRole="radio"
              accessibilityState={{ selected: !isDark }}
              accessibilityLabel="Daylight Mode"
            >
              {/* Miniature Light Mode UI Preview Mockup */}
              <View style={styles.mockupContainerLight}>
                <View style={styles.mockupHeaderLight}>
                  <View style={styles.mockupDotsRow}>
                    <View style={[styles.mockupDot, { backgroundColor: '#EF4444' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#10B981' }]} />
                  </View>
                  <View style={styles.mockupStatusPillLight} />
                </View>
                <View style={styles.mockupBodyLight}>
                  <View style={styles.mockupAccentLineLight} />
                  <View style={styles.mockupCardLight}>
                    <View style={styles.mockupMiniIconLight} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.mockupTextLight1} />
                      <View style={styles.mockupTextLight2} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Theme Meta Info */}
              <View style={styles.themeOptionMeta}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Ionicons
                      name="sunny"
                      size={13}
                      color={!isDark ? colors.primary : colors.textMuted}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.themeOptionTitle,
                        !isDark && { color: colors.textMain, fontWeight: '800' },
                      ]}
                    >
                      Light Mode
                    </Text>
                  </View>
                  <Text style={styles.themeOptionSubtitle}>Sunlight outdoor clarity</Text>
                </View>

                {/* Selection Radio Circle */}
                <View
                  style={[
                    styles.radioCircle,
                    !isDark && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  {!isDark && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Toggle Row */}
          <View style={styles.quickToggleCard}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.quickToggleTitle}>Tactile Theme Switch</Text>
              <Text style={styles.quickToggleSubtitle}>
                {isDark
                  ? 'Optimized for low-light barn telemetry & battery saving'
                  : 'High-contrast visibility for sunlit outdoor pen triage'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.togglePillButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(244, 63, 94, 0.15)'
                    : 'rgba(225, 29, 72, 0.12)',
                  borderColor: isDark
                    ? 'rgba(244, 63, 94, 0.35)'
                    : 'rgba(225, 29, 72, 0.3)',
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.8}
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
            >
              <View style={[styles.toggleThumb, { backgroundColor: colors.primary }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={12} color="#FFFFFF" />
              </View>
              <Text style={[styles.togglePillLabel, { color: colors.primaryHover }]}>
                {isDark ? 'DARK' : 'LIGHT'}
              </Text>
            </TouchableOpacity>
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
                      <Ionicons name={item.icon} size={20} color={colors.primaryHover} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
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

        <Text style={styles.versionText}>Pigify Swine Telemetry • Dynamic Theme Engine • SDK 57</Text>
      </ScrollView>

      {/* Backend Environment & Diagnostic Dialog */}
      <Portal>
        <Dialog
          visible={backendModalVisible}
          onDismiss={() => setBackendModalVisible(false)}
          style={{
            backgroundColor: colors.dialogBg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.borderCard,
            maxHeight: '90%',
          }}
        >
          <Dialog.Title
            style={{ color: colors.textMain, fontWeight: '700', fontSize: 18, paddingBottom: 4 }}
          >
            Backend Environments
          </Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              {/* Active URL Status Box */}
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(20, 29, 48, 0.9)' : '#F1F5F9',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.borderCard,
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textMuted,
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  ACTIVE TARGET URL
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.cyan,
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  }}
                  numberOfLines={1}
                >
                  {currentApiUrl || 'None configured'}
                </Text>

                {/* Health ping badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  {testingBackend ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        Testing connection...
                      </Text>
                    </View>
                  ) : backendHealth ? (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: backendHealth.ok ? '#10B981' : '#EF4444',
                          marginRight: 6,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: backendHealth.ok ? '#10B981' : '#EF4444',
                        }}
                      >
                        {backendHealth.ok
                          ? `Online (${backendHealth.latency}ms)`
                          : 'Unreachable / Offline'}
                      </Text>
                      {backendHealth.components && (
                        <Text
                          style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}
                        >
                          [DB: {backendHealth.components.database ? 'OK' : 'Off'} | AI:{' '}
                          {backendHealth.components.ai_service ? 'OK' : 'Off'}]
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 11, color: colors.textFaint }}>
                      Tap 'Test Connection' below to probe
                    </Text>
                  )}
                </View>
              </View>

              {/* Preset Environments */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.textMuted,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
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
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(244, 63, 94, 0.12)'
                          : 'rgba(225, 29, 72, 0.08)'
                        : isDark
                        ? 'rgba(255,255,255,0.03)'
                        : '#F8FAFC',
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.borderCard,
                      padding: 10,
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? colors.primary : colors.textFaint}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: isSelected ? colors.primaryHover : colors.textMain,
                        }}
                      >
                        {env.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={1}>
                        {env.url}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Custom URL Input */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.textMuted,
                  letterSpacing: 1,
                  marginTop: 8,
                  marginBottom: 6,
                }}
              >
                CUSTOM BACKEND URL
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TextInput
                  value={customUrlInput}
                  onChangeText={setCustomUrlInput}
                  placeholder="e.g. http://192.168.8.153:5000"
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(20, 29, 48, 0.85)' : '#F1F5F9',
                    borderWidth: 1,
                    borderColor: colors.borderCard,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    color: colors.textMain,
                    fontSize: 12,
                    marginRight: 8,
                  }}
                />
                <Button
                  mode="contained"
                  buttonColor={colors.primary}
                  compact
                  onPress={handleApplyCustomUrl}
                  disabled={!customUrlInput.trim()}
                >
                  Apply
                </Button>
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 4,
                }}
              >
                <Button
                  mode="outlined"
                  textColor={colors.cyan}
                  compact
                  loading={testingBackend}
                  disabled={testingBackend}
                  onPress={() => handleTestConnection()}
                  style={{ borderColor: colors.cyan, flex: 1, marginRight: 6 }}
                >
                  Test Connection
                </Button>
                <Button
                  mode="text"
                  textColor={colors.textMuted}
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
            <Button onPress={() => setBackendModalVisible(false)} textColor={colors.textMain}>
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
          style={{
            backgroundColor: colors.dialogBg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.borderCard,
          }}
        >
          <Dialog.Icon icon="alert-circle-outline" color="#EF4444" size={36} />
          <Dialog.Title
            style={{ textAlign: 'center', color: colors.textMain, fontWeight: '700' }}
          >
            Sign Out?
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ textAlign: 'center', color: colors.textMuted }}>
              Are you sure you want to sign out of this session?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions
            style={{
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingBottom: 16,
            }}
          >
            <Button onPress={() => setLogoutVisible(false)} textColor={colors.textFaint}>
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

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgDeep,
    },
    glowTopLeft: {
      position: 'absolute',
      top: -40,
      left: -40,
      width: 240,
      height: 240,
      borderRadius: 120,
    },
    glowTopRight: {
      position: 'absolute',
      top: 60,
      right: -50,
      width: 220,
      height: 220,
      borderRadius: 110,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 110,
    },
    profileCard: {
      backgroundColor: colors.bgCard,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderCard,
      padding: 24,
      alignItems: 'center',
      position: 'relative',
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: isDark ? 4 : 2,
    },
    cornerTL: {
      position: 'absolute',
      top: 8,
      left: 8,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.primary,
    },
    cornerTR: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.primary,
    },
    cornerBL: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.primary,
    },
    cornerBR: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.primary,
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
      backgroundColor: colors.primaryDark,
      borderWidth: 2,
      borderColor: colors.bgCardSolid,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textMain,
      letterSpacing: 0.3,
    },
    userEmail: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    roleChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.12)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(5, 150, 105, 0.28)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 10,
    },
    roleText: {
      fontSize: 10.5,
      fontWeight: '800',
      color: colors.emerald,
      letterSpacing: 0.8,
    },
    statsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: colors.bgCard,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderCard,
      paddingVertical: 14,
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
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
      color: colors.textMain,
    },
    statLabel: {
      fontSize: 10.5,
      color: colors.textMuted,
      marginTop: 1,
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.borderCard,
    },

    // ── Appearance & Theme Section ───────────────────
    appearanceSection: {
      marginTop: 4,
      marginBottom: 14,
    },
    appearanceHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    themeStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
    },
    themeBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },
    themeStatusBadgeText: {
      fontSize: 9.5,
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    themeCardsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 10,
    },
    themeOptionCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 10,
      shadowColor: colors.shadowColor,
      shadowOpacity: isDark ? 0.35 : 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    themeOptionCardActive: {
      borderWidth: 2,
    },
    mockupContainerDark: {
      height: 68,
      backgroundColor: '#0B1220',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      padding: 6,
      marginBottom: 8,
      overflow: 'hidden',
    },
    mockupHeaderDark: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    mockupStatusPillDark: {
      width: 22,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    mockupBodyDark: {
      flex: 1,
      justifyContent: 'space-between',
    },
    mockupAccentLineDark: {
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#F43F5E',
      width: '45%',
      marginBottom: 4,
    },
    mockupCardDark: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 6,
      padding: 4,
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    mockupMiniIconDark: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'rgba(244, 63, 94, 0.35)',
      marginRight: 6,
    },
    mockupTextDark1: {
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(248, 250, 252, 0.75)',
      width: '80%',
      marginBottom: 2,
    },
    mockupTextDark2: {
      height: 3,
      borderRadius: 1.5,
      backgroundColor: 'rgba(148, 163, 184, 0.45)',
      width: '50%',
    },

    mockupContainerLight: {
      height: 68,
      backgroundColor: '#F1F5F9',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#CBD5E1',
      padding: 6,
      marginBottom: 8,
      overflow: 'hidden',
    },
    mockupHeaderLight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    mockupStatusPillLight: {
      width: 22,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#94A3B8',
    },
    mockupBodyLight: {
      flex: 1,
      justifyContent: 'space-between',
    },
    mockupAccentLineLight: {
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#E11D48',
      width: '45%',
      marginBottom: 4,
    },
    mockupCardLight: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      padding: 4,
      borderWidth: 0.5,
      borderColor: '#E2E8F0',
    },
    mockupMiniIconLight: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'rgba(225, 29, 72, 0.25)',
      marginRight: 6,
    },
    mockupTextLight1: {
      height: 4,
      borderRadius: 2,
      backgroundColor: '#0F172A',
      width: '80%',
      marginBottom: 2,
    },
    mockupTextLight2: {
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#64748B',
      width: '50%',
    },

    mockupDotsRow: {
      flexDirection: 'row',
      gap: 3,
    },
    mockupDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },

    themeOptionMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 2,
    },
    themeOptionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
    },
    themeOptionSubtitle: {
      fontSize: 10.5,
      color: colors.textFaint,
    },
    radioCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.borderCard,
      alignItems: 'center',
      justifyContent: 'center',
    },

    quickToggleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderCard,
      paddingHorizontal: 14,
      paddingVertical: 10,
      shadowColor: colors.shadowColor,
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    quickToggleTitle: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.textMain,
    },
    quickToggleSubtitle: {
      fontSize: 10.5,
      color: colors.textMuted,
      marginTop: 2,
      lineHeight: 14,
    },
    togglePillButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 18,
      borderWidth: 1,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    toggleThumb: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
    },
    togglePillLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginRight: 4,
    },

    // ── Menu Sections ─────────────────────────────────
    menuSection: {
      marginTop: 10,
    },
    sectionHeaderTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textFaint,
      letterSpacing: 0.8,
      marginBottom: 8,
      marginLeft: 4,
    },
    menuCard: {
      backgroundColor: colors.bgCard,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderCard,
      overflow: 'hidden',
      shadowColor: colors.shadowColor,
      shadowOpacity: isDark ? 0.35 : 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
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
      backgroundColor: isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(225, 29, 72, 0.08)',
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
      color: colors.textMain,
    },
    menuSubtitle: {
      fontSize: 11.5,
      color: colors.textMuted,
      marginTop: 2,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.borderCard,
      marginLeft: 68,
    },
    logoutWrapper: {
      marginTop: 20,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
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
      color: colors.textFaint,
      textAlign: 'center',
      marginTop: 18,
    },
  });
