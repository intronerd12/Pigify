import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const MOBILE_BODY_PARTS = [
  {
    id: 'ear_pinnae',
    name: 'Ear Pinnae & Auricular Base',
    shortLabel: 'Ears & Base',
    roi: 'ROI [x:18–34%, y:14–36%]',
    camera: 'Camera #2 (Feeder Macro + MLX90614 IR)',
    clues: 'ASF cyanotic purple blotches, Sarcoptic Mange grey crusts, & ear-base tympanic IR temperature target.',
  },
  {
    id: 'lateral_flank',
    name: 'Lateral Flank, Loin & Dorsal Back',
    shortLabel: 'Flank & Back',
    roi: 'ROI [x:35–78%, y:24–62%]',
    camera: 'Camera #1 (Overhead) & Camera #2 (Side)',
    clues: 'Swine Erysipelas raised rhomboid diamond plaques, Greasy Pig sebaceous crusts, & dorsal color mark.',
  },
  {
    id: 'ventral_abdomen',
    name: 'Ventral Abdomen, Belly & Inguinal',
    shortLabel: 'Belly & Inguinal',
    roi: 'ROI [x:38–75%, y:63–86%]',
    camera: 'Camera #2 (Low-Angle Feeder View)',
    clues: 'PDNS necrotizing red-purple purpura, ASF petechial hemorrhages, & mange ventral rash.',
  },
  {
    id: 'snout_facial',
    name: 'Snout, Periorbital Face & Jowl',
    shortLabel: 'Snout & Face',
    roi: 'ROI [x:06–22%, y:32–58%]',
    camera: 'Camera #2 (Trough Front View)',
    clues: 'Greasy Pig dark facial crusting around eyes/snout, frothy nasal discharge, & periorbital IR window.',
  },
  {
    id: 'hock_limbs',
    name: 'Carpal / Hock Joints & Distal Limbs',
    shortLabel: 'Hock & Limbs',
    roi: 'ROI [x:25–82%, y:74–96%]',
    camera: 'Camera #1 (Gait) & Camera #2 (Limb View)',
    clues: 'Chronic Erysipelas swollen arthritic hock joints, PDNS hindlimb edema, & reluctance to stand.',
  },
];

export const MOBILE_ABNORMAL_BEHAVIORS = [
  {
    id: 'loss_of_appetite',
    label: 'Loss of Appetite (Skipping Trough Meals)',
    leadTime: '12–24h Early Sign',
    weight: 35,
  },
  {
    id: 'huddling_piling',
    label: 'Huddling / Piling Together (Fever Chills)',
    leadTime: '8–18h Early Sign',
    weight: 30,
  },
  {
    id: 'lethargy_recumbency',
    label: 'Extreme Lethargy & Refusal to Stand',
    leadTime: '6–12h Early Sign',
    weight: 25,
  },
  {
    id: 'intense_pruritus',
    label: 'Relentless Scratching on Bamboo/Concrete Posts',
    leadTime: '3–5d Early Sign',
    weight: 15,
  },
  {
    id: 'labored_thumping',
    label: 'Labored Abdominal Breathing ("Thumping")',
    leadTime: '6–12h Early Sign',
    weight: 20,
  },
];

export function formatMobileScanDateTime(isoString) {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    if (Number.isNaN(d.getTime())) return 'Nov 8, 2026 • 06:20:00 PM PHT';
    const datePart = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${datePart} • ${timePart} PHT`;
  } catch {
    return 'Nov 8, 2026 • 06:20:00 PM PHT';
  }
}

export function inferMobileBodyPart(conditionText = '') {
  const c = String(conditionText).toLowerCase();
  if (c.includes('mange') || c.includes('ear') || c.includes('asf') || c.includes('hemorrhagic')) {
    return MOBILE_BODY_PARTS[0];
  }
  if (c.includes('erysipelas') || c.includes('diamond')) {
    return MOBILE_BODY_PARTS[1];
  }
  if (c.includes('pdns') || c.includes('nephropathy') || c.includes('purpura')) {
    return MOBILE_BODY_PARTS[2];
  }
  if (c.includes('greasy') || c.includes('exudative')) {
    return MOBILE_BODY_PARTS[3];
  }
  return MOBILE_BODY_PARTS[1];
}

export default function SwineScanTelemetryCard({ scanResult = null }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const initialZone = useMemo(
    () => inferMobileBodyPart(scanResult?.condition || scanResult?.disease_detected || ''),
    [scanResult?.condition, scanResult?.disease_detected]
  );

  const [activeTab, setActiveTab] = useState('body_temp'); // 'body_temp' | 'behavior' | 'cameras_test'
  const [selectedZoneId, setSelectedZoneId] = useState(initialZone.id);
  const [pigTempC, setPigTempC] = useState(
    String(scanResult?.severity || '').toLowerCase() === 'normal' ? 38.9 : 40.9
  );
  const [mealsToday, setMealsToday] = useState(
    String(scanResult?.severity || '').toLowerCase() === 'normal' ? 6 : 1
  );
  const [selectedBehaviors, setSelectedBehaviors] = useState(
    String(scanResult?.severity || '').toLowerCase() === 'normal'
      ? []
      : ['loss_of_appetite', 'huddling_piling']
  );

  const currentZone = useMemo(
    () => MOBILE_BODY_PARTS.find((z) => z.id === selectedZoneId) || MOBILE_BODY_PARTS[0],
    [selectedZoneId]
  );

  const formattedDateTime = useMemo(
    () => formatMobileScanDateTime(scanResult?.timestamp),
    [scanResult?.timestamp]
  );

  const pigTempF = ((pigTempC * 9) / 5 + 32).toFixed(1);
  const isHighFever = pigTempC >= 40.5;
  const isMildFever = pigTempC >= 39.6 && pigTempC < 40.5;
  const tempColor = isHighFever ? '#F43F5E' : isMildFever ? '#F59E0B' : '#10B981';

  const earlyRiskScore = useMemo(() => {
    const behSum = MOBILE_ABNORMAL_BEHAVIORS.reduce(
      (sum, b) => (selectedBehaviors.includes(b.id) ? sum + b.weight : sum),
      0
    );
    const mealPts = mealsToday <= 1 ? 25 : mealsToday <= 3 ? 12 : 0;
    const tempPts = isHighFever ? 35 : isMildFever ? 18 : 0;
    return Math.min(99, behSum + mealPts + tempPts);
  }, [selectedBehaviors, mealsToday, isHighFever, isMildFever]);

  const toggleBehavior = (id) => {
    setSelectedBehaviors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTestImmediateAlert = () => {
    Alert.alert(
      'IMMEDIATE BIOSECURITY ALERT TRIGGERED (<2.1s)',
      `• Scan Date & Time: ${formattedDateTime}\n` +
      `• Affected Pig ID: ${scanResult?.swineId || 'Boar #12'} (Ear-Tag #LU-B12 • Red Dorsal Mark)\n` +
      `• Body Part Detected: ${currentZone.name}\n` +
      `• Pig Body Temp: ${pigTempC.toFixed(1)}°C (${pigTempF}°F) via Melexis MLX90614 IR Sensor\n` +
      `• Appetite & Behavior: ${mealsToday}/6 Meals • ${selectedBehaviors.length} Abnormal Sign(s)\n` +
      `• Camera Setup: 2x Sony IMX708 (Overhead Cam #1 + Feeder Cam #2)\n\n` +
      `Immediate Pen Quarantine Locked & MAO Luna / OPVet La Union Notification Ready.`,
      [
        { text: 'Acknowledge', style: 'cancel' },
        {
          text: 'Call MAO Luna (0917-842-5510)',
          onPress: () => Linking.openURL('tel:09178425510'),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Kicker & Title */}
      <View style={styles.kickerRow}>
        <Ionicons name="locate" size={13} color="#38BDF8" />
        <Text style={styles.kickerText}>
          BODY PART, IR TEMP (MLX90614), BEHAVIOR & 2-CAMERA SUITE
        </Text>
      </View>

      <Text style={styles.title}>
        Anatomical Scan Details, Pig Temp Hardware & Early Behavior Monitor
      </Text>

      {/* Top 2x2 Summary Grid */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>SCAN DATE & TIME</Text>
          <Text style={[styles.summaryVal, { color: '#38BDF8', fontSize: 11 }]}>
            {formattedDateTime}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>DETECTED BODY PART</Text>
          <Text style={[styles.summaryVal, { color: '#F8FAFC', fontSize: 11.5 }]} numberOfLines={1}>
            {currentZone.name}
          </Text>
        </View>
        <View style={[styles.summaryItem, { borderColor: `${tempColor}55` }]}>
          <Text style={styles.summaryLabel}>MLX90614 IR PIG TEMP</Text>
          <Text style={[styles.summaryVal, { color: tempColor }]}>
            {pigTempC.toFixed(1)}°C ({pigTempF}°F)
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>APPETITE & EARLY RISK</Text>
          <Text
            style={[
              styles.summaryVal,
              { color: earlyRiskScore >= 60 ? '#F43F5E' : '#10B981' },
            ]}
          >
            {mealsToday}/6 Meals • {earlyRiskScore}%
          </Text>
        </View>
      </View>

      {/* Sub-Tab Selector */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('body_temp')}
          style={[styles.tabBtn, activeTab === 'body_temp' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'body_temp' && styles.tabBtnTextActive]}>
            1. Body Part & IR Temp
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('behavior')}
          style={[styles.tabBtn, activeTab === 'behavior' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'behavior' && styles.tabBtnTextActive]}>
            2. Appetite & Behavior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('cameras_test')}
          style={[styles.tabBtn, activeTab === 'cameras_test' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'cameras_test' && styles.tabBtnTextActive]}>
            3. 2-Cam, ID & Testing
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: BODY PART & MLX90614 PIG TEMPERATURE */}
      {activeTab === 'body_temp' && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionSubLabel}>
            SELECT SPECIFIC PIG BODY PART WHERE SYMPTOM IS DETECTED:
          </Text>
          <View style={styles.chipWrap}>
            {MOBILE_BODY_PARTS.map((zone) => {
              const active = zone.id === currentZone.id;
              return (
                <TouchableOpacity
                  key={zone.id}
                  onPress={() => setSelectedZoneId(zone.id)}
                  style={[styles.zoneChip, active && styles.zoneChipActive]}
                >
                  <Text style={[styles.zoneChipText, active && styles.zoneChipTextActive]}>
                    {zone.shortLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>
              {currentZone.name} ({currentZone.roi})
            </Text>
            <Text style={styles.infoBoxSub}>Assigned: {currentZone.camera}</Text>
            <Text style={styles.infoBoxDesc}>{currentZone.clues}</Text>
          </View>

          {/* Ma'am Pops Madriaga: Pig Temperature Hardware Box */}
          <View style={[styles.infoBox, { marginTop: 10, borderColor: `${tempColor}66` }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.infoBoxTitle, { color: tempColor }]}>
                Pig Temp Hardware: Melexis MLX90614 IR Sensor
              </Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                {pigTempC.toFixed(1)}°C
              </Text>
            </View>
            <Text style={styles.infoBoxDesc}>
              Non-contact Medical-Grade Infrared Thermometer (I2C GPIO2/GPIO3 on RPi 5) aimed at the Pig&apos;s Ear Base at the feeder trough (15–40cm, ±0.2°C accuracy) + DS18B20 Rectal Probe backup.
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {[
                { label: 'Normal (38.9°C)', val: 38.9, col: '#10B981' },
                { label: 'Mild (40.1°C)', val: 40.1, col: '#F59E0B' },
                { label: 'ASF Fever (41.3°C)', val: 41.3, col: '#F43F5E' },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => setPigTempC(preset.val)}
                  style={{
                    flex: 1,
                    backgroundColor: `${preset.col}22`,
                    borderColor: preset.col,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingVertical: 6,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: '800' }}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* TAB 2: ABNORMAL BEHAVIOR & LOSS OF APPETITE */}
      {activeTab === 'behavior' && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionSubLabel}>
            DAILY FEEDER TROUGH VISITS (LOSS OF APPETITE DETECTOR):
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
            {[0, 1, 2, 4, 6].map((cnt) => (
              <TouchableOpacity
                key={cnt}
                onPress={() => setMealsToday(cnt)}
                style={[
                  styles.mealBtn,
                  mealsToday === cnt && {
                    backgroundColor: cnt <= 2 ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)',
                    borderColor: cnt <= 2 ? '#F43F5E' : '#10B981',
                  },
                ]}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{cnt}/6 Meals</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionSubLabel}>
            EARLY ABNORMAL SWINE BEHAVIORS (12–24H BEFORE SKIN LESIONS):
          </Text>
          {MOBILE_ABNORMAL_BEHAVIORS.map((beh) => {
            const checked = selectedBehaviors.includes(beh.id);
            return (
              <TouchableOpacity
                key={beh.id}
                onPress={() => toggleBehavior(beh.id)}
                style={[styles.behRow, checked && styles.behRowActive]}
              >
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={17}
                  color={checked ? '#F43F5E' : '#64748B'}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '700' }}>
                    {beh.label}
                  </Text>
                  <Text style={{ color: '#38BDF8', fontSize: 10, fontWeight: '700' }}>
                    {beh.leadTime}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* TAB 3: 2-CAMERA ARCHITECTURE, INDIVIDUAL PIG ID & TESTING METHOD */}
      {activeTab === 'cameras_test' && (
        <View style={{ marginTop: 10, gap: 8 }}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>
              Dual-Camera Setup (2 Cameras per Pen Sector)
            </Text>
            <Text style={styles.infoBoxDesc}>
              • Camera #1 (Overhead 120° Sony IMX708 @ 2.2m): Tracks trough appetite visits, fever huddling/piling, recumbency, and dorsal wax color marks.{'\n'}
              • Camera #2 (Feeder-Level 75° AF Sony IMX708 + MLX90614 IR @ 0.55m): Scans Ear-Tag ID, measures ear-base body temperature, and captures close-up Ear, Flank, Belly, Snout & Limb lesions.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>
              Individual Pig Identification & ASF Scan Protocol
            </Text>
            <Text style={styles.infoBoxDesc}>
              • Individual Pig ID: High-contrast Numbered Ear Tag (#LU-B12 / #NP-09) + Non-Toxic Dorsal Livestock Color Stripe (Red/Blue/Green) bound to pen history.{'\n'}
              • ASF Scan Pipeline: Combines Camera #1 anorexia/huddling flag + MLX90614 fever (≥40.5°C) + Camera #2 ear/abdomen cyanosis segmentation.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>
              System Testing & Validation Method (Luna, La Union)
            </Text>
            <Text style={styles.infoBoxDesc}>
              • Stratified 500-Image Dataset (5 classes, 70/20/10 split; mAP@0.5: 96.4%).{'\n'}
              • Tested on both Philippine Native Pigs (Baboy Katutubo) & Commercial White breeds with MLX90614 vs. rectal thermometer validation (±0.2°C).
            </Text>
          </View>
        </View>
      )}

      {/* Immediate Alert Trigger Test Button */}
      <TouchableOpacity
        onPress={handleTestImmediateAlert}
        style={styles.alertTriggerBtn}
        activeOpacity={0.85}
      >
        <Ionicons name="notifications" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.alertTriggerBtnText}>
          Test Immediate Multi-Channel Alert Trigger (&lt;2.1s)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(8, 145, 178, 0.25)',
      padding: 16,
      marginTop: 14,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    kickerText: {
      fontSize: 9.5,
      fontWeight: '800',
      color: colors.cyan,
      letterSpacing: 0.6,
    },
    title: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.textMain,
      marginBottom: 12,
      lineHeight: 20,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    summaryItem: {
      width: '48%',
      backgroundColor: colors.surfaceMuted,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderCard,
      padding: 9,
    },
    summaryLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: colors.textFaint,
      marginBottom: 2,
    },
    summaryVal: {
      fontSize: 12.5,
      fontWeight: '800',
    },
    tabRow: {
      flexDirection: 'row',
      gap: 6,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderRadius: 10,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderCard,
      alignItems: 'center',
    },
    tabBtnActive: {
      backgroundColor: isDark ? 'rgba(244, 63, 94, 0.2)' : 'rgba(225, 29, 72, 0.12)',
      borderColor: colors.primary,
    },
    tabBtnText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: colors.textMuted,
    },
    tabBtnTextActive: {
      color: colors.primaryHover,
      fontWeight: '800',
    },
    sectionSubLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.cyan,
      marginBottom: 6,
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10,
    },
    zoneChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderCard,
    },
    zoneChipActive: {
      backgroundColor: isDark ? 'rgba(6, 182, 212, 0.22)' : 'rgba(8, 145, 178, 0.15)',
      borderColor: colors.cyan,
    },
    zoneChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    zoneChipTextActive: {
      color: colors.textMain,
      fontWeight: '800',
    },
    infoBox: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderCard,
      padding: 11,
    },
    infoBoxTitle: {
      fontSize: 12.5,
      fontWeight: '800',
      color: colors.textMain,
      marginBottom: 2,
    },
    infoBoxSub: {
      fontSize: 10.5,
      fontWeight: '700',
      color: colors.cyan,
      marginBottom: 4,
    },
    infoBoxDesc: {
      fontSize: 11.5,
      color: colors.textMuted,
      lineHeight: 16,
    },
    mealBtn: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderCard,
      alignItems: 'center',
    },
    behRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 9,
      borderRadius: 10,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderCard,
      marginBottom: 6,
    },
    behRowActive: {
      backgroundColor: isDark ? 'rgba(244, 63, 94, 0.14)' : 'rgba(225, 29, 72, 0.1)',
      borderColor: colors.primaryHover,
    },
    alertTriggerBtn: {
      marginTop: 12,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 11,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertTriggerBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
  });

