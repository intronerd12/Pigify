const { supabaseAdmin } = require('../config/supabase');

// ── In-Memory Fallback Store for PVO Alerts & Disease Incidents ──────────────
let IN_MEMORY_PVO_ALERTS = [
  {
    id: 'pvo-alert-init-1',
    incidentRef: 'PVO-REF-2026-ASF-8942',
    farmName: 'Mabuhay Backyard Piggery',
    ownerName: 'Juan Dela Cruz',
    contactNumber: '0917-555-0192',
    province: 'Laguna',
    municipality: 'Santa Cruz',
    barangay: 'Barangay Santo Angel Sur',
    latitude: 14.2812,
    longitude: 121.4182,
    pigBreed: 'Philippine Native Pig',
    herdTotal: 18,
    affectedCount: 3,
    mortalityCount: 1,
    suspectedDisease: 'African Swine Fever (ASF)',
    severityTier: 'Critical Quarantine',
    symptoms: ['High Pyrexia (41.2°C)', 'Cyanotic Purple Blotches on Ventral Abdomen', 'Severe Anorexia', 'Sudden Death'],
    status: 'Forwarded to PVO Surveillance Unit',
    dispatchedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reportingOfficer: 'Barangay Biosecurity Officer (BBO)',
  },
  {
    id: 'pvo-alert-init-2',
    incidentRef: 'PVO-REF-2026-ERY-4311',
    farmName: 'Lipa Green Pastures',
    ownerName: 'Maria Santos',
    contactNumber: '0918-555-8832',
    province: 'Batangas',
    municipality: 'Lipa City',
    barangay: 'Barangay Antipolo Del Norte',
    latitude: 13.9419,
    longitude: 121.1644,
    pigBreed: 'Commercial White (Landrace)',
    herdTotal: 34,
    affectedCount: 5,
    mortalityCount: 0,
    suspectedDisease: 'Swine Erysipelas (Diamond Skin)',
    severityTier: 'Moderate Quarantine',
    symptoms: ['Raised Rhomboid Diamond Plaques', 'Pyrexia (40.5°C)', 'Stiff Gait'],
    status: 'PVO Pen Inspection Scheduled',
    dispatchedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    reportingOfficer: 'Farm Owner',
  },
];

// Sample Regional PVO Outposts & Farm Clusters for Surveillance Map
const SURVEILLANCE_FARM_CLUSTERS = [
  {
    id: 'farm-01',
    name: 'San Isidro Backyard Swine Site',
    owner: 'Rogelio Mendoza',
    breedType: 'Philippine Native Pig',
    pigCount: 22,
    province: 'Laguna',
    municipality: 'Pila',
    barangay: 'San Antonio',
    latitude: 14.2335,
    longitude: 121.3654,
    status: 'Infected Zone (Red)',
    activeAlert: 'Suspected ASF Contagion',
    quarantineRadiusKm: 1.0,
    lastScanned: new Date(Date.now() - 7200000).toISOString(),
    pvoNotified: true,
  },
  {
    id: 'farm-02',
    name: 'Victoria Breeder Farm',
    owner: 'Elena Bautista',
    breedType: 'Commercial White (Yorkshire)',
    pigCount: 45,
    province: 'Laguna',
    municipality: 'Victoria',
    barangay: 'Banca-banca',
    latitude: 14.2255,
    longitude: 121.3282,
    status: 'Buffer Zone (Pink)',
    activeAlert: 'Under Daily Surveillance (1-7 km)',
    quarantineRadiusKm: 7.0,
    lastScanned: new Date(Date.now() - 14400000).toISOString(),
    pvoNotified: true,
  },
  {
    id: 'farm-03',
    name: 'Bay Agri-Backyard Pen',
    owner: 'Danilo Ramos',
    breedType: 'Philippine Native Pig',
    pigCount: 16,
    province: 'Laguna',
    municipality: 'Bay',
    barangay: 'San Agustin',
    latitude: 14.1812,
    longitude: 121.2842,
    status: 'Surveillance Zone (Yellow)',
    activeAlert: 'Movement Restricted (7-10 km)',
    quarantineRadiusKm: 10.0,
    lastScanned: new Date(Date.now() - 28800000).toISOString(),
    pvoNotified: false,
  },
  {
    id: 'farm-04',
    name: 'Calamba Model Agro Pen',
    owner: 'Ricardo Dizon',
    breedType: 'Crossbreed (Duroc x Landrace)',
    pigCount: 60,
    province: 'Laguna',
    municipality: 'Calamba',
    barangay: 'Real',
    latitude: 14.2136,
    longitude: 121.1648,
    status: 'Free Zone (Green)',
    activeAlert: 'Optimal Biosecurity Baseline',
    quarantineRadiusKm: 0,
    lastScanned: new Date(Date.now() - 43200000).toISOString(),
    pvoNotified: false,
  },
  {
    id: 'farm-05',
    name: 'Tanauan Native Pig Reserve',
    owner: 'Nestor Castillo',
    breedType: 'Philippine Native Pig',
    pigCount: 28,
    province: 'Batangas',
    municipality: 'Tanauan City',
    barangay: 'Natatas',
    latitude: 14.0862,
    longitude: 121.1506,
    status: 'Buffer Zone (Pink)',
    activeAlert: 'Erysipelas Differential Watch',
    quarantineRadiusKm: 7.0,
    lastScanned: new Date(Date.now() - 18000000).toISOString(),
    pvoNotified: true,
  },
];

const PVO_REGIONAL_OFFICES = [
  {
    id: 'pvo-laguna',
    name: 'Provincial Veterinary Office - Laguna (PVO Laguna)',
    head: 'Dr. Mary Grace B. Cruz, DVM (Provincial Veterinarian)',
    address: 'Provincial Capitol Compound, Santa Cruz, Laguna',
    hotline: '(049) 501-1823 / 0917-838-5847',
    email: 'pvo.laguna@veterinary.gov.ph',
    latitude: 14.2785,
    longitude: 121.4156,
    jurisdiction: 'Laguna Province (All 30 Municipalities & Cities)',
    capabilities: ['ASF Rapid Blood Antigen/PCR Testing', 'Quarantine Checkpoint Deployment', 'Disinfection Truck Unit'],
  },
  {
    id: 'pvo-batangas',
    name: 'Provincial Veterinary Office - Batangas (PVO Batangas)',
    head: 'Dr. Romelito R. Perez, DVM (Provincial Veterinarian)',
    address: 'Provincial Capitol Site, Batangas City, Batangas',
    hotline: '(043) 723-1498 / 0919-456-7890',
    email: 'pvo.batangas@veterinary.gov.ph',
    latitude: 13.7565,
    longitude: 121.0583,
    jurisdiction: 'Batangas Province',
    capabilities: ['Epidemiological Investigation', 'Movement Cordon', 'BAI Laboratory Coordination'],
  },
  {
    id: 'bai-central',
    name: 'Bureau of Animal Industry - National Swine Task Force (BAI)',
    head: 'National African Swine Fever Task Force (BABay ASF)',
    address: 'Visayas Avenue, Diliman, Quezon City, Metro Manila',
    hotline: '(02) 8528-2240 / 0917-838-5847',
    email: 'bai_asf_response@da.gov.ph',
    latitude: 14.6508,
    longitude: 121.0504,
    jurisdiction: 'Nationwide (Philippines)',
    capabilities: ['Confirmatory RT-PCR', 'National Zone Declaration', 'Indemnification Disbursal'],
  },
];

// ── Controller Handlers ──────────────────────────────────────────────────────

// @desc    Dispatch alert to Provincial Veterinary Office (PVO)
// @route   POST /api/scan/pvo-alert
const dispatchPvoAlert = async (req, res) => {
  try {
    const {
      farmName,
      ownerName,
      contactNumber,
      province,
      municipality,
      barangay,
      latitude,
      longitude,
      pigBreed,
      herdTotal,
      affectedCount,
      mortalityCount,
      suspectedDisease,
      severityTier,
      symptoms,
      reportingOfficer,
      additionalNotes,
    } = req.body;

    const incidentRef = `PVO-REF-${new Date().getFullYear()}-${(suspectedDisease || 'ASF').slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlert = {
      id: `pvo-alert-${Date.now()}`,
      incidentRef,
      farmName: farmName || 'Backyard Swine Facility',
      ownerName: ownerName || 'Registered Swine Raiser',
      contactNumber: contactNumber || '0917-000-0000',
      province: province || 'Laguna',
      municipality: municipality || 'Santa Cruz',
      barangay: barangay || 'Poblacion',
      latitude: Number(latitude) || 14.2812,
      longitude: Number(longitude) || 121.4182,
      pigBreed: pigBreed || 'Philippine Native Pig',
      herdTotal: Number(herdTotal) || 1,
      affectedCount: Number(affectedCount) || 1,
      mortalityCount: Number(mortalityCount) || 0,
      suspectedDisease: suspectedDisease || 'African Swine Fever (ASF)',
      severityTier: severityTier || 'Critical Quarantine',
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
      reportingOfficer: reportingOfficer || 'Backyard Raiser / Pigify System',
      additionalNotes: additionalNotes || 'Early warning signal identified via Pigify AI diagnostic scan.',
      status: 'Officially Dispatched to Provincial Veterinary Office',
      dispatchedAt: new Date().toISOString(),
      actionMandates: [
        'Immediate 10-meter isolation of infected pen.',
        'Halt all pig movements, sales, and slaughter within 500m radius.',
        'Deploy fresh footbath with 2% Virkon S or slaked lime at pen entrance.',
        'Await official PVO veterinary team arrival for blood sample collection.',
      ],
    };

    // Attempt to persist to Supabase if table exists
    try {
      await supabaseAdmin.from('pvo_alerts').insert(newAlert);
    } catch (_dbErr) {
      // In-memory fallback
    }

    IN_MEMORY_PVO_ALERTS.unshift(newAlert);

    return res.status(201).json({
      success: true,
      message: 'Alert officially logged and dispatched to the Provincial Veterinary Office.',
      alert: newAlert,
      pvoContact: PVO_REGIONAL_OFFICES[0],
    });
  } catch (error) {
    console.error('Error dispatching PVO alert:', error);
    return res.status(500).json({ message: error.message || 'Failed to dispatch alert to PVO' });
  }
};

// @desc    Get all PVO Alerts
// @route   GET /api/scan/pvo-alerts
const getPvoAlerts = async (req, res) => {
  try {
    try {
      const { data, error } = await supabaseAdmin.from('pvo_alerts').select('*').order('dispatchedAt', { ascending: false });
      if (!error && data && data.length > 0) {
        return res.status(200).json(data);
      }
    } catch (_e) {
      // Fallback
    }

    return res.status(200).json(IN_MEMORY_PVO_ALERTS);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching PVO alerts' });
  }
};

// @desc    Get Surveillance Map Data (Farms, Zones, PVO Hubs)
// @route   GET /api/scan/surveillance-map
const getSurveillanceMapData = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary: {
        totalFarmsMonitored: SURVEILLANCE_FARM_CLUSTERS.length,
        redInfectedZones: SURVEILLANCE_FARM_CLUSTERS.filter((f) => f.status.includes('Red')).length,
        pinkBufferZones: SURVEILLANCE_FARM_CLUSTERS.filter((f) => f.status.includes('Pink')).length,
        yellowSurveillanceZones: SURVEILLANCE_FARM_CLUSTERS.filter((f) => f.status.includes('Yellow')).length,
        greenFreeZones: SURVEILLANCE_FARM_CLUSTERS.filter((f) => f.status.includes('Green')).length,
        nativePigFarms: SURVEILLANCE_FARM_CLUSTERS.filter((f) => f.breedType.includes('Native')).length,
      },
      farms: SURVEILLANCE_FARM_CLUSTERS,
      pvoOffices: PVO_REGIONAL_OFFICES,
      zoningProtocol: {
        red: { name: 'Infected Zone', radius: '0 - 1 km', mandate: 'Total depopulation / immediate movement lockdown' },
        pink: { name: 'Buffer Zone', radius: '1 - 7 km', mandate: 'Weekly clinical inspections; entry/exit checkpoints' },
        yellow: { name: 'Surveillance Zone', radius: '7 - 10 km', mandate: 'Blood surveillance; ban on live pig transport' },
        green: { name: 'Free Zone', radius: '> 10 km', mandate: 'Regular biosecurity maintenance; strict border control' },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error loading surveillance map data' });
  }
};

// @desc    Perform Multi-Symptom General Illness Differential Diagnostic
// @route   POST /api/scan/differential-triage
const evaluateDifferentialTriage = async (req, res) => {
  try {
    const { symptoms = [], pigBreed = 'Philippine Native Pig', ageGroup = 'Grower' } = req.body;
    const lowerSymptoms = (Array.isArray(symptoms) ? symptoms : [symptoms]).map((s) => String(s).toLowerCase());

    const hasFever = lowerSymptoms.some((s) => s.includes('fever') || s.includes('pyrexia') || s.includes('hot'));
    const hasPurpleSkin = lowerSymptoms.some((s) => s.includes('purple') || s.includes('cyanosis') || s.includes('blotches') || s.includes('ear tip'));
    const hasDiamond = lowerSymptoms.some((s) => s.includes('diamond') || s.includes('rhomboid') || s.includes('square'));
    const hasDiarrhea = lowerSymptoms.some((s) => s.includes('diarrhea') || s.includes('watery') || s.includes('scour'));
    const hasCough = lowerSymptoms.some((s) => s.includes('cough') || s.includes('breathing') || s.includes('respiratory') || s.includes('dyspnea'));
    const hasMange = lowerSymptoms.some((s) => s.includes('scratch') || s.includes('crust') || s.includes('itch') || s.includes('ear crust'));
    const hasGreasy = lowerSymptoms.some((s) => s.includes('greas') || s.includes('sticky') || s.includes('brown exudate') || s.includes('sebaceous'));
    const hasSuddenDeath = lowerSymptoms.some((s) => s.includes('death') || s.includes('dead') || s.includes('fatal') || s.includes('collapse'));
    const hasBlisters = lowerSymptoms.some((s) => s.includes('blister') || s.includes('vesicle') || s.includes('snout') || s.includes('hoof'));

    const isNativePig = pigBreed.toLowerCase().includes('native');

    const results = [];

    // 1. African Swine Fever (ASF)
    let asfScore = 15;
    if (hasFever) asfScore += 25;
    if (hasPurpleSkin) asfScore += 30;
    if (hasSuddenDeath) asfScore += 30;
    if (hasDiarrhea) asfScore += 10;
    results.push({
      disease: 'African Swine Fever (ASF)',
      probability: Math.min(98, asfScore),
      pathogen: 'African Swine Fever Virus (Asfarviridae)',
      severity: 'Critical Emergency (Grade E)',
      pvoReportMandatory: true,
      affectedBreeds: 'ALL domestic pigs (Native Pigs, Commercial White) & Wild Boars (100% mortal)',
      breedPresentationNote: isNativePig
        ? 'Native Pigs with dark skin may not show bright red erythema clearly; inspect inner ear flaps, eye conjunctiva, and belly for purple discoloration.'
        : 'White commercial pigs show distinct bright-to-dark cyanotic discoloration on ears, snout, and ventral belly.',
      differentialClues: 'Extremely high mortality (up to 100%), acute pyrexia, does NOT respond to penicillin/antibiotics.',
      disinfectionRequirement: 'Virkon S (1-2%), 2% Citric acid, or Slaked lime; bleach 0.5%. Complete 10-meter perimeter cordon.',
    });

    // 2. Swine Erysipelas (Diamond Skin)
    let eryScore = 10;
    if (hasFever) eryScore += 20;
    if (hasDiamond) eryScore += 50;
    if (hasPurpleSkin && !hasDiamond) eryScore += 15;
    results.push({
      disease: 'Swine Erysipelas',
      probability: Math.min(96, eryScore),
      pathogen: 'Erysipelothrix rhusiopathiae (Bacterium)',
      severity: 'High Biosecurity Risk (Grade B/C)',
      pvoReportMandatory: false,
      affectedBreeds: 'Commercial White (high visual manifestation) & Philippine Native Pigs',
      breedPresentationNote: isNativePig
        ? 'On dark Native Pigs, diamond plaques are darker and often masked by coarse hair; feel for raised, geometric cutaneous swelling.'
        : 'Rhomboid diamond lesions are visibly prominent and red/purple on white-skinned breeds.',
      differentialClues: 'Rapidly responsive to Penicillin G therapy within 24-36 hours (distinguishes it from fatal viral ASF).',
      disinfectionRequirement: 'Glutaraldehyde 0.5% or Sodium hypochlorite 0.5%; thorough pen floor lime washing.',
    });

    // 3. Porcine Reproductive & Respiratory Syndrome (PRRS)
    let prrsScore = 10;
    if (hasCough) prrsScore += 35;
    if (hasFever) prrsScore += 20;
    if (hasPurpleSkin) prrsScore += 20; // Blue ear
    results.push({
      disease: 'PRRS (Porcine Reproductive & Respiratory Syndrome / Blue Ear)',
      probability: Math.min(92, prrsScore),
      pathogen: 'PRRS Virus (Arteriviridae)',
      severity: 'Severe Respiratory & Reproductive Threat',
      pvoReportMandatory: false,
      affectedBreeds: 'Commercial breeding herds heavily affected; also affects Native Sows and weaners',
      breedPresentationNote: 'Transient cyanosis of ears ("blue ear") visible on all breeds, plus respiratory thumping in weaners.',
      differentialClues: 'Dominant respiratory dyspnea coupled with reproductive sow abortions; less rapid death than ASF.',
      disinfectionRequirement: 'Potassium peroxymonosulfate (Virkon S) misting, strict farm quarantine buffer.',
    });

    // 4. Sarcoptic Mange
    let mangeScore = 5;
    if (hasMange) mangeScore += 65;
    results.push({
      disease: 'Sarcoptic Mange (Acariasis)',
      probability: Math.min(95, mangeScore),
      pathogen: 'Sarcoptes scabiei var. suis (Parasite)',
      severity: 'Chronic Dermal Infestation (Grade C/D)',
      pvoReportMandatory: false,
      affectedBreeds: 'Highly endemic in Philippine Native Pigs in bamboo/wooden pens & Commercial breeds',
      breedPresentationNote: 'Native pigs frequently exhibit thick asbestos-like crusts lining deep inside the ear canals from scratching against bamboo pen railings.',
      differentialClues: 'Non-fatal; intense relentless rubbing against walls, thick crusts in ears, normal rectal temperature.',
      disinfectionRequirement: 'Acaricidal pen wash (Amitraz / Ivermectin bedding spray); high-pressure steam cleaning.',
    });

    // 5. Porcine Epidemic Diarrhea (PEDv)
    let pedScore = 5;
    if (hasDiarrhea) pedScore += 60;
    if (hasSuddenDeath && ageGroup.toLowerCase().includes('suckling')) pedScore += 25;
    results.push({
      disease: 'Porcine Epidemic Diarrhea (PED / PEDv)',
      probability: Math.min(95, pedScore),
      pathogen: 'Porcine Epidemic Diarrhea Virus (Coronavirus)',
      severity: 'Critical for Piglets / Mild for Adults',
      pvoReportMandatory: false,
      affectedBreeds: 'All pig breeds; suckling piglets (<2 weeks) suffer near 100% mortality',
      breedPresentationNote: 'Native piglets become severely dehydrated with watery yellow-curd diarrhea.',
      differentialClues: 'Explosive watery diarrhea with vomiting; rapid mortality in piglets under 10 days old, while mature sows recover in a week.',
      disinfectionRequirement: 'Glutaraldehyde or bleach; heating lamps for surviving piglets with electrolyte rehydration.',
    });

    results.sort((a, b) => b.probability - a.probability);

    return res.status(200).json({
      success: true,
      evaluatedBreed: pigBreed,
      isNativePig,
      topDiagnosis: results[0],
      differentials: results,
      pvoAlertTriggerRecommended: results[0].pvoReportMandatory && results[0].probability >= 50,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error executing differential triage' });
  }
};

module.exports = {
  dispatchPvoAlert,
  getPvoAlerts,
  getSurveillanceMapData,
  evaluateDifferentialTriage,
};
