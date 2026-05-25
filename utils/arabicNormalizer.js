export const normalizeForWaqf = (word, isAtWaqf) => {
  if (!word) return '';
  if (!isAtWaqf) return normalizeArabicText(word);
  
  // At waqf - remove tanween and apply rules
  let processed = word;
  
  // Tanween Fatha (2 zabar) -> becomes alif sound
  if (processed.includes('\u064B')) {
    processed = processed.replace(/\u064B/g, '');
    // Add alif at end if not present
    if (!processed.endsWith('\u0627') && !processed.endsWith('\u0622')) {
      processed = processed + '\u0627';
    }
  }
  
  // Tanween Damma (2 pesh) -> remove noon, keep damma
  if (processed.includes('\u064C')) {
    processed = processed.replace(/\u064C/g, '\u064F');
    // Remove noon if present at end
    processed = processed.replace(/\u0646$/, '');
  }
  
  // Tanween Kasra (2 zeer) -> remove noon, keep kasra
  if (processed.includes('\u064D')) {
    processed = processed.replace(/\u064D/g, '\u0650');
    processed = processed.replace(/\u0646$/, '');
  }
  
  // Normalize after waqf rules
  return normalizeArabicText(processed);
};

export const getWaqfPronunciation = (word) => {
  if (!word) return '';
  
  let result = word;
  
  // Remove tanween and adjust
  if (result.includes('\u064B')) { // Tanween Fatha
    result = result.replace(/\u064B/g, '');
    // Add alif sound at the end
    result = result.replace(/([^\u0627\u0622])$/, '$1\u0627');
  }
  
  if (result.includes('\u064C')) { // Tanween Damma
    result = result.replace(/\u064C/g, '\u064F');
    result = result.replace(/\u0646$/, '');
  }
  
  if (result.includes('\u064D')) { // Tanween Kasra
    result = result.replace(/\u064D/g, '\u0650');
    result = result.replace(/\u0646$/, '');
  }
  
  // Remove remaining diacritics
  result = removeDiacritics(result);
  result = normalizeAlif(result);
  
  return result;
};

// =====================================================
// DIACRITICS REMOVAL
// =====================================================

export const removeDiacritics = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F]/g, '')   // All standard diacritics
    .replace(/\u0670/g, '')             // Khara zabar (superscript alif)
    .replace(/[\u06D6-\u06ED]/g, '');   // Other Quranic marks
};

/**
 * Normalize Alif variations to standard Alif
 */
export const normalizeAlif = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u0627');
};

/**
 * Phonetic normalization for Pakistani/Urdu accent
 * This treats similar-sounding letters as equivalent
 */
export const normalizePhonetic = (text) => {
  if (!text) return '';
  let result = text;
  
  // S-group (ص ث س all sound like س in Urdu accent)
  result = result.replace(/[\u0635\u062B]/g, '\u0633');
  
  // Z-group (ذ ظ ض ز all sound like ز)
  result = result.replace(/[\u0630\u0638\u0636]/g, '\u0632');
  
  // T-group (ط ت)
  result = result.replace(/\u0637/g, '\u062A');
  
  // Qaf/Kaf (ق ك) - often same in Urdu
  result = result.replace(/[\u0642]/g, '\u0643');
  
  // Waw variants
  result = result.replace(/\u0624/g, '\u0648');
  
  // Ya variants
  result = result.replace(/[\u0626\u0649]/g, '\u064A');
  
  // Ta marbuta
  result = result.replace(/\u0629/g, '\u0647');
  
  // Ha (ح) sounds like ه in many accents
  result = result.replace(/\u062D/g, '\u0647');
  
  return result;
};

/**
 * FULL normalization for comparison
 * Use this for strict comparison
 */
export const normalizeArabicText = (text) => {
  if (!text) return '';
  let t = text;
  t = removeDiacritics(t);
  t = normalizeAlif(t);
  t = normalizePhonetic(t);
  t = t.replace(/[^\u0600-\u06FF\s]/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
};

/**
 * LIGHT normalization for vowel equivalence
 * Removes diacritics but keeps letter distinctions
 */
export const normalizeVowelOnly = (text) => {
  if (!text) return '';
  let t = text;
  t = removeDiacritics(t);
  t = normalizeAlif(t);
  t = t.replace(/[^\u0600-\u06FF\s]/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
};

/**
 * WAW prefix strip — وإياك vs إياك
 */
export const stripWawPrefix = (word) => {
  if (word && word.startsWith('\u0648')) return word.slice(1);
  return word;
};

/**
 * Check if character is a vowel marker (zabar, pesh, zeer, khara zabar)
 */
export const isVowelMarker = (char) => {
  return /[\u064B-\u065F\u0670]/.test(char);
};

/**
 * Get base letters without vowels
 */
export const getBaseLetters = (word) => {
  if (!word) return '';
  return word.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
};

/**
 * Get cleaned word (remove diacritics but keep alifs)
 */
export const getCleanedWord = (word) => {
  if (!word) return '';
  return word
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
};

/**
 * Check if two words are equivalent (only vowel difference allowed)
 * Alif (ا) = Zabar (َ) = Khara Zabar (ٰ) all same sound!
 */
export const areVowelEquivalent = (word1, word2) => {
  if (!word1 || !word2) return false;
  
  // Quick check after full normalization
  const norm1 = normalizeArabicText(word1);
  const norm2 = normalizeArabicText(word2);
  if (norm1 === norm2) return true;
  
  // Check base letters (consonants only)
  const base1 = getBaseLetters(word1);
  const base2 = getBaseLetters(word2);
  
  if (base1 === base2) return true;
  
  // Check cleaned words (with alifs but no diacritics)
  const clean1 = getCleanedWord(word1);
  const clean2 = getCleanedWord(word2);
  
  if (clean1 === clean2) return true;
  
  return false;
};

/**
 * Check if two words differ only in harakat (khara zabar vs zabar vs alif)
 */
export const areDifferentOnlyInHarakat = (word1, word2) => {
  if (!word1 || !word2) return false;
  
  // Remove ALL harakat from both (including khara zabar)
  const w1NoHarakat = word1.replace(/[\u064B-\u065F\u0670]/g, '');
  const w2NoHarakat = word2.replace(/[\u064B-\u065F\u0670]/g, '');
  
  // If base letters are same, difference is only in harakat
  if (w1NoHarakat === w2NoHarakat) return true;
  
  // Also check alif vs no alif (both produce 'a' sound)
  const removeAlif = (text) => {
    return text.replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
  };
  
  const w1NoAlif = removeAlif(w1NoHarakat);
  const w2NoAlif = removeAlif(w2NoHarakat);
  
  if (w1NoAlif === w2NoAlif) {
    return true; // Difference is presence/absence of alif - both are 'a' sounds
  }
  
  return false;
};

/**
 * Check if two words have same sound (khara zabar = zabar = alif)
 * This is the MAIN function for sound-based matching
 */
export const soundMatch = (userWord, correctWord) => {
  if (!userWord || !correctWord) return false;
  
  // Quick exact match (including diacritics)
  if (userWord === correctWord) return true;
  
  // Use wordsMatchWithWaw for comprehensive matching
  return wordsMatchWithWaw(userWord, correctWord);
};

/**
 * Calculate word similarity score with fast recitation tolerance
 */
export const wordSimilarityScore = (userWord, correctWord) => {
  if (soundMatch(userWord, correctWord)) return 100;
  if (areVowelEquivalent(userWord, correctWord)) return 100;
  if (areDifferentOnlyInHarakat(userWord, correctWord)) return 100;
  
  const userSound = normalizeArabicText(userWord);
  const correctSound = normalizeArabicText(correctWord);
  
  let matches = 0;
  const maxLen = Math.max(userSound.length, correctSound.length);
  
  for (let i = 0; i < Math.min(userSound.length, correctSound.length); i++) {
    if (userSound[i] === correctSound[i]) matches++;
  }
  
  const percentage = maxLen > 0 ? Math.round((matches / maxLen) * 100) : 0;
  if (percentage >= 45) return 100; // High similarity counts as correct for fast recitation
  
  return percentage;
};

/**
 * TARTEEL-STYLE word match:
 * 1. Exact normalized match
 * 2. Waw prefix tolerance
 * 3. Vowel-only difference tolerance
 */
export const wordsMatchWithWaw = (userWord, correctWord) => {
  if (!userWord || !correctWord) return false;
  
  const u = normalizeArabicText(userWord);
  const c = normalizeArabicText(correctWord);
  
  if (u === c) return true;
  
  // Waw prefix tolerance
  const uStripped = stripWawPrefix(u);
  const cStripped = stripWawPrefix(c);
  
  if (uStripped === cStripped) return true;
  if (uStripped === c) return true;
  if (u === cStripped) return true;
  
  // Check if difference is only in vowels
  const uBase = getBaseLetters(userWord);
  const cBase = getBaseLetters(correctWord);
  
  if (uBase === cBase) return true;
  
  return false;
};

/**
 * TARTEEL-STYLE: Ayah-level smart comparison
 * - Flexible matching (fast/slow recitation)
 * - Waqf tolerance (incomplete ayah OK)
 * - Vowel-only difference tolerance
 * - Partial ayah acceptable
 */
export const smartAyahCompare = (spokenText, correctText, options = {}) => {
  const {
    partialOk = true,        // agar poori ayah na padhi jaye — OK
    waqfTolerance = true,    // waqf pe rukna OK
    speedTolerance = true,   // fast/slow OK
    minAccuracy = 70,        // minimum acceptable accuracy
  } = options;

  if (!spokenText || !correctText) {
    return { isCorrect: false, accuracy: 0, wrongWords: [], partial: false };
  }

  // Normalize dono texts
  const spokenNorm   = normalizeArabicText(spokenText);
  const correctNorm  = normalizeArabicText(correctText);

  const spokenWords  = spokenNorm.split(/\s+/).filter(Boolean);
  const correctWords = correctNorm.split(/\s+/).filter(Boolean);

  // Display versions (diacritics removed but NOT phonetically merged)
  const spokenDisplay  = removeDiacritics(spokenText).replace(/[^\u0600-\u06FF\s]/g, '').split(/\s+/).filter(Boolean);
  const correctDisplay = removeDiacritics(correctText).replace(/[^\u0600-\u06FF\s]/g, '').split(/\s+/).filter(Boolean);

  if (!correctWords.length) return { isCorrect: false, accuracy: 0, wrongWords: [], partial: false };

  // PARTIAL AYAH CHECK: Agar user ne sirf kuch words padhe (waqf pe ruka)
  const spokenRatio = spokenWords.length / correctWords.length;
  const isPartial = partialOk && spokenRatio < 0.9 && spokenRatio > 0.3;

  let matchCount = 0;
  const wrongWords = [];
  let spokenIdx = 0;

  // Compare only as far as user spoke (partial tolerance)
  for (let i = 0; i < correctWords.length && spokenIdx < spokenWords.length; i++) {
    const cWord = correctWords[i];
    const cDisp = correctDisplay[i] || cWord;
    
    let sWord = spokenWords[spokenIdx];
    let sDisp = spokenDisplay[spokenIdx] || sWord;
    
    if (wordsMatchWithWaw(sWord, cWord)) {
      matchCount++;
      spokenIdx++;
    } 
    // Check if difference is only vowels (alif vs zabar vs khara zabar)
    else if (getBaseLetters(sWord) === getBaseLetters(cWord)) {
      matchCount++; // Count as correct - only vowel difference
      spokenIdx++;
    }
    // FAST RECITATION: Merged word check
    else if (speedTolerance && spokenIdx + 1 < spokenWords.length) {
      const mergedWord = spokenWords[spokenIdx] + spokenWords[spokenIdx + 1];
      if (wordsMatchWithWaw(mergedWord, cWord)) {
        matchCount++;
        spokenIdx += 2;
      } else {
        wrongWords.push({
          position    : i + 1,
          userWord    : sDisp,
          correctWord : cDisp,
          errorType   : 'substitution',
        });
        spokenIdx++;
      }
    }
    else {
      wrongWords.push({
        position    : i + 1,
        userWord    : sDisp,
        correctWord : cDisp,
        errorType   : 'substitution',
      });
      spokenIdx++;
    }
  }
  
  // Handle missing words (user didn't finish)
  if (!isPartial) {
    for (let i = spokenIdx; i < correctWords.length; i++) {
      wrongWords.push({
        position    : i + 1,
        userWord    : null,
        correctWord : correctDisplay[i] || correctWords[i],
        errorType   : 'missing',
      });
    }
  }
  
  // Handle extra words (user said more than correct)
  while (spokenIdx < spokenWords.length) {
    const extraWord = spokenDisplay[spokenIdx] || spokenWords[spokenIdx];
    // Don't count single 'و' as error
    if (extraWord !== 'و') {
      wrongWords.push({
        position    : correctWords.length + 1,
        userWord    : extraWord,
        correctWord : null,
        errorType   : 'extra',
      });
    } else {
      matchCount++; // Count waw as correct
    }
    spokenIdx++;
  }

  const refLen = isPartial ? spokenWords.length : correctWords.length;
  const accuracy = refLen > 0 ? Math.round((matchCount / refLen) * 100) : 0;
  const isCorrect = accuracy >= minAccuracy && wrongWords.filter(w => w.errorType !== 'missing' || !partialOk).length === 0;

  return {
    isCorrect,
    accuracy,
    wrongWords,
    partial   : isPartial,
    spokenWordCount  : spokenWords.length,
    correctWordCount : correctWords.length,
  };
};

// Legacy exports (backward compatible)
export const arePhoneticallySame = (w1, w2) => {
  return normalizeArabicText(w1) === normalizeArabicText(w2);
};

export const calculateWordAccuracy = (userText, correctText) => {
  const result = smartAyahCompare(userText, correctText);
  return result.accuracy;
};

export const findWrongWords = (userText, correctText) => {
  const result = smartAyahCompare(userText, correctText);
  return result.wrongWords;
};

export const getWordSimilarity = (w1, w2) => {
  return wordsMatchWithWaw(w1, w2) ? 100 : wordSimilarityScore(w1, w2);
};

// =====================================================
// FUNCTIONS FOR ROMAN CONVERSION
// =====================================================

/**
 * Normalize for Roman conversion (keeps more detail)
 */
export const normalizeForRoman = (text) => {
  if (!text) return '';
  let normalized = text;
  
  // Remove HTML tags
  normalized = normalized.replace(/<[^>]*>/g, '');
  
  // Remove end numbers
  normalized = normalized.replace(/<span[^>]*class="end"[^>]*>[\u0660-\u0669]+<\/span>/g, '');
  normalized = normalized.replace(/[\u0660-\u0669]/g, '');
  
  // Normalize alifs
  normalized = normalized.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
  normalized = normalized.replace(/\u0649/g, '\u0627');
  
  // Keep shadda for Roman conversion
  // Don't remove all diacritics
  
  return normalized.trim();
};

/**
 * Get word-by-word normalized version
 */
export const getNormalizedWords = (text, includeRoman = false) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const words = cleanText.split(/\s+/).filter(Boolean);
  
  return words.map(word => ({
    original: word,
    normalized: normalizeArabicText(word),
    noDiacritics: removeDiacritics(word),
    baseLetters: getBaseLetters(word),
    cleaned: getCleanedWord(word),
    length: word.length
  }));
};

/**
 * Check if text contains waqf marker
 */
export const hasWaqfMarker = (text) => {
  const waqfChars = ['ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۚ', 'ۛ', 'ۜ', '۟', '۠', 'ۢ', 'ۣ'];
  return waqfChars.some(char => text.includes(char));
};

/**
 * Remove waqf markers for processing
 */
export const removeWaqfMarkers = (text) => {
  const waqfChars = ['ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۚ', 'ۛ', 'ۜ', '۟', '۠', 'ۢ', 'ۣ'];
  let result = text;
  for (const char of waqfChars) {
    result = result.replace(new RegExp(char, 'g'), '');
  }
  return result;
};

// Default export
export default {
  // Waqf functions
  normalizeForWaqf,
  getWaqfPronunciation,
  
  // Core normalization
  removeDiacritics,
  normalizeAlif,
  normalizePhonetic,
  normalizeArabicText,
  normalizeVowelOnly,
  
  // Word operations
  stripWawPrefix,
  isVowelMarker,
  getBaseLetters,
  getCleanedWord,
  
  // Comparison functions
  areVowelEquivalent,
  areDifferentOnlyInHarakat,
  soundMatch,
  wordSimilarityScore,
  wordsMatchWithWaw,
  smartAyahCompare,
  
  // Legacy
  arePhoneticallySame,
  calculateWordAccuracy,
  findWrongWords,
  getWordSimilarity,
  
  // Roman/display
  normalizeForRoman,
  getNormalizedWords,
  hasWaqfMarker,
  removeWaqfMarkers
}
