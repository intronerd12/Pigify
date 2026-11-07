import React, { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  MapPin,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  RefreshCw,
  PhoneCall,
  Send,
  Layers,
  Info,
  Sparkles,
  Compass,
  Radio,
  Clock,
  UserCheck,
  Award,
  ExternalLink,
  CheckCircle2,
  Play,
  RotateCcw,
  Activity,
  Navigation,
  Zap,
  Eye,
} from 'lucide-react'
import UserHeader from '../components/user/UserHeader'
import InfectionDecisionEngine from '../components/user/InfectionDecisionEngine'
import { API_BASE_URL } from '../config/api'
import { BRAND_NAME } from '../config/brand'
import {
  PVO_DIRECTORY,
  ASF_GOVERNANCE_ROLES,
  SICK_PIG_ACTION_PROTOCOL,
} from '../utils/swineDiseaseData'
import './Landing.css'
import './MarketingPages.css'
import './DiseaseMap.css'

// Haversine formula to compute real distance in km between two GPS coordinates in Luna, La Union
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Primary Study & Capstone Testing Site: Municipality of Luna, La Union, Philippines (Region I)
const BASE_LUNA_FARMS = [
  {
    id: 'luna-farm-01',
    name: 'Barrientos Backyard Swine Site',
    owner: 'Ernesto Nisce',
    contact: '0917-555-0192',
    breedType: 'Philippine Native Pig (Baboy Katutubo)',
    pigCount: 22,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Barrientos',
    sector: 'Central Agricultural Sector',
    latitude: 16.8590,
    longitude: 120.3910,
    x: 315,
    y: 205,
    status: 'Infected Zone (Red)',
    severityColor: '#f43f5e',
    activeAlert: 'Active ASF Alert // Under 1km Cordon',
    suspectedCondition: 'African Swine Fever (ASF)',
    quarantineRadiusKm: 1.0,
    nearestPvo: 'MAO Luna (1.2 km) • OPVet La Union (28.5 km)',
    lastScanned: '18 mins ago',
    pvoNotified: true,
  },
  {
    id: 'luna-farm-02',
    name: 'Magallanes Poblacion Model Pen',
    owner: 'Rogelio Sibuma',
    contact: '0919-555-8821',
    breedType: 'Commercial White (Yorkshire)',
    pigCount: 38,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Magallanes (Poblacion)',
    sector: 'Town Center Corridor (Near Shrine & Municipal Hall)',
    latitude: 16.8530,
    longitude: 120.3802,
    x: 245,
    y: 245,
    status: 'Buffer Zone (Pink)',
    severityColor: '#ec4899',
    activeAlert: 'Buffer Surveillance Active (1-7 km)',
    suspectedCondition: 'Healthy Swine (Under Buffer Watch)',
    quarantineRadiusKm: 7.0,
    nearestPvo: 'MAO Luna (0.3 km) • OPVet La Union (27.8 km)',
    lastScanned: '1 hour ago',
    pvoNotified: true,
  },
  {
    id: 'luna-farm-03',
    name: 'Nalvo Norte Coastal Backyard Pen',
    owner: 'Marilou Ancheta',
    contact: '0920-555-3104',
    breedType: 'Philippine Native Pig (Ilocos Strain)',
    pigCount: 19,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Nalvo Norte',
    sector: 'Northern Coastal Sector (Bahay na Bato Zone)',
    latitude: 16.8685,
    longitude: 120.3775,
    x: 230,
    y: 135,
    status: 'Buffer Zone (Pink)',
    severityColor: '#ec4899',
    activeAlert: 'Buffer Surveillance Active (1-7 km)',
    suspectedCondition: 'Healthy Swine (Melanin Calibrated)',
    quarantineRadiusKm: 7.0,
    nearestPvo: 'MAO Luna (1.8 km) • OPVet La Union (29.4 km)',
    lastScanned: '2 hours ago',
    pvoNotified: true,
  },
  {
    id: 'luna-farm-04',
    name: 'Ayaoan Agro-Backyard Piggery',
    owner: 'Danilo Lomboy',
    contact: '0922-555-4311',
    breedType: 'Crossbreed (Duroc x Landrace)',
    pigCount: 30,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Ayaoan',
    sector: 'Southern Inland Rice-Swine Corridor',
    latitude: 16.8440,
    longitude: 120.3885,
    x: 295,
    y: 305,
    status: 'Buffer Zone (Pink)',
    severityColor: '#ec4899',
    activeAlert: 'Weekly MAO Luna Inspection (1-7 km)',
    suspectedCondition: 'Healthy Swine (Under Buffer Watch)',
    quarantineRadiusKm: 7.0,
    nearestPvo: 'MAO Luna (1.4 km) • OPVet La Union (26.5 km)',
    lastScanned: '3 hours ago',
    pvoNotified: true,
  },
  {
    id: 'luna-farm-05',
    name: 'Rimos Coastal Swine Coop',
    owner: 'Carlito Corpuz',
    contact: '0917-555-6429',
    breedType: 'Philippine Native Pig (Baboy Katutubo)',
    pigCount: 15,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Rimos No. 3',
    sector: 'Western Coastal Pebble Corridor',
    latitude: 16.8620,
    longitude: 120.3710,
    x: 185,
    y: 180,
    status: 'Buffer Zone (Pink)',
    severityColor: '#ec4899',
    activeAlert: 'Footbath Disinfection Active (1-7 km)',
    suspectedCondition: 'Healthy Swine (Coastline Bio-Curtain)',
    quarantineRadiusKm: 7.0,
    nearestPvo: 'MAO Luna (1.5 km) • OPVet La Union (28.7 km)',
    lastScanned: '4 hours ago',
    pvoNotified: false,
  },
  {
    id: 'luna-farm-06',
    name: 'Oaqui Highway Border Farm',
    owner: 'Ricardo Olba',
    contact: '0918-555-2200',
    breedType: 'Commercial White (Landrace)',
    pigCount: 48,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Oaqui No. 2',
    sector: 'Eastern Border Corridor (Luna–Balaoan Road)',
    latitude: 16.8485,
    longitude: 120.4020,
    x: 390,
    y: 265,
    status: 'Surveillance Zone (Yellow)',
    severityColor: '#f59e0b',
    activeAlert: 'Movement Restricted // Checkpoint Active',
    suspectedCondition: 'Healthy Swine (Border Transit Check)',
    quarantineRadiusKm: 10.0,
    nearestPvo: 'MAO Luna (2.6 km) • Balaoan Checkpoint (0.8 km)',
    lastScanned: '5 hours ago',
    pvoNotified: false,
  },
  {
    id: 'luna-farm-07',
    name: 'Darigayos Cove Backyard Herd',
    owner: 'Nestor Ostrea',
    contact: '0917-555-7764',
    breedType: 'Philippine Native Pig (Baboy Katutubo)',
    pigCount: 24,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Darigayos',
    sector: 'Southern Coastal Corridor',
    latitude: 16.8280,
    longitude: 120.3540,
    x: 145,
    y: 395,
    status: 'Surveillance Zone (Yellow)',
    severityColor: '#f59e0b',
    activeAlert: 'Blood PCR Surveillance Zone (7-10 km)',
    suspectedCondition: 'Healthy Swine (Routine Surveillance)',
    quarantineRadiusKm: 10.0,
    nearestPvo: 'MAO Luna (3.9 km) • OPVet La Union (24.2 km)',
    lastScanned: '6 hours ago',
    pvoNotified: false,
  },
  {
    id: 'luna-farm-08',
    name: 'Sto. Domingo Norte Breeder Site',
    owner: 'Arnaldo Directo',
    contact: '0920-555-9012',
    breedType: 'Crossbreed (Duroc x Large White)',
    pigCount: 35,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Sto. Domingo Norte',
    sector: 'Northern Border Sector (Near Bangar)',
    latitude: 16.8740,
    longitude: 120.3860,
    x: 285,
    y: 95,
    status: 'Buffer Zone (Pink)',
    severityColor: '#ec4899',
    activeAlert: 'Northern Border Buffer Watch (1-7 km)',
    suspectedCondition: 'Healthy Swine',
    quarantineRadiusKm: 7.0,
    nearestPvo: 'MAO Luna (2.5 km) • Bangar Border (1.9 km)',
    lastScanned: '3 hours ago',
    pvoNotified: false,
  },
]

const LUNA_PVO_STATIONS = [
  {
    id: 'mao-luna-hub',
    name: 'MAO Luna (Municipal Agriculture Office)',
    shortLabel: 'MAO LUNA HUB',
    province: 'La Union',
    location: 'Municipal Hall Compound, Brgy. Magallanes, Luna, La Union',
    hotline: '(072) 607-1124 / 0917-842-5510',
    x: 255,
    y: 232,
    officer: 'Municipal Agriculturist & BBO Task Force',
  },
  {
    id: 'opvet-la-union-hub',
    name: 'OPVet La Union (Provincial Veterinary Office)',
    shortLabel: 'OPVET LA UNION (TO SAN FERNANDO)',
    province: 'La Union',
    location: 'Capitol Compound, San Fernando City, La Union',
    hotline: '(072) 242-5550 / 0917-838-5847',
    x: 355,
    y: 445,
    officer: 'Provincial Veterinary Epidemiology Unit',
  },
]

const CHECKPOINT_NODES = [
  {
    id: 'cp-oaqui-balaoan',
    label: 'CHECKPOINT: LUNA-BALAOAN HWY',
    x: 425,
    y: 255,
  },
  {
    id: 'cp-stodomingo-bangar',
    label: 'CHECKPOINT: LUNA-BANGAR BORDER',
    x: 310,
    y: 62,
  },
]

const DEMO_WALKTHROUGH_STEPS = [
  {
    step: 1,
    title: 'Step 1: Field Scan in Luna, La Union',
    summary:
      'A backyard swine raiser in Brgy. Barrientos, Luna captures a photo of a lethargic pig using the Pigify YOLOv8/YOLOv11 AI Scanner.',
    actionLabel: 'Inspect Brgy. Barrientos',
    scenarioKey: 'barrientos_asf',
    targetFarmId: 'luna-farm-01',
  },
  {
    step: 2,
    title: 'Step 2: AI Lesion & GPS Geotagging',
    summary:
      'Pigify detects cyanotic purple ear blotches (97.4% confidence) and tags exact GPS coordinates (16.8590°N, 120.3910°E) in Luna, La Union.',
    actionLabel: 'Lock Epicenter Telemetry',
    scenarioKey: 'barrientos_asf',
    targetFarmId: 'luna-farm-01',
  },
  {
    step: 3,
    title: 'Step 3: Dynamic 1-7-10 km Ring Projection',
    summary:
      'The GIS engine automatically projects the 1km Red Lockdown Zone, 7km Pink Buffer Zone (Magallanes, Nalvo Norte, Ayaoan, Rimos), and 10km Yellow Surveillance Zone.',
    actionLabel: 'View Buffer Impact (Magallanes)',
    scenarioKey: 'barrientos_asf',
    targetFarmId: 'luna-farm-02',
  },
  {
    step: 4,
    title: 'Step 4: Differential Triage (Erysipelas vs ASF)',
    summary:
      'In Brgy. Nalvo Norte, Pigify detects Diamond Skin (Swine Erysipelas) — isolating the single pen for Penicillin G treatment without a town-wide lockdown.',
    actionLabel: 'Simulate Nalvo Norte Erysipelas',
    scenarioKey: 'nalvo_erysipelas',
    targetFarmId: 'luna-farm-03',
  },
  {
    step: 5,
    title: 'Step 5: Official MAO Luna & OPVet Dispatch',
    summary:
      'With one click, the farmer or Barangay Biosecurity Officer transmits an official BAI Form 1 Incident Report to MAO Luna and OPVet La Union.',
    actionLabel: 'Open Official PVO Dispatch Form',
    scenarioKey: 'open_modal',
    targetFarmId: 'luna-farm-01',
  },
]

// Helper to compute farm statuses around an epicenter farm
function buildScenarioFarms(scenarioType, customEpicenterId = 'luna-farm-01', customDisease = 'African Swine Fever (ASF)') {
  if (scenarioType === 'all_green') {
    return BASE_LUNA_FARMS.map((f) => ({
      ...f,
      status: 'Free Zone (Green)',
      severityColor: '#10b981',
      activeAlert: 'Optimal Biosecurity Baseline // Clear',
      suspectedCondition: 'Healthy Swine (Malusog na Baboy)',
      quarantineRadiusKm: 0,
      pvoNotified: false,
      lastScanned: 'Just now (Capstone Baseline)',
    }))
  }

  if (scenarioType === 'nalvo_erysipelas') {
    return BASE_LUNA_FARMS.map((f) => {
      if (f.id === 'luna-farm-03') {
        return {
          ...f,
          status: 'Surveillance Zone (Yellow)',
          severityColor: '#f59e0b',
          activeAlert: 'Localized Pen Isolation // Swine Erysipelas (Treatable)',
          suspectedCondition: 'Swine Erysipelas (Diamond Skin Disease)',
          quarantineRadiusKm: 0.5,
          pvoNotified: true,
          lastScanned: 'Just now (Simulated Demo)',
        }
      }
      return {
        ...f,
        status: 'Free Zone (Green)',
        severityColor: '#10b981',
        activeAlert: 'Normal Biosecurity // Non-ASF Neighbor',
        suspectedCondition: 'Healthy Swine',
        quarantineRadiusKm: 0,
        pvoNotified: false,
        lastScanned: '1 hour ago',
      }
    })
  }

  // Contagious ASF Outbreak Scenario centered on customEpicenterId
  const epicenter = BASE_LUNA_FARMS.find((f) => f.id === customEpicenterId) || BASE_LUNA_FARMS[0]

  return BASE_LUNA_FARMS.map((f) => {
    if (f.id === epicenter.id) {
      return {
        ...f,
        status: 'Infected Zone (Red)',
        severityColor: '#f43f5e',
        activeAlert: `EPICENTER: ${customDisease} // 1km Lockdown Cordon`,
        suspectedCondition: customDisease,
        quarantineRadiusKm: 1.0,
        pvoNotified: true,
        lastScanned: 'Just now (Outbreak Epicenter)',
      }
    }

    const distKm = calculateDistanceKm(epicenter.latitude, epicenter.longitude, f.latitude, f.longitude)
    // Scale real distance slightly for municipal barangay demonstration clarity
    const scaledDist = distKm * 1.65

    if (scaledDist <= 1.2) {
      return {
        ...f,
        status: 'Infected Zone (Red)',
        severityColor: '#f43f5e',
        activeAlert: `Red Cordon (${distKm.toFixed(1)} km from ${epicenter.barangay.replace('Barangay ', '')})`,
        suspectedCondition: 'High Contagion Risk (Immediate Cordon)',
        quarantineRadiusKm: 1.0,
        pvoNotified: true,
        lastScanned: '15 mins ago',
      }
    }

    if (scaledDist <= 4.2) {
      return {
        ...f,
        status: 'Buffer Zone (Pink)',
        severityColor: '#ec4899',
        activeAlert: `Pink Buffer (${distKm.toFixed(2)} km from Epicenter) • Daily Footbath`,
        suspectedCondition: 'Healthy Swine (Under Buffer Quarantine)',
        quarantineRadiusKm: 7.0,
        pvoNotified: true,
        lastScanned: '30 mins ago',
      }
    }

    return {
      ...f,
      status: 'Surveillance Zone (Yellow)',
      severityColor: '#f59e0b',
      activeAlert: `Yellow Surveillance (${distKm.toFixed(2)} km from Epicenter) • VHC Required`,
      suspectedCondition: 'Healthy Swine (Border Surveillance)',
      quarantineRadiusKm: 10.0,
      pvoNotified: false,
      lastScanned: '1 hour ago',
    }
  })
}

function DiseaseMap() {
  const [activeScenario, setActiveScenario] = useState('barrientos_asf')
  const [farms, setFarms] = useState(() => buildScenarioFarms('barrientos_asf', 'luna-farm-01'))
  const [selectedFarm, setSelectedFarm] = useState(() => buildScenarioFarms('barrientos_asf', 'luna-farm-01')[0])
  const [filterBreed, setFilterBreed] = useState('ALL')
  const [filterZone, setFilterZone] = useState('ALL')
  const [activeTab, setActiveTab] = useState('map') // 'map' | 'demo_guide' | 'roles' | 'disinfection'
  const [mapMode, setMapMode] = useState('radar') // 'radar' | 'satellite'
  const [activeDemoStep, setActiveDemoStep] = useState(1)
  const [eventLog, setEventLog] = useState([
    {
      id: 'log-1',
      time: 'Just now',
      type: 'red',
      text: 'Capstone Study Site Locked: Municipality of Luna, La Union (16.8530°N, 120.3802°E).',
    },
    {
      id: 'log-2',
      time: '18m ago',
      type: 'red',
      text: 'Simulated ASF Index Case active in Brgy. Barrientos, Luna. 1-7-10 km BAI zoning rings projected.',
    },
    {
      id: 'log-3',
      time: '15m ago',
      type: 'info',
      text: 'MAO Luna & OPVet La Union notified. Quarantine checkpoints active at Oaqui (Balaoan Rd) & Sto. Domingo (Bangar Rd).',
    },
  ])

  // Incident Dispatch Form State (Defaulted to Luna, La Union)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportForm, setReportForm] = useState({
    farmName: 'Barrientos Backyard Swine Site',
    ownerName: 'Ernesto Nisce',
    contactNumber: '0917-555-0192',
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Barrientos',
    pigBreed: 'Philippine Native Pig (Baboy Katutubo)',
    herdTotal: 22,
    affectedCount: 3,
    mortalityCount: 1,
    suspectedDisease: 'African Swine Fever (ASF)',
    severityTier: 'Critical Quarantine (Red Alert)',
    symptoms: 'High pyrexia (41.2°C), cyanotic purple ear tips, ventral blotches, anorexia',
    reportingOfficer: 'Backyard Raiser / Pigify Capstone Field Tester',
  })
  const [submittingReport, setSubmittingReport] = useState(false)
  const [dispatchedConfirmation, setDispatchedConfirmation] = useState(null)

  // Sync with backend if available while preserving Luna, La Union coordinates
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/scan/surveillance-map`)
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.farms) && data.farms.length > 0 && data.farms[0].municipality === 'Luna') {
            const merged = data.farms.map((f, i) => {
              const base = BASE_LUNA_FARMS.find((b) => b.id === f.id) || BASE_LUNA_FARMS[i] || BASE_LUNA_FARMS[0]
              return {
                ...base,
                ...f,
                x: base.x,
                y: base.y,
                severityColor: f.status?.includes('Red')
                  ? '#f43f5e'
                  : f.status?.includes('Pink')
                  ? '#ec4899'
                  : f.status?.includes('Yellow')
                  ? '#f59e0b'
                  : '#10b981',
              }
            })
            setFarms(merged)
            setSelectedFarm(merged[0])
          }
        }
      } catch {
        // Use local high-precision Luna, La Union dataset
      }
    }
    fetchMapData()
  }, [])

  // Active outbreak epicenter farm (for drawing concentric 1-7-10km rings)
  const activeEpicenter = useMemo(() => {
    return (
      farms.find((f) => f.status.includes('Red')) ||
      farms.find((f) => f.status.includes('Yellow') && f.quarantineRadiusKm > 0 && f.quarantineRadiusKm < 2) ||
      null
    )
  }, [farms])

  // Apply a preset simulation scenario
  const handleSelectScenario = (scenarioKey) => {
    setActiveScenario(scenarioKey)
    let nextFarms = []
    let targetId = 'luna-farm-01'
    let logMsg = ''

    if (scenarioKey === 'all_green') {
      nextFarms = buildScenarioFarms('all_green')
      targetId = 'luna-farm-02'
      logMsg = 'All 8 monitored barangays in Luna, La Union restored to Green Free Zone (0 active outbreaks).'
      toast.success('Demo Scenario: All Luna Barangays Safe (Green Zone)')
    } else if (scenarioKey === 'barrientos_asf') {
      nextFarms = buildScenarioFarms('barrientos_asf', 'luna-farm-01', 'African Swine Fever (ASF)')
      targetId = 'luna-farm-01'
      logMsg = 'Simulated ASF Index Case triggered in Brgy. Barrientos, Luna! 1-7-10 km cordon rings activated.'
      toast.error('Simulated Outbreak: ASF Red Zone in Brgy. Barrientos, Luna!')
    } else if (scenarioKey === 'darigayos_asf') {
      nextFarms = buildScenarioFarms('darigayos_asf', 'luna-farm-07', 'African Swine Fever (ASF)')
      targetId = 'luna-farm-07'
      logMsg = 'Simulated Coastal ASF Outbreak in Brgy. Darigayos, Luna! Southern corridor under lockdown.'
      toast.error('Simulated Outbreak: Coastal ASF Alert in Brgy. Darigayos, Luna!')
    } else if (scenarioKey === 'nalvo_erysipelas') {
      nextFarms = buildScenarioFarms('nalvo_erysipelas')
      targetId = 'luna-farm-03'
      logMsg = 'Simulated Swine Erysipelas (Diamond Skin) in Brgy. Nalvo Norte. Localized pen isolation applied (No ASF lockdown).'
      toast('Differential Demo: Swine Erysipelas in Brgy. Nalvo Norte (Treatable)', { icon: '⚠️' })
    }

    setFarms(nextFarms)
    const found = nextFarms.find((f) => f.id === targetId) || nextFarms[0]
    setSelectedFarm(found)
    setEventLog((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: scenarioKey === 'all_green' ? 'green' : 'red',
        text: logMsg,
      },
      ...prev.slice(0, 7),
    ])
  }

  // Trigger custom infection at currently selected farm in Luna
  const handleTriggerFarmInfection = (farm, mode) => {
    if (!farm) return
    if (mode === 'asf') {
      setActiveScenario(`custom_${farm.id}`)
      const nextFarms = buildScenarioFarms('custom_asf', farm.id, 'African Swine Fever (ASF)')
      setFarms(nextFarms)
      const updatedSelected = nextFarms.find((f) => f.id === farm.id)
      setSelectedFarm(updatedSelected)
      setEventLog((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'red',
          text: `EMERGENCY DEMO: ASF Outbreak triggered at ${farm.name} (${farm.barangay}, Luna). Neighboring barangays shifted to Pink/Yellow zones.`,
        },
        ...prev.slice(0, 7),
      ])
      toast.error(`ASF Red Zone triggered at ${farm.barangay}, Luna!`)
    } else if (mode === 'erysipelas') {
      setActiveScenario(`custom_ery_${farm.id}`)
      const nextFarms = farms.map((f) =>
        f.id === farm.id
          ? {
              ...f,
              status: 'Surveillance Zone (Yellow)',
              severityColor: '#f59e0b',
              activeAlert: 'Localized Pen Isolation // Swine Erysipelas (Diamond Skin)',
              suspectedCondition: 'Swine Erysipelas (Respond with Penicillin G)',
              quarantineRadiusKm: 0.5,
              pvoNotified: true,
              lastScanned: 'Just now (Simulated)',
            }
          : f
      )
      setFarms(nextFarms)
      setSelectedFarm(nextFarms.find((f) => f.id === farm.id))
      setEventLog((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'info',
          text: `Localized Differential Alert: Swine Erysipelas flagged at ${farm.barangay}, Luna. 10m pen isolation initiated.`,
        },
        ...prev.slice(0, 7),
      ])
      toast('Swine Erysipelas watch activated for ' + farm.barangay, { icon: '⚠️' })
    } else if (mode === 'clear') {
      handleSelectScenario('all_green')
    }
  }

  // Handle interactive walkthrough step trigger
  const handleRunWalkthroughStep = (stepObj) => {
    setActiveDemoStep(stepObj.step)
    if (stepObj.scenarioKey === 'open_modal') {
      const target = farms.find((f) => f.id === stepObj.targetFarmId) || selectedFarm
      handleOpenReportModal(target)
      return
    }
    handleSelectScenario(stepObj.scenarioKey)
    const target = BASE_LUNA_FARMS.find((f) => f.id === stepObj.targetFarmId)
    if (target) {
      setTimeout(() => {
        setFarms((curr) => {
          const match = curr.find((c) => c.id === target.id)
          if (match) setSelectedFarm(match)
          return curr
        })
      }, 60)
    }
  }

  // Filtered farms list
  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      const matchBreed =
        filterBreed === 'ALL'
          ? true
          : filterBreed === 'NATIVE'
          ? f.breedType.includes('Native')
          : !f.breedType.includes('Native')

      const matchZone =
        filterZone === 'ALL'
          ? true
          : filterZone === 'INFECTED'
          ? f.status.includes('Red')
          : filterZone === 'BUFFER'
          ? f.status.includes('Pink') || f.status.includes('Yellow')
          : f.status.includes('Green')

      return matchBreed && matchZone
    })
  }, [farms, filterBreed, filterZone])

  const stats = useMemo(() => {
    return {
      total: farms.length,
      redInfected: farms.filter((f) => f.status.includes('Red')).length,
      bufferPink: farms.filter((f) => f.status.includes('Pink')).length,
      yellowSurveillance: farms.filter((f) => f.status.includes('Yellow')).length,
      greenFree: farms.filter((f) => f.status.includes('Green')).length,
      nativePigFarms: farms.filter((f) => f.breedType.includes('Native')).length,
      totalSwineHeads: farms.reduce((acc, f) => acc + (Number(f.pigCount) || 0), 0),
    }
  }, [farms])

  const handleOpenReportModal = (farm = null) => {
    const target = farm || selectedFarm || farms[0]
    if (target) {
      setReportForm((prev) => ({
        ...prev,
        farmName: target.name,
        ownerName: target.owner,
        contactNumber: target.contact || '0917-555-0192',
        province: 'La Union',
        municipality: 'Luna',
        barangay: target.barangay,
        pigBreed: target.breedType,
        herdTotal: target.pigCount,
        suspectedDisease: target.suspectedCondition?.includes('Erysipelas')
          ? 'Swine Erysipelas (Diamond Skin)'
          : 'African Swine Fever (ASF)',
      }))
    }
    setReportModalOpen(true)
  }

  const handleSubmitPvoReport = async (e) => {
    e.preventDefault()
    setSubmittingReport(true)

    try {
      const payload = {
        ...reportForm,
        latitude: selectedFarm?.latitude || 16.8530,
        longitude: selectedFarm?.longitude || 120.3802,
        symptoms: [reportForm.symptoms],
      }

      let confirmation = null
      try {
        const res = await fetch(`${API_BASE_URL}/api/scan/pvo-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const resData = await res.json()
          confirmation = resData.alert
        }
      } catch {
        // Local simulation fallback
      }

      if (!confirmation) {
        confirmation = {
          incidentRef: `PVO-LU-${new Date().getFullYear()}-ASF-${Math.floor(1000 + Math.random() * 9000)}`,
          farmName: reportForm.farmName,
          province: reportForm.province,
          municipality: reportForm.municipality,
          barangay: reportForm.barangay,
          suspectedDisease: reportForm.suspectedDisease,
          dispatchedAt: new Date().toISOString(),
          status: 'Dispatched to MAO Luna & OPVet La Union',
        }
      }

      setDispatchedConfirmation(confirmation)
      setEventLog((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'info',
          text: `Official BAI Form 1 Alert (${confirmation.incidentRef}) transmitted for ${reportForm.barangay}, Luna, La Union.`,
        },
        ...prev.slice(0, 7),
      ])
      toast.success('Official alert transmitted to MAO Luna & OPVet La Union!')
    } catch (err) {
      toast.error(err.message || 'Error transmitting report')
    } finally {
      setSubmittingReport(false)
    }
  }

  const distanceFromEpicenterKm = useMemo(() => {
    if (!activeEpicenter || !selectedFarm) return null
    if (activeEpicenter.id === selectedFarm.id) return 0
    return calculateDistanceKm(
      activeEpicenter.latitude,
      activeEpicenter.longitude,
      selectedFarm.latitude,
      selectedFarm.longitude
    )
  }, [activeEpicenter, selectedFarm])

  const currentStepObj =
    DEMO_WALKTHROUGH_STEPS.find((s) => s.step === activeDemoStep) || DEMO_WALKTHROUGH_STEPS[0]

  return (
    <div className="pro-landing mk-page luna-map-page">
      <UserHeader />

      <main className="mk-main">
        {/* ── 1. HERO HEADER: LUNA, LA UNION CAPSTONE SURVEILLANCE ── */}
        <section className="mk-hero" style={{ paddingBottom: '18px' }}>
          <div className="container-pro">
            <div className="mk-kicker">
              <span className="mk-kicker-dot" />
              <span>CAPSTONE STUDY SITE &bull; LUNA, LA UNION, PHILIPPINES (16.8530&deg;N, 120.3802&deg;E)</span>
            </div>

            <h1 className="mk-title">
              Luna, La Union Swine GIS Map &amp;
              <span className="accent"> Outbreak Containment Simulator</span>
            </h1>

            <p className="mk-subtitle">
              Real-time barangay biosecurity mapping, dynamic BAI 1-7-10 km quarantine ring projection, and interactive infection simulation for backyard swine farms in <strong>Luna, La Union</strong> in coordination with <strong>MAO Luna</strong> and <strong>OPVet La Union</strong>.
            </p>

            {/* Sub-Nav Bar */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`lp-btn-secondary ${activeTab === 'map' ? 'lp-btn-primary' : ''}`}
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              >
                <Compass size={15} />
                <span>Luna, La Union GIS &amp; Outbreak Demo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`lp-btn-secondary ${activeTab === 'roles' ? 'lp-btn-primary' : ''}`}
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              >
                <UserCheck size={15} />
                <span>Who Checks &amp; Reports ASF? (5-Tier SOP)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('disinfection')}
                className={`lp-btn-secondary ${activeTab === 'disinfection' ? 'lp-btn-primary' : ''}`}
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              >
                <ShieldCheck size={15} />
                <span>Sick Pig Disinfection Protocols</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenReportModal()}
                className="lp-btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.84rem',
                  background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                  borderColor: 'rgba(244,63,94,0.5)',
                }}
              >
                <Send size={15} />
                <span>Report Incident to MAO Luna / OPVet</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 2. TAB: GEOGRAPHIC MAP VIEW & INTERACTIVE OUTBREAK SIMULATOR ── */}
        {activeTab === 'map' && (
          <section className="mk-section" style={{ paddingTop: '8px' }}>
            <div className="container-pro">
              {/* ── INTERACTIVE CAPSTONE DEMO & OUTBREAK SIMULATOR PANEL ── */}
              <div className="luna-sim-banner">
                <div className="luna-sim-header">
                  <div className="luna-sim-title-group">
                    <span className="luna-sim-badge">
                      <Zap size={12} />
                      Interactive Capstone Simulator
                    </span>
                    <h2 className="luna-sim-title">
                      Simulate an Infection or Outbreak Scenario in Luna, La Union
                    </h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleSelectScenario('all_green')}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#10b981',
                        borderRadius: '8px',
                        padding: '5px 11px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Reset All to Safe (Green)</span>
                    </button>
                  </div>
                </div>

                {/* 4 Preset Outbreak Scenarios */}
                <div className="luna-sim-grid">
                  <button
                    type="button"
                    className={`luna-scenario-btn ${activeScenario === 'barrientos_asf' ? 'active' : ''}`}
                    onClick={() => handleSelectScenario('barrientos_asf')}
                  >
                    <div className="luna-scenario-top">
                      <span>Scenario 1: Brgy. Barrientos ASF Outbreak</span>
                      <span style={{ color: '#f43f5e', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>RED ALERT</span>
                    </div>
                    <span className="luna-scenario-desc">
                      Simulates an acute ASF detection in central Luna. Projects 1km Red, 7km Pink, and 10km Yellow rings.
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`luna-scenario-btn ${activeScenario === 'darigayos_asf' ? 'active' : ''}`}
                    onClick={() => handleSelectScenario('darigayos_asf')}
                  >
                    <div className="luna-scenario-top">
                      <span>Scenario 2: Brgy. Darigayos Coastal Alert</span>
                      <span style={{ color: '#ec4899', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>COASTAL CORDONS</span>
                    </div>
                    <span className="luna-scenario-desc">
                      Simulates an infection in southern coastal Luna. Shifts containment rings and alerts Ayaoan &amp; Magallanes.
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`luna-scenario-btn ${activeScenario === 'nalvo_erysipelas' ? 'active' : ''}`}
                    onClick={() => handleSelectScenario('nalvo_erysipelas')}
                  >
                    <div className="luna-scenario-top">
                      <span>Scenario 3: Brgy. Nalvo Norte Erysipelas</span>
                      <span style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>DIFFERENTIAL</span>
                    </div>
                    <span className="luna-scenario-desc">
                      Simulates treatable Diamond Skin disease in Nalvo Norte. Isolates pen without town-wide ASF lockdown.
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`luna-scenario-btn green-mode ${activeScenario === 'all_green' ? 'active' : ''}`}
                    onClick={() => handleSelectScenario('all_green')}
                  >
                    <div className="luna-scenario-top">
                      <span>Scenario 4: All Barangays Safe Baseline</span>
                      <span style={{ color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>GREEN FREE</span>
                    </div>
                    <span className="luna-scenario-desc">
                      Pre-outbreak baseline across all 8 monitored barangays in Luna, La Union with 231 healthy swine.
                    </span>
                  </button>
                </div>

                {/* 5-Step Guided Walkthrough Bar ("How to Use It") */}
                <div className="luna-walkthrough-strip">
                  <div className="luna-step-pills">
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', fontFamily: 'JetBrains Mono', marginRight: '4px' }}>
                      HOW TO USE DEMO:
                    </span>
                    {DEMO_WALKTHROUGH_STEPS.map((st) => (
                      <button
                        key={st.step}
                        type="button"
                        className={`luna-step-pill ${activeDemoStep === st.step ? 'active' : ''}`}
                        onClick={() => handleRunWalkthroughStep(st)}
                      >
                        <span>Step {st.step}</span>
                      </button>
                    ))}
                  </div>

                  <div className="luna-step-banner-box">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#06b6d4', marginBottom: '2px' }}>
                        {currentStepObj.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted, #cbd5e1)', lineHeight: 1.4 }}>
                        {currentStepObj.summary}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRunWalkthroughStep(currentStepObj)}
                        className="lp-btn-primary"
                        style={{ padding: '7px 14px', fontSize: '11.5px' }}
                      >
                        <Play size={12} />
                        <span>{currentStepObj.actionLabel}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = activeDemoStep >= 5 ? 1 : activeDemoStep + 1
                          const nextObj = DEMO_WALKTHROUGH_STEPS.find((s) => s.step === next)
                          if (nextObj) handleRunWalkthroughStep(nextObj)
                        }}
                        className="lp-btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '11.5px' }}
                      >
                        <span>Next Step &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telemetry Metric Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f43f5e', fontWeight: 700 }}>
                    RED ZONE (0-1 KM)
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.redInfected} {stats.redInfected === 1 ? 'Barangay' : 'Barangays'}
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>Lockdown Cordon in Luna</small>
                </div>

                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(236, 72, 153, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#ec4899', fontWeight: 700 }}>
                    PINK BUFFER (1-7 KM)
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.bufferPink} Barangays
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>Daily Footbath &amp; MAO Check</small>
                </div>

                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                    YELLOW ZONE (7-10 KM)
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.yellowSurveillance} Barangays
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>Highway Checkpoint &amp; PCR</small>
                </div>

                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                    GREEN ZONE (&gt;10 KM / SAFE)
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.greenFree} Barangays
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                    {stats.totalSwineHeads} Total Swine Monitored
                  </small>
                </div>
              </div>

              {/* Main Interactive Map Grid */}
              <div className="luna-map-grid">
                {/* ── LEFT: LUNA, LA UNION GIS MAP CANVAS (TACTICAL RADAR + LIVE SATELLITE) ── */}
                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    borderRadius: '24px',
                    padding: '22px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  {/* Filter & Mode Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={16} color="#f43f5e" className="pigify-pulse" />
                      <div>
                        <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                          Municipality of Luna, La Union GIS
                        </h3>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
                          Region I (Ilocos) &bull; 16.8530&deg;N, 120.3802&deg;E
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Dual Map Mode Switcher */}
                      <div className="luna-map-mode-toggle">
                        <button
                          type="button"
                          className={`luna-mode-btn ${mapMode === 'radar' ? 'active' : ''}`}
                          onClick={() => setMapMode('radar')}
                        >
                          <Compass size={13} />
                          <span>Tactical Zoning GIS</span>
                        </button>
                        <button
                          type="button"
                          className={`luna-mode-btn ${mapMode === 'satellite' ? 'active' : ''}`}
                          onClick={() => setMapMode('satellite')}
                        >
                          <Eye size={13} />
                          <span>Live Street / OSM Map</span>
                        </button>
                      </div>

                      <select
                        value={filterBreed}
                        onChange={(e) => setFilterBreed(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          padding: '6px 9px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="ALL">All Breeds</option>
                        <option value="NATIVE">Native Pigs</option>
                        <option value="COMMERCIAL">Commercial / Cross</option>
                      </select>

                      <select
                        value={filterZone}
                        onChange={(e) => setFilterZone(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          padding: '6px 9px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="ALL">All Zones</option>
                        <option value="INFECTED">Red Zone</option>
                        <option value="BUFFER">Pink &amp; Yellow</option>
                        <option value="FREE">Green Free</option>
                      </select>
                    </div>
                  </div>

                  {/* MODE 1: HIGH-PRECISION VECTOR GIS MAP OF LUNA, LA UNION */}
                  {mapMode === 'radar' ? (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '490px',
                        background: 'radial-gradient(ellipse at 55% 45%, rgba(16, 28, 52, 0.92) 0%, rgba(7, 10, 19, 0.99) 100%)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <svg
                        viewBox="0 0 500 500"
                        style={{ width: '100%', height: '100%', display: 'block' }}
                      >
                        <defs>
                          <pattern id="lunaGrid" width="35" height="35" patternUnits="userSpaceOnUse">
                            <path d="M 35 0 L 0 0 0 35" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          </pattern>
                          <radialGradient id="redOutbreakGlow">
                            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.48)" />
                            <stop offset="60%" stopColor="rgba(244, 63, 94, 0.16)" />
                            <stop offset="100%" stopColor="rgba(244, 63, 94, 0.0)" />
                          </radialGradient>
                          <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.22)" />
                            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.03)" />
                          </linearGradient>
                        </defs>

                        {/* Background Coordinate Grid */}
                        <rect width="500" height="500" fill="url(#lunaGrid)" />

                        {/* West Philippine Sea / South China Sea Coastline along Western Luna (Nalvo, Rimos, Magallanes, Darigayos) */}
                        <path
                          d="M 0 0 L 195 0 Q 175 75 168 135 T 145 235 Q 130 315 112 395 T 95 500 L 0 500 Z"
                          fill="url(#seaGradient)"
                          stroke="rgba(6, 182, 212, 0.45)"
                          strokeWidth="2"
                        />
                        <text
                          x="22"
                          y="235"
                          fill="rgba(6, 182, 212, 0.45)"
                          fontSize="10"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                          letterSpacing="2"
                          transform="rotate(-78 55 235)"
                        >
                          WEST PHILIPPINE SEA (LUNA COASTLINE)
                        </text>

                        {/* Municipality of Luna Landmass Boundary Polygon */}
                        <path
                          d="M 195 20 L 385 35 L 455 170 L 445 340 L 335 455 L 105 465 Q 125 350 145 235 T 195 20 Z"
                          fill="rgba(16, 185, 129, 0.03)"
                          stroke="rgba(255, 255, 255, 0.14)"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                        />

                        {/* Amburayan / Baroro Tributary & Darigayos Creek */}
                        <path
                          d="M 118 395 Q 200 385 275 355 T 430 315"
                          fill="none"
                          stroke="rgba(56, 189, 248, 0.25)"
                          strokeWidth="2"
                        />
                        <text x="180" y="412" fill="rgba(56, 189, 248, 0.45)" fontSize="8" fontFamily="JetBrains Mono">
                          DARIGAYOS INLET &amp; RIVER CORRIDOR
                        </text>

                        {/* Major Municipal Roads: Luna-Bangar Hwy (North), Luna-Balaoan Rd (East), Coastal Rd */}
                        <path
                          d="M 245 245 L 285 95 L 315 30"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.14)"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M 245 245 L 315 205 L 390 265 L 465 275"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.16)"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M 230 135 L 185 180 L 245 245 L 295 305 L 145 395"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.12)"
                          strokeWidth="1.8"
                          strokeDasharray="3 3"
                        />

                        {/* Compass Direction Labels for Neighboring Towns */}
                        <text x="275" y="22" fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="JetBrains Mono">
                          &uarr; NORTH TO BANGAR, LA UNION
                        </text>
                        <text x="345" y="298" fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="JetBrains Mono">
                          EAST TO BALAOAN &rarr;
                        </text>
                        <text x="180" y="485" fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="JetBrains Mono">
                          &darr; SOUTH TO BACNOTAN &amp; SAN FERNANDO CITY
                        </text>

                        {/* DYNAMIC 1-7-10 KM CONCENTRIC ZONING RINGS AROUND ACTIVE EPICENTER */}
                        {activeEpicenter && (
                          <g>
                            {/* Yellow Surveillance Zone (10 km) */}
                            {activeEpicenter.quarantineRadiusKm >= 1 && (
                              <>
                                <circle
                                  cx={activeEpicenter.x}
                                  cy={activeEpicenter.y}
                                  r="165"
                                  fill="none"
                                  stroke="rgba(245, 158, 11, 0.38)"
                                  strokeWidth="1.5"
                                  strokeDasharray="6 4"
                                />
                                <text
                                  x={Math.min(340, activeEpicenter.x + 10)}
                                  y={Math.max(45, activeEpicenter.y - 148)}
                                  fill="rgba(245, 158, 11, 0.75)"
                                  fontSize="8.5"
                                  fontFamily="JetBrains Mono"
                                  fontWeight="bold"
                                >
                                  YELLOW ZONE (7-10 KM SURVEILLANCE)
                                </text>

                                {/* Pink Buffer Zone (7 km) */}
                                <circle
                                  cx={activeEpicenter.x}
                                  cy={activeEpicenter.y}
                                  r="108"
                                  fill="rgba(236, 72, 153, 0.05)"
                                  stroke="rgba(236, 72, 153, 0.55)"
                                  strokeWidth="1.5"
                                  strokeDasharray="4 3"
                                />
                                <text
                                  x={Math.min(350, activeEpicenter.x + 10)}
                                  y={Math.max(75, activeEpicenter.y - 92)}
                                  fill="rgba(236, 72, 153, 0.85)"
                                  fontSize="8.5"
                                  fontFamily="JetBrains Mono"
                                  fontWeight="bold"
                                >
                                  PINK BUFFER (1-7 KM)
                                </text>
                              </>
                            )}

                            {/* Red Infected Zone (1 km) or Localized Erysipelas Cordon */}
                            <circle
                              cx={activeEpicenter.x}
                              cy={activeEpicenter.y}
                              r={activeEpicenter.quarantineRadiusKm >= 1 ? '44' : '28'}
                              fill="url(#redOutbreakGlow)"
                              stroke={activeEpicenter.severityColor}
                              strokeWidth="2"
                            />
                            <circle
                              cx={activeEpicenter.x}
                              cy={activeEpicenter.y}
                              r={activeEpicenter.quarantineRadiusKm >= 1 ? '44' : '28'}
                              fill="none"
                              stroke={activeEpicenter.severityColor}
                              strokeWidth="1.2"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={activeEpicenter.x - 36}
                              y={activeEpicenter.y - (activeEpicenter.quarantineRadiusKm >= 1 ? 30 : 20)}
                              fill={activeEpicenter.severityColor}
                              fontSize="8.5"
                              fontFamily="JetBrains Mono"
                              fontWeight="bold"
                            >
                              {activeEpicenter.quarantineRadiusKm >= 1 ? 'RED ZONE (0-1 KM)' : 'PEN ISOLATION'}
                            </text>
                          </g>
                        )}

                        {/* Distance Vector Line from Active Epicenter to Selected Farm */}
                        {activeEpicenter && selectedFarm && activeEpicenter.id !== selectedFarm.id && (
                          <g>
                            <line
                              x1={activeEpicenter.x}
                              y1={activeEpicenter.y}
                              x2={selectedFarm.x}
                              y2={selectedFarm.y}
                              stroke="#38bdf8"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                            <rect
                              x={(activeEpicenter.x + selectedFarm.x) / 2 - 34}
                              y={(activeEpicenter.y + selectedFarm.y) / 2 - 10}
                              width="68"
                              height="16"
                              rx="4"
                              fill="rgba(7, 10, 19, 0.9)"
                              stroke="#38bdf8"
                              strokeWidth="1"
                            />
                            <text
                              x={(activeEpicenter.x + selectedFarm.x) / 2}
                              y={(activeEpicenter.y + selectedFarm.y) / 2 + 1}
                              fill="#38bdf8"
                              fontSize="8.5"
                              fontFamily="JetBrains Mono"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {distanceFromEpicenterKm ? `${distanceFromEpicenterKm.toFixed(2)} km` : ''}
                            </text>
                          </g>
                        )}

                        {/* Active Quarantine Checkpoints (Shown when Red Zone is active) */}
                        {stats.redInfected > 0 &&
                          CHECKPOINT_NODES.map((cp) => (
                            <g key={cp.id} transform={`translate(${cp.x}, ${cp.y})`}>
                              <polygon
                                points="0,-9 9,7 -9,7"
                                fill="rgba(245, 158, 11, 0.25)"
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                              />
                              <circle cx="0" cy="1" r="2" fill="#f59e0b" />
                              <text
                                x="-45"
                                y="18"
                                fill="#fbbf24"
                                fontSize="7.5"
                                fontFamily="JetBrains Mono"
                                fontWeight="bold"
                              >
                                {cp.label}
                              </text>
                            </g>
                          ))}

                        {/* MAO Luna & OPVet La Union Hubs */}
                        {LUNA_PVO_STATIONS.map((pvo) => (
                          <g key={pvo.id} transform={`translate(${pvo.x}, ${pvo.y})`}>
                            <rect
                              x="-12"
                              y="-12"
                              width="24"
                              height="24"
                              rx="6"
                              fill="rgba(37, 99, 235, 0.28)"
                              stroke="#3b82f6"
                              strokeWidth="1.5"
                            />
                            <circle cx="0" cy="0" r="4" fill="#60a5fa" />
                            <text
                              x="15"
                              y="4"
                              fill="#60a5fa"
                              fontSize="8"
                              fontFamily="JetBrains Mono"
                              fontWeight="bold"
                            >
                              {pvo.shortLabel}
                            </text>
                          </g>
                        ))}

                        {/* Luna Barangay Farm Markers */}
                        {filteredFarms.map((farm) => {
                          const isSelected = selectedFarm?.id === farm.id
                          const isRed = farm.status.includes('Red')
                          const isNative = farm.breedType.includes('Native')

                          return (
                            <g
                              key={farm.id}
                              transform={`translate(${farm.x}, ${farm.y})`}
                              onClick={() => setSelectedFarm(farm)}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* Selected Reticle */}
                              {isSelected && (
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="17"
                                  fill="none"
                                  stroke="#ffffff"
                                  strokeWidth="1.8"
                                  strokeDasharray="3 3"
                                />
                              )}

                              {/* Outbreak Sonar Beacon */}
                              {isRed && (
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="15"
                                  fill="rgba(244, 63, 94, 0.28)"
                                  stroke="rgba(244, 63, 94, 0.65)"
                                  strokeWidth="1"
                                />
                              )}

                              {/* Farm Pin Body */}
                              <circle
                                cx="0"
                                cy="0"
                                r={isSelected ? '10.5' : '8.5'}
                                fill={farm.severityColor}
                                stroke="#ffffff"
                                strokeWidth={isSelected ? '2.5' : '1.5'}
                              />

                              {/* Native Pig Indicator Center Dot */}
                              {isNative && <circle cx="0" cy="0" r="3" fill="#070a13" />}

                              {/* Barangay Label */}
                              <text
                                x="13"
                                y="4"
                                fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.88)'}
                                fontSize={isSelected ? '10' : '8.5'}
                                fontWeight={isSelected ? 'bold' : 'normal'}
                                fontFamily="JetBrains Mono"
                              >
                                {farm.barangay.replace('Barangay ', 'Brgy. ')}
                              </text>
                            </g>
                          )
                        })}
                      </svg>

                      {/* Map Legend Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          right: '12px',
                          background: 'rgba(7, 10, 19, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          gap: '10px',
                          fontSize: '10px',
                          fontFamily: 'JetBrains Mono',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
                          <span>Red (Infected 1km)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
                          <span>Pink (Buffer 7km)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                          <span>Yellow (Surveillance 10km)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                          <span>MAO Luna / OPVet</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <span>Free Zone</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* MODE 2: LIVE OPENSTREETMAP / SATELLITE GEOGRAPHIC EMBED OF LUNA, LA UNION */
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '490px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        overflow: 'hidden',
                        background: '#0f172a',
                      }}
                    >
                      <iframe
                        title="Luna, La Union Live Geographic Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'contrast(1.04)' }}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=120.3350%2C16.8150%2C120.4250%2C16.8850&layer=mapnik&marker=${
                          selectedFarm ? `${selectedFarm.latitude}%2C${selectedFarm.longitude}` : '16.8530%2C120.3802'
                        }`}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          right: '12px',
                          background: 'rgba(7, 10, 19, 0.92)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>
                            Pinned: {selectedFarm ? `${selectedFarm.name} (${selectedFarm.barangay})` : 'Luna, La Union'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                            GPS: {selectedFarm ? `${selectedFarm.latitude.toFixed(4)}°N, ${selectedFarm.longitude.toFixed(4)}°E` : '16.8530°N, 120.3802°E'}
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${
                            selectedFarm ? `${selectedFarm.latitude},${selectedFarm.longitude}` : '16.8530,120.3802'
                          }`}
                          target="_blank"
                          rel="noreferrer"
                          className="lp-btn-primary"
                          style={{ padding: '6px 12px', fontSize: '11.5px', textDecoration: 'none' }}
                        >
                          <ExternalLink size={12} />
                          <span>Open in Google Maps</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Map Telemetry Footer & Live Event Log */}
                  <div
                    style={{
                      marginTop: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        fontSize: '10.5px',
                        fontFamily: 'JetBrains Mono',
                        color: '#94a3b8',
                      }}
                    >
                      <span>LIVE LUNA, LA UNION SURVEILLANCE LOG</span>
                      <button
                        type="button"
                        onClick={() => handleSelectScenario('barrientos_asf')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#06b6d4',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        Reset Default Demo
                      </button>
                    </div>
                    <div style={{ display: 'grid', gap: '4px' }}>
                      {eventLog.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          style={{
                            fontSize: '11.5px',
                            color: ev.type === 'red' ? '#fb7185' : ev.type === 'green' ? '#34d399' : '#cbd5e1',
                            display: 'flex',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontFamily: 'JetBrains Mono', color: '#64748b', flexShrink: 0 }}>
                            [{ev.time}]
                          </span>
                          <span>{ev.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: SELECTED LUNA BARANGAY INSPECTOR & SIMULATION CONTROLS ── */}
                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    borderRadius: '24px',
                    padding: '22px',
                    position: 'relative',
                  }}
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                      LUNA BARANGAY INSPECTOR
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono',
                        color: '#ffffff',
                        background: selectedFarm ? selectedFarm.severityColor : '#64748b',
                      }}
                    >
                      {selectedFarm ? selectedFarm.status : 'NO SELECTION'}
                    </span>
                  </div>

                  {selectedFarm ? (
                    <div>
                      <h2 style={{ fontFamily: 'Sora', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
                        {selectedFarm.name}
                      </h2>
                      <div style={{ fontSize: '0.84rem', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                        {selectedFarm.barangay}, {selectedFarm.municipality}, {selectedFarm.province}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '14px' }}>
                        {selectedFarm.sector}
                      </div>

                      {/* INTERACTIVE BARANGAY OUTBREAK TRIGGER CONTROLS */}
                      <div className="luna-sim-control-box">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fb7185', fontFamily: 'JetBrains Mono' }}>
                            DEMO: TEST INFECTION AT THIS BARANGAY
                          </span>
                          <Sparkles size={13} color="#fb7185" />
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>
                          Simulate what happens if an infection breaks out in <strong>{selectedFarm.barangay}</strong>:
                        </div>
                        <div className="luna-sim-btn-row">
                          <button
                            type="button"
                            className="luna-mini-sim-btn trigger-asf"
                            onClick={() => handleTriggerFarmInfection(selectedFarm, 'asf')}
                          >
                            <ShieldAlert size={13} />
                            <span>Trigger ASF Red Alert</span>
                          </button>
                          <button
                            type="button"
                            className="luna-mini-sim-btn trigger-ery"
                            onClick={() => handleTriggerFarmInfection(selectedFarm, 'erysipelas')}
                          >
                            <AlertTriangle size={13} />
                            <span>Trigger Erysipelas Watch</span>
                          </button>
                          <button
                            type="button"
                            className="luna-mini-sim-btn trigger-clear"
                            onClick={() => handleTriggerFarmInfection(selectedFarm, 'clear')}
                          >
                            <CheckCircle2 size={13} />
                            <span>Clear All Outbreaks (Restore Green Zone)</span>
                          </button>
                        </div>
                      </div>

                      {/* Detail Metrics List */}
                      <div style={{ display: 'grid', gap: '9px', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '9px 13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>DETECTED / MONITORED CONDITION</small>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: selectedFarm.severityColor, marginTop: '2px' }}>
                            {selectedFarm.suspectedCondition || selectedFarm.activeAlert}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '9px 13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>SWINE BREED CATEGORY</small>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', marginTop: '2px' }}>
                            {selectedFarm.breedType}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '9px 13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>HERD TOTAL</small>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981', marginTop: '2px' }}>
                              {selectedFarm.pigCount} Heads
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '9px 13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>LUNA GPS COORDS</small>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#ffffff', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                              {selectedFarm.latitude.toFixed(4)}&deg;N, {selectedFarm.longitude.toFixed(4)}&deg;E
                            </div>
                          </div>
                        </div>

                        {distanceFromEpicenterKm !== null && distanceFromEpicenterKm > 0 && (
                          <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '9px 13px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.28)' }}>
                            <small style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>DISTANCE FROM ACTIVE OUTBREAK EPICENTER</small>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff', marginTop: '2px' }}>
                              {distanceFromEpicenterKm.toFixed(2)} km from {activeEpicenter?.barangay}
                            </div>
                          </div>
                        )}

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '9px 13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>LGU &amp; PROVINCIAL AUTHORITY</small>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#38bdf8', marginTop: '2px' }}>
                            {selectedFarm.nearestPvo}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '9px 13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>RAISER &amp; CONTACT</small>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#ffffff', marginTop: '2px' }}>
                            {selectedFarm.owner} &bull; {selectedFarm.contact}
                          </div>
                        </div>
                      </div>

                      {/* Mandated Action for this Farm */}
                      <div
                        style={{
                          borderRadius: '12px',
                          padding: '12px 14px',
                          marginBottom: '16px',
                          background: selectedFarm.status.includes('Red')
                            ? 'rgba(244, 63, 94, 0.12)'
                            : 'rgba(6, 182, 212, 0.1)',
                          border: `1px solid ${
                            selectedFarm.status.includes('Red')
                              ? 'rgba(244, 63, 94, 0.35)'
                              : 'rgba(6, 182, 212, 0.3)'
                          }`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                          <ShieldAlert size={15} color={selectedFarm.severityColor} />
                          <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>Mandated LGU Luna Biosecurity Action:</strong>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45, margin: 0 }}>
                          {selectedFarm.status.includes('Red')
                            ? 'CRITICAL RED ZONE (0-1 KM): Complete barangay pen lockdown. No live pig movement across Luna borders. 24/7 MAO Luna & OPVet La Union checkpoint active. Apply 2% Virkon S & slaked lime.'
                            : selectedFarm.status.includes('Pink')
                            ? 'PINK BUFFER ZONE (1-7 KM): Weekly clinical inspection by MAO Luna & Barangay Biosecurity Officers. Daily footbath disinfection required. Live pig transport prohibited without permit.'
                            : selectedFarm.status.includes('Yellow')
                            ? 'YELLOW SURVEILLANCE: Routine blood sampling or localized pen quarantine. Transit requires certified Veterinary Health Certificate (VHC) from OPVet La Union.'
                            : 'GREEN FREE ZONE: Maintain standard backyard biosecurity hygiene, slaked lime walkways, and 48-hour footbath replacement across Luna pens.'}
                        </p>
                      </div>

                      {/* Action Dispatch Buttons */}
                      <div style={{ display: 'grid', gap: '9px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(selectedFarm)}
                          className="lp-btn-primary"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            padding: '11px',
                            background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                          }}
                        >
                          <Send size={15} />
                          <span>Dispatch Incident Report to MAO Luna / OPVet</span>
                        </button>

                        <a
                          href="tel:09178425510"
                          className="lp-btn-secondary"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            padding: '9px',
                            textDecoration: 'none',
                            fontSize: '0.82rem',
                          }}
                        >
                          <PhoneCall size={14} />
                          <span>Call MAO Luna / OPVet Hotline (0917-842-5510)</span>
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ── ALL 8 MONITORED BARANGAYS IN LUNA, LA UNION DIRECTORY CARDS ── */}
              <div className="luna-barangay-directory">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#06b6d4', fontWeight: 700 }}>
                      LUNA, LA UNION CAPSTONE FIELD SITES (8 MONITORED BARANGAYS)
                    </div>
                    <h3 style={{ margin: '4px 0 0 0', fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                      Click Any Barangay to Inspect or Simulate an Infection
                    </h3>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Showing {filteredFarms.length} of {farms.length} Barangays in Luna, La Union
                  </span>
                </div>

                <div className="luna-dir-grid">
                  {filteredFarms.map((farm) => {
                    const isSelected = selectedFarm?.id === farm.id
                    return (
                      <div
                        key={farm.id}
                        className={`luna-dir-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedFarm(farm)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#ffffff' }}>
                            {farm.barangay}
                          </span>
                          <span
                            style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              background: farm.severityColor,
                              flexShrink: 0,
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600 }}>{farm.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {farm.pigCount} Heads &bull; {farm.breedType.split('(')[0].trim()}
                        </div>
                        <div
                          style={{
                            marginTop: '4px',
                            fontSize: '10.5px',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 700,
                            color: farm.severityColor,
                          }}
                        >
                          {farm.status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* What To Do First: Single & Multi-Infection Decision Engine for Luna, La Union */}
              <div style={{ marginTop: '24px' }}>
                <InfectionDecisionEngine
                  detectedConditions={farms}
                  contextLabel="LUNA, LA UNION GIS • MULTI-INFECTION PRIORITY RESPONSE"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 3. TAB: RESPONSIBILITY CHAIN & REPORTING HIERARCHY ── */}
        {activeTab === 'roles' && (
          <section className="mk-section" style={{ paddingTop: '10px' }}>
            <div className="container-pro">
              <div
                style={{
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '30px',
                }}
              >
                <div style={{ maxWidth: '780px', marginBottom: '28px' }}>
                  <div className="mk-kicker">
                    <span className="mk-kicker-dot" />
                    <span>EPIDEMIOLOGY GOVERNANCE &bull; LUNA, LA UNION &amp; BAI PROTOCOL</span>
                  </div>
                  <h2 style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 12px 0' }}>
                    Who is Responsible for Checking and Reporting ASF Spread in Luna, La Union?
                  </h2>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    In accordance with Department of Agriculture Administrative Order No. 22 and the National <em>Bantay ASF sa Barangay (BABay ASF)</em> Program implemented in La Union,
                    disease detection, verification, and contagion containment follow a strict 5-tier chain of command:
                  </p>
                </div>

                {/* 5-Tier Governance Workflow Cards */}
                <div style={{ display: 'grid', gap: '16px' }}>
                  {ASF_GOVERNANCE_ROLES.map((tier) => (
                    <div
                      key={tier.tier}
                      style={{
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${tier.color}35`,
                        padding: '20px 24px',
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontFamily: 'JetBrains Mono',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#ffffff',
                            background: tier.color,
                            marginBottom: '8px',
                          }}
                        >
                          TIER {tier.tier} &bull; {tier.badge}
                        </span>
                        <h4 style={{ fontFamily: 'Sora', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0' }}>
                          {tier.roleTitle}
                        </h4>
                        <small style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.8rem' }}>{tier.designation}</small>
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: tier.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Core Responsibilities &amp; Verification Duties:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                          {tier.responsibilities.map((resp, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statutory Highlight Note */}
                <div
                  style={{
                    marginTop: '24px',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Award size={22} color="#f43f5e" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#ffffff' }}>Capstone Defense Key (Luna, La Union):</strong> The <strong>Municipal Agriculture Office (MAO Luna)</strong> and the <strong>Office of the Provincial Veterinarian (OPVet La Union)</strong> are the primary statutory bodies responsible for on-ground epidemiological checking and testing of whether ASF is contagious and spreading across barangays. The <strong>Bureau of Animal Industry (BAI / DA-RFO I)</strong> provides confirmatory RT-PCR diagnostics, while the <strong>Luna Backyard Farmer</strong> acts as the first observer using Pigify.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 4. TAB: SICK PIG DISINFECTION PROTOCOLS ── */}
        {activeTab === 'disinfection' && (
          <section className="mk-section" style={{ paddingTop: '10px' }}>
            <div className="container-pro">
              <div
                style={{
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '30px',
                }}
              >
                <div style={{ maxWidth: '800px', marginBottom: '28px' }}>
                  <div className="mk-kicker">
                    <span className="mk-kicker-dot" />
                    <span>CARE &amp; ISOLATION &bull; LUNA BACKYARD SWINE GUIDELINES</span>
                  </div>
                  <h2 style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 12px 0' }}>
                    What Should Be Done When a Pig Shows Signs of Illness?
                  </h2>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Immediate actions must focus on stopping disease transmission to healthy herd members, applying chemical virucidal disinfection,
                    and logging the incident with MAO Luna and OPVet La Union. Follow this standard 5-step containment protocol:
                  </p>
                </div>

                {/* Step-by-Step Cards */}
                <div style={{ display: 'grid', gap: '20px' }}>
                  {SICK_PIG_ACTION_PROTOCOL.steps.map((st) => (
                    <div
                      key={st.step}
                      style={{
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'var(--accent-rose, #f43f5e)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontFamily: 'JetBrains Mono',
                              fontSize: '13px',
                            }}
                          >
                            {st.step}
                          </span>
                          <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                            {st.title}
                          </h3>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#06b6d4', fontWeight: 700 }}>
                          {st.tag}
                        </span>
                      </div>

                      {st.agents ? (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {st.agents.map((ag, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                padding: '14px 18px',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <strong style={{ color: '#10b981', fontSize: '0.98rem' }}>{ag.name}</strong>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                                  Contact: {ag.contactTime}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.86rem', color: '#ffffff', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Mixing Ratio: </span>
                                <strong>{ag.ratio}</strong>
                              </div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '4px' }}>
                                <span>Target Diseases: </span> {ag.target}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                                {ag.instructions}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {st.actions.map((act, i) => (
                            <li key={i} style={{ marginBottom: '8px' }}>
                              {act}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 5. MAO LUNA & OPVET LA UNION INCIDENT REPORT MODAL ── */}
        {reportModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(3, 7, 18, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                background: 'var(--surface-card, #0d1320)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '30px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={22} color="#f43f5e" />
                  <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    MAO Luna &amp; OPVet La Union Incident Dispatch
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false)
                    setDispatchedConfirmation(null)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                  }}
                >
                  &#10005;
                </button>
              </div>

              {dispatchedConfirmation ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                    }}
                  >
                    <CheckCircle2 size={36} color="#10b981" />
                  </div>
                  <h4 style={{ fontFamily: 'Sora', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                    Official Incident Dispatched
                  </h4>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#06b6d4',
                      background: 'rgba(6, 182, 212, 0.1)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '16px',
                    }}
                  >
                    REF: {dispatchedConfirmation.incidentRef}
                  </div>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 20px auto' }}>
                    Your emergency notice for <strong>{reportForm.barangay}, {reportForm.municipality}, {reportForm.province}</strong> has been logged into the surveillance queue of <strong>MAO Luna</strong> and <strong>OPVet La Union</strong>.
                    A Barangay Biosecurity Officer (BBO) and municipal livestock inspector will be deployed for clinical verification.
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 700, marginBottom: '6px' }}>
                      MAO Luna &amp; OPVet La Union Emergency Hotlines:
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono', color: '#38bdf8', fontSize: '0.95rem' }}>
                      (072) 607-1124 &bull; 0917-842-5510 &bull; (072) 242-5550
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                      Reference Form: BAI Swine Disease Incident Notice (Form 1 - Region I)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReportModalOpen(false)
                      setDispatchedConfirmation(null)
                    }}
                    className="lp-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    Done &bull; Return to Luna Surveillance Map
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPvoReport} style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
                    Generate an official BAI Form 1 incident transmission directly to the <strong>Municipal Agriculture Office (MAO Luna)</strong> and <strong>OPVet La Union</strong> upon suspecting African Swine Fever (ASF) or contagious swine illness.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Farm Name / Pen Site
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.farmName}
                        onChange={(e) => setReportForm({ ...reportForm, farmName: e.target.value })}
                        placeholder="e.g. Barrientos Backyard Swine Site"
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Owner / Raiser Name
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.ownerName}
                        onChange={(e) => setReportForm({ ...reportForm, ownerName: e.target.value })}
                        placeholder="e.g. Ernesto Nisce"
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Province
                      </label>
                      <select
                        value={reportForm.province}
                        onChange={(e) => setReportForm({ ...reportForm, province: e.target.value })}
                        className="auth-text-field"
                        style={{ height: '42px' }}
                      >
                        <option value="La Union">La Union (OPVet)</option>
                        <option value="Ilocos Sur">Ilocos Sur PVO</option>
                        <option value="Pangasinan">Pangasinan PVO</option>
                        <option value="Laguna">Laguna PVO</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Municipality
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.municipality}
                        onChange={(e) => setReportForm({ ...reportForm, municipality: e.target.value })}
                        placeholder="Luna"
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Barangay in Luna
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.barangay}
                        onChange={(e) => setReportForm({ ...reportForm, barangay: e.target.value })}
                        placeholder="e.g. Barangay Barrientos"
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Swine Breed Category
                      </label>
                      <select
                        value={reportForm.pigBreed}
                        onChange={(e) => setReportForm({ ...reportForm, pigBreed: e.target.value })}
                        className="auth-text-field"
                        style={{ height: '42px' }}
                      >
                        <option value="Philippine Native Pig (Baboy Katutubo)">Philippine Native Pig (Baboy Katutubo)</option>
                        <option value="Commercial White (Landrace / Yorkshire)">Commercial White (Landrace / Yorkshire)</option>
                        <option value="Crossbreed (Duroc x Landrace)">Crossbreed (Duroc x Landrace)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.contactNumber}
                        onChange={(e) => setReportForm({ ...reportForm, contactNumber: e.target.value })}
                        placeholder="e.g. 0917-555-0192"
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Total Herd
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={reportForm.herdTotal}
                        onChange={(e) => setReportForm({ ...reportForm, herdTotal: e.target.value })}
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Sick Pigs
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={reportForm.affectedCount}
                        onChange={(e) => setReportForm({ ...reportForm, affectedCount: e.target.value })}
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Dead Pigs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.mortalityCount}
                        onChange={(e) => setReportForm({ ...reportForm, mortalityCount: e.target.value })}
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                      Clinical Symptoms Observed
                    </label>
                    <textarea
                      rows={2}
                      value={reportForm.symptoms}
                      onChange={(e) => setReportForm({ ...reportForm, symptoms: e.target.value })}
                      placeholder="e.g. High fever >41°C, cyanotic purple skin on ears/belly, diamond plaques, anorexia"
                      className="auth-text-field"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      className="lp-btn-secondary"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReport}
                      className="lp-btn-primary"
                      style={{
                        flex: 2,
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                      }}
                    >
                      {submittingReport ? (
                        <>
                          <RefreshCw size={16} className="pigify-spin" />
                          <span>Transmitting to MAO Luna &amp; OPVet…</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Dispatch Official Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="lp-footer" style={{ marginTop: '40px' }}>
        <div className="container-pro" style={{ textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main, #ffffff)', marginBottom: '6px' }}>{BRAND_NAME}</div>
          <div style={{ fontSize: '0.85rem' }}>
            Luna, La Union Swine Disease Surveillance &bull; MAO Luna &amp; OPVet La Union Incident Dispatcher &bull; BABay ASF
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DiseaseMap
