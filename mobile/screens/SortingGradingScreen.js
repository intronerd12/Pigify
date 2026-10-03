import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Text, Chip, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ScanService } from '../services/ScanService';

// ── Web Design Tokens (Exact match with SortingGrading.jsx & Home.css) ────────
const THEME = {
  bgDeep: '#070A13',
  bgCard: 'rgba(13, 20, 36, 0.92)',
  bgInput: 'rgba(20, 29, 48, 0.85)',
  borderCard: 'rgba(255, 255, 255, 0.10)',
  borderInput: 'rgba(255, 255, 255, 0.12)',

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

const getGradeTone = (grade) => {
  const value = String(grade || 'A').toUpperCase();
  if (value === 'A') return { bg: 'rgba(16, 185, 129, 0.14)', text: '#10B981', border: 'rgba(16, 185, 129, 0.35)', label: 'OPTIMAL' };
  if (value === 'B') return { bg: 'rgba(56, 189, 248, 0.14)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.35)', label: 'MILD' };
  if (value === 'C') return { bg: 'rgba(245, 158, 11, 0.16)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.35)', label: 'MODERATE' };
  if (value === 'D') return { bg: 'rgba(244, 63, 94, 0.16)', text: '#FB7185', border: 'rgba(244, 63, 94, 0.35)', label: 'ISOLATE' };
  return { bg: 'rgba(100, 116, 139, 0.14)', text: '#94A3B8', border: 'rgba(100, 116, 139, 0.35)', label: 'BASELINE' };
};

export default function SortingGradingScreen({ user }) {
  const insets = useSafeAreaInsets();
  const [scans, setScans] = useState([]);
  const [gradeFilter, setGradeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
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
    return scans.filter((s) => {
      const matchGrade = gradeFilter === 'All' || (s.grade || 'A').toUpperCase() === gradeFilter;
      const matchSearch =
        !searchQuery.trim() ||
        String(s.condition || s.disease_detected || s.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchGrade && matchSearch;
    });
  }, [scans, gradeFilter, searchQuery]);

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

      {/* Atmospheric Overlays */}
      <View style={styles.glowTopLeft} />

      {/* Header Profile Section */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.kickerRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kickerText}>CLINICAL TRIAGE // SEVERITY PIPELINE</Text>
        </View>

        <Text style={styles.headerTitle}>Swine Health Triage</Text>
        <Text style={styles.headerSubtitle}>
          Severity grading and biosecurity isolation filter matching web telemetry.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={17} color={THEME.textFaint} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search symptoms, pen ID, or condition..."
            placeholderTextColor={THEME.textFaint}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={THEME.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsRow}>
          {['All', 'A', 'B', 'C', 'D'].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGradeFilter(g)}
              style={[styles.filterChip, gradeFilter === g && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, gradeFilter === g && styles.filterChipTextActive]}>
                {g === 'All' ? 'All Grades' : `Grade ${g}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Delete Single Dialog */}
      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)} style={styles.darkDialog}>
          <Dialog.Title style={{ color: THEME.textMain, fontWeight: '700' }}>Delete scan record?</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: THEME.textMuted }}>
              This will remove the swine scan from your local history and synced veterinary telemetry.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            <Button onPress={() => setDeleteVisible(false)} textColor={THEME.textFaint}>Cancel</Button>
            <Button onPress={confirmDelete} textColor={THEME.primaryHover}>Delete</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete All Dialog */}
        <Dialog visible={deleteAllVisible} onDismiss={() => setDeleteAllVisible(false)} style={styles.darkDialog}>
          <Dialog.Title style={{ color: '#EF4444', fontWeight: '700' }}>Clear all triage scans?</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: THEME.textMuted }}>
              Are you sure you want to permanently clear your swine scan records?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            <Button onPress={() => setDeleteAllVisible(false)} textColor={THEME.textFaint}>Cancel</Button>
            <Button onPress={confirmDeleteAll} textColor="#EF4444">Clear All</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Action Row */}
        <View style={styles.actionHeaderRow}>
          <Text style={styles.resultsCountText}>Showing {filtered.length} diagnostic cases</Text>
          {scans.length > 0 && (
            <TouchableOpacity onPress={() => setDeleteAllVisible(true)}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Swine Scans List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="filter-outline" size={44} color={THEME.primaryHover} />
            <Text style={styles.emptyTitle}>No swine cases found</Text>
            <Text style={styles.emptySub}>
              {scans.length === 0
                ? 'Capture your first swine symptom scan using the camera tab.'
                : 'No swine scans match the selected grade filter.'}
            </Text>
          </View>
        ) : (
          filtered.map((item, index) => {
            const tone = getGradeTone(item.grade);
            return (
              <View key={item.id || index} style={styles.caseCard}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />

                <View style={styles.caseTopRow}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.caseImage} />
                  ) : (
                    <View style={styles.caseIconBox}>
                      <Ionicons name="shield-checkmark" size={24} color={THEME.primaryHover} />
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
                        <Ionicons name="trash-outline" size={16} color={THEME.textFaint} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.caseTimestamp}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Today'} •{' '}
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Recorded'}
                    </Text>

                    <View style={styles.badgeRow}>
                      <View style={[styles.gradeToneBadge, { backgroundColor: tone.bg, borderColor: tone.border }]}>
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
                  <Text style={styles.recomLabel}>CLINICAL ACTION:</Text>
                  <Text style={styles.recomText} numberOfLines={2}>
                    {item.triage_recommendation ||
                      item.recommendation ||
                      'Skin surface clear. Maintain standard pen biosecurity hygiene.'}
                  </Text>
                </View>
              </View>
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.emerald,
    marginRight: 6,
  },
  kickerText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textMain,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgInput,
    borderWidth: 1,
    borderColor: THEME.borderInput,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.textMain,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  filterChip: {
    backgroundColor: 'rgba(20, 29, 48, 0.7)',
    borderWidth: 1,
    borderColor: THEME.borderInput,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  filterChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  resultsCountText: {
    fontSize: 11.5,
    color: THEME.textFaint,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    padding: 28,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textMain,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  caseCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    padding: 14,
    marginBottom: 12,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primary,
  },
  caseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  caseIconBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
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
    color: THEME.textMain,
    flex: 1,
    marginRight: 8,
  },
  caseTimestamp: {
    fontSize: 11,
    color: THEME.textFaint,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gradeToneBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeToneText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  confText: {
    fontSize: 11,
    color: THEME.textFaint,
    fontWeight: '600',
  },
  recomBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  recomLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textFaint,
    letterSpacing: 0.6,
  },
  recomText: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  darkDialog: {
    backgroundColor: '#0D1424',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderCard,
  },
});
