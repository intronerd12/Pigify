import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const THEME = {
  bgDeep: '#060911',
  bgCard: 'rgba(13, 20, 36, 0.94)',
  primary: '#f43f5e',
  emerald: '#10b981',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
};

export default function UserScreen({ navigation, user, onLogout }) {
  const insets = useSafeAreaInsets();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const operatorName = user?.name || user?.fullName || 'Operator';
  const operatorEmail = user?.email || 'operator@pigify.ai';
  const operatorRole = (user?.role || 'Operator').toUpperCase();

  const handleLogoutConfirm = async () => {
    setLogoutVisible(false);
    if (onLogout) onLogout();
  };

  const MENU_SECTIONS = [
    {
      title: 'OPERATOR & FACILITY',
      items: [
        {
          id: 'edit_profile',
          icon: 'person-outline',
          title: 'Operator Profile',
          subtitle: 'Update clinical identity and credentials',
          action: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'pen_sensors',
          icon: 'partly-sunny-outline',
          title: 'Farm Environment & Pen Telemetry',
          subtitle: 'Monitor pen ambient temperature & humidity',
          action: () => navigation.navigate('Weather'),
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Biosecurity Notifications',
          subtitle: 'Alerts on high contagion risk & pen warnings',
          action: () => navigation.navigate('Notifications'),
        },
      ],
    },
    {
      title: 'CLINICAL GUIDANCE & FORUM',
      items: [
        {
          id: 'guide',
          icon: 'book-outline',
          title: 'Swine Disease Clinical Guide',
          subtitle: 'Diagnostics manual for Erysipelas, Greasy Pig & Mange',
          action: () => navigation.navigate('Guide'),
        },
        {
          id: 'community',
          icon: 'people-outline',
          title: 'Backyard Swine Community',
          subtitle: 'Share lesion photos and peer discussions',
          action: () => navigation.navigate('CommunityForum'),
        },
        {
          id: 'support',
          icon: 'help-circle-outline',
          title: 'Technical Veterinary Support',
          subtitle: 'YOLOv11 engine support & troubleshooting',
          action: () => Alert.alert('Pigify Support', 'For veterinary inquiries, email support@pigify.ai'),
        },
      ],
    },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + (Platform.OS === 'ios' ? 12 : 16) }]}>
        <View style={styles.kickerRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kickerText}>OPERATOR PROFILE // CLINICAL CREDENTIALS</Text>
        </View>
        <Text style={styles.headerTitle}>System Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── OPERATOR IDENTITY CARD ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={['#f43f5e', '#fb7185']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarInitial}>
                  {operatorName.substring(0, 2).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.metaGroup}>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{operatorRole}</Text>
              </View>
              <Text style={styles.operatorName}>{operatorName}</Text>
              <Text style={styles.operatorEmail}>{operatorEmail}</Text>
            </View>
          </View>

          {/* Telemetry row */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.telemetryBadgeText}>TLS-256 SECURED</Text>
            </View>
            <Text style={styles.telemetrySector}>Sector A • Backyard Unit</Text>
          </View>
        </View>

        {/* ── CLINICAL STATS COUNTERS ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>53</Text>
            <Text style={styles.statLabel}>Herd Size</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>42</Text>
            <Text style={styles.statLabel}>Scans Taken</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#10b981' }]}>98%</Text>
            <Text style={styles.statLabel}>Biosecurity</Text>
          </View>
        </View>

        {/* ── MENU SECTIONS ── */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={item.action}
                  style={[
                    styles.menuRow,
                    iIdx !== section.items.length - 1 && styles.menuRowBorder,
                  ]}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={item.icon} size={18} color="#fb7185" />
                  </View>
                  <View style={styles.menuTextGroup}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSub}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#64748b" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── SIGN OUT BUTTON ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setLogoutVisible(true)}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={18} color="#f43f5e" />
          <Text style={styles.logoutBtnText}>Sign Out of Operator Terminal</Text>
        </TouchableOpacity>

        {/* System info footer */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>PIGIFY CLINICAL AI // VERSION 4.2</Text>
          <Text style={styles.footerNoteSub}>Supabase TLS Cloud Telemetry Active</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalAlertIcon}>
              <Ionicons name="log-out" size={24} color="#f43f5e" />
            </View>
            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to end your operator session on this device?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setLogoutVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogoutConfirm}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.bgDeep,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(11, 18, 32, 0.95)',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  kickerText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#34d399',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Profile Card ──
  profileCard: {
    backgroundColor: 'rgba(13, 20, 36, 0.94)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  metaGroup: {
    flex: 1,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fb7185',
    letterSpacing: 0.8,
  },
  operatorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  operatorEmail: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  telemetryBadgeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#10b981',
    fontWeight: '700',
  },
  telemetrySector: {
    fontSize: 10,
    color: THEME.textFaint,
  },

  // ── Stats Row ──
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.85)',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: THEME.textFaint,
    marginTop: 2,
  },

  // ── Menu Sections ──
  sectionContainer: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.textFaint,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'rgba(13, 20, 36, 0.94)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  menuItemSub: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
  },

  // ── Logout Button ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fb7185',
  },

  footerNote: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerNoteText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.textFaint,
    letterSpacing: 0.6,
  },
  footerNoteSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#0c1424',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 22,
    alignItems: 'center',
  },
  modalAlertIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(244, 63, 94, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f43f5e',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
});
