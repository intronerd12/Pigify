/**
 * Pig & Swine Topic Validator for Pigify Community Forum
 * Ensures posts are strictly relevant to pigs, swine health, biosecurity, and husbandry.
 */

const PIG_KEYWORDS = [
  // Core English pig terminology
  'pig', 'pigs', 'piglet', 'piglets', 'swine', 'swines', 'hog', 'hogs', 'porcine',
  'sow', 'sows', 'boar', 'boars', 'gilt', 'gilts', 'shoat', 'shoats', 'pork',
  'weaner', 'weaners', 'grower', 'growers', 'finisher', 'finishers',
  'litter', 'farrow', 'farrowing', 'gestation', 'boar stud', 'piggery',
  'swine farm', 'hog raiser', 'hog farming', 'swine production',

  // Core Tagalog/Filipino terminology
  'baboy', 'mga baboy', 'biik', 'mga biik', 'inahin', 'barako', 'lechon', 'litson',
  'pagbababuyan', 'alagang baboy', 'kulungan ng baboy', 'pababoy',

  // Swine diseases, symptoms & clinical indicators
  'asf', 'african swine fever', 'erysipelas', 'pdns', 'prrs', 'ped', 'pedv',
  'swine flu', 'hog cholera', 'swine fever', 'circovirus', 'parvovirus', 'strep suis',
  'scour', 'scours', 'swine diarrhea', 'skin lesion', 'skin lesions', 'skin rash',
  'diamond skin', 'ear cyanosis', 'cyanosis', 'purple ear', 'purple ears',
  'erythema', 'snout', 'trotter', 'trotters', 'tail biting',
  'sakit ng baboy', 'pulang pantal', 'lagnat ng baboy', 'tatae ang biik',
  'purgang baboy', 'bakuna sa baboy', 'vitamins ng baboy',

  // Swine feeds, care & husbandry
  'swine feeds', 'pig feed', 'pig feeds', 'hog feed', 'hog feeds', 'pre-starter',
  'starter feed', 'grower feed', 'finisher feed', 'pig pen', 'pig pens', 'pig sty',
  'pigsty', 'farrowing crate', 'biosecurity', 'swine biosecurity',
  'castration', 'iron injection', 'ear notching', 'pakain sa baboy',
  'backyard pig', 'backyard piggery', 'backyard raiser'
];

// Precompute regexes
const KEYWORD_REGEXES = PIG_KEYWORDS.map((kw) => {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(\\b|\\W|^)' + escaped + '(\\b|\\W|$)', 'i');
});

/**
 * Validates whether a community post is about pigs or swine farming.
 * @param {object} param0
 * @param {string} param0.text - Text of the post
 * @param {object|null} param0.scanSnapshot - Attached scan object (if any)
 * @returns {{ isRelevant: boolean, message?: string }}
 */
const validatePigTopic = ({ text, scanSnapshot }) => {
  // If an AI scan snapshot is attached from the Pigify diagnostic system, it is verified swine content
  if (scanSnapshot && typeof scanSnapshot === 'object') {
    const hasScanData = Boolean(
      scanSnapshot.imageUrl ||
      scanSnapshot.condition ||
      scanSnapshot.grade ||
      scanSnapshot.severity ||
      scanSnapshot.localScanId
    );
    if (hasScanData) {
      return { isRelevant: true };
    }
  }

  const cleanText = String(text || '').trim();
  if (!cleanText) {
    return {
      isRelevant: false,
      message: 'Post must contain a message or an attached swine clinical scan.'
    };
  }

  // Check against swine keyword dictionary
  for (const regex of KEYWORD_REGEXES) {
    regex.lastIndex = 0;
    if (regex.test(cleanText)) {
      return { isRelevant: true };
    }
  }

  return {
    isRelevant: false,
    message:
      'This community forum is exclusively for pigs and swine farming discussions (e.g., swine health, symptoms, ASF biosecurity, feeding, pens, or care). Please ensure your post is about pigs, or attach a swine diagnostic scan.'
  };
};

module.exports = {
  PIG_KEYWORDS,
  validatePigTopic,
};
