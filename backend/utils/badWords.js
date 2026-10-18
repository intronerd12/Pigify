// Comprehensive Profanity & Bad Language Filter (English & Tagalog/Filipino)

const BAD_WORDS_AND_PHRASES = [
  // Compound Tagalog curses & variations of "ina mo" / "putangina"
  'putang inang yan', 'putanginang yan', 'putang inang', 'putanginang',
  'putang ina mo', 'putangina mo', 'putanginamo', 'putang ina', 'putangina',
  'tang inang yan', 'tanginang yan', 'tang inang', 'tanginang',
  'tang ina mo', 'tangina mo', 'tanginamo', 'tang ina', 'tangina',
  'king inang yan', 'kinginang yan', 'king inang', 'kinginang',
  'king ina mo', 'kingina mo', 'kinginamo', 'kinangina', 'king ina', 'kingina',
  'pota inang yan', 'potanginang yan', 'pota inang', 'potanginang',
  'pota ina mo', 'potaena mo', 'potangina mo', 'potanginamo', 'potaena', 'potangina', 'pota ina',
  'pucha inang', 'puchangina', 'pucha',
  'punyeta ka', 'punyetaka', 'punyeta mo', 'punyetang', 'punyeta',

  // Variations of "ina mo" / "ina ka" / "ina nyo"
  'ina mo', 'inamo', 'ina ka', 'inaka', 'ina nyo', 'inanyo', 'ina niyo', 'inaniyo', 'ina niya', 'inaniya',

  // Tagalog insults & slurs
  'tarantado ka', 'tarantadoka', 'tarantada ka', 'tarantadaka', 'tarantado', 'tarantada',
  'gago ka', 'gagoka', 'gaga ka', 'gagaka', 'kagaguhan', 'gago', 'gaga',
  'bobo ka', 'boboka', 'kabobohan', 'bobo', 'bobohan',
  'tanga ka', 'tangaka', 'katangahan', 'tanga', 'tangahan',
  'ulol ka', 'ulolka', 'ulul ka', 'ululka', 'kaululan', 'ulul', 'ulol',
  'pakyu ka', 'pakyuka', 'pakyu', 'fakyu', 'fckyu', 'pakyung',
  'hinayupak ka', 'hinayupakka', 'hinayupak', 'hayupak ka', 'hayupak', 'hayop ka',
  'kupal ka', 'kupalka', 'kupal',
  'ogag ka', 'ogag', 'gunggong', 'engot', 'inutil', 'hangal',
  'lintik ka', 'lintik', 'leche ka', 'leche', 'letse ka', 'letse', 'hudas',
  'yawa ka', 'yawa', 'peste ka', 'peste', 'pesteng', 'buwisit', 'bwisit',

  // Tagalog vulgar / sexual terms
  'kantot', 'kantutan', 'k@ntot', 'kinantot', 'iyot', 'iyutan', 'iniyot',
  'pokpok', 'bayag', 'tamod', 'jakol', 'j@kol', 'tsupa', 'chupa',
  'pepe', 'kiki', 'tite', 'burat', 'puke', 'puki', 'pekpek', 'puday',

  // English profanities
  'motherfucker', 'mother fucker', 'son of a bitch',
  'fuck you', 'fuck off', 'fucking', 'fucker', 'fuckers', 'fucked', 'fuckhead', 'fck', 'fuk', 'fuck',
  'bullshit', 'shitty', 'shit',
  'bitch', 'bitches', 'bitching',
  'asshole', 'assholes', 'bastard', 'bastards', 'cunt', 'cunts',
  'dick', 'dicks', 'pussy', 'pussies', 'cock', 'cocks', 'whore', 'whores', 'slut', 'sluts',
  'damn'
];

// Sort phrases from longest to shortest so compound phrases match first
const SORTED_PHRASES = [...BAD_WORDS_AND_PHRASES].sort((a, b) => b.length - a.length);

const PHRASE_REGEXES = SORTED_PHRASES.map((phrase) => {
  const words = phrase.split(/\s+/);
  const regexPattern = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');
  return new RegExp('(\\b|\\W|^)' + regexPattern + '(\\b|\\W|$)', 'gi');
});

// Additional patterns for obfuscated profanities (f*ck, sh!t, b!tch, p*ta, g@go, etc.)
const OBFUSCATED_PATTERNS = [
  /(\b|\W|^)f[\*\@\#\$]ck(\b|\W|$)/gi,
  /(\b|\W|^)sh[\*\@\#\$\!]t(\b|\W|$)/gi,
  /(\b|\W|^)b[\*\@\#\$\!]tch(\b|\W|$)/gi,
  /(\b|\W|^)p[\*\@\#\$]t[a|@]?(?:ng)?(?:ina)?(?:mo)?(\b|\W|$)/gi,
  /(\b|\W|^)t[\*\@\#\$]ng(?:ina)?(?:mo)?(\b|\W|$)/gi,
  /(\b|\W|^)g[\*\@\#\$]g[o|a]?(\b|\W|$)/gi,
  /(\b|\W|^)b[\*\@\#\$]b[o|0]?(\b|\W|$)/gi,
  /(\b|\W|^)in[\*\@\#\$]m[o|0]?(\b|\W|$)/gi,
];

/**
 * Masks offensive words in text with asterisks.
 */
const maskBadLanguage = (text) => {
  if (!text) return '';
  let masked = String(text);

  for (const regex of PHRASE_REGEXES) {
    regex.lastIndex = 0;
    masked = masked.replace(regex, (match, p1, p2) => {
      const phrase = match.slice(p1.length, match.length - p2.length);
      const censored = phrase.replace(/[^\s]/g, '*');
      return p1 + censored + p2;
    });
  }

  for (const regex of OBFUSCATED_PATTERNS) {
    regex.lastIndex = 0;
    masked = masked.replace(regex, (match, p1, p2) => {
      const phrase = match.slice(p1.length, match.length - p2.length);
      const censored = phrase.replace(/[^\s]/g, '*');
      return p1 + censored + p2;
    });
  }

  return masked;
};

/**
 * Checks if the text contains any bad words.
 */
const containsBadLanguage = (text) => {
  if (!text) return false;
  const str = String(text);

  for (const regex of PHRASE_REGEXES) {
    regex.lastIndex = 0;
    if (regex.test(str)) return true;
  }
  for (const regex of OBFUSCATED_PATTERNS) {
    regex.lastIndex = 0;
    if (regex.test(str)) return true;
  }

  return false;
};

module.exports = {
  BAD_WORDS: BAD_WORDS_AND_PHRASES,
  maskBadLanguage,
  containsBadLanguage,
};
