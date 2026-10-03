import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Title, Portal, Dialog, Button, Paragraph, Surface } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ScanService } from '../services/ScanService';

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

const getGradeTone = (grade) => {
  const value = String(grade || 'A').toUpperCase();
  if (value === 'A') return { bg: 'rgba(0, 184, 148, 0.14)', text: '#00B894', label: 'OPTIMAL' };
  if (value === 'B') return { bg: 'rgba(59, 130, 246, 0.14)', text: '#2563EB', label: 'MILD' };
  if (value === 'C') return { bg: 'rgba(245, 158, 11, 0.16)', text: '#D97706', label: 'MODERATE' };
  if (value === 'D') return { bg: 'rgba(239, 68, 68, 0.14)', text: '#DC2626', label: 'ISOLATE' };
  return { bg: 'rgba(100, 116, 139, 0.14)', text: '#475569', label: 'BASELINE' };
};

export default function SortingGradingScreen({ user }) {
  const insets = useSafeAreaInsets();
  const [scans, setScans] = useState([]);
  const [gradeFilter, setGradeFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteAllVisible, setDeleteAllVisible] = useState(false);

  const refresh = useCallback(async () => {
    const list = await ScanService.getScans({ user });
    setScans(Array.isArray(list) ? list : []);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filtered = useMemo(() => {
    if (gradeFilter === 'All') return scans;
    return scans.filter((s) => (s.grade || 'A').toUpperCase() === gradeFilter);
  }, [scans, gradeFilter]);

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteVisible(false);
    setDeleteTarget(null);
    if (!target?.id) return;
    try {
      await ScanService.deleteScan(target.id, { user });
      await refresh();
    } catch {
      await refresh();
    }
  };

  const confirmDeleteAll = async () => {
    setDeleteAllVisible(false);
    try {
      await ScanService.deleteAllScans({ user });
      await refresh();
    } catch {
      await refresh();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Profile Section */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <LinearGradient
          colors={[THEME.primaryDark, THEME.primary]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.patternCircle1} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Swine Health Triage</Text>
          <Text style={styles.headerSubtitle}>Severity grading and biosecurity isolation filter</Text>
        </View>
      </View>

      {/* Delete Single Dialog */}
      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)} style={{ backgroundColor: '#FFFFFF', borderRadius: 20 }}>
          <Dialog.Title style={{ color: THEME.textDark, fontWeight: '700' }}>Delete scan record?</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: THEME.textLight }}>
              This will remove the swine scan from your local history and synced veterinary telemetry.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            <Button onPress={() => setDeleteVisible(false)} textColor={THEME.textLight}>Cancel</Button>
            <Button onPress={confirmDelete} textColor={THEME.primary}>Delete</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete All Dialog */}
        <Dialog visible={deleteAllVisible} onDismiss={() => setDeleteAllVisible(false)} style={{ backgroundColor: '#FFFFFF', borderRadius: 20 }}>
          <Dialog.Title style={{ color: '#EF4444', fontWeight: '700' }}>Clear all triage scans?</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: THEME.textLight }}>
              Are you sure you want to permanently clear your swine scan records?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            <Button onPress={() => setDeleteAllVisible(false)} textColor={THEME.textLight}>Cancel</Button>
            <Button onPress={confirmDeleteAll} textColor="#EF4444">Clear All</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filter Card */}
        <Surface style={styles.controlsCard} elevation={2}>
          <View style={styles.controlsHeader}>
            <Text style={styles.sectionLabel}>Severity Grade</Text>
            {scans.length > 0 && (
              <TouchableOpacity onPress={() => setDeleteAllVisible(true)}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.chipsRow}>
            {['All', 'A', 'B', 'C', 'D'].map((g) => (
              <Chip
                key={g}
                selected={gradeFilter === g}
                onPress={() => setGradeFilter(g)}
                style={[styles.chip, gradeFilter === g && styles.chipSelected]}
                textStyle={[styles.chipText, gradeFilter === g && styles.chipTextSelected]}
              >
                {g === 'All' ? 'All Grades' : `Grade ${g}`}
              </Chip>
            ))}
          </View>
        </Surface>

        {/* Swine Scans List */}
        {filtered.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Ionicons name="filter-outline" size={44} color={THEME.primaryLight} />
            <Text style={styles.emptyTitle}>No swine cases found</Text>
            <Text style={styles.emptySub}>
              {scans.length === 0
                ? 'Capture your first swine symptom scan using the camera tab.'
                : 'No swine scans match the selected grade filter.'}
            </Text>
          </Surface>
        ) : (
          filtered.map((item, index) => {
            const tone = getGradeTone(item.grade);
            return (
              <Surface key={item.id || index} style={styles.caseCard} elevation={2}>
                <View style={styles.caseTopRow}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.caseImage} />
                  ) : (
                    <View style={styles.caseIconBox}>
                      <Ionicons name="shield-checkmark" size={26} color={THEME.primary} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.caseTitle} numberOfLines={1}>
                        {item.disease_detected || item.condition || item.notes || 'Swine Health Scan'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setDeleteTarget(item);
                          setDeleteVisible(true);
                        }}
                      >
                        <Ionicons name="trash-outline" size={17} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.caseTimestamp}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Today'} •{' '}
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Recorded'}
                    </Text>

                    <View style={styles.badgeRow}>
                      <View style={[styles.gradeToneBadge, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.gradeToneText, { color: tone.text }]}>
                          GRADE {String(item.grade || 'A').toUpperCase()} • {tone.label}
                        </Text>
                      </View>
                      <Text style={styles.confText}>
                        {Math.round(item.display_confidence_score || item.confidence_score || 97)}% AI
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recommendation summary */}
                <View style={styles.recomBox}>
                  <Text style={styles.recomLabel}>Clinical Action:</Text>
                  <Text style={styles.recomText} numberOfLines={2}>
                    {item.triage_recommendation ||
                      item.recommendation ||
                      'Skin surface clear. Maintain standard pen biosecurity hygiene.'}
                  </Text>
                </View>
              </Surface>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerContainer: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  patternCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  controlsCard: {
    backgroundColor: THEME.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1E293B',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: THEME.primary,
  },
  chipText: {
    fontSize: 12,
    color: THEME.textLight,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textDark,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  caseCard: {
    backgroundColor: THEME.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#1E293B',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  caseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  caseIconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: 'rgba(199, 21, 133, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textDark,
    flex: 1,
    marginRight: 8,
  },
  caseTimestamp: {
    fontSize: 11,
    color: THEME.textLight,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gradeToneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeToneText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  confText: {
    fontSize: 11,
    color: THEME.textLight,
    fontWeight: '600',
  },
  recomBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  recomLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textLight,
  },
  recomText: {
    fontSize: 12,
    color: THEME.textDark,
    marginTop: 2,
    lineHeight: 16,
  },
});
