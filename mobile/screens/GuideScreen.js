import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const THEME = {
  bg: '#070A13',
  cardBg: 'rgba(13, 20, 36, 0.92)',
  cardBgAlt: 'rgba(20, 29, 48, 0.85)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderActive: '#F43F5E',
  primary: '#F43F5E',
  primaryRose: '#FB7185',
  primaryDark: '#BE123C',
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  purple: '#A855F7',
  text: '#F8FAFC',
  textSub: '#94A3B8',
  textMuted: '#64748B',
};

const CLINICAL_GUIDES = {
  erysipelas: {
    id: 'erysipelas',
    name: 'Swine Erysipelas',
    tagline: 'Diamond Skin Disease • Bacterial Dermatopathy',
    pathogen: 'Erysipelothrix rhusiopathiae',
    severity: 'High / Critical',
    severityColor: '#f43f5e',
    badge: 'Class I Alert',
    icon: 'shield-alert',
    overview:
      'Acute, subacute, or chronic systemic bacterial disease characterized by raised rhomboid (diamond-shaped) erythematous or purplish skin plaques, high pyrexia (40-42°C), and potential endocarditis or arthritis.',
    quickStats: [
      { label: 'Etiology', val: 'Gram-Positive Bacilli' },
      { label: 'Incubation', val: '1 - 7 Days' },
      { label: 'Morbidity', val: 'Moderate - High' },
      { label: 'Mortality', val: 'Up to 50% untreated' },
    ],
    pathologicalSigns: [
      {
        title: 'Rhomboid Urticarial Lesions',
        desc: 'Square or diamond-shaped red-to-purple cutaneous plaques on the back, flank, and ears that blanch under digital pressure initially.',
      },
      {
        title: 'Acute High Pyrexia',
        desc: 'Sudden spike in rectal temperature (40°C to 42°C), severe prostration, anorexia, and unwillingness to stand.',
      },
      {
        title: 'Chronic Vegetative Endocarditis',
        desc: 'Cauliflower-like heart valve lesions and non-suppurative polyarthritis causing chronic stiffness in survivors.',
      },
    ],
    interventionProtocol: [
      'Immediate intramuscular administration of Penicillin G (20,000 IU/kg) for 3-5 consecutive days.',
      'Prompt isolation of affected swine to a clean, dry quarantine pen away from nursery sectors.',
      'Herd-wide therapeutic water medication (amoxicillin or tetracyclines) for pens sharing airflow.',
      'Deep disinfection of pens with glutaraldehyde or 2% sodium hypochlorite solution.',
    ],
    preventionMeasures: [
      'Routine vaccination program with killed bacterin at 8-10 weeks of age.',
      'Aggressive rodent control, as mice and rats serve as biological reservoirs.',
      'Strict quarantine of newly acquired breeding stock for a minimum of 30 days.',
    ],
  },
  greasypig: {
    id: 'greasypig',
    name: 'Greasy Pig Disease',
    tagline: 'Exudative Epidermitis • Superficial Cutaneous Exudation',
    pathogen: 'Staphylococcus hyicus',
    severity: 'Moderate / High',
    severityColor: '#f59e0b',
    badge: 'Suckling & Weaner Risk',
    icon: 'water',
    overview:
      'Acute generalized superficial dermatitis of suckling piglets and weaners characterized by excessive sebaceous gland secretion, dark greasy exudate, and rapid dehydration without prominent pruritus.',
    quickStats: [
      { label: 'Etiology', val: 'Toxigenic Staph' },
      { label: 'Incubation', val: '2 - 4 Days' },
      { label: 'Target Age', val: '1 - 6 Weeks Old' },
      { label: 'Mortality', val: 'Up to 80% in piglets' },
    ],
    pathologicalSigns: [
      {
        title: 'Brownish Sebaceous Exudate',
        desc: 'Skin becomes greasy, sticky, and turns dark brown-black as sebum blends with epidermal debris and dirt.',
      },
      {
        title: 'Facial and Ear Erosions',
        desc: 'Erythematous macules erupting around snout, eyes, and behind ears, progressing rapidly across the entire ventral abdomen.',
      },
      {
        title: 'Profound Dehydration',
        desc: 'Severe electrolyte and water loss across cracked epidermis; piglets appear shrunken and lethargic.',
      },
    ],
    interventionProtocol: [
      'Gentle whole-body antiseptic soak using 0.5% chlorhexidine or mild savlon wash to strip greasy crusts.',
      'Injectable antimicrobials (lincomycin, amoxicillin, or trimethoprim-sulfa) according to weight.',
      'Oral rehydration solution (ORS) with electrolytes provided ad libitum in warm nursery creep areas.',
      'Dry bedding replacement: completely eliminate abrasive rough wet concrete contact.',
    ],
    preventionMeasures: [
      'Clip needle teeth properly within 24 hours of birth to avoid facial abrasions during milk nursing.',
      'Smooth pen floors and repair all rough metallic partitions that cause micro-trauma.',
      'Wash and disinfect sow teats and udder before farrowing crates entry.',
    ],
  },
  mange: {
    id: 'mange',
    name: 'Sarcoptic Mange',
    tagline: 'Parasitic Dermatitis • Cutaneous Acariasis',
    pathogen: 'Sarcoptes scabiei var. suis',
    severity: 'Moderate',
    severityColor: '#06b6d4',
    badge: 'Endemic Vector',
    icon: 'bug',
    overview:
      'Extremely contagious parasitic infestation causing intense pruritus, hyperkeratosis, thick crusty ear canals, and constant scratching against pen pen walls leading to carcass downgrading and stunted feed efficiency.',
    quickStats: [
      { label: 'Etiology', val: 'Burrowing Mite' },
      { label: 'Life Cycle', val: '10 - 15 Days' },
      { label: 'Transmission', val: 'Direct Contact' },
      { label: 'Feed Loss', val: '10 - 15% Reduction' },
    ],
    pathologicalSigns: [
      {
        title: 'Intense Pruritus & Rubbing',
        desc: 'Persistent frenzied scratching of ears, neck, and ribs against metal railings, concrete, and trough edges.',
      },
      {
        title: 'Thick Asbestos-like Ear Crusts',
        desc: 'Yellowish-grey dry, hyperkeratotic crusts lining the inner pinna and external auditory meatus.',
      },
      {
        title: 'Skin Thickening & Corrugation',
        desc: 'Chronic rub damage causes leathery, heavily wrinkled skin with hair loss and secondary bacterial infection.',
      },
    ],
    interventionProtocol: [
      'Subcutaneous Ivermectin (300 µg/kg) or Doramectin injection; repeat in 14 days to eliminate newly hatched nymphs.',
      'Ear canal mechanical debridement with mineral oil before applying acaricidal topical sprays.',
      'Simultaneous treatment of all sows 7-14 days prior to farrowing to block transmission to litter.',
      'Thorough steam cleaning and high-pressure acaricidal wash of empty pens before restocking.',
    ],
    preventionMeasures: [
      'Treat all incoming breeding animals twice with macrocyclic lactones during quarantine.',
      'Conduct routine ear scraping screenings on mature sows showing frequent scratching.',
      'Maintain an all-in, all-out system with rigorous pen resting intervals.',
    ],
  },
  biosecurity: {
    id: 'biosecurity',
    name: 'Pen Biosecurity',
    tagline: 'Clinical Infection Control & Protocol Standards',
    pathogen: 'Multi-Agent Biosecurity Standard',
    severity: 'Standard Protocol',
    severityColor: '#10b981',
    badge: 'Prevention Standard',
    icon: 'checkmark-done-circle',
    overview:
      'Operational biosecurity guidelines designed for Philippine backyard and commercial piggeries to prevent pathogen entry, curtail dermatological disease spread, and optimize swine microclimate.',
    quickStats: [
      { label: 'Foot Bath', val: 'Active Virucide' },
      { label: 'Buffer Zone', val: 'Min. 10 Meters' },
      { label: 'Down Time', val: '7-14 Days Empty' },
      { label: 'Sanitation', val: 'All-In, All-Out' },
    ],
    pathologicalSigns: [
      {
        title: 'Foot Bath & Vehicle Disinfection',
        desc: 'Maintain fresh disinfectant footbaths (glutaraldehyde, potassium peroxymonosulfate) at pen entrances changed every 48 hours.',
      },
      {
        title: 'Quarantine Holding Buffer',
        desc: 'Isolate any pig presenting skin erythema, pustules, or sudden listlessness into Sector E quarantine for 14-21 days.',
      },
      {
        title: 'Ventilation & Humidity Balance',
        desc: 'Keep pen humidity below 75% and ensure continuous air turnover to prevent ammonia buildup that damages dermal integrity.',
      },
    ],
    interventionProtocol: [
      'Establish a strict Red-Amber-Green cleanliness zoning across nursery, grower, and isolation pens.',
      'Mandate boots and overall change for operators moving between grower herds and farrowing crates.',
      'Store swine feed in elevated, sealed rodent-proof bins to prevent contamination by wild disease vectors.',
      'Coordinate immediately with local municipal veterinary officers upon suspecting acute systemic lesions.',
    ],
    preventionMeasures: [
      'Post visible biosecurity warning signage and prohibit unauthorized farm visitors.',
      'Perform monthly environmental swabs of water lines and floor cracks for microbial load check.',
      'Keep comprehensive digital clinical records of all vaccinations and medical interventions.',
    ],
  },
  asf: {
    id: 'asf',
    name: 'African Swine Fever (ASF)',
    tagline: 'Acute Hemorrhagic Epizootic • High-Mortality Viral Disease',
    pathogen: 'African Swine Fever Virus (Asfarviridae)',
    severity: 'Critical Emergency',
    severityColor: '#f43f5e',
    badge: 'BAI Red Alert & PVO Mandate',
    icon: 'flame',
    overview:
      'High-threat viral disease causing near 100% mortality in both commercial and Philippine Native Pigs. Characterized by high pyrexia (40.5-42°C), cyanotic purple blotches on ears, snout, and abdomen, anorexia, bloody diarrhea, and rapid mortality within 2-7 days. Incurable and antibiotic-resistant.',
    quickStats: [
      { label: 'Etiology', val: 'DNA Asfarvirus' },
      { label: 'Incubation', val: '3 - 15 Days' },
      { label: 'Mortality', val: 'Up to 100% in all pigs' },
      { label: 'Treatment', val: 'No Vaccine / No Cure' },
    ],
    pathologicalSigns: [
      {
        title: 'Severe High Pyrexia (>40.5°C)',
        desc: 'Extreme spiking fever, animals huddled/piling together, profound lethargy, and refusal to feed.',
      },
      {
        title: 'Cyanotic Cutaneous Discoloration',
        desc: 'Dark purple/red patches on ear tips, snout, tail, and ventral abdomen. On Native Pigs, inspect inner ear flaps and eyes as dark skin masks red blushing.',
      },
      {
        title: 'Mass Sudden Mortality',
        desc: 'Rapid death of multiple age groups within 24 to 72 hours; severe splenomegaly (enlarged dark friable spleen) and internal hemorrhages.',
      },
    ],
    interventionProtocol: [
      'IMMEDIATE PVO REPORTING: Notify Provincial Veterinary Office (PVO) and Municipal Agriculture Office immediately.',
      'TOTAL MOVEMENT FREEZE: Prohibit any live pig sales, slaughter, or movement within 1 km radius (Red Zone).',
      'CHEMICAL VIRUCIDAL DISINFECTION: Apply 2% Virkon S (10-20g/L), 2% Citric acid, or hydrated slaked lime whitewash across pens.',
      'DO NOT DISCARD DEAD PIGS IN RIVERS: Await official veterinary disposal or bury under 2 meters depth with lime.',
    ],
    preventionMeasures: [
      'Zero swill feeding (kanin-baboy); swill must be boiled vigorously for at least 60 continuous minutes.',
      'Install disinfectant footbaths and tire spray dips at farm entry gates changed every 48 hours.',
      'Enforce 1-7-10 km zoning quarantine rings per Department of Agriculture AO No. 22.',
    ],
  },
  native_pigs: {
    id: 'native_pigs',
    name: 'Philippine Native Pigs',
    tagline: 'Baboy Katutubo • Melanin Traits & Disease Presentation',
    pathogen: 'Sus scrofa domesticus (Philippine Native Breed)',
    severity: 'Breed Profile',
    severityColor: '#06b6d4',
    badge: 'Native Pig Protocol',
    icon: 'paw',
    overview:
      'Philippine Native Pigs (Baboy Katutubo / Black Pig - Ilocos, Batangas, Kalinga strains) feature thick, melanin-rich dermal layers and high climatic tolerance. However, native pigs have ZERO genetic immunity to African Swine Fever. Due to dark skin pigmentation, clinical erythema and diamond skin lesions are obscured and appear as darker hyperkeratotic crusts.',
    quickStats: [
      { label: 'Coat Color', val: 'Black / Dark Slate' },
      { label: 'Skin Dermis', val: 'Thick Melanin Layer' },
      { label: 'ASF Resistance', val: '0% (100% Mortal)' },
      { label: 'Housing', val: 'Backyard Rustic Pens' },
    ],
    pathologicalSigns: [
      {
        title: 'Obscured Dermal Lesions',
        desc: 'Red diamond plaques and petechial hemorrhages are less visible through black epidermis; physical palpation for raised ridges is essential.',
      },
      {
        title: 'Chronic Sarcoptic Mange Endemism',
        desc: 'Frequent scratching against rustic bamboo and coconut post partitions causes thick asbestos-like grey ear crusts.',
      },
      {
        title: 'Respiratory & Vector Exposure',
        desc: 'Backyard tethering and unsealed pens expose native pigs to sylvatic tick vectors (Ornithodoros) and wild boars.',
      },
    ],
    interventionProtocol: [
      'Calibrate diagnostic cameras for contrast normalization over dark pigmented pig hide.',
      'Smooth rustic wooden and bamboo partitions to reduce skin micro-trauma and mange mite entry.',
      'Administer macrocyclic lactones (Ivermectin 300 µg/kg) twice a year for endemic backyard mange control.',
      'Apply slaked lime whitewash over dirt floors to neutralize parasites and bacterial pathogens.',
    ],
    preventionMeasures: [
      'Construct a double-fence perimeter buffer to prevent interaction with free-ranging animals or wild boars.',
      'Separate suckling native piglets from older sows during feeding to prevent trampling abrasions.',
      'Coordinate with the Provincial Veterinary Office for native pig registry and biosecurity certification.',
    ],
  },
  disinfection: {
    id: 'disinfection',
    name: 'Disinfection Measures',
    tagline: 'Chemical Virucides & Sick Pig Isolation Protocol',
    pathogen: 'SOP Disinfection & Biosecurity Protocol',
    severity: 'Mandatory Practice',
    severityColor: '#10b981',
    badge: 'SOP Standard',
    icon: 'shield-checkmark',
    overview:
      'Standard Operating Procedure (SOP) for disinfecting pens and managing sick swine in Philippine backyard farms. Chemical virucides must be chosen correctly: Potassium peroxymonosulfate (Virkon S), Hydrated Slaked Lime, Bleach (0.5% available chlorine), and Glutaraldehyde.',
    quickStats: [
      { label: 'Footbath Virucide', val: 'Virkon S (1:100)' },
      { label: 'Floor Slurry', val: 'Slaked Lime (10-20%)' },
      { label: 'Contact Time', val: '15 - 30 Minutes' },
      { label: 'Pen Downtime', val: '48 - 72 Hours Dry' },
    ],
    pathologicalSigns: [
      {
        title: 'Step 1: Immediate Sick Pig Isolation',
        desc: 'Move sick pig to quarantine pen >10m away. Use dedicated boots and separate feed buckets.',
      },
      {
        title: 'Step 2: 4-Stage Pen Decontamination',
        desc: 'Dry scrape all manure first (organic matter deactivates chemical disinfectants) -> Detergent wash -> Apply chemical virucide at 300-400 mL/m² -> Let dry for 72 hours.',
      },
      {
        title: 'Step 3: Slaked Lime Perimeter Barrier',
        desc: 'Spread dry hydrated slaked lime powder or 20% whitewash slurry along walkways and pen borders (pH >12 destroys viruses).',
      },
    ],
    interventionProtocol: [
      'Virkon S (1-2%): 10g-20g per 1 Liter of water. Preferred for footbaths, partition walls, and boots.',
      'Sodium Hypochlorite (0.5% Bleach): 1 part bleach to 9 parts water for clean plastic drinkers and concrete troughs.',
      'Citric Acid (2%): 20g per 1 Liter water; rapidly inactivates ASF virions on vehicle tires and footwear.',
      'Chlorinate water tanks at 3-5 ppm free chlorine to prevent communal waterborne transmission.',
    ],
    preventionMeasures: [
      'Replace disinfectant in pen entrance footbaths every 48 hours (sunlight degrades active chlorine and peroxides).',
      'Sanitize all delivery tricycles and feed sacks before entering farm premises.',
      'Never allow visitors or livestock traders inside the pen area without boot changes.',
    ],
  },
  reporting_roles: {
    id: 'reporting_roles',
    name: 'Who Checks & Reports ASF?',
    tagline: 'BAI & PVO Chain of Reporting & Contagion Verification',
    pathogen: 'Official Governance & Epidemiology Protocol',
    severity: 'Government Protocol',
    severityColor: '#38bdf8',
    badge: 'BAI & PVO Hierarchy',
    icon: 'people',
    overview:
      'Official statutory chain of responsibility under the Department of Agriculture (DA) and BAI BABay ASF program. The Provincial Veterinary Office (PVO) is the statutory body responsible for on-ground checking and reporting whether ASF is contagious and spreading between municipalities.',
    quickStats: [
      { label: 'First Observer', val: 'Backyard Farmer' },
      { label: 'Ground Security', val: 'Barangay Officer (BBO)' },
      { label: 'LGU Verification', val: 'Municipal Vet (MAO)' },
      { label: 'Spread Tracking', val: 'Provincial Vet (PVO)' },
    ],
    pathologicalSigns: [
      {
        title: 'Tier 1: Backyard Farmer (First Observer)',
        desc: 'Daily observation with Pigify scanner; isolates sick pig, freezes sales, logs alert within 2 hours.',
      },
      {
        title: 'Tier 2: Barangay Biosecurity Officer (BBO)',
        desc: 'Verifies perimeter cordon; ensures dead pigs are not dumped in rivers; reports to MAO within 4 hours.',
      },
      {
        title: 'Tier 3: Municipal Agriculture Office (MAO)',
        desc: 'Inspects surrounding pens within 500m; issues municipal transport freeze; escalates to PVO within 12 hours.',
      },
    ],
    interventionProtocol: [
      'Tier 4: PROVINCIAL VETERINARY OFFICE (PVO): Primary statutory agency responsible for checking contagion spread, deploying rapid PCR test teams, collecting blood samples, and establishing 1-7-10 km quarantine zones.',
      'Tier 5: BUREAU OF ANIMAL INDUSTRY (BAI): Molecular RT-PCR confirmation, National ASF zoning updates, and national indemnification funds.',
      'PVO Laguna Hotline: (049) 501-1823 / 0917-838-5847 &bull; PVO Batangas: (043) 723-1498.',
      'BAI National Task Force Emergency: (02) 8528-2240 / 0917-838-5847.',
    ],
    preventionMeasures: [
      'Comply with all BAI inter-town quarantine checkpoints and vehicle disinfections.',
      'Always secure a Veterinary Health Certificate (VHC) and Shipping Permit before transporting pigs.',
      'Participate in the BABay ASF barangay biosecurity surveillance program.',
    ],
  },
};

export default function GuideScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const initialKey =
    route.params?.initialTab && CLINICAL_GUIDES[route.params.initialTab]
      ? route.params.initialTab
      : 'erysipelas';

  const [activeTab, setActiveTab] = useState(initialKey);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (route.params?.initialTab && CLINICAL_GUIDES[route.params.initialTab]) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  const activeGuide = CLINICAL_GUIDES[activeTab] || CLINICAL_GUIDES.erysipelas;

  return (
    <View style={styles.container}>
      {/* Top Cyber Telemetry Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.brandRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.brandSubtitle}>CLINICAL PATHOLOGY COMPENDIUM</Text>
            </View>
            <Text style={styles.headerTitle}>Swine Clinical Guide</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Chatbot')}
            style={styles.aiHelpBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="chatbubbles" size={17} color="#fb7185" />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          style={styles.tabScroll}
        >
          {Object.keys(CLINICAL_GUIDES).map((key) => {
            const guide = CLINICAL_GUIDES[key];
            const isSelected = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(key)}
                style={[
                  styles.tabPill,
                  isSelected && styles.tabPillActive,
                  isSelected && { borderColor: guide.severityColor },
                ]}
              >
                <Ionicons
                  name={guide.icon}
                  size={15}
                  color={isSelected ? guide.severityColor : THEME.textMuted}
                />
                <Text
                  style={[
                    styles.tabPillText,
                    isSelected && [styles.tabPillTextActive, { color: '#f8fafc' }],
                  ]}
                >
                  {guide.name}
                </Text>
                {isSelected && (
                  <View style={[styles.activeDot, { backgroundColor: guide.severityColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={[styles.scrollBody, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Hero Clinical Disease Banner Card */}
          <LinearGradient
            colors={['#1e1b4b', '#0f172a', '#060911']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroTopRow}>
              <View
                style={[
                  styles.severityPill,
                  {
                    backgroundColor: `${activeGuide.severityColor}22`,
                    borderColor: `${activeGuide.severityColor}66`,
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={13} color={activeGuide.severityColor} />
                <Text style={[styles.severityPillText, { color: activeGuide.severityColor }]}>
                  {activeGuide.severity}
                </Text>
              </View>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{activeGuide.badge}</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{activeGuide.name}</Text>
            <Text style={styles.heroPathogen}>Pathogen: {activeGuide.pathogen}</Text>
            <Text style={styles.heroOverview}>{activeGuide.overview}</Text>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              {activeGuide.quickStats.map((item, idx) => (
                <View key={idx} style={styles.statBox}>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statVal}>{item.val}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Section 1: Pathological Diagnostic Signs */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="pulse" size={17} color="#fb7185" />
            <Text style={styles.sectionHeading}>Key Pathological Signs</Text>
          </View>

          <View style={styles.cardsContainer}>
            {activeGuide.pathologicalSigns.map((sign, index) => (
              <Surface key={index} style={styles.detailCard} elevation={0}>
                <View style={styles.detailCardHeader}>
                  <View style={styles.stepNumCircle}>
                    <Text style={styles.stepNumText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.signTitle}>{sign.title}</Text>
                </View>
                <Text style={styles.signDesc}>{sign.desc}</Text>
              </Surface>
            ))}
          </View>

          {/* Section 2: Clinical Intervention Protocol */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="medkit" size={17} color="#10b981" />
            <Text style={styles.sectionHeading}>Immediate Intervention Protocol</Text>
          </View>

          <Surface style={styles.protocolCard} elevation={0}>
            {activeGuide.interventionProtocol.map((step, idx) => (
              <View key={idx} style={styles.protocolRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.protocolIcon} />
                <Text style={styles.protocolText}>{step}</Text>
              </View>
            ))}
          </Surface>

          {/* Section 3: Farm-Level Prevention Measures */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark" size={17} color="#06b6d4" />
            <Text style={styles.sectionHeading}>Preventative Biosecurity Measures</Text>
          </View>

          <Surface style={styles.protocolCard} elevation={0}>
            {activeGuide.preventionMeasures.map((tip, idx) => (
              <View key={idx} style={styles.protocolRow}>
                <Ionicons name="chevron-forward-circle" size={18} color="#06b6d4" style={styles.protocolIcon} />
                <Text style={styles.protocolText}>{tip}</Text>
              </View>
            ))}
          </Surface>

          {/* Quick Action Clinical CTA */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Scan')}
              style={styles.scanCtaBtn}
            >
              <LinearGradient
                colors={['#f43f5e', '#be123c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Ionicons name="scan" size={18} color="#FFFFFF" />
                <Text style={styles.ctaBtnText}>Launch AI Scanner</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Sorting')}
              style={styles.triageCtaBtn}
            >
              <Ionicons name="layers" size={18} color="#94a3b8" />
              <Text style={styles.triageBtnText}>View Triage Records</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
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
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  aiHelpBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabScroll: {
    marginTop: 4,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  tabPillTextActive: {
    fontWeight: '700',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  scrollBody: {
    padding: 16,
  },
  heroBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  severityPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroPathogen: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#06b6d4',
    marginBottom: 10,
  },
  heroOverview: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  cardsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fb7185',
  },
  signTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  signDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    paddingLeft: 34,
  },
  protocolCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  protocolIcon: {
    marginTop: 2,
  },
  protocolText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
    flex: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  scanCtaBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  triageCtaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: THEME.cardBg,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 14,
  },
  triageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
});
