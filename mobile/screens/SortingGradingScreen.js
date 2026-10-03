import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ScanService } from '../services/ScanService';

const SEVERITY_FILTERS = ['All', 'Normal', 'Mild', 'Moderate', 'Severe'];

// Fallback baseline swine triage cases if user hasn't scanned yet
const BASELINE_SWINE_CASES = [
  {
    id: 'TR-101',
    swineId: 'Boar #12',
    penId: 'Pen B-04',
    condition: 'Diamond Skin Disease (Erysipelas)',
    severity: 'Severe',
    grade: 'D',
    confidence: '97.4%',
    affectedArea: '14%',
    recommendation: 'Isolate swine in pen B-04 immediately. Administer prescribed antimicrobial therapy and disinfect pen feeding trough.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    statusLabel: 'ISOLATE',
    statusColor: '#f43f5e',
  },
  {
    id: 'TR-102',
    swineId: 'Piglet #08',
    penId: 'Nursery A-02',
    condition: 'Mild Dermatitis / Erythema',
    severity: 'Mild',
    grade: 'B',
    confidence: '95.2%',
    affectedArea: '6%',
    recommendation: 'Clean bedding and monitor pen humidity. Check for rough pen floor abrasions. Re-scan in 48 hours.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    statusLabel: 'MILD',
    statusColor: '#38bdf8',
  },
  {
    id: 'TR-103',
    swineId: 'Sow #05',
    penId: 'Pen C-01',
    condition: 'Healthy Skin Tissue (No Lesions)',
    severity: 'Normal',
    grade: 'A',
    confidence: '98.6%',
    affectedArea: '0%',
    recommendation: 'Skin surface clear. Continue standard backyard biosecurity hygiene and pen nutrition schedule.',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    statusLabel: 'NORMAL',
    statusColor: '#10b981',
  },
  {
    id: 'TR-104',
    swineId: 'Grower #17',
    penId: 'Pen B-02',
    condition: 'Greasy Pig Disease (Exudative Epidermitis)',
    severity: 'Moderate',
    grade: 'C',
    confidence: '96.8%',
    affectedArea: '9%',
    recommendation: 'Wash skin with mild antiseptic solution. Separate affected pig from crowding and ensure dry resting area.',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    statusLabel: 'MODERATE',
    statusColor: '#f59e0b',
  },
];

const getStatusColor = (sev) => {
  const s = String(sev || '').toLowerCase();
  if (s.includes('severe') || s.includes('isolate') || s === 'd' || s === 'e') return '#f43f5e';
  if (s.includes('moderate') || s === 'c') return '#f59e0b';
  if (s.includes('mild') || s === 'b') return '#38bdf8';
  return '#10b981';
};

const getStatusLabel = (sev) => {
  const s = String(sev || '').toLowerCase();
  if (s.includes('severe') || s.includes('isolate') || s === 'd' || s === 'e') return 'ISOLATE';
  if (s.includes('moderate') || s === 'c') return 'MODERATE';
  if (s.includes('mild') || s === 'b') return 'MILD';
  return 'NORMAL';
};

export default function SortingGradingScreen({ user }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [scans, setScans] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchPen, setSearchPen] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const list = await ScanService.getScans({ user });
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((s, idx) => {
          const sev = s.severity || (s.grade === 'A' ? 'Normal' : s.grade === 'B' ? 'Mild' : s.grade === 'C' ? 'Moderate' : 'Severe');
          return {
            id: s.id || `SC-${idx}`,
            swineId: s.swineId || s.swine_tag || `Swine #${idx + 1}`,
            penId: s.penId || `Pen ${s.pen_number || 'A'}`,
            condition: s.condition || s.notes || (s.grade === 'A' ? 'Healthy Skin Tissue' : 'Symptom Detected'),
            severity: sev,
            grade: s.grade || 'A',
            confidence: `${Math.round(s.display_confidence_score || 97)}%`,
            affectedArea: s.affectedArea || (s.grade === 'A' ? '0%' : '12%'),
            recommendation: s.recommendation || (s.grade === 'A' ? 'No treatment needed. Continue biosecurity protocol.' : 'Isolate animal and monitor symptoms closely.'),
            timestamp: s.timestamp || new Date().toISOString(),
            statusLabel: getStatusLabel(sev),
            statusColor: getStatusColor(sev),
          };
        });
        setScans(mapped);
      } else {
        setScans(BASELINE_SWINE_CASES);
      }
    } catch {
      setScans(BASELINE_SWINE_CASES);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredCases = useMemo(() => {
    return scans.filter((item) => {
      const s = String(item.severity || '').toLowerCase();
      const matchFilter =
        filterSeverity === 'All' ||
        (filterSeverity === 'Normal' && (s.includes('normal') || s.includes('healthy'))) ||
        (filterSeverity === 'Mild' && s.includes('mild')) ||
        (filterSeverity === 'Moderate' && s.includes('moderate')) ||
        (filterSeverity === 'Severe' && (s.includes('severe') || s.includes('isolate')));

      const matchSearch =
        !searchPen.trim() ||
        item.penId.toLowerCase().includes(searchPen.toLowerCase()) ||
        item.swineId.toLowerCase().includes(searchPen.toLowerCase()) ||
        item.condition.toLowerCase().includes(searchPen.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [scans, filterSeverity, searchPen]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + (Platform.OS === 'ios' ? 12 : 16) }]}>
        <View style={styles.kickerRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kickerText}>CLINICAL TRIAGE // SEVERITY PIPELINE</Text>
        </View>

        <Text style={styles.headerTitle}>
          Symptom <Text style={styles.headerTitlePink}>Severity Grading</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          Automated Swine Triaging: Normal, Mild, Moderate, and Acute Quarantine for backyard biosecurity.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={17} color="#64748b" style={styles.searchIcon} />
          <TextInput
            value={searchPen}
            onChangeText={setSearchPen}
            placeholder="Search by Pen, Swine ID, or Condition..."
            placeholderTextColor="#64748b"
            style={styles.searchInput}
          />
          {searchPen.length > 0 && (
            <TouchableOpacity onPress={() => setSearchPen('')}>
              <Ionicons name="close-circle" size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {SEVERITY_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              activeOpacity={0.8}
              onPress={() => setFilterSeverity(f)}
              style={[
                styles.filterPill,
                filterSeverity === f && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filterSeverity === f && styles.filterPillTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cases List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.casesList}>
          {filteredCases.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => setSelectedCase(item)}
              style={styles.caseCard}
            >
              {/* Card Header */}
              <View style={styles.caseCardHeader}>
                <View style={styles.penBadge}>
                  <Ionicons name="location-outline" size={12} color="#fb7185" />
                  <Text style={styles.penBadgeText}>{item.penId}</Text>
                  <Text style={styles.swineIdText}>• {item.swineId}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${item.statusColor}18`, borderColor: `${item.statusColor}40` }]}>
                  <Text style={[styles.statusBadgeText, { color: item.statusColor }]}>
                    {item.statusLabel}
                  </Text>
                </View>
              </View>

              {/* Diagnosed Condition */}
              <Text style={styles.conditionTitle}>{item.condition}</Text>

              {/* Telemetry Row */}
              <View style={styles.telemetryRow}>
                <View style={styles.telemetryItem}>
                  <Ionicons name="sparkles" size={13} color="#fb7185" />
                  <Text style={styles.telemetryLabel}>
                    Confidence: <Text style={styles.telemetryVal}>{item.confidence}</Text>
                  </Text>
                </View>

                <View style={styles.telemetryItem}>
                  <Ionicons name="fitness-outline" size={13} color="#34d399" />
                  <Text style={styles.telemetryLabel}>
                    Affected Area: <Text style={styles.telemetryVal}>{item.affectedArea}</Text>
                  </Text>
                </View>
              </View>

              {/* Recommendation Snippet */}
              <View style={styles.recommendationBox}>
                <Ionicons name="shield-outline" size={14} color="#94a3b8" />
                <Text style={styles.recommendationText} numberOfLines={2}>
                  {item.recommendation}
                </Text>
              </View>

              {/* Card Footer */}
              <View style={styles.caseCardFooter}>
                <Text style={styles.timeAgo}>
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                </Text>
                <View style={styles.inspectBtn}>
                  <Text style={styles.inspectBtnText}>View Clinical Protocol</Text>
                  <Ionicons name="arrow-forward" size={12} color="#fb7185" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredCases.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={44} color="#64748b" />
            <Text style={styles.emptyTitle}>No matching swine cases found</Text>
            <Text style={styles.emptySub}>Try adjusting your filter or search keywords.</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Case Details Modal */}
      {selectedCase && (
        <Modal
          visible={Boolean(selectedCase)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCase(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalPenText}>{selectedCase.penId} • {selectedCase.swineId}</Text>
                  <Text style={styles.modalCondition}>{selectedCase.condition}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCase(null)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={[styles.modalStatusPill, { backgroundColor: `${selectedCase.statusColor}18`, borderColor: `${selectedCase.statusColor}40` }]}>
                <Ionicons name="alert-circle-outline" size={15} color={selectedCase.statusColor} />
                <Text style={[styles.modalStatusText, { color: selectedCase.statusColor }]}>
                  STATUS: {selectedCase.statusLabel} // GRADE {selectedCase.grade}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Veterinary Clinical Guidance</Text>
                <Text style={styles.modalSectionBody}>{selectedCase.recommendation}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Telemetry Metrics</Text>
                <Text style={styles.modalSectionSub}>Confidence Score: {selectedCase.confidence}</Text>
                <Text style={styles.modalSectionSub}>Estimated Lesion Area: {selectedCase.affectedArea}</Text>
                <Text style={styles.modalSectionSub}>AI Detection Engine: YOLOv11-VET (Production Weights)</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setSelectedCase(null)}
                style={styles.modalDismissBtn}
              >
                <Text style={styles.modalDismissText}>Acknowledge Triage Protocol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#060911',
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
    marginBottom: 6,
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
    marginBottom: 4,
  },
  headerTitlePink: {
    color: '#fb7185',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 29, 48, 0.85)',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
  },
  filtersScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderColor: 'rgba(244, 63, 94, 0.5)',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterPillTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  casesList: {
    gap: 12,
  },
  caseCard: {
    backgroundColor: 'rgba(13, 20, 36, 0.94)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    padding: 14,
  },
  caseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  penBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  penBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  swineIdText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  conditionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  telemetryLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  telemetryVal: {
    color: '#ffffff',
    fontWeight: '600',
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 15,
    flex: 1,
  },
  caseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeAgo: {
    fontSize: 10,
    color: '#64748b',
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inspectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0c1424',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalPenText: {
    fontSize: 12,
    color: '#fb7185',
    fontWeight: '700',
    marginBottom: 2,
  },
  modalCondition: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalSectionBody: {
    fontSize: 13,
    color: '#f8fafc',
    lineHeight: 18,
  },
  modalSectionSub: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  modalDismissBtn: {
    backgroundColor: '#f43f5e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalDismissText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
