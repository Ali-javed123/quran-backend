// utils/waqfHandler.js
// Waqf (stop) detection and handling

// Import the sound handler
import { analyzeWaqfWord, WAQF_SYMBOLS as WAQF_SYMBOLS_SOUND, getAllWaqfPositions as getAllWaqfPositionsFromSound } from './waqfSoundHandler.js';

// =====================================================
// WAQF SYMBOLS (Original - for detection)
// =====================================================

export const waqfSymbols = {
  'ۖ': { type: 'waqf_jaiz', meaning: 'وقف جائز (permissible stop)', soundStop: true },
  'ۗ': { type: 'waqf_jaiz', meaning: 'وقف جائز', soundStop: true },
  'ۘ': { type: 'waqf_mujawwaz', meaning: 'وقف مجوز', soundStop: true },
  'ۙ': { type: 'waqf_mustahab', meaning: 'وقف مستحب', soundStop: true },
  'ۚ': { type: 'waqf_wajib', meaning: 'وقف واجب (obligatory stop)', soundStop: true },
  'ۛ': { type: 'waqf_la_waqf', meaning: 'لا وقف (no stop)', soundStop: false },
  'ۜ': { type: 'waqf_qabeeh', meaning: 'وقف قبيح (bad stop)', soundStop: true },
  '۟': { type: 'waqf_mutlaq', meaning: 'وقف مطلق', soundStop: true },
  '۠': { type: 'waqf_murakhkhas', meaning: 'وقف مرخص', soundStop: true },
  'ۡ': { type: 'sukun', meaning: 'سكون', soundStop: false },
  'ۢ': { type: 'waqf_manzil', meaning: 'وقف منزل', soundStop: true },
  'ۣ': { type: 'waqf_mujawwaz', meaning: 'وقف مجوز', soundStop: true },
};

// Words that indicate waqf in the middle of ayah
export const waqfIndicators = [
  { word: 'ۖ', position: 'mid' },
  { word: 'ۗ', position: 'mid' },
  { word: 'ۘ', position: 'mid' },
  { word: 'ۙ', position: 'mid' },
  { word: 'ۚ', position: 'mid' },
  { word: 'ۛ', position: 'mid' },
];

// =====================================================
// DETECT WAQF POSITIONS (MAIN EXPORT - FIXED)
// =====================================================

/**
 * Detect waqf positions in ayah text
 * @param {string} text - Ayah text with tajweed
 * @returns {Array} Array of waqf positions
 */
export const detectWaqfPositions = (text) => {
  if (!text) return [];
  
  const waqfs = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (waqfSymbols[char]) {
      waqfs.push({
        position: i,
        symbol: char,
        type: waqfSymbols[char].type,
        shouldStop: waqfSymbols[char].soundStop,
        context: getWordContext(text, i)
      });
    }
  }
  
  // Also check for end markers
  const endMatch = text.match(/<span[^>]*class="end"[^>]*>([\u0660-\u0669]+)<\/span>/);
  if (endMatch) {
    waqfs.push({
      position: text.length - 1,
      symbol: 'end',
      type: 'end_of_ayah',
      shouldStop: true,
      context: { before: text.substring(text.length - 20), after: '' }
    });
  }
  
  return waqfs;
};

/**
 * Get word context around a position
 */
const getWordContext = (text, pos) => {
  let before = '';
  let after = '';
  
  // Get previous word
  let i = pos - 1;
  while (i >= 0 && text[i] !== ' ') {
    before = text[i] + before;
    i--;
  }
  
  // Get next word
  let j = pos + 1;
  while (j < text.length && text[j] !== ' ') {
    after += text[j];
    j++;
  }
  
  return { before, after };
};

/**
 * Check if a position is a waqf (should stop sound)
 * @param {string} text - Full text
 * @param {number} wordIndex - Word index in the ayah
 * @returns {boolean} True if should stop
 */
export const isWaqfPosition = (text, wordIndex) => {
  const words = text.split(/\s+/);
  if (wordIndex >= words.length) return false;
  
  const word = words[wordIndex];
  
  // Check if word contains waqf symbol
  for (const indicator of waqfIndicators) {
    if (word.includes(indicator.word)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Split ayah into segments based on waqf positions
 * @param {string} text - Ayah text
 * @returns {Array} Segments with start/end positions
 */
export const splitByWaqf = (text) => {
  const segments = [];
  let currentSegment = '';
  let startPos = 0;
  
  // Remove HTML for processing
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  for (let i = 0; i < cleanText.length; i++) {
    currentSegment += cleanText[i];
    
    if (waqfSymbols[cleanText[i]] && waqfSymbols[cleanText[i]].soundStop) {
      segments.push({
        text: currentSegment.trim(),
        start: startPos,
        end: i,
        hasWaqf: true
      });
      currentSegment = '';
      startPos = i + 1;
    }
  }
  
  // Add remaining
  if (currentSegment.trim()) {
    segments.push({
      text: currentSegment.trim(),
      start: startPos,
      end: cleanText.length - 1,
      hasWaqf: false
    });
  }
  
  return segments;
};

// =====================================================
// WAQF SOUND RULES FUNCTIONS (For compatibility)
// =====================================================

/**
 * Process a word at waqf position - get its sound version
 * @param {string} word - Original word with diacritics
 * @returns {string} Word as it should sound when stopping
 */
export const getWaqfSoundVersion = (word) => {
  const analysis = analyzeWaqfWord(word);
  return analysis.pronunciation;
};

/**
 * Check if a word should have its sound changed at waqf
 * @param {string} word - The word to check
 * @returns {boolean} True if sound changes at waqf
 */
export const doesWordChangeAtWaqf = (word) => {
  // Check for tanween (2 zabar, 2 pesh, 2 zeer)
  if (word.includes('\u064B') || word.includes('\u064C') || word.includes('\u064D')) {
    return true;
  }
  // Check for ta marbuta
  if (word.includes('\u0629')) {
    return true;
  }
  return false;
};

/**
 * Get the correct waqf sound for comparison
 * @param {string} correctWord - Correct word from Quran
 * @param {string} userWord - User's spoken word
 * @returns {Object} Comparison result with waqf rules
 */
export const compareWithWaqfRules = (correctWord, userWord) => {
  // If correct word has tanween, apply waqf rule
  const hasTanween = correctWord.includes('\u064B') || 
                     correctWord.includes('\u064C') || 
                     correctWord.includes('\u064D');
  
  if (hasTanween) {
    const waqfSound = getWaqfSoundVersion(correctWord);
    const userNormalized = userWord.replace(/[\u064B-\u065F\u0670]/g, '')
                                   .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
    const waqfNormalized = waqfSound.replace(/[\u064B-\u065F\u0670]/g, '')
                                     .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
    
    return {
      isMatch: userNormalized === waqfNormalized || 
               userNormalized.includes(waqfNormalized) ||
               waqfNormalized.includes(userNormalized),
      correctSound: waqfSound,
      rule: 'tanween_waqf'
    };
  }
  
  return {
    isMatch: false,
    correctSound: correctWord,
    rule: 'no_change'
  };
};

/**
 * Get all waqf positions (from sound handler)
 * @param {string} text - Full text
 * @returns {Array} Array of waqf positions
 */
export const getAllWaqfPositions = (text) => {
  return getAllWaqfPositionsFromSound(text);
};

// Export combined symbols
export const WAQF_SYMBOLS = {
  ...WAQF_SYMBOLS_SOUND,
  ...waqfSymbols
};

// Default export for backwards compatibility
export default {
  waqfSymbols,
  waqfIndicators,
  detectWaqfPositions,
  isWaqfPosition,
  splitByWaqf,
  getWaqfSoundVersion,
  doesWordChangeAtWaqf,
  compareWithWaqfRules,
  getAllWaqfPositions,
  WAQF_SYMBOLS
};