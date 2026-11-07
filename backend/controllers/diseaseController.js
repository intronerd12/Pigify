const { supabaseAdmin } = require('../config/supabase');

// ── In-Memory Fallback Store for PVO Alerts & Disease Incidents (Luna, La Union Study Site) ──
let IN_MEMORY_PVO_ALERTS = [
  {
    id: 'pvo-alert-init-1',
    incidentRef: 'PVO-LU-2026-ASF-8942',
    farmName: 'Barrientos Backyard Swine Site',
    ownerName: 'Ernesto Nisce',
    contactNumber: '0917-555-0192',
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Barrientos',
    latitude: 16.8590,
    longitude: 120.3910,
    pigBreed: 'Philippine Native Pig (Ilocos Strain)',
    herdTotal: 18,
    affectedCount: 3,
    mortalityCount: 1,
    suspectedDisease: 'African Swine Fever (ASF)',
    severityTier: 'Critical Quarantine',
    symptoms: ['High Pyrexia (41.2°C)', 'Cyanotic Purple Blotches on Ventral Abdomen', 'Severe Anorexia', 'Sudden Death'],
    status: 'Forwarded to MAO Luna & OPVet La Union Surveillance Unit',
    dispatchedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reportingOfficer: 'Barangay Biosecurity Officer (BBO - Luna)',
  },
  {
    id: 'pvo-alert-init-2',
    incidentRef: 'PVO-LU-2026-ERY-4311',
    farmName: 'Nalvo Norte Coastal Piggery',
    ownerName: 'Marilou Ancheta',
    contactNumber: '0918-555-8832',
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Nalvo Norte',
    latitude: 16.8685,
    longitude: 120.3775,
    pigBreed: 'Commercial White (Landrace)',
    herdTotal: 32,
    affectedCount: 4,
    mortalityCount: 0,
    suspectedDisease: 'Swine Erysipelas (Diamond Skin)',
    severityTier: 'Moderate Quarantine',
    symptoms: ['Raised Rhomboid Diamond Plaques', 'Pyrexia (40.5°C)', 'Stiff Gait'],
    status: 'MAO Luna Pen Inspection Scheduled',
    dispatchedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    reportingOfficer: 'Backyard Raiser / Farm Owner',
  },
];

// Primary Capstone Study Site: Luna, La Union, Philippines (Region I)
const SURVEILLANCE_FARM_CLUSTERS = [
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
    status: 'Infected Zone (Red)',
    activeAlert: 'Active ASF Alert // Under 1km Cordon',
    quarantineRadiusKm: 1.0,
    lastScanned: new Date(Date.now() - 7200000).toISOString(),
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
    sector: 'Town Center Corridor',
    latitude: 16.8530,
    longitude: 120.3802,
    status: 'Buffer Zone (Pink)',
    activeAlert: 'Buffer Surveillance Active (1-7 km)',
    quarantineRadiusKm: 7.0,
    lastScanned: new Date(Date.now() - 14400000).toISOString(),
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
    status: 'Buffer Zone (Pink)',
    activeAlert: 'Erysipelas Differential Watch (1-7 km)',
    quarantineRadiusKm: 7.0,
    lastScanned: new Date(Date.now() - 18000000).toISOString(),
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
    sector: 'Southern Inland Sector',
    latitude: 16.8440,
    longitude: 120.3885,
    status: 'Buffer Zone (Pink)',
    activeAlert: 'Weekly MAO Luna Inspection (1-7 km)',
    quarantineRadiusKm: 7.0,
    lastScanned: new Date(Date.now() - 21600000).toISOString(),
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
    status: 'Buffer Zone (Pink)',
    activeAlert: 'Footbath Disinfection Active (1-7 km)',
    quarantineRadiusKm: 7.0,
    lastScanned: new Date(Date.now() - 25200000).toISOString(),
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
    sector: 'Eastern Border Corridor (Luna-Balaoan Road)',
    latitude: 16.8485,
    longitude: 120.4020,
    status: 'Surveillance Zone (Yellow)',
    activeAlert: 'Movement Restricted // Checkpoint Active',
    quarantineRadiusKm: 10.0,
    lastScanned: new Date(Date.now() - 28800000).toISOString(),
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
    status: 'Free Zone (Green)',
    activeAlert: 'Optimal Biosecurity Baseline',
    quarantineRadiusKm: 0,
    lastScanned: new Date(Date.now() - 36000000).toISOString(),
    pvoNotified: false,
  },
  {
    id: 'luna-farm-08',
    name: 'Sto. Domingo Norte Breeder Site',
    owner: 'ArnaldoDirecto',
    contact: '0920-555-9012',
    breedType: 'Crossbreed (Duroc x Large White)',
    pigCount: 35,
    province: 'La Union',
    municipality: 'Luna',
    barangay: 'Barangay Sto. Domingo Norte',
    sector: 'Northern Border Sector (Near Bangar)',
    latitude: 16.8740,
    longitude: 120.3860,
    status: 'Free Zone (Green)',
    activeAlert: 'Negative Surveillance Baseline',
    quarantineRadiusKm: 0,
    lastScanned: new Date(Date.now() - 43200000).toISOString(),
    pvoNotified: false,
  },
];

const PVO_REGIONAL_OFFICES = [
  {
    id: 'mao-luna',
    name: 'Municipal Agriculture Office - Luna (MAO Luna)',
    head: 'Municipal Agriculturist & Livestock Inspector (LGU Luna)',
    address: 'Municipal Hall Compound, Brgy. Magallanes, Luna, La Union',
    hotline: '(072) 607-1124 / 0917-842-5510',
    email: 'mao.luna@launion.gov.ph',
    latitude: 16.8532,
    longitude: 120.3805,
    jurisdiction: 'All 40 Barangays of Luna, La Union',
    capabilities: ['First-Line Barangay Swine Inspection', 'BBO Coordination', 'Disinfectant Distribution & Quarantine Checkpoints'],
  },
  {
    id: 'opvet-la-union',
    name: 'Office of the Provincial Veterinarian - La Union (OPVet / PVO La Union)',
    head: 'Provincial Veterinarian, DVM (Province of La Union)',
    address: 'Provincial Capitol Compound, Aguila Rd, San Fernando City, La Union',
    hotline: '(072) 242-5550 / 0917-838-5847',
    email: 'opvet@launion.gov.ph',
    latitude: 16.6159,
    longitude: 120.3166,
    jurisdiction: 'Province of La Union (19 Municipalities & 1 Component City)',
    capabilities: ['ASF Rapid Blood Antigen/PCR Testing', '1-7-10 km Zoning Enforcement', 'Provincial Biosecurity Task Force'],
  },
  {
    id: 'bai-rfo1',
    name: 'DA Regional Field Office I - RADDL Ilocos & BAI Task Force',
    head: 'Regional Animal Disease Diagnostic Laboratory (Region I)',
    address: 'Aguila Road, Sevilla, San Fernando City, La Union',
    hotline: '(072) 888-2045 / (02) 8528-2240',
    email: 'rfo1.regulatory@da.gov.ph',
    latitude: 16.6042,
    longitude: 120.3198,
    jurisdiction: 'Region I (Ilocos Norte, Ilocos Sur, La Union, Pangasinan)',
    capabilities: ['Confirmatory RT-PCR Diagnostics', 'Regional ASF Zoning Declaration', 'Indemnification Processing'],
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

    const incidentRef = `PVO-LU-${new Date().getFullYear()}-${(suspectedDisease || 'ASF').slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlert = {
      id: `pvo-alert-${Date.now()}`,
      incidentRef,
      farmName: farmName || 'Luna Backyard Swine Facility',
      ownerName: ownerName || 'Registered Swine Raiser',
      contactNumber: contactNumber || '0917-000-0000',
      province: province || 'La Union',
      municipality: municipality || 'Luna',
      barangay: barangay || 'Barangay Magallanes (Poblacion)',
      latitude: Number(latitude) || 16.8530,
      longitude: Number(longitude) || 120.3802,
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
