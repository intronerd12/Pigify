import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Layers,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Zap,
} from 'lucide-react'
import './InfectionDecisionEngine.css'

export const SWINE_INFECTION_CATALOG = [
  {
    id: 'asf',
    name: 'African Swine Fever (ASFV)',
    shortName: 'African Swine Fever (ASF)',
    localName: 'Lagnat-Baboy Aprikano',
    priorityScore: 100,
    urgencyTier: 'PRIORITY #1 • CRITICAL VIRAL LOCKDOWN',
    category: 'Reportable Viral Hemorrhagic',
    color: '#f43f5e',
    penZone: 'Strict In-Place Lockdown (Do NOT Move Pig Through Corridor)',
    doFirstImmediate:
      'Lock the affected pen gate immediately. Do NOT move the pig past healthy pens, do NOT slaughter or sell, and halt all visitor/trader entry.',
    feedingSequenceRank: 'LAST (Dedicated caretaker, dedicated boots & pail)',
    disinfectant: '2% Sodium Hydroxide (Caustic Soda), Glutaraldehyde, or Slaked Lime (Apog)',
    vetProtocol:
      'No vaccine or cure exists. Do NOT inject or share needles (blood spreads ASFV). Report immediately to MAO Luna (0917-842-5510) & OPVet La Union for RT-PCR verification and 1-7-10 km zoning.',
  },
  {
    id: 'pdns',
    name: 'Porcine Dermatitis & Nephropathy Syndrome (PDNS)',
    shortName: 'PDNS (PCV2 Vasculitis)',
    localName: 'Pamumantal at Sakit sa Bato (PCV2)',
    priorityScore: 85,
    urgencyTier: 'PRIORITY #2 • SYSTEMIC VASCULAR & DIFFERENTIAL',
    category: 'PCV2 Immune-Complex Viral',
    color: '#a855f7',
    penZone: 'Dedicated Vascular Isolation Bay (Unit Q-2)',
    doFirstImmediate:
      'Isolate the affected grower/finisher in a dry, quiet pen and request veterinary differential check to rule out ASF due to dark-red/purple macules on hindquarters.',
    feedingSequenceRank: 'SECOND-TO-LAST (Before ASF suspects, after bacterial/parasitic)',
    disinfectant: 'Potassium Peroxymonosulfate (Virkon-S) or 2% Sodium Hypochlorite',
    vetProtocol:
      'Provide clean oral electrolyte water to support kidney function, anti-inflammatory care under veterinary supervision, and review herd PCV2 vaccination.',
  },
  {
    id: 'erysipelas',
    name: 'Swine Erysipelas (Diamond Skin Disease)',
    shortName: 'Swine Erysipelas (Diamond Skin)',
    localName: 'Bulutong-Diyamante',
    priorityScore: 70,
    urgencyTier: 'PRIORITY #3 • URGENT 24H ANTIBIOTIC WINDOW',
    category: 'Acute Contagious Bacterial',
    color: '#f59e0b',
    penZone: 'Bacterial Treatment Isolation Pen (Unit Q-1)',
    doFirstImmediate:
      'Separate pig with raised rhomboid/diamond skin plaques and high fever (40.5°C–42°C) into a shaded bacterial treatment pen within the first hour.',
    feedingSequenceRank: 'AFTER HEALTHY & PARASITIC PENS (Wear disposable gloves)',
    disinfectant: 'Quaternary Ammonium, Povidone-Iodine, or Phenolic Disinfectant',
    vetProtocol:
      'Highly responsive to fast-acting Penicillin G (20,000–30,000 IU/kg IM) or Amoxicillin within 24 hours. Provide cool wet mash and antipyretics as prescribed by your vet.',
  },
  {
    id: 'greasy_pig',
    name: 'Greasy Pig Disease (Exudative Epidermitis)',
    shortName: 'Greasy Pig Disease',
    localName: 'Langis-Balat (Staphylococcus hyicus)',
    priorityScore: 55,
    urgencyTier: 'PRIORITY #4 • PIGLET DERMAL & HYDRATION CARE',
    category: 'Exudative Bacterial Dermatitis',
    color: '#ec4899',
    penZone: 'Warm Dry Nursery Hospital Pen',
    doFirstImmediate:
      'Move affected piglets/weaners with dark greasy crusts to a dry, draft-free creep pen and give oral electrolytes immediately to prevent fatal dehydration.',
    feedingSequenceRank: 'SECOND (After 100% healthy nursery/grower pens)',
    disinfectant: '0.05% Chlorhexidine Gluconate or Diluted Povidone-Iodine Wash',
    vetProtocol:
      'Gently wash greasy exudate with warm 0.05% Chlorhexidine soap, pat dry, apply topical antibiotic spray, and replace damp bedding with fresh dry rice hull (ipa).',
  },
  {
    id: 'mange',
    name: 'Sarcoptic Swine Mange (Scabies)',
    shortName: 'Sarcoptic Mange',
    localName: 'Galis-Baboy / Kagid (Sarcoptes scabiei)',
    priorityScore: 40,
    urgencyTier: 'PRIORITY #5 • ECTOPARASITIC ERADICATION',
    category: 'Contagious Mite Infestation',
    color: '#06b6d4',
    penZone: 'Acaricide Treatment Pen (Separate from Open-Wound Pigs)',
    doFirstImmediate:
      'Isolate intensely scratching pigs with crusty ear/neck scabs so they do not rub mites onto pen dividers or healthy sows.',
    feedingSequenceRank: 'SECOND (Right after healthy pens; before febrile pens)',
    disinfectant: 'Amitraz (0.05%–0.1%) Acaricide Spray on Pen Walls & Bamboo Crevices',
    vetProtocol:
      'Administer Ivermectin (300 mcg/kg SC) or Doramectin with a mandatory second dose at Day 14 to kill newly hatched mite larvae, plus spray pen rubbing posts.',
  },
]

const MULTI_INFECTION_PRESETS = [
  {
    id: 'mange_greasy',
    label: 'Co-Infection: Mange + Greasy Pig (2 Infections)',
    ids: ['mange', 'greasy_pig'],
  },
  {
    id: 'herd_multi',
    label: 'Multi-Pen: Erysipelas + Mange + PDNS (3 Infections)',
    ids: ['erysipelas', 'mange', 'pdns'],
  },
  {
    id: 'asf_erysipelas',
    label: 'Critical Red Alert: ASF + Erysipelas (2 Infections)',
    ids: ['asf', 'erysipelas'],
  },
  {
    id: 'single_erysipelas',
    label: 'Single Detection: Swine Erysipelas',
    ids: ['erysipelas'],
  },
]

export function mapConditionStringToIds(conditionText) {
  if (!conditionText) return []
  const lower = String(conditionText).toLowerCase()
  const matched = []
  if (lower.includes('asf') || lower.includes('african swine')) matched.push('asf')
  if (lower.includes('pdns') || lower.includes('nephropathy') || lower.includes('circovirus')) matched.push('pdns')
  if (lower.includes('erysipelas') || lower.includes('diamond')) matched.push('erysipelas')
  if (lower.includes('greasy') || lower.includes('exudative') || lower.includes('staph')) matched.push('greasy_pig')
  if (lower.includes('mange') || lower.includes('scabies') || lower.includes('galis') || lower.includes('mite')) matched.push('mange')
  return matched
}

export default function InfectionDecisionEngine({
  detectedConditions = [],
  contextLabel = 'HERD & PEN MONITORING DECISION ENGINE',
  compact = false,
}) {
  // Derive initial selected disease IDs from props or default to a realistic 2-infection backyard scenario
  const derivedFromProps = useMemo(() => {
    const set = new Set()
    const list = Array.isArray(detectedConditions) ? detectedConditions : [detectedConditions]
    list.forEach((item) => {
      const text = typeof item === 'string' ? item : item?.condition || item?.detectedDisease || item?.name || ''
      mapConditionStringToIds(text).forEach((id) => set.add(id))
    })
    return Array.from(set)
  }, [detectedConditions])

  const [selectedIds, setSelectedIds] = useState(() =>
    derivedFromProps.length > 0 ? derivedFromProps : ['erysipelas', 'mange']
  )

  useEffect(() => {
    if (derivedFromProps.length > 0) {
      setSelectedIds(derivedFromProps)
    }
  }, [derivedFromProps.join(',')])

  const toggleDiseaseId = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev
      }
      return [...prev, id]
    })
  }

  // Sort selected infections by highest priority score first
  const activeInfections = useMemo(() => {
    return SWINE_INFECTION_CATALOG.filter((item) => selectedIds.includes(item.id)).sort(
      (a, b) => b.priorityScore - a.priorityScore
    )
  }, [selectedIds])

  const topPriority = activeInfections[0] || SWINE_INFECTION_CATALOG[2]
  const isMultiInfection = activeInfections.length > 1
  const hasAsf = selectedIds.includes('asf')
  const hasPdns = selectedIds.includes('pdns')
  const hasErysipelas = selectedIds.includes('erysipelas')
  const hasGreasy = selectedIds.includes('greasy_pig')
  const hasMange = selectedIds.includes('mange')

  // Generate dynamic Co-Infection / Multi-Infection Clinical Warnings & Interaction Rules
  const coInfectionAdvisory = useMemo(() => {
    if (!isMultiInfection) {
      return {
        title: `Single Active Condition Detected: ${topPriority.name}`,
        color: topPriority.color,
        bg: `${topPriority.color}14`,
        border: `${topPriority.color}45`,
        summary: `Focus immediately on containing ${topPriority.shortName} in ${topPriority.penZone}. Follow the 4-stage chronological response protocol below to prevent spread to healthy pens.`,
        conflictRules: [
          `Always feed and clean 100% healthy pens FIRST before entering the ${topPriority.shortName} pen.`,
          `Use a dedicated pair of rubber boots and disinfectant footbath (${topPriority.disinfectant}) outside the affected pen.`,
        ],
      }
    }

    const rules = []
    if (hasAsf) {
      rules.push(
        'CRITICAL NEEDLE & INJECTION PROHIBITION: Because ASF is suspected alongside other conditions, DO NOT perform herd-wide injections (such as Ivermectin for Mange or Penicillin for Erysipelas) using shared needles—blood-borne ASFV transmission will wipe out the entire herd.'
      )
      rules.push(
        'SEPARATE QUARANTINE ZONES: Never place an ASF-suspect pig into the same hospital pen as pigs with treatable Erysipelas, Greasy Pig, or Mange. Keep the ASF-suspect pig locked in its original pen.'
      )
    }
    if (hasMange && hasGreasy) {
      rules.push(
        'DERMAL BARRIER SYNERGY (MANGE + GREASY PIG): Sarcoptic Mange scratching creates raw skin fissures that allow Staphylococcus hyicus (Greasy Pig Disease) to rapidly colonize. Wash crusts with 0.05% Chlorhexidine FIRST, then treat both the bacterial infection and the mite infestation.'
      )
    }
    if (hasErysipelas && (hasMange || hasGreasy)) {
      rules.push(
        'FEBRILE BACTERIAL PRIORITY: Handle and medicate the high-fever Swine Erysipelas pig (24h Penicillin G window) before routine Mange acaricide spraying, as acute Erysipelas septicemia can be fatal within 24–48 hours.'
      )
    }
    if (hasPdns && !hasAsf) {
      rules.push(
        'VASCULAR & RENAL CAUTION (PDNS): Avoid nephrotoxic drugs or high-stress physical restraint while treating co-existing skin conditions; keep PDNS suspects in a calm, separate bay pending veterinary ASF rule-out.'
      )
    }
    if (rules.length === 0) {
      rules.push(
        'STRICT MULTI-PEN ISOLATION: Do not mix pigs with different infections in a single hospital pen. Partition isolation bays by pathogen type (Viral vs. Bacterial vs. Parasitic).'
      )
    }

    return {
      title: `Multi-Infection Alert (${activeInfections.length} Conditions Detected) — Handle ${topPriority.shortName} First!`,
      color: topPriority.color,
      bg: `${topPriority.color}16`,
      border: `${topPriority.color}50`,
      summary: `When ${activeInfections.length} swine conditions are present (${activeInfections.map((i) => i.shortName).join(' + ')}), you must triage by biological lethality and contagion speed while avoiding cross-pen contamination.`,
      conflictRules: rules,
    }
  }, [isMultiInfection, activeInfections, topPriority, hasAsf, hasPdns, hasErysipelas, hasGreasy, hasMange])

  return (
    <div className="ide-wrapper">
      <div className="lp-card-reticle top-left" />
      <div className="lp-card-reticle bottom-right" />

      {/* Header */}
      <div className="ide-top-bar">
        <div>
          <div className="ide-kicker">
            <Stethoscope size={13} />
            <span>{contextLabel}</span>
          </div>
          <h2 className="ide-title">
            What To Do First: Single &amp; Multi-Infection Clinical Decision Guide
          </h2>
          <p className="ide-subtitle">
            Actionable step-by-step triage for backyard farmers when <strong>one or more infections</strong> are detected during monitoring—ranking which condition to contain first, how to separate pens, and what feeding &amp; disinfection order to follow.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/disease-map" className="lp-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <MapPin size={14} />
            <span>Luna, La Union GIS Map</span>
          </Link>
          <Link to="/chatbot" className="lp-btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <Bot size={14} />
            <span>Ask Dr. Pigify AI</span>
          </Link>
        </div>
      </div>

      {/* Interactive Multi-Infection Selector & Presets */}
      <div className="ide-controls-box">
        <div className="ide-controls-label">
          <span>
            SELECT DETECTED INFECTIONS IN YOUR PEN / HERD ({activeInfections.length} ACTIVE):
          </span>
          <span style={{ color: '#38bdf8' }}>
            Click 1 or multiple conditions to see priority order
          </span>
        </div>

        <div className="ide-preset-row">
          {MULTI_INFECTION_PRESETS.map((preset) => {
            const isMatch =
              preset.ids.length === selectedIds.length &&
              preset.ids.every((id) => selectedIds.includes(id))
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedIds(preset.ids)}
                className={`ide-preset-btn ${isMatch ? 'active' : ''}`}
              >
                <Zap size={12} />
                <span>{preset.label}</span>
              </button>
            )
          })}
        </div>

        <div className="ide-disease-toggles">
          {SWINE_INFECTION_CATALOG.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleDiseaseId(item.id)}
                className={`ide-disease-chip ${isSelected ? 'selected' : ''}`}
                style={
                  isSelected
                    ? {
                        background: `${item.color}28`,
                        borderColor: item.color,
                        color: item.color,
                      }
                    : undefined
                }
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSelected ? item.color : '#64748b',
                  }}
                />
                <span>{item.shortName}</span>
                {isSelected && <CheckCircle2 size={13} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Co-Infection / Priority Alert Banner */}
      <div
        className="ide-coinfection-banner"
        style={{
          background: coInfectionAdvisory.bg,
          borderColor: coInfectionAdvisory.border,
        }}
      >
        <ShieldAlert
          size={22}
          color={coInfectionAdvisory.color}
          style={{ flexShrink: 0, marginTop: '2px' }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '0.98rem',
              fontWeight: 800,
              color: coInfectionAdvisory.color,
              marginBottom: '4px',
            }}
          >
            {coInfectionAdvisory.title}
          </div>
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '0.84rem',
              color: 'var(--text-main, #e2e8f0)',
              lineHeight: 1.5,
            }}
          >
            {coInfectionAdvisory.summary}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {coInfectionAdvisory.conflictRules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '7px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted, #cbd5e1)',
                  lineHeight: 1.45,
                }}
              >
                <AlertTriangle
                  size={14}
                  color={coInfectionAdvisory.color}
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Triage Queue (Ordered #1, #2, #3...) */}
      <div className="ide-priority-grid">
        {activeInfections.map((inf, idx) => (
          <div
            key={inf.id}
            className="ide-priority-card"
            style={{
              borderColor: idx === 0 ? `${inf.color}88` : 'rgba(255,255,255,0.1)',
              boxShadow: idx === 0 ? `0 8px 24px -8px ${inf.color}40` : 'none',
            }}
          >
            <div className="ide-priority-head">
              <span
                className="ide-rank-badge"
                style={{
                  background: `${inf.color}22`,
                  color: inf.color,
                  border: `1px solid ${inf.color}55`,
                }}
              >
                ACTION ORDER #{idx + 1} • {inf.category}
              </span>
              {idx === 0 && (
                <span
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#ffffff',
                    background: inf.color,
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  DO THIS FIRST
                </span>
              )}
            </div>

            <div
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-main, #ffffff)',
              }}
            >
              {inf.name}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '-4px' }}>
              Local Name: <strong>{inf.localName}</strong> • Zone: <strong>{inf.penZone}</strong>
            </div>

            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.22)',
                borderLeft: `3px solid ${inf.color}`,
                fontSize: '0.8rem',
                color: 'var(--text-main, #f1f5f9)',
                lineHeight: 1.45,
              }}
            >
              <strong>What to do first:</strong> {inf.doFirstImmediate}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45 }}>
              <strong>Disinfectant:</strong> {inf.disinfectant}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45 }}>
              <strong>Veterinary Care:</strong> {inf.vetProtocol}
            </div>
          </div>
        ))}
      </div>

      {/* 4-Step Chronological Action Plan ("What To Do First" Timeline) */}
      {!compact && (
        <div className="ide-steps-grid">
          <div className="ide-step-card">
            <span className="ide-step-time" style={{ color: '#f43f5e' }}>
              STEP 1 • FIRST 0–15 MINUTES (CONTAINMENT &amp; FEEDING ORDER)
            </span>
            <h4 className="ide-step-title">
              Lock Down Priority #1 ({topPriority.shortName}) &amp; Enforce Feeding Order
            </h4>
            <ul className="ide-step-list">
              <li>
                <CheckCircle2 size={14} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Immediate Gate Lock:</strong> {topPriority.doFirstImmediate}
                </span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Golden Feeding Sequence:</strong> Always feed and water{' '}
                  <strong>100% Healthy Pens FIRST</strong> &rarr;{' '}
                  <strong>Mild/Parasitic Pens (Mange/Greasy Pig) SECOND</strong> &rarr;{' '}
                  <strong>Febrile/Viral Pens (Erysipelas/PDNS/ASF) LAST</strong>.
                </span>
              </li>
            </ul>
          </div>

          <div className="ide-step-card">
            <span className="ide-step-time" style={{ color: '#f59e0b' }}>
              STEP 2 • FIRST 15–60 MINUTES (SEPARATE PEN PARTITIONING)
            </span>
            <h4 className="ide-step-title">
              {isMultiInfection
                ? `Segregate All ${activeInfections.length} Conditions Into Separate Bays`
                : 'Establish Dedicated Quarantine Buffer & Stop Shared Troughs'}
            </h4>
            <ul className="ide-step-list">
              <li>
                <CheckCircle2 size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>No Mixed Hospital Pens:</strong>{' '}
                  {isMultiInfection
                    ? `Never house ${activeInfections.map((i) => i.shortName).join(' and ')} pigs in the same pen—keep each condition separated by solid CHB/bamboo partitions.`
                    : `Isolate the affected pig at least 10 meters downwind from healthy growers and sows.`}
                </span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Drainage &amp; Slurry Check:</strong> Block pen wash-water from flowing through adjacent pen gutters.
                </span>
              </li>
            </ul>
          </div>

          <div className="ide-step-card">
            <span className="ide-step-time" style={{ color: '#06b6d4' }}>
              STEP 3 • FIRST 1–4 HOURS (TARGETED SANITATION &amp; VECTOR CONTROL)
            </span>
            <h4 className="ide-step-title">
              Deploy Pathogen-Specific Footbaths &amp; Disinfect Equipment
            </h4>
            <ul className="ide-step-list">
              <li>
                <CheckCircle2 size={14} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Primary Disinfectant:</strong> Prepare{' '}
                  <strong>{topPriority.disinfectant}</strong> at the entryway of the affected pen.
                </span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Bedding &amp; Vectors:</strong> Remove damp rice hull (ipa) bedding, apply slaked lime (apog) to wet walkways, and screen pens against flies, rodents, and stray dogs.
                </span>
              </li>
            </ul>
          </div>

          <div className="ide-step-card">
            <span className="ide-step-time" style={{ color: '#10b981' }}>
              STEP 4 • FIRST 4–24 HOURS (VETERINARY CARE &amp; MAO LUNA REPORT)
            </span>
            <h4 className="ide-step-title">
              Execute Veterinary Protocol &amp; Local Authority Notification
            </h4>
            <ul className="ide-step-list">
              <li>
                <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Clinical Action:</strong> {topPriority.vetProtocol}
                </span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Luna, La Union Statutory Hotline:</strong> Contact{' '}
                  <strong>MAO Luna (0917-842-5510)</strong> or{' '}
                  <strong>OPVet La Union ((072) 242-5550)</strong> for on-site veterinary inspection.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <div className="ide-footer-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>
            <strong>Pigify Clinical Decision Engine:</strong> Always consult a licensed veterinarian or MAO Luna officer before administering prescription injectables.
          </span>
        </div>

        <a
          href="tel:09178425510"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#38bdf8',
            textDecoration: 'none',
          }}
        >
          <PhoneCall size={14} />
          <span>MAO Luna Hotline: 0917-842-5510</span>
        </a>
      </div>
    </div>
  )
}

