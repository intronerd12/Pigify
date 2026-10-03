import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Avatar, Surface, Dialog, Portal, Button, Paragraph } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ── Vibrant Signature Mobile Palette ──────────────────────────────────────────
const THEME = {
  primary: '#C71585',       // Deep Rose
  primaryDark: '#8B008B',   // Dark Magenta
  primaryLight: '#FF69B4',  // Hot Pink
  secondary: '#FFC0CB',    // Soft Pink
  accent: '#00B894',       // Emerald
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  error: '#EF4444',
  border: '#E2E8F0',
};

export default function UserScreen({ navigation, user, onLogout }) {
  const insets = useSafeAreaInsets();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const operatorName = user?.name || user?.fullName || 'Swine Operator';
  const operatorEmail = user?.email || 'operator@pigify.ai';
  const operatorRole = user?.role || 'Swine Operator';

  const handleLogoutConfirm = () => {
    setLogoutVisible(false);
    if (onLogout) onLogout();
  };

  const MENU_SECTIONS = [
    {
      title: 'Account Settings',
      items: [
        {
          id: 'edit_profile',
          icon: 'person-outline',
          title: 'Edit Profile',
          subtitle: 'Update your name and avatar',
          action: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Manage swine outbreak & scan alerts',
          action: () => navigation.navigate('Notifications'),
        },
        {
          id: 'community',
          icon: 'people-outline',
          title: 'Swine Community',
          subtitle: 'Connect with peer swine raisers',
          action: () => navigation.navigate('CommunityForum'),
        },
      ],
    },
    {
      title: 'Farm Telemetry & GIS',
      items: [
        {
          id: 'pen_sensors',
          icon: 'partly-sunny-outline',
          title: 'Pen Climate & Heat Stress',
          subtitle: 'Ambient temperature, humidity & THI',
          action: () => navigation.navigate('Weather'),
        },
        {
          id: 'gis_mapping',
          icon: 'map-outline',
          title: 'Farm GIS & Pen Mapping',
          subtitle: 'Pen location coordinates & layout',
          action: () => navigation.navigate('MappingEnvironment'),
        },
      ],
    },
    {
      title: 'Clinical Support',
      items: [
        {
          id: 'guide',
          icon: 'book-outline',
          title: 'Swine Pathology Guide',
          subtitle: 'Lesion, rash & symptom references',
          action: () => navigation.navigate('Guide'),
        },
        {
          id: 'ai_vet',
          icon: 'chatbubble-ellipses-outline',
          title: 'AI Swine Vet Assistant',
          subtitle: 'Interactive clinical consultation',
          action: () => navigation.navigate('Chatbot'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Profile Section */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[THEME.primaryDark, THEME.primary]}
            style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
          >
            {/* Ambient pattern circles */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                {user?.avatar ? (
                  <Avatar.Image
                    size={76}
                    source={{ uri: user.avatar }}
                    style={{ backgroundColor: THEME.white }}
                  />
                ) : (
                  <Avatar.Text
                    size={76}
                    label={operatorName ? operatorName.substring(0, 2).toUpperCase() : 'SW'}
                    style={{ backgroundColor: THEME.white }}
                    labelStyle={{ color: THEME.primary, fontWeight: 'bold', fontSize: 26 }}
                  />
                )}
                <TouchableOpacity
                  style={styles.editBadge}
                  onPress={() => navigation.navigate('EditProfile')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil" size={13} color={THEME.white} />
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>{operatorName}</Text>
              <Text style={styles.userEmail}>{operatorEmail}</Text>

              <View style={styles.roleChip}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.roleText}>{operatorRole.toUpperCase()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Floating Farm Summary Stats */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statsCard} elevation={3}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="scan-outline" size={18} color="#2196F3" />
              </View>
              <Text style={styles.statNumber}>48</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="pulse" size={18} color="#00B894" />
              </View>
              <Text style={styles.statNumber}>96.4%</Text>
              <Text style={styles.statLabel}>Herd Health</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="ribbon-outline" size={18} color="#FF9F43" />
              </View>
              <Text style={styles.statNumber}>Grade A</Text>
              <Text style={styles.statLabel}>Optimal</Text>
            </View>
          </Surface>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.menuSection}>
            <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
            <Surface style={styles.menuCard} elevation={2}>
              {section.items.map((item, iIdx) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.action}
                    activeOpacity={0.75}
                  >
                    <View style={styles.menuIconBox}>
                      <Ionicons name={item.icon} size={20} color={THEME.primary} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                  {iIdx < section.items.length - 1 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </Surface>
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

        <Text style={styles.versionText}>Pigify Mobile Swine Telemetry • Build 1.0.0 (SDK 57)</Text>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={() => setLogoutVisible(false)}
          style={{ backgroundColor: THEME.white, borderRadius: 20 }}
        >
          <Dialog.Icon icon="alert-circle-outline" color="#EF4444" size={36} />
          <Dialog.Title style={{ textAlign: 'center', color: THEME.textDark, fontWeight: '700' }}>
            Sign Out?
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ textAlign: 'center', color: THEME.textLight }}>
              Are you sure you want to sign out of this device?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 }}>
            <Button onPress={() => setLogoutVisible(false)} textColor={THEME.textLight}>
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
    backgroundColor: THEME.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerContainer: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileHeader: {
    alignItems: 'center',
    zIndex: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -22,
    marginBottom: 16,
    zIndex: 20,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: THEME.white,
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
    color: THEME.textDark,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textLight,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: 'rgba(199, 21, 133, 0.08)',
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
    color: THEME.textDark,
  },
  menuSubtitle: {
    fontSize: 11,
    color: THEME.textLight,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  logoutWrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
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
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
  },
});
