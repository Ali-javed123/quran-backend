// utils/waqfSoundHandler.js
// Quranic Waqf Sound Rules Implementation - Complete Fixed Version

// =====================================================
// WAQF SYMBOLS
// =====================================================

export const WAQF_SYMBOLS = {
  "\u06D6": { type: "mufassal", label: "ۖ", meaning: "Waqf Mufassal - Rukna Behtar", stopsSound: true },
  "\u06D7": { type: "mutlaq", label: "ۗ", meaning: "Waqf Mutlaq - Rukna Jaiz", stopsSound: true },
  "\u06D8": { type: "jaiz", label: "ۘ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz", stopsSound: true },
  "\u06D9": { type: "la_waqf", label: "ۙ", meaning: "La Waqf - Rukna Mana Hai", stopsSound: false },
  "\u06DA": { type: "murakhkhas", label: "ۚ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk", stopsSound: true },
  "\u06DB": { type: "musta_naf", label: "ۛ", meaning: "Waqf Mustanaf - Lazmi Waqf", stopsSound: true },
  "\u06DC": { type: "sakt", label: "ۜ", meaning: "Sakt - Bina Saans Liye Thodi Ruk", stopsSound: false },
  "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb", stopsSound: false },
  "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark", stopsSound: false },
  "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar", stopsSound: true },
  "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk", stopsSound: true },
};

// Letters that can have madd when stopping
const MADD_LETTERS = ['\u0627', '\u0648', '\u064A']; // ا و ي

// Letters that are always pronounced with sukun at stop
const ALWAYS_SUKUN_LETTERS = ['\u062A', '\u0647']; // ت ه

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if character is a diacritic (harakat)
 */
const isDiacritic = (char) => {
  return (char >= '\u064B' && char <= '\u065F') || char === '\u0670';
};

/**
 * Check if letter is a madd letter (ا و ي)
 */
const isMaddLetter = (char) => {
  return MADD_LETTERS.includes(char);
};

/**
 * Remove waqf symbols from text
 */
const removeWaqfSymbols = (word) => {
  let cleanWord = word;
  for (const symbol of Object.keys(WAQF_SYMBOLS)) {
    cleanWord = cleanWord.replace(new RegExp(symbol, 'g'), '');
  }
  return cleanWord;
};

// =====================================================
// ANALYZE WORD AT WAQF POSITION
// =====================================================

/**
 * Analyze the last word of a segment when stopping (Waqf)
 * Applies authentic Quranic waqf sound rules
 * 
 * @param {string} word - The word to analyze (with diacritics)
 * @returns {Object} Analysis result with pronunciation rules
 */
export const analyzeWaqfWord = (word) => {
  if (!word) return { original: word, rule: 'empty', pronunciation: word };
  
  // Remove waqf symbols from the word
  let cleanWord = removeWaqfSymbols(word);
  
  const result = {
    original: word,
    cleanWord: cleanWord,
    rule: 'normal_stop',
    pronunciation: cleanWord,
    pronunciationWord: cleanWord,
    lastLetter: '',
    lastLetterHarakat: '',
    secondLastLetter: '',
    secondLastHarakat: '',
    changes: []
  };
  
  if (!cleanWord.length) return result;
  
  // Get last character (letter)
  let lastCharIdx = cleanWord.length - 1;
  while (lastCharIdx >= 0 && isDiacritic(cleanWord[lastCharIdx])) {
    lastCharIdx--;
  }
  
  if (lastCharIdx < 0) return result;
  
  const lastChar = cleanWord[lastCharIdx];
  result.lastLetter = lastChar;
  
  // Get harakat on last character
  let lastHarakat = '';
  if (lastCharIdx + 1 < cleanWord.length && isDiacritic(cleanWord[lastCharIdx + 1])) {
    lastHarakat = cleanWord[lastCharIdx + 1];
  }
  result.lastLetterHarakat = lastHarakat;
  
  // Get second last character
  let secondLastIdx = lastCharIdx - 1;
  while (secondLastIdx >= 0 && isDiacritic(cleanWord[secondLastIdx])) {
    secondLastIdx--;
  }
  
  if (secondLastIdx >= 0) {
    result.secondLastLetter = cleanWord[secondLastIdx];
    
    let secondHarakat = '';
    if (secondLastIdx + 1 < cleanWord.length && isDiacritic(cleanWord[secondLastIdx + 1])) {
      secondHarakat = cleanWord[secondLastIdx + 1];
    }
    result.secondLastHarakat = secondHarakat;
  }
  
  // APPLY WAQF RULES
  
  // RULE 1: Tanween Fatha (ًّ / 2 Zabar) -> becomes Alif with Fatha
  // Example: عَلِيمًا -> عَلِيمَا (noon silent, alif madd)
  if (lastHarakat === '\u064B') { // Tanween Fatha (2 zabar)
    result.rule = 'tanween_fatha_waqf';
    result.changes.push(`Tanween Fatha: "${word}" → Last noon silent, alif madd added`);
    
    // Remove the tanween and noon, add alif
    let newWord = cleanWord.substring(0, lastCharIdx);
    // Add alif at the end
    result.pronunciation = newWord + '\u0627';
    result.pronunciationWord = newWord + 'ا';
    result.soundRule = 'noon_silent_alif_madd';
  }
  
  // RULE 2: Tanween Damma (ٌّ / 2 Pesh) -> becomes Long Damma (sukun)
  // Example: نُورٌ -> نُورْ (noon silent, last letter sukun)
  else if (lastHarakat === '\u064C') { // Tanween Damma (2 pesh)
    result.rule = 'tanween_damma_waqf';
    result.changes.push(`Tanween Damma: "${word}" → Noon silent, last letter sukun`);
    
    let newWord = cleanWord.substring(0, lastCharIdx);
    // Add sukun on the last letter
    result.pronunciation = newWord + lastChar;
    result.pronunciationWord = newWord + lastChar;
    result.soundRule = 'noon_silent_sukun';
  }
  
  // RULE 3: Tanween Kasra (ٍّ / 2 Zeer) -> becomes Long Kasra (sukun)
  // Example: رَحِيمٍ -> رَحِيمْ (noon silent, last letter sukun)
  else if (lastHarakat === '\u064D') { // Tanween Kasra (2 zeer)
    result.rule = 'tanween_kasra_waqf';
    result.changes.push(`Tanween Kasra: "${word}" → Noon silent, last letter sukun`);
    
    let newWord = cleanWord.substring(0, lastCharIdx);
    result.pronunciation = newWord + lastChar;
    result.pronunciationWord = newWord + lastChar;
    result.soundRule = 'noon_silent_sukun';
  }
  
  // RULE 4: Single Fatha (Zabar) -> Stop with sukun
  else if (lastHarakat === '\u064E') { // Single Fatha
    result.rule = 'single_fatha_waqf';
    result.changes.push(`Single Fatha: "${word}" → Last letter sukun`);
    
    let newWord = cleanWord.substring(0, lastCharIdx);
    result.pronunciation = newWord + lastChar;
    result.pronunciationWord = newWord + lastChar;
    result.soundRule = 'sukun';
  }
  
  // RULE 5: Single Damma (Pesh) -> Stop with sukun
  else if (lastHarakat === '\u064F') { // Single Damma
    result.rule = 'single_damma_waqf';
    result.changes.push(`Single Damma: "${word}" → Last letter sukun`);
    
    let newWord = cleanWord.substring(0, lastCharIdx);
    result.pronunciation = newWord + lastChar;
    result.pronunciationWord = newWord + lastChar;
    result.soundRule = 'sukun';
  }
  
  // RULE 6: Single Kasra (Zeer) -> Stop with sukun
  else if (lastHarakat === '\u0650') { // Single Kasra
    result.rule = 'single_kasra_waqf';
    result.changes.push(`Single Kasra: "${word}" → Last letter sukun`);
    
    let newWord = cleanWord.substring(0, lastCharIdx);
    result.pronunciation = newWord + lastChar;
    result.pronunciationWord = newWord + lastChar;
    result.soundRule = 'sukun';
  }
  
  // RULE 7: Sukun already present -> keep as is
  else if (lastHarakat === '\u0652') {
    result.rule = 'already_sukun';
    result.pronunciation = cleanWord;
    result.pronunciationWord = cleanWord;
    result.soundRule = 'no_change';
  }
  
  // RULE 8: No harakat on last letter
  else {
    result.rule = 'no_harakat';
    result.pronunciation = cleanWord;
    result.pronunciationWord = cleanWord;
    result.soundRule = 'no_change';
  }
  
  // RULE 9: Ta Marbuta (ة/ه) at end -> becomes Ha (ه) without harakat
  if (lastChar === '\u0629') { // Ta Marbuta
    result.rule = 'ta_marbuta_waqf';
    result.changes.push(`Ta Marbuta: "${word}" → Pronounced as 'h' (ha)`);
    let newWord = cleanWord.substring(0, lastCharIdx);
    result.pronunciation = newWord + '\u0647';
    result.pronunciationWord = newWord + 'ه';
    result.soundRule = 'ta_marbuta_to_ha';
  }
  
  // Handle Shadda (Tashdeed) on last letter - but preserve it
  let shaddaPos = lastCharIdx + 1;
  if (shaddaPos < cleanWord.length && cleanWord[shaddaPos] === '\u0651') {
    result.hasShadda = true;
    if (result.rule !== 'already_sukun') {
      result.changes.push(`Shadda on last letter preserved at stop`);
      result.soundRule = 'shadda_waqf';
    }
  }
  
  return result;
};

/**
 * Get pronunciation for a word at waqf position (for comparison)
 * Used when comparing user speech to correct text
 * 
 * @param {string} word - The word as it appears in the Quran
 * @param {boolean} isAtWaqf - Whether this word is at a waqf position
 * @returns {string} How the word should be pronounced at stop
 */
export const getWaqfPronunciation = (word, isAtWaqf) => {
  if (!isAtWaqf) return word;
  
  const analysis = analyzeWaqfWord(word);
  return analysis.pronunciation;
};

/**
 * Normalize a word for comparison considering waqf rules
 * This creates a version of the word that matches how it sounds when stopping
 * 
 * @param {string} word - Original word with diacritics
 * @param {boolean} isAtWaqf - Whether stopping at this word
 * @returns {string} Normalized version for sound comparison
 */
export const normalizeForWaqfComparison = (word, isAtWaqf) => {
  if (!isAtWaqf) {
    // No waqf - remove diacritics for normal comparison
    return word
      .replace(/[\u064B-\u065F\u0670]/g, '')  // Remove all diacritics
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
  }
  
  // At waqf - apply waqf sound rules
  const analysis = analyzeWaqfWord(word);
  let waqfSound = analysis.pronunciation;
  
  // Further normalize for sound comparison
  waqfSound = waqfSound.replace(/[\u064B-\u065F\u0670]/g, '');
  waqfSound = waqfSound.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
  
  return waqfSound;
};

/**
 * Compare word with correct word using waqf rules
 * @param {string} userWord - User's spoken word
 * @param {string} correctWord - Correct Quranic word
 * @param {boolean} isAtWaqf - Whether this is a waqf position
 * @returns {boolean} True if they match considering waqf rules
 */
export const compareWithWaqfRules = (userWord, correctWord, isAtWaqf) => {
  if (!isAtWaqf) {
    // Normal comparison without waqf
    const userNorm = userWord.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
    const correctNorm = correctWord.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
    return userNorm === correctNorm;
  }
  
  // At waqf - apply rules
  const correctWaqf = normalizeForWaqfComparison(correctWord, true);
  const userNorm = userWord.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
  
  // Check if user's word matches the waqf pronunciation
  if (userNorm === correctWaqf) return true;
  
  // Special check for tanween fatha (2 zabar) -> alif sound
  const hasTanweenFatha = correctWord.includes('\u064B');
  if (hasTanweenFatha) {
    // Remove tanween and noon, add alif
    const correctWithoutTanween = correctWord
      .replace(/\u064B/g, '')
      .replace(/\u0646$/, '')
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
    
    if (userNorm === correctWithoutTanween) return true;
  }
  
  return false;
};

/**
 * Detect if a word is at waqf position
 * @param {string} text - Full text
 * @param {number} wordIndex - Index of word in the text
 * @returns {boolean} True if this word is at a waqf position
 */
export const isWordAtWaqf = (text, wordIndex) => {
  const words = text.split(/\s+/);
  if (wordIndex >= words.length) return false;
  
  const word = words[wordIndex];
  
  for (const [symbol, info] of Object.entries(WAQF_SYMBOLS)) {
    if (word.includes(symbol) && info.stopsSound) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get all waqf positions in a text
 * @param {string} text - Full text
 * @returns {Array} Array of {position, wordIndex, word, symbol}
 */
export const getAllWaqfPositions = (text) => {
  const positions = [];
  if (!text) return positions;
  
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (const [symbol, info] of Object.entries(WAQF_SYMBOLS)) {
      if (word.includes(symbol) && info.stopsSound) {
        positions.push({
          wordIndex: i,
          word: word,
          symbol: symbol,
          type: info.type,
          meaning: info.meaning
        });
        break;
      }
    }
  }
  
  return positions;
};

/**
 * Apply waqf sound rules to a full text (for debugging)
 */
export const applyWaqfSoundRules = (text) => {
  if (!text) return text;
  
  let result = text;
  let words = text.split(/(\s+)/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    let hasWaqf = false;
    for (const [symbol, info] of Object.entries(WAQF_SYMBOLS)) {
      if (word.includes(symbol) && info.stopsSound) {
        hasWaqf = true;
        break;
      }
    }
    
    if (hasWaqf) {
      const analysis = analyzeWaqfWord(word);
      words[i] = analysis.pronunciationWord;
    }
  }
  
  return words.join('');
};

export default {
  WAQF_SYMBOLS,
  analyzeWaqfWord,
  applyWaqfSoundRules,
  getWaqfPronunciation,
  normalizeForWaqfComparison,
  compareWithWaqfRules,
  isWordAtWaqf,
  getAllWaqfPositions
};