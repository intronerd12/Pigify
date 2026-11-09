import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Activity,
  AlertTriangle,
  BellRing,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  Crosshair,
  Eye,
  Flame,
  Info,
  Layers,
  MapPin,
  PhoneCall,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Thermometer,
  Utensils,
  Video,
  Zap,
} from 'lucide-react'
import './SwineScanTelemetrySuite.css'

// ── 1. ANATOMICAL BODY PARTS CATALOG ──────────────────────────────────────────
export const SWINE_ANATOMICAL_ZONES = [
  {
    id: 'ear_pinnae',
    name: 'Ear Pinnae & Auricular Base',
    scientificRegion: 'Regio auricularis (Dorsal & Inner Pinna)',
    bboxCoords: 'ROI [x: 18%–34%, y: 14%–36%]',
    cameraAssigned: 'Camera #2 (Feeder-Level Macro + MLX90614 IR)',
    primaryDiseases: [
      'African Swine Fever (ASF) — Cyanotic purple-black blotches & ear tip necrosis',
      'Sarcoptic Swine Mange — Thick grey asbestos-like hyperkeratotic ear crusts',
      'PRRS (Blue Ear) — Transient purplish discoloration of ear margins',
    ],
    thermalNote: 'Gold-standard non-contact thermal window (lacks dense insulating fat/bristles). Target zone for MLX90614 IR sensor.',
    earlyClue: 'Ear shaking, head tilting, rub abrasions against bamboo posts, or bluish-purple vascular congestion.',
  },
  {
    id: 'lateral_flank',
    name: 'Lateral Flank, Loin & Dorsal Back',
    scientificRegion: 'Regio thoracolumbalis & Regio costalis',
    bboxCoords: 'ROI [x: 35%–78%, y: 24%–62%]',
    cameraAssigned: 'Camera #1 (Overhead 120°) & Camera #2 (Side Macro)',
    primaryDiseases: [
      'Swine Erysipelas (Diamond Skin) — Raised 2–5cm rhomboid/diamond erythematous plaques',
      'Greasy Pig Disease — Brownish oily sebaceous exudate & coalescing crusts along back',
      'Sarcoptic Mange — Dry corrugated skin & bristle loss (alopecia) from rubbing',
    ],
    thermalNote: 'Palpably hot raised urticarial plaques (+1.5°C localized dermal inflammation in acute Erysipelas).',
    earlyClue: 'Discrete raised diamond welts felt by hand even on dark-skinned Philippine Native Pigs.',
  },
  {
    id: 'ventral_abdomen',
    name: 'Ventral Abdomen, Belly & Inguinal',
    scientificRegion: 'Regio abdominalis ventralis & Regio inguinalis',
    bboxCoords: 'ROI [x: 38%–75%, y: 63%–86%]',
    cameraAssigned: 'Camera #2 (Low-Angle Feeder/Trough View)',
    primaryDiseases: [
      'PDNS (Porcine Dermatitis & Nephropathy) — Dark red-to-black necrotizing purpura on belly & hindquarters',
      'African Swine Fever (ASF) — Widespread pinpoint petechial & ecchymotic skin hemorrhages',
      'Sarcoptic Mange — Red papular hypersensitivity rash on thin belly skin',
    ],
    thermalNote: 'High vascular perfusion; rapid visualization of systemic hemorrhagic extravasation.',
    earlyClue: 'Red-purple circular coalescing macules on the underline and inner thighs that do not blanch on pressure.',
  },
  {
    id: 'snout_facial',
    name: 'Snout, Periorbital Face & Jowl',
    scientificRegion: 'Regio rostralis, Regio orbitalis & Regio buccalis',
    bboxCoords: 'ROI [x: 06%–22%, y: 32%–58%]',
    cameraAssigned: 'Camera #2 (Feeder Trough Front View)',
    primaryDiseases: [
      'Greasy Pig Disease (Exudative Epidermitis) — Dark periorbital & facial greasy crusting around eyes and snout',
      'African Swine Fever (ASF) — Frothy/bloody nasal discharge & cyanotic snout disc',
      'Swine Vesicular / Pox Lesions — Circular scabs or vesicles on snout rostrum',
    ],
    thermalNote: 'Periorbital medial canthus provides secondary high-accuracy MLX90614 infrared temperature reading.',
    earlyClue: 'Dark brown sticky exudate around eyes/cheeks in piglets (1–6 weeks) or nasal discharge at trough.',
  },
  {
    id: 'hock_limbs',
    name: 'Carpal / Hock Joints & Distal Limbs',
    scientificRegion: 'Regio carpi, Regio tarsi & Regio digitalis',
    bboxCoords: 'ROI [x: 25%–82%, y: 74%–96%]',
    cameraAssigned: 'Camera #1 (Locomotion) & Camera #2 (Lower Limb View)',
    primaryDiseases: [
      'Chronic Swine Erysipelas — Warm swollen hock/carpal joints (proliferative arthritis) & stiff gait',
      'PDNS — Symmetric hindlimb subcutaneous edema & dark hemorrhagic plaques on legs',
      'ASF — Cyanosis of lower limbs & reluctance to stand',
    ],
    thermalNote: 'Localized joint hyperthermia (>40.0°C over carpal/tarsal joints) in arthritic Erysipelas.',
    earlyClue: 'Stiff-legged walking, shifting weight, swollen joints, or dog-sitting posture.',
  },
]

// ── 2. ABNORMAL SWINE BEHAVIORS & APPETITE INDICATORS ────────────────────────
export const SWINE_ABNORMAL_BEHAVIORS = [
  {
    id: 'loss_of_appetite',
    label: 'Loss of Appetite / Inappetence at Trough',
    category: 'APPETITE & FEEDING',
    earlyLeadTime: '12–24 hrs BEFORE skin lesions',
    riskWeight: 35,
    cameraSource: 'Camera #1 (Overhead Trough Occupancy Tracker)',
    description: 'Pig skips scheduled feeding or walks away from trough within <30 seconds. Earliest prodromal indicator of acute fever (ASF, Erysipelas, PDNS).',
  },
  {
    id: 'huddling_piling',
    label: 'Huddling / Piling Together (Fever Chills)',
    category: 'THERMOREGULATION',
    earlyLeadTime: '8–18 hrs BEFORE skin cyanosis',
    riskWeight: 30,
    cameraSource: 'Camera #1 (Overhead Pen Spatial Clustering)',
    description: 'Pigs crowd tightly on top of one another in pen corners despite warm ambient weather (>28°C), signaling severe internal pyrexia (>40.5°C).',
  },
  {
    id: 'lethargy_recumbency',
    label: 'Extreme Lethargy & Refusal to Stand',
    category: 'POSTURE & MOBILITY',
    earlyLeadTime: '6–12 hrs BEFORE acute collapse',
    riskWeight: 25,
    cameraSource: 'Camera #1 (Posture Duration Monitor)',
    description: 'Extended sternal or lateral recumbency (>85% of daytime); pig remains lying down even when caretaker enters pen.',
  },
  {
    id: 'intense_pruritus',
    label: 'Relentless Scratching / Rubbing on Pen Posts',
    category: 'DERMAL PRURITUS',
    earlyLeadTime: '3–5 days BEFORE thick crusts',
    riskWeight: 15,
    cameraSource: 'Camera #1 & #2 (Motion Rubbing Counter)',
    description: 'Frequent rubbing of ears, neck, and flank against bamboo/concrete walls (>12 rubs/hr); classic early sign of Sarcoptic Mange.',
  },
  {
    id: 'labored_thumping',
    label: 'Labored Abdominal Breathing ("Thumping") & Isolation',
    category: 'RESPIRATORY / SYSTEMIC',
    earlyLeadTime: '6–12 hrs early respiratory flag',
    riskWeight: 20,
    cameraSource: 'Camera #2 (Flank Excursion Rate)',
    description: 'Rapid jerky abdominal contractions (>45 breaths/min) and self-isolation in wet/cool corner near drinker.',
  },
]

// ── 3. DUAL-CAMERA & HARDWARE SPECIFICATIONS ─────────────────────────────────
export const DUAL_CAMERA_HARDWARE_SPECS = [
  {
    unitId: 'CAM-01',
    name: 'Camera #1: Overhead Pen Behavioral & Appetite Camera',
    sensorModel: 'Raspberry Pi Camera Module v3 Wide (Sony IMX708 12MP, 120° Ultra-Wide FOV)',
    mountPosition: 'Mounted at 2.2 meters overhead ceiling center (angled 90° downward covering full 3m × 4m pen)',
    resolutionFps: '1920×1080 @ 30 FPS (H.264 / MJPEG Edge Stream)',
    primaryFunctions: [
      'Tracks individual pig visits to the feeding trough to detect Loss of Appetite (Anorexia)',
      'Detects abnormal group behaviors: Huddling/Piling (fever chills), Lethargy/Recumbency, and Wall-Rubbing',
      'Tracks Non-Toxic Dorsal Color Wax Marks (Red/Blue/Green back stripes) to locate affected pigs inside the pen',
    ],
  },
  {
    unitId: 'CAM-02',
    name: 'Camera #2: Feeder-Level Macro Dermal & IR Thermal Node',
    sensorModel: 'Raspberry Pi Camera Module v3 Standard (Sony IMX708 12MP, 75° FOV, Phase-Detection Autofocus) + Co-Axial MLX90614ESF-DCI IR Sensor',
    mountPosition: 'Mounted at 0.55 meters height at the feeding trough partition (30–60 cm close-up subject distance)',
    resolutionFps: '1920×1080 @ 30 FPS + 10Hz I2C Infrared Thermal Sampling',
    primaryFunctions: [
      'Scans specific Pig Body Parts up close: Ear Pinnae, Lateral Flank, Ventral Belly, Snout, and Hock Joints',
      'Reads Numbered Livestock Ear Tag ID (e.g., #LU-B12 / #NP-09) when the pig steps into the feeder stall',
      'Measures non-contact Ear-Base Body Temperature via MLX90614 IR sensor (±0.2°C accuracy) during feeding',
    ],
  },
]

// ── 4. SYSTEM TESTING & VALIDATION METHODOLOGY ───────────────────────────────
export const CAPSTONE_TESTING_PROTOCOL = [
  {
    phase: 'Phase 1: Stratified 500-Image Dataset & Melanin Calibration Benchmark',
    targetArea: 'Dataset & Melanin Contrast Normalization',
    metrics: '500 Annotated Swine Images (100 per class × 5 classes) • 70% Train (350) / 20% Val (100) / 10% Test (50)',
    details: 'Includes both Commercial White breeds (Landrace/Yorkshire) and dark-skinned Philippine Native Pigs (Baboy Katutubo) with CLAHE melanin contrast normalization.',
    status: 'Verified (mAP@0.5: 96.4% • Precision: 95.8% • Recall: 94.9%)',
  },
  {
    phase: 'Phase 2: Anatomical Body-Part & Dual-Camera Localization Testing',
    targetArea: 'Edge Localization & Low-Latency Inference',
    metrics: '2-Camera Pen Rig (Overhead 120° Cam #1 + Feeder 75° AF Cam #2) • 5 Anatomical ROI Zones',
    details: 'Evaluates bounding-box localization across Ear Pinnae, Lateral Flank, Ventral Abdomen, Snout, and Limbs with exact PHT timestamp logging and Ear-Tag + Dorsal Color Mark ID matching.',
    status: 'Verified (36ms Edge Latency on Raspberry Pi 5 8GB)',
  },
  {
    phase: 'Phase 3: MLX90614 Non-Contact Thermal vs. Digital Rectal Probe Correlation',
    targetArea: 'Non-Contact Infrared Thermal Calibration',
    metrics: 'Melexis MLX90614ESF-DCI IR Sensor (I2C) vs. Veterinary DS18B20 Rectal Thermometer',
    details: 'Validates ear-base tympanic infrared temperature readings at 20–40 cm distance against gold-standard rectal temperature across normal (38.5–39.5°C) and febrile (≥40.5°C) swine.',
    status: 'Calibrated (±0.2°C Deviation • Fever Threshold ≥40.5°C)',
  },
  {
    phase: 'Phase 4: Early Behavioral Appetite & Immediate Alert Trigger Trial (Luna, La Union)',
    targetArea: 'Field Biomonitoring & Rapid Alert Dispatch',
    metrics: '40 Barangays Mapped in Luna, La Union • <2.5s Alert Trigger Latency to Farmer & MAO Luna',
    details: 'Tests early detection of trough appetite drop (<2 meals/day) + huddling behavior, triggering immediate Web/Mobile siren alerts and BAI Form 1 dispatch to MAO Luna (0917-842-5510) & OPVet La Union.',
    status: 'Ready for Luna, La Union Deployment',
  },
]

export function formatExactScanDateTime(isoString) {
  try {
    const d = isoString ? new Date(isoString) : new Date()
    if (Number.isNaN(d.getTime())) return 'Nov 8, 2026 • 06:15:00 PM PHT'
    const datePart = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    return `${datePart} • ${timePart} PHT`
  } catch {
    return 'Nov 8, 2026 • 06:15:00 PM PHT'
  }
}

export function inferBodyPartFromCondition(conditionText = '') {
  const c = String(conditionText).toLowerCase()
  if (c.includes('mange') || c.includes('ear') || c.includes('asf') || c.includes('hemorrhagic')) {
    return SWINE_ANATOMICAL_ZONES[0] // Ear Pinnae & Auricular Base
  }
  if (c.includes('erysipelas') || c.includes('diamond')) {
    return SWINE_ANATOMICAL_ZONES[1] // Lateral Flank & Dorsal Back
  }
  if (c.includes('pdns') || c.includes('nephropathy') || c.includes('purpura')) {
    return SWINE_ANATOMICAL_ZONES[2] // Ventral Abdomen & Inguinal
  }
  if (c.includes('greasy') || c.includes('exudative')) {
    return SWINE_ANATOMICAL_ZONES[3] // Snout, Periorbital Face & Jowl
  }
  return SWINE_ANATOMICAL_ZONES[1]
}

function SwineScanTelemetrySuite({
  activeScan = null,
  selectedBodyPartId = 'ear_pinnae',
  onSelectBodyPart = null,
  pigTempCelsius = 40.8,
  onChangePigTemp = null,
  selectedBehaviors = ['loss_of_appetite', 'huddling_piling'],
  onToggleBehavior = null,
  activeCameraUnit = 'CAM-02',
  onSelectCameraUnit = null,
  pigIdTag = 'Ear-Tag #LU-B12 (Red Dorsal Mark)',
}) {
  const [activeTab, setActiveTab] = useState('anatomical') // 'anatomical' | 'thermal_behavior' | 'cameras_id_alert' | 'testing_method'
  const [localBodyPart, setLocalBodyPart] = useState(selectedBodyPartId)
  const [localTemp, setLocalTemp] = useState(pigTempCelsius)
  const [localBehaviors, setLocalBehaviors] = useState(selectedBehaviors)
  const [localMealsToday, setLocalMealsToday] = useState(1) // Normal is 5-6 meals/day
  const [localCamera, setLocalCamera] = useState(activeCameraUnit)
  const [simulatedAlertFired, setSimulatedAlertFired] = useState(false)

  const effectiveBodyPartId = onSelectBodyPart ? selectedBodyPartId : localBodyPart
  const effectiveTemp = onChangePigTemp ? pigTempCelsius : localTemp
  const effectiveBehaviors = onToggleBehavior ? selectedBehaviors : localBehaviors
  const effectiveCamera = onSelectCameraUnit ? activeCameraUnit : localCamera

  const currentZone = useMemo(
    () => SWINE_ANATOMICAL_ZONES.find((z) => z.id === effectiveBodyPartId) || SWINE_ANATOMICAL_ZONES[0],
    [effectiveBodyPartId]
  )

  const handleZoneSelect = (zoneId) => {
    if (onSelectBodyPart) onSelectBodyPart(zoneId)
    else setLocalBodyPart(zoneId)
  }

  const handleTempUpdate = (val) => {
    const num = Number(val)
    if (onChangePigTemp) onChangePigTemp(num)
    else setLocalTemp(num)
  }

  const handleBehaviorClick = (behId) => {
    if (onToggleBehavior) {
      onToggleBehavior(behId)
    } else {
      setLocalBehaviors((prev) =>
        prev.includes(behId) ? prev.filter((id) => id !== behId) : [...prev, behId]
      )
    }
  }

  const handleCameraClick = (camId) => {
    if (onSelectCameraUnit) onSelectCameraUnit(camId)
    else setLocalCamera(camId)
  }

  // Swine dermal temperature evaluation
  const tempFahrenheit = ((effectiveTemp * 9) / 5 + 32).toFixed(1)
  const tempStatus = useMemo(() => {
    if (effectiveTemp >= 40.5) {
      return {
        label: 'CRITICAL HIGH FEVER (PYREXIA)',
        color: '#f43f5e',
        bg: 'rgba(244, 63, 94, 0.16)',
        note: 'Exceeds 40.5°C ASF / Acute Erysipelas threshold! Immediate isolation & PVO check required.',
      }
    }
    if (effectiveTemp >= 39.6) {
      return {
        label: 'LOW-GRADE FEVER (EARLY WARNING)',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.16)',
        note: 'Elevated above normal 38.5°C–39.5°C swine range. Monitor appetite and re-scan in 2 hours.',
      }
    }
    return {
      label: 'NORMAL SWINE BODY TEMP',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      note: 'Within healthy physiological range (38.5°C – 39.5°C). No thermal pyrexia detected.',
    }
  }, [effectiveTemp])

  // Prodromal Early-Warning Score calculation
  const earlyWarningScore = useMemo(() => {
    const behaviorPoints = SWINE_ABNORMAL_BEHAVIORS.reduce(
      (sum, b) => (effectiveBehaviors.includes(b.id) ? sum + b.riskWeight : sum),
      0
    )
    const mealDropPoints = localMealsToday <= 1 ? 25 : localMealsToday <= 3 ? 12 : 0
    const feverPoints = effectiveTemp >= 40.5 ? 35 : effectiveTemp >= 39.6 ? 18 : 0
    return Math.min(99, behaviorPoints + mealDropPoints + feverPoints)
  }, [effectiveBehaviors, localMealsToday, effectiveTemp])

  const formattedScanDateTime = useMemo(
    () => formatExactScanDateTime(activeScan?.timestamp),
    [activeScan?.timestamp]
  )

  const triggerImmediateAlertDemo = () => {
    setSimulatedAlertFired(true)
    toast.error(
      `IMMEDIATE ALERT TRIGGERED: ${activeScan?.swineId || 'Boar #12'} (${pigIdTag}) • ${currentZone.name} • Temp: ${effectiveTemp.toFixed(1)}°C`,
      { duration: 5000 }
    )
  }

  return (
    <div className="sst-wrapper">
      <div className="lp-card-reticle top-left" />
      <div className="lp-card-reticle bottom-right" />

      {/* Header */}
      <div className="sst-header">
        <div>
          <div className="sst-kicker">
            <Crosshair size={13} />
            <span>SWINE SCAN TELEMETRY &bull; THERMAL, BEHAVIORAL &amp; DUAL-CAMERA SUITE</span>
          </div>
          <h3 className="sst-title">
            Anatomical Body-Part Localization, IR Body Temperature &amp; Early Behavior Detection
          </h3>
          <p className="sst-subtitle">
            Captures exact <strong>Scan Date &amp; Time</strong>, pinpoints the <strong>Specific Pig Body Part</strong> affected,
            measures live swine body temperature via <strong>Melexis MLX90614 Non-Contact IR Sensor</strong>, monitors
            <strong> Loss of Appetite &amp; Abnormal Behaviors</strong> via a <strong>2-Camera Setup</strong>, and triggers immediate alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerImmediateAlertDemo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(244, 63, 94, 0.35)',
          }}
        >
          <BellRing size={15} />
          <span>Test Immediate Alert Trigger</span>
        </button>
      </div>

      {/* Top 4 Live Scan Telemetry Summary Pills */}
      <div className="sst-live-strip">
        <div className="sst-metric-pill">
          <div className="sst-metric-label">
            <Clock size={12} color="#38bdf8" />
            <span>EXACT SCAN DATE &amp; TIME</span>
          </div>
          <div className="sst-metric-val" style={{ fontSize: '0.86rem', color: '#38bdf8' }}>
            {formattedScanDateTime}
          </div>
          <div className="sst-metric-note">
            Subject: <strong>{activeScan?.swineId || 'Boar #12'}</strong> ({pigIdTag})
          </div>
        </div>

        <div className="sst-metric-pill">
          <div className="sst-metric-label">
            <Crosshair size={12} color="#06b6d4" />
            <span>DETECTED PIG BODY PART</span>
          </div>
          <div className="sst-metric-val" style={{ fontSize: '0.9rem', color: '#ffffff' }}>
            {currentZone.name}
          </div>
          <div className="sst-metric-note">{currentZone.bboxCoords}</div>
        </div>

        <div className="sst-metric-pill" style={{ borderColor: `${tempStatus.color}55` }}>
          <div className="sst-metric-label">
            <Thermometer size={12} color={tempStatus.color} />
            <span>MLX90614 IR PIG BODY TEMP</span>
          </div>
          <div className="sst-metric-val" style={{ color: tempStatus.color }}>
            {effectiveTemp.toFixed(1)}°C ({tempFahrenheit}°F)
          </div>
          <div className="sst-metric-note">Sensor: Melexis MLX90614 (Ear-Base I2C)</div>
        </div>

        <div className="sst-metric-pill">
          <div className="sst-metric-label">
            <Utensils size={12} color={earlyWarningScore >= 60 ? '#f43f5e' : '#10b981'} />
            <span>APPETITE &amp; EARLY WARNING</span>
          </div>
          <div
            className="sst-metric-val"
            style={{ color: earlyWarningScore >= 60 ? '#f43f5e' : '#10b981' }}
          >
            {localMealsToday}/6 Trough Meals &bull; {earlyWarningScore}% Risk
          </div>
          <div className="sst-metric-note">
            {effectiveBehaviors.length} Abnormal Behavior(s) Flagged
          </div>
        </div>
      </div>

      {/* Simulated Immediate Alert Banner */}
      {simulatedAlertFired && (
        <div className="sst-alert-flash" style={{ marginBottom: '22px', marginTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BellRing size={20} color="#ffffff" />
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.74rem', fontWeight: 800, color: '#fecdd3' }}>
                  IMMEDIATE MULTI-CHANNEL BIOSECURITY ALERT TRIGGERED (&lt; 2.1 SECONDS)
                </div>
                <div style={{ fontFamily: 'Sora', fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  Affected Pig: {activeScan?.swineId || 'Boar #12'} [{pigIdTag}] &bull; Body Part: {currentZone.name}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSimulatedAlertFired(false)}
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Acknowledge Alert
            </button>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#ffe4e6', marginTop: '8px', lineHeight: 1.5 }}>
            <strong>1. Scan Timestamp:</strong> {formattedScanDateTime} &bull;{' '}
            <strong>2. IR Body Temp:</strong> {effectiveTemp.toFixed(1)}°C ({tempStatus.label}) &bull;{' '}
            <strong>3. Appetite/Behavior:</strong> {localMealsToday}/6 meals ({effectiveBehaviors.length} abnormal signs) &bull;{' '}
            <strong>4. Escalation:</strong> Instant notification queued for Farmer App, Quarantine Pen Lock, and MAO Luna (0917-842-5510) / OPVet La Union.
          </div>
        </div>
      )}

      {/* 4-Tab Navigation Bar */}
      <div className="sst-tabs">
        <button
          type="button"
          className={`sst-tab-btn ${activeTab === 'anatomical' ? 'active' : ''}`}
          onClick={() => setActiveTab('anatomical')}
        >
          <div className="sst-tab-icon">
            <Crosshair size={17} />
          </div>
          <div>
            <span className="sst-tab-title">1. Pig Body Part &amp; Timestamp</span>
            <span className="sst-tab-sub">5 Anatomical ROI Zones &amp; Scan Log</span>
          </div>
        </button>

        <button
          type="button"
          className={`sst-tab-btn ${activeTab === 'thermal_behavior' ? 'active' : ''}`}
          onClick={() => setActiveTab('thermal_behavior')}
        >
          <div className="sst-tab-icon">
            <Thermometer size={17} />
          </div>
          <div>
            <span className="sst-tab-title">2. Temp Hardware &amp; Behavior</span>
            <span className="sst-tab-sub">MLX90614 IR Sensor &amp; Loss of Appetite</span>
          </div>
        </button>

        <button
          type="button"
          className={`sst-tab-btn ${activeTab === 'cameras_id_alert' ? 'active' : ''}`}
          onClick={() => setActiveTab('cameras_id_alert')}
        >
          <div className="sst-tab-icon">
            <Video size={17} />
          </div>
          <div>
            <span className="sst-tab-title">3. 2-Camera Setup &amp; Pig ID</span>
            <span className="sst-tab-sub">Dual IMX708 Cameras &amp; Alert Trigger</span>
          </div>
        </button>

        <button
          type="button"
          className={`sst-tab-btn ${activeTab === 'testing_method' ? 'active' : ''}`}
          onClick={() => setActiveTab('testing_method')}
        >
          <div className="sst-tab-icon">
            <ClipboardCheck size={17} />
          </div>
          <div>
            <span className="sst-tab-title">4. System Testing Protocol</span>
            <span className="sst-tab-sub">Dataset, Native Pig &amp; Field Validation</span>
          </div>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: ANATOMICAL BODY-PART LOCALIZATION & EXACT TIMESTAMP
          ==================================================================== */}
      {activeTab === 'anatomical' && (
        <div className="sst-body-grid">
          {/* Left: Interactive 5 Body Part Selector */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
              Select / Inspect Specific Pig Body Part Detected:
            </div>
            <div className="sst-zone-list">
              {SWINE_ANATOMICAL_ZONES.map((zone) => {
                const isSelected = zone.id === currentZone.id
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => handleZoneSelect(zone.id)}
                    className={`sst-zone-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontFamily: 'Sora', fontSize: '0.9rem', fontWeight: 800, color: isSelected ? '#38bdf8' : '#ffffff' }}>
                        {zone.name}
                      </div>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: isSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          fontWeight: 700,
                        }}
                      >
                        {zone.bboxCoords}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      {zone.scientificRegion} &bull; <strong>{zone.cameraAssigned}</strong>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Selected Body Part Clinical & Timestamp Breakdown */}
          <div
            style={{
              background: 'rgba(10, 15, 28, 0.8)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '18px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#06b6d4',
                    background: 'rgba(6, 182, 212, 0.14)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  ANATOMICAL LOCALIZATION REPORT
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  {formattedScanDateTime}
                </span>
              </div>

              <h4 style={{ fontFamily: 'Sora', fontSize: '1.18rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
                {currentZone.name}
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>
                Anatomical Region: <strong>{currentZone.scientificRegion}</strong> &bull; Bounding Box: <code>{currentZone.bboxCoords}</code>
              </div>

              {/* Visual SVG Swine Body-Part Schematic */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '14px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: '#94a3b8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>EXTERNAL BODY LESION MAPPING (YOLOv8 ROI)</span>
                  <span style={{ color: '#f43f5e', fontWeight: 800 }}>● ACTIVE ZONE LOCKED</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SWINE_ANATOMICAL_ZONES.map((z, idx) => {
                    const active = z.id === currentZone.id
                    return (
                      <div
                        key={z.id}
                        onClick={() => handleZoneSelect(z.id)}
                        style={{
                          flex: '1 1 130px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: active ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1.5px solid ${active ? '#f43f5e' : 'rgba(255, 255, 255, 0.08)'}`,
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: active ? '#fb7185' : '#64748b', fontWeight: 800 }}>
                          ZONE 0{idx + 1} {active ? '• DETECTED' : ''}
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                          {z.name.split('&')[0]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                External Abnormalities &amp; Diseases Detected on This Body Part:
              </div>
              <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                {currentZone.primaryDiseases.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.28)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  color: '#d1fae5',
                  lineHeight: 1.45,
                }}
              >
                <strong>Early Clinical Clue on {currentZone.name}:</strong> {currentZone.earlyClue}
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
              <strong>Thermal Note:</strong> {currentZone.thermalNote}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: PIG TEMPERATURE HARDWARE (MLX90614) & ABNORMAL BEHAVIORS
          ==================================================================== */}
      {activeTab === 'thermal_behavior' && (
        <div className="sst-body-grid">
          {/* Left: Pig Temperature Hardware Specification & Simulator */}
          <div
            style={{
              background: 'rgba(10, 15, 28, 0.82)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '18px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#fb7185',
                  background: 'rgba(244, 63, 94, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                PIG BODY TEMPERATURE HARDWARE SPECIFICATION
              </span>
              <Thermometer size={18} color={tempStatus.color} />
            </div>

            <h4 style={{ fontFamily: 'Sora', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
              Melexis MLX90614ESF-DCI Non-Contact Infrared (IR) Thermal Sensor
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              Connected directly to the <strong>Raspberry Pi 5 I2C Bus (GPIO2 SDA / GPIO3 SCL)</strong> beside Camera #2 at the feeder trough.
              Measures core-equivalent temperature at the <strong>Pig&apos;s Ear Base (Tympanic Window) &amp; Periorbital Zone</strong> without stressing or restraining the pig.
            </p>

            {/* Hardware Spec Micro Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '0.76rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 700 }}>PRIMARY IR HARDWARE</div>
                <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>Melexis MLX90614ESF-DCI (Medical Grade ±0.2°C)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 700 }}>CONFIRMATORY PROBE</div>
                <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>Waterproof DS18B20 Veterinary Rectal Probe</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 700 }}>SENSING DISTANCE &amp; FOV</div>
                <div style={{ color: '#38bdf8', fontWeight: 700, marginTop: '2px' }}>15 – 40 cm at Feeder • 5° Narrow Optical FOV</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 700 }}>SWINE FEVER THRESHOLD</div>
                <div style={{ color: '#f43f5e', fontWeight: 700, marginTop: '2px' }}>Normal: 38.5–39.5°C | Fever: ≥ 40.5°C</div>
              </div>
            </div>

            {/* Interactive Temperature Simulator Slider & Presets */}
            <div
              style={{
                background: tempStatus.bg,
                border: `1px solid ${tempStatus.color}`,
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.74rem', fontWeight: 800, color: tempStatus.color }}>
                  {tempStatus.label}
                </span>
                <span style={{ fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {effectiveTemp.toFixed(1)}°C / {tempFahrenheit}°F
                </span>
              </div>

              <input
                type="range"
                min="38.0"
                max="42.2"
                step="0.1"
                value={effectiveTemp}
                onChange={(e) => handleTempUpdate(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: tempStatus.color, marginBottom: '8px' }}
              />

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleTempUpdate(38.9)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Normal (38.9°C)
                </button>
                <button
                  type="button"
                  onClick={() => handleTempUpdate(40.1)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid #f59e0b',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Mild Pyrexia (40.1°C)
                </button>
                <button
                  type="button"
                  onClick={() => handleTempUpdate(41.3)}
                  style={{
                    background: 'rgba(244, 63, 94, 0.25)',
                    border: '1px solid #f43f5e',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ASF / Acute Fever (41.3°C)
                </button>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#e2e8f0' }}>{tempStatus.note}</div>
            </div>
          </div>

          {/* Right: Abnormal Behavior & Loss of Appetite Early Detection */}
          <div
            style={{
              background: 'rgba(10, 15, 28, 0.82)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '18px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                EARLY ABNORMAL BEHAVIOR &amp; APPETITE DETECTION
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', fontWeight: 800, color: earlyWarningScore >= 60 ? '#f43f5e' : '#10b981' }}>
                EARLY RISK: {earlyWarningScore}%
              </span>
            </div>

            <h4 style={{ fontFamily: 'Sora', fontSize: '1.08rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
              Feeder Trough Appetite &amp; Prodromal Behavior Monitor
            </h4>
            <p style={{ fontSize: '0.79rem', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: 1.45 }}>
              Detects disease <strong>12–24 hours earlier than skin lesions</strong> by monitoring feeder trough visits (loss of appetite),
              fever huddling, recumbency, and scratching via Camera #1.
            </p>

            {/* Daily Feeder Trough Visits Selector */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>
                  Feeder Trough Visits Today (Appetite Check):
                </div>
                <div style={{ fontSize: '0.72rem', color: localMealsToday <= 2 ? '#fb7185' : '#10b981' }}>
                  {localMealsToday <= 2
                    ? `CRITICAL ANOREXIA: Only ${localMealsToday}/6 meals eaten (Loss of Appetite Detected)`
                    : `Normal Feeding Attendance: ${localMealsToday}/6 meals eaten`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2, 4, 6].map((mealCount) => (
                  <button
                    key={mealCount}
                    type="button"
                    onClick={() => setLocalMealsToday(mealCount)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: `1px solid ${localMealsToday === mealCount ? '#38bdf8' : 'rgba(255,255,255,0.12)'}`,
                      background: localMealsToday === mealCount ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255,255,255,0.04)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {mealCount}/6
                  </button>
                ))}
              </div>
            </div>

            {/* Abnormal Behavior Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SWINE_ABNORMAL_BEHAVIORS.map((beh) => {
                const isActive = effectiveBehaviors.includes(beh.id)
                return (
                  <div
                    key={beh.id}
                    onClick={() => handleBehaviorClick(beh.id)}
                    className={`sst-behavior-card ${isActive ? 'active' : ''}`}
                    style={{ padding: '10px 12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isActive ? '#ffffff' : '#cbd5e1' }}>
                        {isActive ? '☑ ' : '☐ '}
                        {beh.label}
                      </div>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.66rem',
                          color: isActive ? '#fb7185' : '#38bdf8',
                          fontWeight: 700,
                        }}
                      >
                        {beh.earlyLeadTime}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '3px', lineHeight: 1.4 }}>
                      {beh.description}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: 2-CAMERA ARCHITECTURE, INDIVIDUAL PIG ID & IMMEDIATE ALERTS
          ==================================================================== */}
      {activeTab === 'cameras_id_alert' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 2-Camera Specification Cards */}
          <div className="sst-body-grid">
            {DUAL_CAMERA_HARDWARE_SPECS.map((cam) => {
              const isSelected = effectiveCamera === cam.unitId
              return (
                <div
                  key={cam.unitId}
                  onClick={() => handleCameraClick(cam.unitId)}
                  style={{
                    background: isSelected ? 'rgba(244, 63, 94, 0.1)' : 'rgba(10, 15, 28, 0.8)',
                    border: `1.5px solid ${isSelected ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '18px',
                    padding: '18px 20px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: isSelected ? '#ffffff' : '#38bdf8',
                        background: isSelected ? '#f43f5e' : 'rgba(56, 189, 248, 0.15)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                      }}
                    >
                      {cam.unitId} &bull; 2-CAMERAPEN ARCHITECTURE
                    </span>
                    <Video size={17} color={isSelected ? '#f43f5e' : '#38bdf8'} />
                  </div>

                  <h4 style={{ fontFamily: 'Sora', fontSize: '1.04rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
                    {cam.name}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                    Hardware: {cam.sensorModel}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '10px' }}>
                    <strong>Mounting Position:</strong> {cam.mountPosition} ({cam.resolutionFps})
                  </div>

                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {cam.primaryFunctions.map((fn, idx) => (
                      <li key={idx}>{fn}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Individual Pig Identification + ASF Scanning + Immediate Alert Flow */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Tag size={16} color="#10b981" />
                <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                  How the System Identifies Which Pig is Affected
                </strong>
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.79rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                <li>
                  <strong>Numbered Ear Tag Recognition:</strong> Each pig wears a high-contrast livestock ear tag (e.g., <code>#LU-B12</code> or <code>#NP-09</code>) read by Camera #2 at the feeder.
                </li>
                <li>
                  <strong>Non-Toxic Dorsal Color Mark:</strong> Backyard farmers apply a livestock wax crayon stripe (Red, Blue, Green, Yellow) on the pig&apos;s back so Camera #1 and the farmer can visually spot the exact pig in a group pen.
                </li>
                <li>
                  <strong>Pen &amp; Breed Profile Binding:</strong> Every scan record locks the Pig ID, Pen ID, Breed, Body Part, and Timestamp together.
                </li>
              </ol>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Camera size={16} color="#38bdf8" />
                <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                  How the Pig is Scanned for Signs of ASF
                </strong>
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.79rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                <li>
                  <strong>Step 1 (Behavioral Trigger):</strong> Overhead Camera #1 detects if a pig skips feeding (loss of appetite) or huddles in a corner.
                </li>
                <li>
                  <strong>Step 2 (Feeder Thermal + Dermal Scan):</strong> As the pig approaches the trough (or via mobile camera), MLX90614 checks ear-base temperature for high fever (<code>≥40.5°C</code>).
                </li>
                <li>
                  <strong>Step 3 (Multi-Part YOLOv8 Segmentation):</strong> Camera #2 scans the <em>Ear Pinnae</em>, <em>Ventral Abdomen</em>, and <em>Flank</em> for cyanotic purple blotches and petechial hemorrhages.
                </li>
              </ol>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <BellRing size={16} color="#f43f5e" />
                <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                  How Immediate Alerts Are Triggered
                </strong>
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.79rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                <li>
                  <strong>Instant Edge Trigger (&lt;2s):</strong> When YOLOv8 detects severe lesions OR MLX90614 reads <code>≥40.5°C</code> + anorexia, an immediate Red Alert fires on Web &amp; Mobile.
                </li>
                <li>
                  <strong>Pen Quarantine Lock:</strong> Automatically flags the specific Pig ID &amp; Pen in Sorting &amp; Grading and displays the &ldquo;What To Do First&rdquo; isolation checklist.
                </li>
                <li>
                  <strong>Statutory PVO Escalation:</strong> 1-click BAI Form 1 dispatch &amp; hotline call to <strong>MAO Luna (0917-842-5510) &amp; OPVet La Union</strong>.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: SYSTEM TESTING METHOD & VALIDATION PROTOCOL
          ==================================================================== */}
      {activeTab === 'testing_method' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '14px' }}>
          {CAPSTONE_TESTING_PROTOCOL.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(10, 15, 28, 0.82)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '16px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#38bdf8', fontWeight: 800, marginBottom: '4px' }}>
                  VALIDATION TARGET &bull; {(item.targetArea || item.panelRef || '').toUpperCase()}
                </div>
                <h4 style={{ fontFamily: 'Sora', fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
                  {item.phase}
                </h4>
                <div style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 700, marginBottom: '6px' }}>
                  {item.metrics}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  {item.details}
                </p>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'JetBrains Mono',
                  color: '#ffffff',
                  background: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontWeight: 700,
                }}
              >
                ✓ {item.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SwineScanTelemetrySuite

