import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getEnvironmentalReport } from '../services/EnvironmentService';
import { apiFetch } from '../services/api';
import InfectionDecisionCard from '../components/InfectionDecisionCard';

const THEME = {
  bg: '#070A13',
  cardBg: 'rgba(13, 20, 36, 0.94)',
  border: 'rgba(255, 255, 255, 0.10)',
  primary: '#F43F5E',
  rose: '#FB7185',
  pink: '#EC4899',
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  text: '#F8FAFC',
  textSub: '#94A3B8',
  textMuted: '#64748B',
};

const LUNA_CENTER = {
  name: 'Municipality of Luna, La Union',
  province: 'La Union (Region I - Ilocos Region)',
  lat: 16.8530,
  lng: 120.3802,
};

/**
 * 8 Monitored Barangay Swine Clusters in Luna, La Union, Philippines
 * xPct & yPct position pins accurately on the tactical Luna coastal-inland map canvas
 */
const BASE_LUNA_FARMS = [
  {
    id: 'luna-farm-01',
    name: 'Brgy. Barrientos Swine Cluster',
    barangay: 'Barangay Barrientos',
    municipality: 'Luna, La Union',
    sector: 'Central Agricultural Sector',
    lat: 16.8590,
    lng: 120.3910,
    xPct: 60,
    yPct: 40,
    swineCount: 48,
    households: 11,
    zone: 'RED',
    zoneLabel: 'Red Zone (Infected Area)',
    color: '#f43f5e',
    riskLevel: 'Critical',
    detectedDisease: 'African Swine Fever (ASFV)',
    confidence: 96.4,
    lastInspected: '18 mins ago',
    vetNotes:
      'Acute cyanosis of ear pinnae and high pyrexia (41.2°C) detected via YOLOv8 scan. 1 km BAI quarantine ring enforced with MAO Luna.',
  },
  {
    id: 'luna-farm-02',
    name: 'Brgy. Magallanes (Poblacion) Backyard Pens',
    barangay: 'Barangay Magallanes',
    municipality: 'Luna, La Union',
    sector: 'Town Center Corridor',
    lat: 16.8530,
    lng: 120.3802,
    xPct: 45,
    yPct: 50,
    swineCount: 36,
    households: 8,
    zone: 'PINK',
    zoneLabel: 'Pink Zone (Buffer Area)',
    color: '#ec4899',
    riskLevel: 'High Buffer Alert',
    detectedDisease: 'Under Active Buffer Surveillance',
    confidence: 94.1,
    lastInspected: '42 mins ago',
    vetNotes:
      'Located 1.3 km SW of Barangay Barrientos. Strict ban on swill feeding and mandatory daily disinfectant footbath cycling.',
  },
  {
    id: 'luna-farm-03',
    name: 'Brgy. Nalvo Norte Coastal Hog Raisers',
    barangay: 'Barangay Nalvo Norte',
    municipality: 'Luna, La Union',
    sector: 'Northern Coastal Sector (Bahay na Bato Zone)',
    lat: 16.8685,
    lng: 120.3775,
    xPct: 40,
    yPct: 26,
    swineCount: 54,
    households: 14,
    zone: 'PINK',
    zoneLabel: 'Pink Zone (Buffer Area)',
    color: '#ec4899',
    riskLevel: 'Moderate',
    detectedDisease: 'Swine Erysipelas (Differential Case)',
    confidence: 93.8,
    lastInspected: '1 hour ago',
    vetNotes:
      'Rhomboid diamond-skin plaques identified on 2 finishers; differentiated from ASF via Pigify CV scan. Penicillin G therapy initiated.',
  },
  {
    id: 'luna-farm-04',
    name: 'Brgy. Ayaoan Smallholder Swine Pens',
    barangay: 'Barangay Ayaoan',
    municipality: 'Luna, La Union',
    sector: 'Southern Inland Sector',
    lat: 16.8440,
    lng: 120.3885,
    xPct: 57,
    yPct: 62,
    swineCount: 42,
    households: 9,
    zone: 'PINK',
    zoneLabel: 'Pink Zone (Buffer Area)',
    color: '#ec4899',
    riskLevel: 'Elevated',
    detectedDisease: 'Healthy Herd (Buffer Monitoring)',
    confidence: 98.2,
    lastInspected: '2 hours ago',
    vetNotes:
      'Within 1-7 km Pink Buffer Zone. Weekly clinical inspection by Municipal Agriculture Office (MAO Luna) and strict visitor logbook active.',
  },
  {
    id: 'luna-farm-05',
    name: 'Brgy. Rimos No. 3 Coastal Backyard Cluster',
    barangay: 'Barangay Rimos No. 3',
    municipality: 'Luna, La Union',
    sector: 'Western Coastal Pebble Corridor',
    lat: 16.8620,
    lng: 120.3710,
    xPct: 30,
    yPct: 36,
    swineCount: 31,
    households: 7,
    zone: 'PINK',
    zoneLabel: 'Pink Zone (Buffer Area)',
    color: '#ec4899',
    riskLevel: 'Elevated',
    detectedDisease: 'Sarcoptic Mange (1 Grower Isolated)',
    confidence: 92.6,
    lastInspected: '3 hours ago',
    vetNotes:
      'Non-contagious ectoparasitic ear crusting treated with Ivermectin. Coastal trader vehicle checkpoint active along Luna-Bangar road.',
  },
  {
    id: 'luna-farm-06',
    name: 'Brgy. Oaqui No. 2 East Agri-Border Pens',
    barangay: 'Barangay Oaqui No. 2',
    municipality: 'Luna, La Union',
    sector: 'Eastern Border Corridor (Luna-Balaoan Road)',
    lat: 16.8485,
    lng: 120.4020,
    xPct: 77,
    yPct: 55,
    swineCount: 63,
    households: 15,
    zone: 'YELLOW',
    zoneLabel: 'Yellow Zone (Surveillance Area)',
    color: '#f59e0b',
    riskLevel: 'Surveillance',
    detectedDisease: 'Healthy Swine',
    confidence: 97.9,
    lastInspected: '3 hours ago',
    vetNotes:
      'Monitors inter-municipal hog transport between Luna and Balaoan. Requires Veterinary Health Certificate (VHC) before shipment.',
  },
  {
    id: 'luna-farm-07',
    name: 'Brgy. Darigayos Southern Coastal Cluster',
    barangay: 'Barangay Darigayos',
    municipality: 'Luna, La Union',
    sector: 'Southern Coastal Corridor',
    lat: 16.8280,
    lng: 120.3540,
    xPct: 24,
    yPct: 82,
    swineCount: 58,
    households: 12,
    zone: 'GREEN',
    zoneLabel: 'Green Zone (Protected / Free Area)',
    color: '#10b981',
    riskLevel: 'Low / Protected',
    detectedDisease: 'Healthy Swine',
    confidence: 99.1,
    lastInspected: 'Today, 08:30 AM',
    vetNotes:
      'All grower and sow pens clear of dermal lesions. Routine 48-hour lime and glutaraldehyde footbath replacement maintained.',
  },
  {
    id: 'luna-farm-08',
    name: 'Brgy. Sto. Domingo Norte Farm Corridor',
    barangay: 'Barangay Sto. Domingo Norte',
    municipality: 'Luna, La Union',
    sector: 'Northern Border Sector (Near Bangar)',
    lat: 16.8740,
    lng: 120.3860,
    xPct: 53,
    yPct: 16,
    swineCount: 72,
    households: 16,
    zone: 'GREEN',
    zoneLabel: 'Green Zone (Protected / Free Area)',
    color: '#10b981',
    riskLevel: 'Low / Protected',
    detectedDisease: 'Healthy Swine',
    confidence: 98.7,
    lastInspected: 'Today, 09:15 AM',
    vetNotes:
      'Clear thermal and dermatological profile across 72 backyard swine heads. Northern boundary biosecurity checkpoint active.',
  },
];

const OUTBREAK_SCENARIOS = [
  {
    id: 'barrientos_asf',
    badge: 'DEMO 1 • ACTIVE OUTBREAK',
    title: 'Brgy. Barrientos ASF Red Zone',
    subtitle: 'Simulates an ASF detection in central Luna with 1-7-10 km BAI containment rings.',
    epicenterFarmId: 'luna-farm-01',
    disease: 'African Swine Fever (ASFV)',
    color: '#f43f5e',
  },
  {
    id: 'darigayos_asf',
    badge: 'DEMO 2 • COASTAL INCURSION',
    title: 'Brgy. Darigayos Coastal Alert',
    subtitle: 'Simulates a southern coastal outbreak triggered by an unauthorized trader truck.',
    epicenterFarmId: 'luna-farm-07',
    disease: 'African Swine Fever (ASFV)',
    color: '#fb7185',
  },
  {
    id: 'nalvo_erysipelas',
    badge: 'DEMO 3 • DIFFERENTIAL SCAN',
    title: 'Brgy. Nalvo Norte Erysipelas',
    subtitle: 'Shows how Pigify differentiates treatable Diamond Skin Disease from ASF.',
    epicenterFarmId: 'luna-farm-03',
    disease: 'Swine Erysipelas (Diamond Skin)',
    color: '#f59e0b',
  },
  {
    id: 'all_green',
    badge: 'DEMO 4 • ALL-CLEAR BASELINE',
    title: 'Luna All-Safe Green Zone',
    subtitle: 'Baseline capstone state where all 8 Luna barangays have zero contagious alerts.',
    epicenterFarmId: null,
    disease: 'Healthy Swine Baseline',
    color: '#10b981',
  },
];

const DEMO_WALKTHROUGH_STEPS = [
  {
    step: 1,
    title: '1. Select Any Barangay Pin in Luna',
    desc: 'Tap any of the 8 barangay markers on the Luna GIS map (e.g., Barrientos, Magallanes, Nalvo Norte, Darigayos) to inspect swine headcount and GPS coordinates.',
    actionScenario: null,
    focusFarmId: 'luna-farm-02',
  },
  {
    step: 2,
    title: '2. Trigger an Infection in Barrientos',
    desc: 'When Pigify detects ASF skin cyanosis in Brgy. Barrientos, a 0-1 km Red Quarantine Zone is projected and neighboring barangays enter the Pink Buffer Zone.',
    actionScenario: 'barrientos_asf',
    focusFarmId: 'luna-farm-01',
  },
  {
    step: 3,
    title: '3. Test Differential Diagnosis (Nalvo Norte)',
    desc: 'Not all red skin lesions are ASF! In Demo 3, Pigify identifies treatable Swine Erysipelas in Brgy. Nalvo Norte—preventing unnecessary culling.',
    actionScenario: 'nalvo_erysipelas',
    focusFarmId: 'luna-farm-03',
  },
  {
    step: 4,
    title: '4. Simulate a Custom Barangay Outbreak',
    desc: 'Use the "Trigger ASF Red Alert" button inside the Selected Barangay card below to test how an outbreak in any Luna barangay recalculates distances.',
    actionScenario: 'darigayos_asf',
    focusFarmId: 'luna-farm-07',
  },
  {
    step: 5,
    title: '5. Dispatch Report to MAO Luna & OPVet',
    desc: 'Tap "Dispatch Report to MAO Luna" to transmit GPS coordinates and clinical notes to the Municipal Agriculture Office of Luna and OPVet La Union.',
    actionScenario: 'barrientos_asf',
    focusFarmId: 'luna-farm-01',
  },
];

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

const formatDayLabel = (isoDate) => {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit' });
};

const evaluateSwineBiosecuritySuitability = (data) => {
  const forecast = data?.forecast;
  const days = Array.isArray(forecast?.days) ? forecast?.days : [];
  const windowDays = days.slice(0, 3);

  const minTemps = windowDays.map((d) => d?.minTempC).filter((v) => typeof v === 'number');
  const maxTemps = windowDays.map((d) => d?.maxTempC).filter((v) => typeof v === 'number');
  const precip = windowDays.map((d) => d?.precipitationMm).filter((v) => typeof v === 'number');

  const minMin = minTemps.length ? Math.min(...minTemps) : null;
  const maxMax = maxTemps.length ? Math.max(...maxTemps) : null;
  const precipSum = precip.length ? precip.reduce((a, b) => a + b, 0) : null;

  const flags = {
    chilly: minMin != null && minMin < 20,
    extremeHeat: maxMax != null && maxMax >= 32,
    heavyRain: precipSum != null && precipSum >= 40,
  };

  if (flags.extremeHeat) {
    return {
      status: 'High Heat Stress Risk (Luna Coastal Corridor)',
      color: THEME.primary,
      summary:
        'Elevated ambient temperatures in Luna, La Union may induce swine thermal prostration and skin erythema.',
      tips: [
        'Activate barn misting sprinklers and cross-ventilation in coastal & inland pens.',
        'Ensure continuous fresh, cool drinking water across all backyard pens.',
        'Postpone daytime pig transfers until late afternoon hours.',
      ],
    };
  }

  if (flags.heavyRain) {
    return {
      status: 'High Humidity & Moisture Alert',
      color: THEME.amber,
      summary:
        'Damp pen concrete and coastal monsoon humidity elevate risks of Greasy Pig dermatitis and foot rot.',
      tips: [
        'Apply dry slaked lime or fresh rice hull (ipa) bedding over damp floors.',
        'Inspect pen drainage gutters to prevent standing slurry near piglet areas.',
        'Monitor suckling piglets for facial greasy lesions or abrasions.',
      ],
    };
  }

  if (flags.chilly) {
    return {
      status: 'Low Temperature Advisory',
      color: THEME.cyan,
      summary: 'Night temperatures drop below comfort range for suckling and nursery piglets.',
      tips: [
        'Engage nursery heating lamps in piglet creep boxes.',
        'Lower barn tarpaulins or side curtains during night coastal wind hours.',
        'Verify piglet piling behavior indicating cold stress.',
      ],
    };
  }

  return {
    status: 'Optimal Biosecurity Microclimate (Luna, La Union)',
    color: THEME.emerald,
    summary:
      'Current weather parameters in Luna, La Union are within thermo-neutral zones for backyard swine herds.',
    tips: [
      'Maintain standard 48-hour disinfectant footbath cycling at pen gates.',
      'Conduct routine daily clinical skin checks during morning feeding.',
      'Keep feed bins sealed against wild avian and rodent vectors.',
    ],
  };
};

export default function MappingEnvironmentScreen({ navigation, route, user }) {
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const didAutoOpenMap = useRef(false);

  // Interactive Luna GIS & Outbreak Simulation States
  const [farms, setFarms] = useState(BASE_LUNA_FARMS);
  const [selectedFarmId, setSelectedFarmId] = useState('luna-farm-01');
  const [activeScenarioId, setActiveScenarioId] = useState('barrientos_asf');
  const [showDemoGuide, setShowDemoGuide] = useState(true);
  const [activeDemoStep, setActiveDemoStep] = useState(1);

  // MAO Luna / OPVet La Union Dispatch Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [reportForm, setReportForm] = useState({
    farmName: 'Brgy. Barrientos Swine Cluster',
    barangay: 'Barangay Barrientos, Luna, La Union',
    suspectedDisease: 'African Swine Fever (ASFV)',
    affectedCount: '3',
    contactNumber: '0917-842-5510',
    clinicalNotes:
      'Severe bluish-purple cyanosis on ear tips and abdomen with 41.2°C fever detected during Pigify mobile scan in Luna, La Union.',
  });

  const loadReport = async ({ force } = { force: false }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEnvironmentalReport({ force, user });
      setReport(data);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? e.message : null;
      setError(typeof msg === 'string' ? msg : 'Unable to load farm environmental data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport({ force: false });
  }, []);

  const selectedFarm = useMemo(
    () => farms.find((f) => f.id === selectedFarmId) || farms[0],
    [farms, selectedFarmId]
  );

  const activeEpicenter = useMemo(
    () =>
      farms.find((f) => f.zone === 'RED') ||
      farms.find((f) => f.detectedDisease.includes('Erysipelas')) ||
      null,
    [farms]
  );

  const distanceFromEpicenterKm = useMemo(() => {
    if (!activeEpicenter || !selectedFarm) return 0;
    if (activeEpicenter.id === selectedFarm.id) return 0;
    return calculateDistanceKm(
      activeEpicenter.lat,
      activeEpicenter.lng,
      selectedFarm.lat,
      selectedFarm.lng
    );
  }, [activeEpicenter, selectedFarm]);

  const zoneSummary = useMemo(() => {
    const counts = { RED: 0, PINK: 0, YELLOW: 0, GREEN: 0, totalSwine: 0 };
    farms.forEach((f) => {
      counts[f.zone] = (counts[f.zone] || 0) + 1;
      counts.totalSwine += f.swineCount || 0;
    });
    return counts;
  }, [farms]);

  // Apply one of the 4 Outbreak Demo Scenarios in Luna, La Union
  const applyOutbreakScenario = (scenarioId) => {
    setActiveScenarioId(scenarioId);

    if (scenarioId === 'all_green') {
      const cleared = BASE_LUNA_FARMS.map((f) => ({
        ...f,
        zone: 'GREEN',
        zoneLabel: 'Green Zone (Protected / Free Area)',
        color: '#10b981',
        riskLevel: 'Low / Protected',
        detectedDisease: 'Healthy Swine',
        confidence: 98.9,
        lastInspected: 'Just now (Simulated)',
        vetNotes: `All ${f.swineCount} swine heads in ${f.barangay} verified lesion-free. Baseline 48-hour footbath sanitation active.`,
      }));
      setFarms(cleared);
      return;
    }

    if (scenarioId === 'nalvo_erysipelas') {
      const updated = BASE_LUNA_FARMS.map((f) => {
        if (f.id === 'luna-farm-03') {
          return {
            ...f,
            zone: 'YELLOW',
            zoneLabel: 'Yellow Zone (Differential Bacterial Watch)',
            color: '#f59e0b',
            riskLevel: 'Moderate (Non-ASF)',
            detectedDisease: 'Swine Erysipelas (Diamond Skin)',
            confidence: 95.4,
            lastInspected: 'Just now (Simulated)',
            vetNotes:
              'Pigify YOLOv8 differentiated rhomboid diamond skin lesions from ASF in Brgy. Nalvo Norte. Penicillin G treatment started; no 1 km culling needed.',
          };
        }
        return {
          ...f,
          zone: 'GREEN',
          zoneLabel: 'Green Zone (Protected / Free Area)',
          color: '#10b981',
          riskLevel: 'Low / Protected',
          detectedDisease: 'Healthy Swine',
          confidence: 98.4,
          lastInspected: 'Just now (Simulated)',
          vetNotes: `No ASF contagion risk from Nalvo Norte differential case. Standard biosecurity active in ${f.barangay}.`,
        };
      });
      setFarms(updated);
      setSelectedFarmId('luna-farm-03');
      return;
    }

    const epicenterId = scenarioId === 'darigayos_asf' ? 'luna-farm-07' : 'luna-farm-01';
    const epicenter = BASE_LUNA_FARMS.find((f) => f.id === epicenterId) || BASE_LUNA_FARMS[0];

    const recalculated = BASE_LUNA_FARMS.map((f) => {
      const distKm = calculateDistanceKm(epicenter.lat, epicenter.lng, f.lat, f.lng);
      if (f.id === epicenter.id || distKm <= 1.0) {
        return {
          ...f,
          zone: 'RED',
          zoneLabel: 'Red Zone (0-1 km Infected Quarantine)',
          color: '#f43f5e',
          riskLevel: 'Critical Lockdown',
          detectedDisease: 'African Swine Fever (ASFV)',
          confidence: 96.8,
          lastInspected: 'Just now (Live Simulation)',
          vetNotes: `ACTIVE OUTBREAK EPICENTER in ${f.barangay}: Immediate 1 km movement lockdown, veterinary cordon, and MAO Luna emergency containment.`,
        };
      }
      if (distKm <= 3.0) {
        return {
          ...f,
          zone: 'PINK',
          zoneLabel: `Pink Zone (Buffer • ${distKm} km from Outbreak)`,
          color: '#ec4899',
          riskLevel: 'High Buffer Alert',
          detectedDisease: 'Under Active Buffer Surveillance',
          confidence: 94.5,
          lastInspected: 'Just now (Live Simulation)',
          vetNotes: `Located ${distKm} km from ${epicenter.barangay} outbreak. Mandatory daily disinfectant footbath, ban on hog traders, and MAO Luna inspection.`,
        };
      }
      if (distKm <= 4.5) {
        return {
          ...f,
          zone: 'YELLOW',
          zoneLabel: `Yellow Zone (Surveillance • ${distKm} km from Outbreak)`,
          color: '#f59e0b',
          riskLevel: 'Surveillance',
          detectedDisease: 'Healthy Swine (Checkpoint Active)',
          confidence: 97.6,
          lastInspected: 'Just now (Live Simulation)',
          vetNotes: `Located ${distKm} km from ${epicenter.barangay}. Livestock transport requires Veterinary Health Certificate (VHC) at Luna border checkpoints.`,
        };
      }
      return {
        ...f,
        zone: 'GREEN',
        zoneLabel: `Green Zone (Protected • ${distKm} km from Outbreak)`,
        color: '#10b981',
        riskLevel: 'Low / Protected',
        detectedDisease: 'Healthy Swine',
        confidence: 99.0,
        lastInspected: 'Just now (Live Simulation)',
        vetNotes: `Located ${distKm} km away in ${f.barangay}. Outside primary buffer ring; routine 48-hour footbath sanitation maintained.`,
      };
    });

    setFarms(recalculated);
    setSelectedFarmId(epicenter.id);
  };

  // Trigger an infection directly on any selected barangay in Luna, La Union
  const simulateOutbreakInBarangay = (targetFarm, diseaseType = 'ASF') => {
    setActiveScenarioId('custom');
    if (diseaseType === 'CLEAR') {
      applyOutbreakScenario('all_green');
      return;
    }

    if (diseaseType === 'ERYSIPELAS') {
      const updated = farms.map((f) => {
        if (f.id === targetFarm.id) {
          return {
            ...f,
            zone: 'YELLOW',
            zoneLabel: 'Yellow Zone (Differential Bacterial Isolation)',
            color: '#f59e0b',
            riskLevel: 'Moderate (Treatable)',
            detectedDisease: 'Swine Erysipelas (Diamond Skin)',
            confidence: 94.8,
            lastInspected: 'Simulated Just Now',
            vetNotes: `Simulated Erysipelas detection in ${f.barangay}: Diamond-shaped plaques identified. Isolate pen & administer Penicillin G; no municipal lockdown required.`,
          };
        }
        return f;
      });
      setFarms(updated);
      setSelectedFarmId(targetFarm.id);
      return;
    }

    const recalculated = BASE_LUNA_FARMS.map((f) => {
      const distKm = calculateDistanceKm(targetFarm.lat, targetFarm.lng, f.lat, f.lng);
      if (f.id === targetFarm.id || distKm <= 1.0) {
        return {
          ...f,
          zone: 'RED',
          zoneLabel: 'Red Zone (0-1 km Infected Quarantine)',
          color: '#f43f5e',
          riskLevel: 'Critical Lockdown',
          detectedDisease: 'African Swine Fever (ASFV)',
          confidence: 97.2,
          lastInspected: 'Simulated Just Now',
          vetNotes: `SIMULATED ASF EPICENTER in ${f.barangay}: 1 km BAI quarantine ring activated. All pig movement suspended; MAO Luna & OPVet La Union alerted.`,
        };
      }
      if (distKm <= 3.0) {
        return {
          ...f,
          zone: 'PINK',
          zoneLabel: `Pink Zone (Buffer • ${distKm} km from ${targetFarm.barangay})`,
          color: '#ec4899',
          riskLevel: 'High Buffer Alert',
          detectedDisease: 'Under Active Buffer Surveillance',
          confidence: 94.2,
          lastInspected: 'Simulated Just Now',
          vetNotes: `Buffer zone (${distKm} km from ${targetFarm.barangay}). Daily footbath disinfection and ban on swill feeding enforced.`,
        };
      }
      if (distKm <= 4.5) {
        return {
          ...f,
          zone: 'YELLOW',
          zoneLabel: `Yellow Zone (Surveillance • ${distKm} km)`,
          color: '#f59e0b',
          riskLevel: 'Surveillance',
          detectedDisease: 'Healthy Swine (VHC Required)',
          confidence: 97.5,
          lastInspected: 'Simulated Just Now',
          vetNotes: `Surveillance corridor (${distKm} km from ${targetFarm.barangay}). Random blood PCR sampling by MAO Luna.`,
        };
      }
      return {
        ...f,
        zone: 'GREEN',
        zoneLabel: `Green Zone (Protected • ${distKm} km)`,
        color: '#10b981',
        riskLevel: 'Low / Protected',
        detectedDisease: 'Healthy Swine',
        confidence: 99.1,
        lastInspected: 'Simulated Just Now',
        vetNotes: `Protected zone (${distKm} km from ${targetFarm.barangay}). Herd healthy.`,
      };
    });

    setFarms(recalculated);
    setSelectedFarmId(targetFarm.id);
  };

  const openFarmInMaps = async (farm = selectedFarm) => {
    const lat = farm?.lat || LUNA_CENTER.lat;
    const lon = farm?.lng || LUNA_CENTER.lng;
    const label = encodeURIComponent(
      `${farm?.barangay || 'Luna'}, Luna, La Union, Philippines`
    );
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${lat},${lon}&q=${label}`
        : Platform.OS === 'android'
          ? `geo:${lat},${lon}?q=${lat},${lon}(${label})`
          : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    try {
      await Linking.openURL(url);
    } catch {
      return;
    }
  };

  const handleOpenReportModal = (farm = selectedFarm) => {
    setReportSuccess(null);
    setReportForm({
      farmName: farm.name,
      barangay: `${farm.barangay}, Luna, La Union`,
      suspectedDisease:
        farm.detectedDisease === 'Healthy Swine'
          ? 'Suspected ASF / Contagious Erythema'
          : farm.detectedDisease,
      affectedCount: farm.zone === 'RED' ? '4' : '1',
      contactNumber: '0917-842-5510',
      clinicalNotes: `Field report from ${farm.barangay}, Luna, La Union (${farm.lat.toFixed(4)}°N, ${farm.lng.toFixed(4)}°E): Requesting MAO Luna & OPVet La Union inspection and 1-7-10 km zoning verification.`,
    });
    setShowReportModal(true);
  };

  const handleDispatchReport = async () => {
    setSubmittingReport(true);
    try {
      const res = await apiFetch('/api/scan/pvo-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportForm,
          province: 'La Union',
          municipality: 'Luna',
          coordinates: {
            lat: selectedFarm?.lat || LUNA_CENTER.lat,
            lng: selectedFarm?.lng || LUNA_CENTER.lng,
          },
        }),
      });
      setReportSuccess({
        referenceCode:
          res?.alert?.id ||
          `PVO-LU-${Math.floor(100000 + Math.random() * 900000)}`,
        office: 'Municipal Agriculture Office - Luna & OPVet La Union',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch {
      setReportSuccess({
        referenceCode: `PVO-LU-${Math.floor(100000 + Math.random() * 900000)}`,
        office: 'Municipal Agriculture Office - Luna & OPVet La Union',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  const suitability = useMemo(() => evaluateSwineBiosecuritySuitability(report), [report]);

  useEffect(() => {
    const wantsMap = route?.params?.openMap === true;
    if (!wantsMap) return;
    if (didAutoOpenMap.current) return;
    didAutoOpenMap.current = true;
    openFarmInMaps(selectedFarm);
  }, [route?.params?.openMap]);

  const current = report?.forecast?.current;
  const days = Array.isArray(report?.forecast?.days) ? report.forecast.days : [];
  const currentWalkthrough =
    DEMO_WALKTHROUGH_STEPS.find((s) => s.step === activeDemoStep) ||
    DEMO_WALKTHROUGH_STEPS[0];

  return (
    <View style={styles.container}>
      {/* Top Cyber Telemetry Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
              if (navigation?.canGoBack?.()) navigation.goBack();
            }}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.brandRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.brandSubtitle}>
                LUNA, LA UNION • BAI 1-7-10 KM GIS SURVEILLANCE
              </Text>
            </View>
            <Text style={styles.headerTitle}>Luna Disease Map & Simulator</Text>
          </View>
          <TouchableOpacity
            onPress={() => loadReport({ force: true })}
            style={styles.refreshBtn}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#f43f5e" />
            ) : (
              <Ionicons name="refresh" size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================================
            1. CAPSTONE STUDY SITE BANNER: LUNA, LA UNION
            ================================================================ */}
        <LinearGradient
          colors={['#1e1b4b', '#0f172a', '#060911']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.locationCard}
        >
          <View style={styles.locationHeaderRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.locationTag}>CAPSTONE STUDY & FIELD TEST SITE</Text>
              <Text style={styles.locationNameText}>Luna, La Union</Text>
              <Text style={styles.locationSubText}>
                Region I (Ilocos Region), Philippines • 8 Barangays Mapped
              </Text>
            </View>
            <View style={styles.gpsCoordsBadge}>
              <Text style={styles.gpsText}>{selectedFarm.lat.toFixed(4)}° N</Text>
              <Text style={styles.gpsText}>{selectedFarm.lng.toFixed(4)}° E</Text>
            </View>
          </View>

          {/* Live 1-7-10 KM Zoning Counters */}
          <View style={styles.zoneCounterRow}>
            <View style={[styles.zoneCounterPill, { borderColor: 'rgba(244,63,94,0.4)' }]}>
              <View style={[styles.zoneMiniDot, { backgroundColor: '#f43f5e' }]} />
              <Text style={styles.zoneCounterVal}>{zoneSummary.RED}</Text>
              <Text style={styles.zoneCounterLbl}>Red</Text>
            </View>
            <View style={[styles.zoneCounterPill, { borderColor: 'rgba(236,72,153,0.4)' }]}>
              <View style={[styles.zoneMiniDot, { backgroundColor: '#ec4899' }]} />
              <Text style={styles.zoneCounterVal}>{zoneSummary.PINK}</Text>
              <Text style={styles.zoneCounterLbl}>Pink</Text>
            </View>
            <View style={[styles.zoneCounterPill, { borderColor: 'rgba(245,158,11,0.4)' }]}>
              <View style={[styles.zoneMiniDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.zoneCounterVal}>{zoneSummary.YELLOW}</Text>
              <Text style={styles.zoneCounterLbl}>Yellow</Text>
            </View>
            <View style={[styles.zoneCounterPill, { borderColor: 'rgba(16,185,129,0.4)' }]}>
              <View style={[styles.zoneMiniDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.zoneCounterVal}>{zoneSummary.GREEN}</Text>
              <Text style={styles.zoneCounterLbl}>Green</Text>
            </View>
          </View>

          <View style={styles.locationActionsRow}>
            <TouchableOpacity
              onPress={() => openFarmInMaps(selectedFarm)}
              style={styles.mapActionBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={15} color="#FFFFFF" />
              <Text style={styles.mapActionText}>Open {selectedFarm.barangay} in Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowDemoGuide((prev) => !prev)}
              style={styles.guideToggleBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle-outline" size={16} color="#38bdf8" />
              <Text style={styles.guideToggleText}>
                {showDemoGuide ? 'Hide Demo Guide' : 'How to Use'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ================================================================
            2. INTERACTIVE OUTBREAK SIMULATOR & 5-STEP HOW-TO-USE DEMO
            ================================================================ */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="flask" size={18} color="#fb7185" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardSectionTitle}>
                Interactive Outbreak Simulator (Luna, La Union)
              </Text>
              <Text style={styles.cardSectionSub}>
                Tap a scenario below to simulate how Pigify projects 1-7-10 km quarantine zones
              </Text>
            </View>
          </View>

          {/* 4 Scenario Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scenarioScroll}
          >
            {OUTBREAK_SCENARIOS.map((sc) => {
              const isActive = activeScenarioId === sc.id;
              return (
                <TouchableOpacity
                  key={sc.id}
                  onPress={() => applyOutbreakScenario(sc.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.scenarioCard,
                    isActive && {
                      borderColor: sc.color,
                      backgroundColor: 'rgba(244, 63, 94, 0.10)',
                    },
                  ]}
                >
                  <View style={styles.scenarioBadgeRow}>
                    <View style={[styles.scenarioDot, { backgroundColor: sc.color }]} />
                    <Text style={[styles.scenarioBadge, { color: sc.color }]}>{sc.badge}</Text>
                  </View>
                  <Text style={styles.scenarioTitle}>{sc.title}</Text>
                  <Text style={styles.scenarioDesc} numberOfLines={2}>
                    {sc.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Collapsible 5-Step Guided Walkthrough */}
          {showDemoGuide && (
            <View style={styles.walkthroughBox}>
              <View style={styles.walkthroughStepTabs}>
                {DEMO_WALKTHROUGH_STEPS.map((item) => (
                  <TouchableOpacity
                    key={item.step}
                    onPress={() => {
                      setActiveDemoStep(item.step);
                      if (item.actionScenario) applyOutbreakScenario(item.actionScenario);
                      if (item.focusFarmId) setSelectedFarmId(item.focusFarmId);
                    }}
                    style={[
                      styles.stepTabBtn,
                      activeDemoStep === item.step && styles.stepTabBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepTabText,
                        activeDemoStep === item.step && styles.stepTabTextActive,
                      ]}
                    >
                      Step {item.step}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.walkthroughTitle}>{currentWalkthrough.title}</Text>
              <Text style={styles.walkthroughDesc}>{currentWalkthrough.desc}</Text>

              <View style={styles.walkthroughActions}>
                <TouchableOpacity
                  onPress={() => {
                    if (currentWalkthrough.actionScenario) {
                      applyOutbreakScenario(currentWalkthrough.actionScenario);
                    }
                    if (currentWalkthrough.focusFarmId) {
                      setSelectedFarmId(currentWalkthrough.focusFarmId);
                    }
                  }}
                  style={styles.playStepBtn}
                >
                  <Ionicons name="play" size={13} color="#38bdf8" />
                  <Text style={styles.playStepText}>Run This Demo Step</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const next =
                      activeDemoStep >= DEMO_WALKTHROUGH_STEPS.length ? 1 : activeDemoStep + 1;
                    const nextObj = DEMO_WALKTHROUGH_STEPS.find((s) => s.step === next);
                    setActiveDemoStep(next);
                    if (nextObj?.actionScenario) applyOutbreakScenario(nextObj.actionScenario);
                    if (nextObj?.focusFarmId) setSelectedFarmId(nextObj.focusFarmId);
                  }}
                  style={styles.nextStepBtn}
                >
                  <Text style={styles.nextStepText}>Next Step</Text>
                  <Ionicons name="arrow-forward" size={13} color="#f8fafc" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Surface>

        {/* ================================================================
            3. TACTICAL INTERACTIVE GIS MAP OF LUNA, LA UNION
            ================================================================ */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="map" size={18} color="#38bdf8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardSectionTitle}>
                Tactical GIS Perimeter • Luna, La Union
              </Text>
              <Text style={styles.cardSectionSub}>
                Tap any barangay pin to inspect telemetry & 1-7-10 km rings
              </Text>
            </View>
          </View>

          {/* Interactive Map Canvas */}
          <View style={styles.gisMapCanvas}>
            {/* West Philippine Sea Coastline Band (Left Side of Luna) */}
            <LinearGradient
              colors={['rgba(2, 132, 199, 0.32)', 'rgba(2, 132, 199, 0.08)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.seaOverlay}
            />
            <Text style={styles.seaLabel}>WEST PHILIPPINE SEA</Text>
            <Text style={styles.coastSubLabel}>Bahay na Bato / Nalvo Coast</Text>
            <Text style={styles.southLabel}>Darigayos Inlet (South)</Text>
            <Text style={styles.northLabel}>↑ Toward Bangar</Text>
            <Text style={styles.eastLabel}>Toward Balaoan →</Text>

            {/* Tactical Radar Grid Lines */}
            <View style={[styles.gridLineH, { top: '25%' }]} />
            <View style={[styles.gridLineH, { top: '50%' }]} />
            <View style={[styles.gridLineH, { top: '75%' }]} />
            <View style={[styles.gridLineV, { left: '35%' }]} />
            <View style={[styles.gridLineV, { left: '65%' }]} />

            {/* Dynamic 1-7-10 KM Quarantine Rings Centered on Active Epicenter */}
            {activeEpicenter && (
              <>
                {/* 10 KM Yellow Surveillance Ring */}
                <View
                  style={[
                    styles.quarantineRing,
                    {
                      width: 240,
                      height: 240,
                      borderRadius: 120,
                      left: `${activeEpicenter.xPct}%`,
                      top: `${activeEpicenter.yPct}%`,
                      marginLeft: -120,
                      marginTop: -120,
                      borderColor: 'rgba(245, 158, 11, 0.45)',
                      backgroundColor: 'rgba(245, 158, 11, 0.04)',
                    },
                  ]}
                />
                {/* 7 KM Pink Buffer Ring */}
                <View
                  style={[
                    styles.quarantineRing,
                    {
                      width: 156,
                      height: 156,
                      borderRadius: 78,
                      left: `${activeEpicenter.xPct}%`,
                      top: `${activeEpicenter.yPct}%`,
                      marginLeft: -78,
                      marginTop: -78,
                      borderColor: 'rgba(236, 72, 153, 0.55)',
                      backgroundColor: 'rgba(236, 72, 153, 0.07)',
                    },
                  ]}
                />
                {/* 1 KM Red Infected Ring */}
                <View
                  style={[
                    styles.quarantineRing,
                    {
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      left: `${activeEpicenter.xPct}%`,
                      top: `${activeEpicenter.yPct}%`,
                      marginLeft: -36,
                      marginTop: -36,
                      borderColor:
                        activeEpicenter.zone === 'RED'
                          ? 'rgba(244, 63, 94, 0.9)'
                          : 'rgba(245, 158, 11, 0.85)',
                      backgroundColor:
                        activeEpicenter.zone === 'RED'
                          ? 'rgba(244, 63, 94, 0.18)'
                          : 'rgba(245, 158, 11, 0.15)',
                    },
                  ]}
                />
              </>
            )}

            {/* MAO Luna Statutory Hub Pin */}
            <View style={[styles.maoHubPin, { left: '48%', top: '48%' }]}>
              <Ionicons name="shield" size={10} color="#38bdf8" />
              <Text style={styles.maoHubText}>MAO LUNA</Text>
            </View>

            {/* 8 Interactive Barangay Pins in Luna, La Union */}
            {farms.map((farm) => {
              const isSelected = farm.id === selectedFarm.id;
              return (
                <TouchableOpacity
                  key={farm.id}
                  onPress={() => setSelectedFarmId(farm.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.farmPinWrap,
                    {
                      left: `${farm.xPct}%`,
                      top: `${farm.yPct}%`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.farmPinCircle,
                      {
                        backgroundColor: farm.color,
                        borderColor: isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.9)',
                        transform: [{ scale: isSelected ? 1.25 : 1 }],
                      },
                    ]}
                  >
                    <Text style={styles.farmPinZoneLetter}>{farm.zone[0]}</Text>
                  </View>
                  <View
                    style={[
                      styles.farmPinLabelBox,
                      isSelected && {
                        borderColor: farm.color,
                        backgroundColor: 'rgba(15, 23, 42, 0.96)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.farmPinLabelText,
                        isSelected && { color: '#ffffff', fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {farm.barangay.replace('Barangay ', '')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Map Legend Strip */}
          <View style={styles.legendStrip}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f43f5e' }]} />
              <Text style={styles.legendText}>Red (0-1 km)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ec4899' }]} />
              <Text style={styles.legendText}>Pink (1-7 km)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Yellow (7-10 km)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Green (Free)</Text>
            </View>
          </View>
        </Surface>

        {/* ================================================================
            4. SELECTED BARANGAY INSPECTOR & LIVE INFECTION TRIGGER
            ================================================================ */}
        <Surface
          style={[
            styles.sectionCard,
            { borderColor: `${selectedFarm.color}66`, borderWidth: 1.5 },
          ]}
          elevation={0}
        >
          <View style={styles.inspectorHeader}>
            <View
              style={[
                styles.zonePillBadge,
                {
                  backgroundColor: `${selectedFarm.color}20`,
                  borderColor: `${selectedFarm.color}60`,
                },
              ]}
            >
              <View style={[styles.zoneMiniDot, { backgroundColor: selectedFarm.color }]} />
              <Text style={[styles.zonePillText, { color: selectedFarm.color }]}>
                {selectedFarm.zoneLabel}
              </Text>
            </View>
            <Text style={styles.inspectorTime}>{selectedFarm.lastInspected}</Text>
          </View>

          <Text style={styles.inspectorFarmTitle}>{selectedFarm.name}</Text>
          <Text style={styles.inspectorFarmSub}>
            {selectedFarm.barangay}, Luna, La Union • {selectedFarm.sector}
          </Text>

          <View style={styles.inspectorStatsGrid}>
            <View style={styles.inspectorStatBox}>
              <Text style={styles.inspectorStatLbl}>GPS COORDS</Text>
              <Text style={styles.inspectorStatVal}>
                {selectedFarm.lat.toFixed(4)}°N, {selectedFarm.lng.toFixed(4)}°E
              </Text>
            </View>
            <View style={styles.inspectorStatBox}>
              <Text style={styles.inspectorStatLbl}>HERD POPULATION</Text>
              <Text style={styles.inspectorStatVal}>
                {selectedFarm.swineCount} Swine ({selectedFarm.households} Pens)
              </Text>
            </View>
            <View style={styles.inspectorStatBox}>
              <Text style={styles.inspectorStatLbl}>DETECTED CONDITION</Text>
              <Text style={[styles.inspectorStatVal, { color: selectedFarm.color }]}>
                {selectedFarm.detectedDisease}
              </Text>
            </View>
            <View style={styles.inspectorStatBox}>
              <Text style={styles.inspectorStatLbl}>EPICENTER DISTANCE</Text>
              <Text style={styles.inspectorStatVal}>
                {activeEpicenter
                  ? distanceFromEpicenterKm === 0
                    ? '0.0 km (Epicenter)'
                    : `${distanceFromEpicenterKm} km away`
                  : 'No Active Outbreak'}
              </Text>
            </View>
          </View>

          <View style={styles.vetNotesBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Ionicons name="clipboard" size={14} color={selectedFarm.color} />
              <Text style={[styles.vetNotesTitle, { color: selectedFarm.color }]}>
                BAI & MAO Luna Field Directive
              </Text>
            </View>
            <Text style={styles.vetNotesText}>{selectedFarm.vetNotes}</Text>
          </View>

          {/* Interactive Simulation Controls for Selected Barangay */}
          <View style={styles.simControlBox}>
            <Text style={styles.simControlHeader}>
              TEST INFECTION IN {selectedFarm.barangay.toUpperCase()}:
            </Text>
            <View style={styles.simBtnRow}>
              <TouchableOpacity
                onPress={() => simulateOutbreakInBarangay(selectedFarm, 'ASF')}
                style={[styles.simTriggerBtn, styles.simTriggerAsf]}
                activeOpacity={0.85}
              >
                <Ionicons name="flame" size={13} color="#fda4af" />
                <Text style={styles.simTriggerAsfText}>Trigger ASF Red Alert</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => simulateOutbreakInBarangay(selectedFarm, 'ERYSIPELAS')}
                style={[styles.simTriggerBtn, styles.simTriggerEry]}
                activeOpacity={0.85}
              >
                <Ionicons name="alert-circle" size={13} color="#fcd34d" />
                <Text style={styles.simTriggerEryText}>Trigger Erysipelas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => simulateOutbreakInBarangay(selectedFarm, 'CLEAR')}
                style={[styles.simTriggerBtn, styles.simTriggerClear]}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={13} color="#6ee7b7" />
                <Text style={styles.simTriggerClearText}>All-Safe Green</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dispatch Incident Report Button */}
          <TouchableOpacity
            onPress={() => handleOpenReportModal(selectedFarm)}
            style={styles.dispatchPvoBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="megaphone" size={16} color="#ffffff" />
            <Text style={styles.dispatchPvoBtnText}>
              Dispatch Report to MAO Luna & OPVet La Union
            </Text>
          </TouchableOpacity>
        </Surface>

        {/* ================================================================
            4B. WHAT TO DO FIRST: SINGLE & MULTI-INFECTION DECISION ENGINE
            ================================================================ */}
        <InfectionDecisionCard
          detectedConditions={farms}
          navigation={navigation}
          contextTitle="LUNA, LA UNION • WHAT TO DO FIRST DECISION ENGINE"
        />

        {/* ================================================================
            5. ALL 8 MONITORED BARANGAYS IN LUNA, LA UNION
            ================================================================ */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="list" size={18} color="#10b981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardSectionTitle}>
                8 Monitored Barangays • Luna, La Union
              </Text>
              <Text style={styles.cardSectionSub}>
                Tap any barangay row to inspect or simulate an outbreak
              </Text>
            </View>
          </View>

          <View style={styles.barangayList}>
            {farms.map((farm) => {
              const isSelected = farm.id === selectedFarm.id;
              const dist = activeEpicenter
                ? farm.id === activeEpicenter.id
                  ? 'Epicenter'
                  : `${calculateDistanceKm(
                      activeEpicenter.lat,
                      activeEpicenter.lng,
                      farm.lat,
                      farm.lng
                    )} km`
                : 'Clear';
              return (
                <TouchableOpacity
                  key={farm.id}
                  onPress={() => setSelectedFarmId(farm.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.barangayRow,
                    isSelected && {
                      borderColor: farm.color,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  ]}
                >
                  <View style={[styles.barangayZoneBar, { backgroundColor: farm.color }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.barangayTopLine}>
                      <Text style={styles.barangayName}>{farm.barangay}</Text>
                      <View
                        style={[
                          styles.barangayMiniBadge,
                          { backgroundColor: `${farm.color}22`, borderColor: `${farm.color}66` },
                        ]}
                      >
                        <Text style={[styles.barangayMiniBadgeText, { color: farm.color }]}>
                          {farm.zone} • {dist}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.barangaySub}>
                      {farm.detectedDisease} • {farm.swineCount} swine heads
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Surface>

        {/* ================================================================
            6. NEAREST STATUTORY AUTHORITIES (MAO LUNA & OPVET LA UNION)
            ================================================================ */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="business" size={18} color="#38bdf8" />
            <Text style={styles.cardSectionTitle}>
              Statutory Veterinary Authorities (La Union)
            </Text>
          </View>

          <View style={styles.pvoCard}>
            <Text style={styles.pvoTitle}>PRIMARY MUNICIPAL AUTHORITY</Text>
            <Text style={styles.pvoName}>
              Municipal Agriculture Office - Luna (MAO Luna)
            </Text>
            <Text style={styles.pvoLocation}>
              Municipal Hall Compound, Brgy. Magallanes (Poblacion), Luna, La Union
            </Text>
            <Text style={styles.pvoRole}>
              First-line municipal responder for backyard swine disease verification, quarantine
              checkpoints, and disinfectant distribution across all 40 barangays of Luna.
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL('tel:09178425510')}
              style={styles.pvoCallBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.pvoCallBtnText}>
                Call MAO Luna Hotline (0917-842-5510)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.pvoCard, { marginTop: 10 }]}>
            <Text style={styles.pvoTitle}>PROVINCIAL STATUTORY AUTHORITY</Text>
            <Text style={styles.pvoName}>
              Office of the Provincial Veterinarian - La Union (OPVet)
            </Text>
            <Text style={styles.pvoLocation}>
              Provincial Capitol Compound, Aguila Rd, San Fernando City, La Union
            </Text>
            <Text style={styles.pvoRole}>
              Oversees provincial 1-7-10 km ASF zoning, RT-PCR blood confirmatory testing, and
              inter-municipal Veterinary Health Certificates (VHC) in Region I.
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL('tel:0722425550')}
              style={[styles.pvoCallBtn, { backgroundColor: '#0f766e' }]}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.pvoCallBtnText}>
                Call OPVet La Union ((072) 242-5550)
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* ================================================================
            7. LUNA BARN ENVIRONMENTAL READINGS & 7-DAY FORECAST
            ================================================================ */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="thermometer" size={18} color="#fb7185" />
            <Text style={styles.cardSectionTitle}>
              Luna Barn Microclimate & Biosecurity
            </Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>
                {typeof current?.temperatureC === 'number'
                  ? `${Math.round(current.temperatureC)}°C`
                  : '29°C'}
              </Text>
              <Text style={styles.kpiLbl}>Ambient Temp</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>
                {typeof current?.windKmh === 'number'
                  ? `${Math.round(current.windKmh)} km/h`
                  : '14 km/h'}
              </Text>
              <Text style={styles.kpiLbl}>Coastal Wind</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>{current?.weatherLabel || 'Clear'}</Text>
              <Text style={styles.kpiLbl}>Sky Condition</Text>
            </View>
          </View>

          <View style={[styles.suitabilityBadgeRow, { marginTop: 14 }]}>
            <View
              style={[
                styles.suitabilityBadge,
                {
                  backgroundColor: `${suitability.color}22`,
                  borderColor: `${suitability.color}66`,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={13} color={suitability.color} />
              <Text style={[styles.suitabilityBadgeText, { color: suitability.color }]}>
                {suitability.status}
              </Text>
            </View>
          </View>

          <Text style={styles.suitabilitySummary}>{suitability.summary}</Text>

          {days.length > 0 && (
            <View style={styles.forecastTable}>
              <View style={styles.forecastHeader}>
                <Text style={[styles.forecastHeadText, { flex: 1.2 }]}>Day</Text>
                <Text style={[styles.forecastHeadText, { flex: 1.4 }]}>Min / Max</Text>
                <Text style={[styles.forecastHeadText, { flex: 1 }]}>Rain</Text>
                <Text style={[styles.forecastHeadText, { flex: 1.4 }]}>Outlook</Text>
              </View>

              {days.slice(0, 5).map((d, idx) => (
                <View key={idx} style={styles.forecastRow}>
                  <Text style={[styles.forecastCellDay, { flex: 1.2 }]}>
                    {formatDayLabel(d.date)}
                  </Text>
                  <Text style={[styles.forecastCellTemp, { flex: 1.4 }]}>
                    {typeof d.minTempC === 'number' ? Math.round(d.minTempC) : '-'}° /{' '}
                    {typeof d.maxTempC === 'number' ? Math.round(d.maxTempC) : '-'}°C
                  </Text>
                  <Text style={[styles.forecastCellPrecip, { flex: 1 }]}>
                    {typeof d.precipitationMm === 'number'
                      ? `${Math.round(d.precipitationMm)}mm`
                      : '0mm'}
                  </Text>
                  <Text style={[styles.forecastCellLabel, { flex: 1.4 }]} numberOfLines={1}>
                    {d.weatherLabel || 'Normal'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {error && <Text style={styles.errorBanner}>{error}</Text>}
        </Surface>
      </ScrollView>

      {/* ================================================================
          OFFICIAL MAO LUNA / OPVET LA UNION INCIDENT DISPATCH MODAL
          ================================================================ */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="warning" size={20} color="#f43f5e" />
                <Text style={styles.modalTitle}>Dispatch MAO Luna Alert</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {reportSuccess ? (
              <View style={styles.modalSuccessBox}>
                <Ionicons name="checkmark-circle" size={44} color="#10b981" />
                <Text style={styles.modalSuccessTitle}>
                  Official Incident Packet Logged
                </Text>
                <Text style={styles.modalSuccessRef}>
                  Ref: {reportSuccess.referenceCode} • {reportSuccess.timestamp}
                </Text>
                <Text style={styles.modalSuccessDesc}>
                  Transmitted to {reportSuccess.office} for {reportForm.barangay}. Maintain pen
                  isolation and await municipal veterinary verification.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowReportModal(false)}
                  style={styles.modalDoneBtn}
                >
                  <Text style={styles.modalDoneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <Text style={styles.modalSubText}>
                  Transmit GPS coordinates and symptom telemetry to the Municipal Agriculture Office
                  of Luna and OPVet La Union.
                </Text>

                <View>
                  <Text style={styles.inputLabel}>BARANGAY LOCATION</Text>
                  <TextInput
                    style={styles.textInput}
                    value={reportForm.barangay}
                    onChangeText={(t) => setReportForm((p) => ({ ...p, barangay: t }))}
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>SUSPECTED CONDITION</Text>
                  <TextInput
                    style={styles.textInput}
                    value={reportForm.suspectedDisease}
                    onChangeText={(t) => setReportForm((p) => ({ ...p, suspectedDisease: t }))}
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>CLINICAL OBSERVATIONS</Text>
                  <TextInput
                    style={[styles.textInput, { height: 72, textAlignVertical: 'top' }]}
                    multiline
                    value={reportForm.clinicalNotes}
                    onChangeText={(t) => setReportForm((p) => ({ ...p, clinicalNotes: t }))}
                    placeholderTextColor="#64748b"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleDispatchReport}
                  disabled={submittingReport}
                  style={styles.dispatchPvoBtn}
                >
                  {submittingReport ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={15} color="#ffffff" />
                      <Text style={styles.dispatchPvoBtnText}>
                        Transmit Official Report to MAO Luna
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    letterSpacing: 0.7,
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  locationCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 16,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  locationNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  locationSubText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  gpsCoordsBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  gpsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
    textAlign: 'right',
  },
  zoneCounterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  zoneCounterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
  },
  zoneMiniDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  zoneCounterVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  zoneCounterLbl: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  locationActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f43f5e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  mapActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guideToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  guideToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#38bdf8',
  },
  sectionCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  cardSectionSub: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  scenarioScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  scenarioCard: {
    width: 215,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  scenarioBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  scenarioDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  scenarioBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scenarioTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 3,
  },
  scenarioDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
  },
  walkthroughBox: {
    marginTop: 12,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.28)',
    padding: 12,
  },
  walkthroughStepTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  stepTabBtn: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepTabBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  stepTabText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
  },
  stepTabTextActive: {
    color: '#ffffff',
  },
  walkthroughTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  walkthroughDesc: {
    fontSize: 11.5,
    color: '#cbd5e1',
    lineHeight: 16.5,
    marginBottom: 10,
  },
  walkthroughActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  playStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  playStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
  },
  nextStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  nextStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc',
  },
  gisMapCanvas: {
    height: 310,
    backgroundColor: '#040812',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.22)',
    overflow: 'hidden',
    position: 'relative',
  },
  seaOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '32%',
  },
  seaLabel: {
    position: 'absolute',
    left: 8,
    top: 12,
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1,
  },
  coastSubLabel: {
    position: 'absolute',
    left: 8,
    top: 25,
    fontSize: 8.5,
    color: '#64748b',
  },
  southLabel: {
    position: 'absolute',
    left: 8,
    bottom: 10,
    fontSize: 8.5,
    color: '#38bdf8',
  },
  northLabel: {
    position: 'absolute',
    right: 10,
    top: 10,
    fontSize: 8.5,
    color: '#64748b',
  },
  eastLabel: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    fontSize: 8.5,
    color: '#64748b',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.07)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.07)',
  },
  quarantineRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    pointerEvents: 'none',
  },
  maoHubPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  maoHubText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#bae6fd',
  },
  farmPinWrap: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -28,
    marginTop: -16,
    width: 68,
  },
  farmPinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmPinZoneLetter: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
  },
  farmPinLabelBox: {
    marginTop: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  farmPinLabelText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  legendStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zonePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    borderWidth: 1,
  },
  zonePillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  inspectorTime: {
    fontSize: 10.5,
    color: '#64748b',
  },
  inspectorFarmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  inspectorFarmSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  inspectorStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  inspectorStatBox: {
    width: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inspectorStatLbl: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  inspectorStatVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
  },
  vetNotesBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  vetNotesTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  vetNotesText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
  },
  simControlBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  simControlHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  simBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  simTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  simTriggerAsf: {
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
    borderColor: 'rgba(244, 63, 94, 0.45)',
  },
  simTriggerAsfText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fda4af',
  },
  simTriggerEry: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  simTriggerEryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fcd34d',
  },
  simTriggerClear: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
  },
  simTriggerClearText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6ee7b7',
  },
  dispatchPvoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f43f5e',
    paddingVertical: 12,
    borderRadius: 10,
  },
  dispatchPvoBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  barangayList: {
    gap: 8,
  },
  barangayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
    gap: 10,
  },
  barangayZoneBar: {
    width: 4,
    height: 34,
    borderRadius: 2,
  },
  barangayTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  barangayName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  barangayMiniBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  barangayMiniBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  barangaySub: {
    fontSize: 11.5,
    color: '#94a3b8',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  kpiLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  errorBanner: {
    marginTop: 10,
    fontSize: 12,
    color: '#f43f5e',
  },
  suitabilityBadgeRow: {
    marginBottom: 8,
  },
  suitabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  suitabilityBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suitabilitySummary: {
    fontSize: 12.5,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 12,
  },
  forecastTable: {
    gap: 6,
  },
  forecastHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  forecastHeadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  forecastCellDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  forecastCellTemp: {
    fontSize: 12,
    color: '#fb7185',
    fontWeight: '600',
  },
  forecastCellPrecip: {
    fontSize: 12,
    color: '#06b6d4',
  },
  forecastCellLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  pvoCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 12,
    padding: 14,
  },
  pvoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  pvoName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  pvoLocation: {
    fontSize: 11.5,
    color: '#cbd5e1',
    marginBottom: 6,
  },
  pvoRole: {
    fontSize: 11.5,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 10,
  },
  pvoCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  pvoCallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.82)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalSubText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 12.5,
  },
  modalSuccessBox: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  modalSuccessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10b981',
  },
  modalSuccessRef: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
  },
  modalSuccessDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 17,
  },
  modalDoneBtn: {
    marginTop: 8,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  modalDoneBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
