import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, Switch, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME = {
  bg: '#F6F7FB',
  cardBg: '#FFFFFF',
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

const STORAGE_KEY = 'pigify_notification_prefs_v1';

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    emailAlerts: true,
    diseaseOutbreaks: true,
    heatStressAlerts: true,
    quarantineUpdates: true,
    scanAnalysisReady: true,
    biosecurityReminders: false,
    communityDiscussions: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch {
      // Keep defaults
    }
  };

  const toggleSwitch = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const SettingItem = ({ icon, iconColor = '#fb7185', title, subtitle, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${iconColor}15`, borderColor: `${iconColor}30` },
          ]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        color="#f43f5e"
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(244, 63, 94, 0.4)' }}
      />
    </View>
  );

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
              <Text style={styles.brandSubtitle}>HERD TELEMETRY DISPATCH</Text>
            </View>
            <Text style={styles.headerTitle}>Clinical Alert Preferences</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Urgent Veterinary & Herd Disease Alerts */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="shield-alert" size={16} color="#f43f5e" />
            <Text style={styles.sectionHeader}>Veterinary Health & Biosecurity</Text>
          </View>

          <SettingItem
            icon="alert-circle"
            iconColor="#f43f5e"
            title="Disease Outbreak Alerts"
            subtitle="Immediate alert when high-severity swine lesions (Erysipelas / Greasy Pig) are confirmed"
            value={preferences.diseaseOutbreaks}
            onToggle={() => toggleSwitch('diseaseOutbreaks')}
          />
          <Divider style={styles.divider} />

          <SettingItem
            icon="flame"
            iconColor="#f59e0b"
            title="Heat Stress Thresholds"
            subtitle="Warnings when THI microclimate index exceeds 78 in any monitored barn sector"
            value={preferences.heatStressAlerts}
            onToggle={() => toggleSwitch('heatStressAlerts')}
          />
          <Divider style={styles.divider} />

          <SettingItem
            icon="hand-left"
            iconColor="#a855f7"
            title="Quarantine Sector Events"
            subtitle="Movement or status changes in Sector E isolation buffer"
            value={preferences.quarantineUpdates}
            onToggle={() => toggleSwitch('quarantineUpdates')}
          />
        </Surface>

        {/* AI Diagnostics & Scanning Pipeline */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="scan" size={16} color="#06b6d4" />
            <Text style={styles.sectionHeader}>Diagnostic Scanning Pipeline</Text>
          </View>

          <SettingItem
            icon="checkmark-done"
            iconColor="#06b6d4"
            title="Triage Scan Completion"
            subtitle="Notify instantly when YOLOv11-VET finishes lesion bounding box detection"
            value={preferences.scanAnalysisReady}
            onToggle={() => toggleSwitch('scanAnalysisReady')}
          />
          <Divider style={styles.divider} />

          <SettingItem
            icon="chatbubbles"
            iconColor="#10b981"
            title="Community Operator Feedback"
            subtitle="Replies and clinical case discussions from fellow swine farm operators"
            value={preferences.communityDiscussions}
            onToggle={() => toggleSwitch('communityDiscussions')}
          />
        </Surface>

        {/* Dispatch Channels */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="notifications" size={16} color="#10b981" />
            <Text style={styles.sectionHeader}>Dispatch Channels</Text>
          </View>

          <SettingItem
            icon="phone-portrait"
            iconColor="#10b981"
            title="Mobile Push Notifications"
            subtitle="High-priority push notifications on this device"
            value={preferences.pushEnabled}
            onToggle={() => toggleSwitch('pushEnabled')}
          />
          <Divider style={styles.divider} />

          <SettingItem
            icon="mail"
            iconColor="#06b6d4"
            title="Email Daily Herd Digest"
            subtitle="Receive comprehensive morning clinical summaries via email"
            value={preferences.emailAlerts}
            onToggle={() => toggleSwitch('emailAlerts')}
          />
          <Divider style={styles.divider} />

          <SettingItem
            icon="calendar"
            iconColor="#fb7185"
            title="Biosecurity Protocols & Sanitation"
            subtitle="Reminders for 48-hour boot bath disinfectant rotation and farrowing sanitization"
            value={preferences.biosecurityReminders}
            onToggle={() => toggleSwitch('biosecurityReminders')}
          />
        </Surface>
      </ScrollView>
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
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 11.5,
    color: '#94a3b8',
    lineHeight: 16,
  },
  divider: {
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
