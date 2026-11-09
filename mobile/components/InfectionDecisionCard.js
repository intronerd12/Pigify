import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const MOBILE_INFECTION_CATALOG = [
  {
    id: 'asf',
    name: 'African Swine Fever (ASFV)',
    shortName: 'African Swine Fever',
    localName: 'Lagnat-Baboy Aprikano',
    priorityScore: 100,
    category: 'Reportable Viral Hemorrhagic',
    color: '#F43F5E',
    penZone: 'Strict In-Place Pen Lockdown (Do NOT Move Pig)',
    doFirstImmediate:
      'Lock the affected pen gate immediately. Do NOT move the pig past healthy pens, do NOT slaughter or sell, and halt all visitor/trader entry.',
    disinfectant: '2% Caustic Soda, Glutaraldehyde, or Slaked Lime (Apog)',
    vetProtocol:
      'No vaccine or cure exists. Do NOT inject or share needles (blood spreads ASFV). Report immediately to MAO Luna (0917-842-5510) & OPVet La Union.',
  },
  {
    id: 'pdns',
    name: 'Porcine Dermatitis & Nephropathy (PDNS)',
    shortName: 'PDNS (PCV2)',
    localName: 'Pamumantal at Sakit sa Bato',
    priorityScore: 85,
    category: 'PCV2 Immune-Complex Viral',
    color: '#A855F7',
    penZone: 'Dedicated Vascular Isolation Bay (Unit Q-2)',
    doFirstImmediate:
      'Isolate the affected grower/finisher in a dry, quiet pen and request veterinary differential check to rule out ASF due to dark-red/purple macules.',
    disinfectant: 'Potassium Peroxymonosulfate (Virkon-S) or 2% Bleach',
    vetProtocol:
      'Provide clean oral electrolyte water to support kidney function, anti-inflammatory care under veterinary supervision, and review PCV2 vaccination.',
  },
  {
    id: 'erysipelas',
    name: 'Swine Erysipelas (Diamond Skin)',
    shortName: 'Swine Erysipelas',
    localName: 'Bulutong-Diyamante',
    priorityScore: 70,
    category: 'Acute Contagious Bacterial',
    color: '#F59E0B',
    penZone: 'Bacterial Treatment Isolation Pen (Unit Q-1)',
    doFirstImmediate:
      'Separate pig with raised rhomboid/diamond skin plaques and high fever (40.5°C–42°C) into a shaded bacterial treatment pen within the first hour.',
    disinfectant: 'Quaternary Ammonium, Povidone-Iodine, or Phenolic Disinfectant',
    vetProtocol:
      'Highly responsive to fast-acting Penicillin G (20,000–30,000 IU/kg IM) or Amoxicillin within 24 hours under veterinary prescription.',
  },
  {
    id: 'greasy_pig',
    name: 'Greasy Pig Disease (Exudative)',
    shortName: 'Greasy Pig Disease',
    localName: 'Langis-Balat (Staph. hyicus)',
    priorityScore: 55,
    category: 'Exudative Bacterial Dermatitis',
    color: '#EC4899',
    penZone: 'Warm Dry Nursery Hospital Pen',
    doFirstImmediate:
      'Move affected piglets/weaners with dark greasy crusts to a dry, draft-free creep pen and give oral electrolytes immediately to prevent dehydration.',
    disinfectant: '0.05% Chlorhexidine Gluconate or Diluted Povidone-Iodine Wash',
    vetProtocol:
      'Gently wash greasy exudate with warm 0.05% Chlorhexidine soap, pat dry, apply topical antibiotic spray, and replace damp rice hull (ipa) bedding.',
  },
  {
    id: 'mange',
    name: 'Sarcoptic Swine Mange (Scabies)',
    shortName: 'Sarcoptic Mange',
    localName: 'Galis-Baboy / Kagid',
    priorityScore: 40,
    category: 'Contagious Mite Infestation',
    color: '#06B6D4',
    penZone: 'Acaricide Treatment Pen (Separate from Open-Wound Pigs)',
    doFirstImmediate:
      'Isolate intensely scratching pigs with crusty ear/neck scabs so they do not rub mites onto pen dividers or healthy sows.',
    disinfectant: 'Amitraz (0.05%–0.1%) Acaricide Spray on Pen Walls & Bamboo Crevices',
    vetProtocol:
      'Administer Ivermectin (300 mcg/kg SC) or Doramectin with a mandatory second dose at Day 14 to kill newly hatched mite larvae.',
  },
];

const MOBILE_PRESETS = [
  {
    id: 'mange_greasy',
    label: 'Co-Infection: Mange + Greasy Pig',
    ids: ['mange', 'greasy_pig'],
  },
  {
    id: 'herd_multi',
    label: 'Multi-Pen: Erysipelas + Mange + PDNS',
    ids: ['erysipelas', 'mange', 'pdns'],
  },
  {
    id: 'asf_erysipelas',
    label: 'Critical Alert: ASF + Erysipelas',
    ids: ['asf', 'erysipelas'],
  },
  {
    id: 'single_erysipelas',
    label: 'Single: Swine Erysipelas',
    ids: ['erysipelas'],
  },
];

export function parseConditionToMobileIds(conditionText) {
  if (!conditionText) return [];
  const lower = String(conditionText).toLowerCase();
  const matched = [];
  if (lower.includes('asf') || lower.includes('african swine')) matched.push('asf');
  if (lower.includes('pdns') || lower.includes('nephropathy') || lower.includes('circovirus'))
    matched.push('pdns');
  if (lower.includes('erysipelas') || lower.includes('diamond')) matched.push('erysipelas');
  if (lower.includes('greasy') || lower.includes('exudative') || lower.includes('staph'))
    matched.push('greasy_pig');
  if (lower.includes('mange') || lower.includes('scabies') || lower.includes('galis'))
    matched.push('mange');
  return matched;
}

export default function InfectionDecisionCard({
  detectedConditions = [],
  navigation,
  contextTitle = 'WHAT TO DO FIRST • MULTI-INFECTION DECISION ENGINE',
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const derivedIds = useMemo(() => {
    const set = new Set();
    const list = Array.isArray(detectedConditions) ? detectedConditions : [detectedConditions];
    list.forEach((item) => {
      const text =
        typeof item === 'string'
          ? item
          : item?.condition || item?.disease_detected || item?.detectedDisease || item?.name || '';
      parseConditionToMobileIds(text).forEach((id) => set.add(id));
    });
    return Array.from(set);
  }, [detectedConditions]);

  const [selectedIds, setSelectedIds] = useState(() =>
    derivedIds.length > 0 ? derivedIds : ['erysipelas', 'mange']
  );

  useEffect(() => {
    if (derivedIds.length > 0) {
      setSelectedIds(derivedIds);
    }
  }, [derivedIds.join(',')]);

  const toggleId = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const activeInfections = useMemo(() => {
    return MOBILE_INFECTION_CATALOG.filter((item) => selectedIds.includes(item.id)).sort(
      (a, b) => b.priorityScore - a.priorityScore
    );
  }, [selectedIds]);

  const topPriority = activeInfections[0] || MOBILE_INFECTION_CATALOG[2];
  const isMultiInfection = activeInfections.length > 1;
  const hasAsf = selectedIds.includes('asf');
  const hasPdns = selectedIds.includes('pdns');
  const hasErysipelas = selectedIds.includes('erysipelas');
  const hasGreasy = selectedIds.includes('greasy_pig');
  const hasMange = selectedIds.includes('mange');

  const advisory = useMemo(() => {
    if (!isMultiInfection) {
      return {
        title: `Single Active Infection: Handle ${topPriority.shortName} Immediately`,
        color: topPriority.color,
        summary: `Contain ${topPriority.shortName} in ${topPriority.penZone}. Always feed 100% healthy pens FIRST before entering the affected pen.`,
        rules: [
          `Lock or isolate the affected pen and place a dedicated footbath (${topPriority.disinfectant}) at the gate.`,
          'Never use the same broom, shovel, or boots between the sick pen and healthy pens.',
        ],
      };
    }

    const rules = [];
    if (hasAsf) {
      rules.push(
        'NEEDLE-SHARING PROHIBITION: Because ASF is suspected alongside other conditions, DO NOT administer herd-wide Mange or antibiotic injections using shared needles—blood-borne ASFV will spread rapidly.'
      );
      rules.push(
        'SEPARATE QUARANTINE BAYS: Never place an ASF-suspect pig into the same hospital pen as treatable Erysipelas, Greasy Pig, or Mange pigs.'
      );
    }
    if (hasMange && hasGreasy) {
      rules.push(
        'SKIN BARRIER SYNERGY (MANGE + GREASY PIG): Mange scratching opens raw skin fissures that accelerate Greasy Pig Staphylococcus colonization. Wash crusts with 0.05% Chlorhexidine FIRST, then treat both mites and bacteria.'
      );
    }
    if (hasErysipelas && (hasMange || hasGreasy)) {
      rules.push(
        'FEBRILE BACTERIAL PRIORITY: Treat the high-fever Swine Erysipelas pig (24h Penicillin G window) BEFORE routine Mange acaricide spraying.'
      );
    }
    if (hasPdns && !hasAsf) {
      rules.push(
        'VASCULAR & RENAL CAUTION (PDNS): Keep PDNS suspects in a calm, separate bay with oral electrolytes pending veterinary ASF rule-out.'
      );
    }
    if (rules.length === 0) {
      rules.push(
        'NO MIXED HOSPITAL PENS: Keep viral, bacterial, and parasitic cases in separate partitioned bays to prevent cross-infection.'
      );
    }

    return {
      title: `Multi-Infection Alert (${activeInfections.length} Conditions) — Handle ${topPriority.shortName} First!`,
      color: topPriority.color,
      summary: `Multiple conditions detected (${activeInfections
        .map((i) => i.shortName)
        .join(' + ')}). Follow the ranked priority order below to prevent cross-pen contagion.`,
      rules,
    };
  }, [isMultiInfection, activeInfections, topPriority, hasAsf, hasPdns, hasErysipelas, hasGreasy, hasMange]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.kickerRow}>
        <Ionicons name="medkit" size={13} color="#FB7185" />
        <Text style={styles.kickerText}>{contextTitle}</Text>
      </View>

      <Text style={styles.title}>
        What To Do First: Single & Multi-Infection Action Plan
      </Text>
      <Text style={styles.subtitle}>
        Tap 1 or multiple detected conditions below to see which infection to handle first, how to
        separate pens, and the exact feeding & sanitation order.
      </Text>

      {/* Preset Scenarios Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetScroll}
      >
        {MOBILE_PRESETS.map((preset) => {
          const isMatch =
            preset.ids.length === selectedIds.length &&
            preset.ids.every((id) => selectedIds.includes(id));
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => setSelectedIds(preset.ids)}
              activeOpacity={0.85}
              style={[styles.presetBtn, isMatch && styles.presetBtnActive]}
            >
              <Ionicons
                name="flash"
                size={12}
                color={isMatch ? '#FB7185' : '#94A3B8'}
              />
              <Text style={[styles.presetBtnText, isMatch && styles.presetBtnTextActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 5 Interactive Disease Toggles */}
      <View style={styles.chipsWrap}>
        {MOBILE_INFECTION_CATALOG.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleId(item.id)}
              activeOpacity={0.8}
              style={[
                styles.diseaseChip,
                isSelected && {
                  backgroundColor: `${item.color}26`,
                  borderColor: item.color,
                },
              ]}
            >
              <View
                style={[
                  styles.chipDot,
                  { backgroundColor: isSelected ? item.color : '#64748B' },
                ]}
              />
              <Text
                style={[
                  styles.diseaseChipText,
                  isSelected && { color: '#FFFFFF', fontWeight: '800' },
                ]}
              >
                {item.shortName}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={13} color={item.color} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Co-Infection / Priority Warning Banner */}
      <View
        style={[
          styles.advisoryBanner,
          {
            backgroundColor: `${advisory.color}15`,
            borderColor: `${advisory.color}55`,
          },
        ]}
      >
        <View style={styles.advisoryHead}>
          <Ionicons name="warning" size={18} color={advisory.color} />
          <Text style={[styles.advisoryTitle, { color: advisory.color }]}>
            {advisory.title}
          </Text>
        </View>
        <Text style={styles.advisorySummary}>{advisory.summary}</Text>

        {advisory.rules.map((rule, idx) => (
          <View key={idx} style={styles.ruleRow}>
            <Ionicons
              name="alert-circle"
              size={14}
              color={advisory.color}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>

      {/* Ranked Priority Queue Cards */}
      <View style={styles.priorityList}>
        {activeInfections.map((inf, idx) => (
          <View
            key={inf.id}
            style={[
              styles.priorityCard,
              idx === 0 && { borderColor: `${inf.color}88`, borderWidth: 1.5 },
            ]}
          >
            <View style={styles.priorityTopRow}>
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: `${inf.color}24`, borderColor: `${inf.color}66` },
                ]}
              >
                <Text style={[styles.rankBadgeText, { color: inf.color }]}>
                  ACTION ORDER #{idx + 1} • {inf.category}
                </Text>
              </View>
              {idx === 0 && (
                <View style={[styles.doFirstPill, { backgroundColor: inf.color }]}>
                  <Text style={styles.doFirstPillText}>DO THIS FIRST</Text>
                </View>
              )}
            </View>

            <Text style={styles.priorityName}>{inf.name}</Text>
            <Text style={styles.priorityLocal}>
              {inf.localName} • {inf.penZone}
            </Text>

            <View style={[styles.doFirstBox, { borderLeftColor: inf.color }]}>
              <Text style={styles.doFirstBoxText}>
                <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>What to do first: </Text>
                {inf.doFirstImmediate}
              </Text>
            </View>

            <Text style={styles.metaLine}>
              <Text style={{ fontWeight: '800', color: '#E2E8F0' }}>Disinfectant: </Text>
              {inf.disinfectant}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={{ fontWeight: '800', color: '#E2E8F0' }}>Veterinary Care: </Text>
              {inf.vetProtocol}
            </Text>
          </View>
        ))}
      </View>

      {/* 4-Step Chronological Timeline */}
      <View style={styles.timelineBox}>
        <Text style={styles.timelineHeader}>
          4-STEP CHRONOLOGICAL FARM RESPONSE SEQUENCE
        </Text>

        <View style={styles.timelineStep}>
          <View style={[styles.stepBadge, { backgroundColor: '#F43F5E' }]}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>
              First 0–15 Mins: Lock Down Priority #1 & Feeding Sequence
            </Text>
            <Text style={styles.stepDesc}>
              Always feed 100% Healthy Pens FIRST → Mild/Parasitic Pens (Mange/Greasy Pig) SECOND →
              Febrile/Viral Isolation Pens ({topPriority.shortName}) LAST.
            </Text>
          </View>
        </View>

        <View style={styles.timelineStep}>
          <View style={[styles.stepBadge, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>
              First 15–60 Mins: Separate Pen Bays & Stop Shared Troughs
            </Text>
            <Text style={styles.stepDesc}>
              {isMultiInfection
                ? `Never mix ${activeInfections
                    .map((i) => i.shortName)
                    .join(' and ')} pigs in the same hospital pen. Partition each condition separately.`
                : 'Isolate the affected pig at least 10 meters away and block pen slurry drainage from flowing into adjacent pens.'}
            </Text>
          </View>
        </View>

        <View style={styles.timelineStep}>
          <View style={[styles.stepBadge, { backgroundColor: '#06B6D4' }]}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>
              First 1–4 Hours: Footbath Disinfection & Vector Control
            </Text>
            <Text style={styles.stepDesc}>
              Deploy {topPriority.disinfectant} at the pen gate, replace damp rice hull (ipa)
              bedding, and apply slaked lime (apog) on walkways.
            </Text>
          </View>
        </View>

        <View style={styles.timelineStep}>
          <View style={[styles.stepBadge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.stepBadgeText}>4</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>
              First 4–24 Hours: Veterinary Treatment & MAO Luna Alert
            </Text>
            <Text style={styles.stepDesc}>
              {topPriority.vetProtocol}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.actionsRow}>
        {navigation && (
          <TouchableOpacity
            onPress={() => navigation.navigate('MappingEnvironment')}
            style={styles.mapBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="map" size={14} color="#FFFFFF" />
            <Text style={styles.mapBtnText}>Luna GIS Map</Text>
          </TouchableOpacity>
        )}

        {navigation && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Chatbot')}
            style={styles.chatBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubbles" size={14} color="#38BDF8" />
            <Text style={styles.chatBtnText}>Ask Dr. Pigify</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => Linking.openURL('tel:09178425510')}
          style={styles.callBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="call" size={14} color="#10B981" />
          <Text style={styles.callBtnText}>Call MAO Luna</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(244, 63, 94, 0.32)' : 'rgba(225, 29, 72, 0.22)',
      padding: 16,
      marginVertical: 10,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    kickerText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primaryHover,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textMain,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
      marginBottom: 12,
    },
    presetScroll: {
      gap: 8,
      paddingBottom: 10,
    },
    presetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 11,
      borderRadius: 9,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderCard,
    },
    presetBtnActive: {
      backgroundColor: isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(225, 29, 72, 0.12)',
      borderColor: colors.primary,
    },
    presetBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    presetBtnTextActive: {
      color: colors.primaryHover,
    },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 14,
    },
    diseaseChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 9,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderCard,
    },
    chipDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    diseaseChipText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: colors.textMuted,
    },
    advisoryBanner: {
      borderRadius: 13,
      borderWidth: 1,
      padding: 12,
      marginBottom: 14,
      gap: 6,
    },
    advisoryHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    advisoryTitle: {
      fontSize: 13,
      fontWeight: '800',
      flex: 1,
    },
    advisorySummary: {
      fontSize: 11.5,
      color: colors.textMain,
      lineHeight: 16.5,
    },
    ruleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 2,
    },
    ruleText: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15.5,
      flex: 1,
    },
    priorityList: {
      gap: 10,
      marginBottom: 14,
    },
    priorityCard: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.borderCard,
      padding: 12,
      gap: 6,
    },
    priorityTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    rankBadge: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 6,
      borderWidth: 1,
    },
    rankBadgeText: {
      fontSize: 9.5,
      fontWeight: '800',
    },
    doFirstPill: {
      paddingVertical: 2,
      paddingHorizontal: 7,
      borderRadius: 5,
    },
    doFirstPillText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    priorityName: {
      fontSize: 14.5,
      fontWeight: '800',
      color: colors.textMain,
    },
    priorityLocal: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: -2,
    },
    doFirstBox: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)',
      borderLeftWidth: 3,
      borderRadius: 8,
      padding: 9,
      marginVertical: 2,
    },
    doFirstBoxText: {
      fontSize: 11.5,
      color: colors.textMain,
      lineHeight: 16,
    },
    metaLine: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15.5,
    },
    timelineBox: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.borderCard,
      padding: 12,
      gap: 10,
      marginBottom: 12,
    },
    timelineHeader: {
      fontSize: 10.5,
      fontWeight: '800',
      color: colors.cyan,
      letterSpacing: 0.6,
    },
    timelineStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 9,
    },
    stepBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    stepBadgeText: {
      fontSize: 10.5,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    stepTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMain,
      marginBottom: 2,
    },
    stepDesc: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15.5,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.borderCard,
    },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F43F5E',
    paddingVertical: 9,
    borderRadius: 9,
  },
  mapBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    paddingVertical: 9,
    borderRadius: 9,
  },
  chatBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#38BDF8',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 9,
    borderRadius: 9,
  },
  callBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#10B981',
  },
});

