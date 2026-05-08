// services/romanConverter.js
// WhatsApp style Roman conversion service

import { convertToRoman, convertToWhatsAppStyle } from '../utils/romanMapping.js';
import { detectWaqfPositions, isWaqfPosition, splitByWaqf } from '../utils/waqfHandler.js';

/**
 * Convert ayah to Roman with waqf awareness
 * @param {string} ayahText - Ayah text with tajweed
 * @param {Object} options - Conversion options
 * @returns {Object} Roman conversion result
 */
export const convertAyahToRoman = (ayahText, options = {}) => {
  const { whatsappStyle = true, consoleLog = true } = options;
  
  // Detect waqf positions
  const waqfs = detectWaqfPositions(ayahText);
  
  // Split by waqf for segment-level conversion
  const segments = splitByWaqf(ayahText);
  
  const romanSegments = segments.map(segment => ({
    text: segment.text,
    roman: convertToRoman(segment.text, false),
    hasWaqf: segment.hasWaqf
  }));
  
  const fullRoman = romanSegments.map(s => s.roman).join(' ');
  
  const result = {
    original: ayahText,
    roman: whatsappStyle ? convertToWhatsAppStyle(ayahText) : fullRoman,
    romanRaw: fullRoman,
    segments: romanSegments,
    waqfPositions: waqfs,
    wordCount: ayahText.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  };
  
  if (consoleLog) {
    console.log('🕌 Roman Conversion Result:', {
      roman: result.roman.substring(0, 200),
      waqfCount: waqfs.length,
      segmentCount: segments.length
    });
  }
  
  return result;
};

/**
 * Get Roman for a specific word in ayah
 * @param {string} ayahText - Full ayah text
 * @param {number} wordIndex - Index of word
 * @returns {string} Romanized word
 */
export const getWordRoman = (ayahText, wordIndex) => {
  const words = ayahText.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean);
  if (wordIndex >= words.length) return '';
  return convertToRoman(words[wordIndex], false);
};

/**
 * Compare two Roman texts flexibly
 * @param {string} userRoman - User's Roman text
 * @param {string} correctRoman - Correct Roman text
 * @returns {Object} Comparison result
 */
export const compareRomanFlexible = (userRoman, correctRoman) => {
  const userWords = userRoman.toLowerCase().split(/\s+/).filter(Boolean);
  const correctWords = correctRoman.toLowerCase().split(/\s+/).filter(Boolean);
  
  let matches = 0;
  const mismatches = [];
  
  for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
    const userWord = userWords[i];
    const correctWord = correctWords[i];
    
    // Check for close match (allow small differences)
    if (userWord === correctWord) {
      matches++;
    } else if (isCloseMatch(userWord, correctWord)) {
      matches++;
      mismatches.push({
        position: i + 1,
        userWord,
        correctWord,
        type: 'close'
      });
    } else {
      mismatches.push({
        position: i + 1,
        userWord,
        correctWord,
        type: 'mismatch'
      });
    }
  }
  
  const accuracy = correctWords.length > 0 
    ? Math.round((matches / correctWords.length) * 100)
    : 0;
  
  return {
    accuracy,
    mismatches,
    isAcceptable: accuracy >= 85
  };
};

/**
 * Check if two Roman words are close enough
 */
const isCloseMatch = (word1, word2) => {
  if (!word1 || !word2) return false;
  
  // Remove common suffixes/prefixes
  const normalize = (w) => w.replace(/[aeiou]+$/g, '').replace(/^[aeiou]+/g, '');
  
  const n1 = normalize(word1);
  const n2 = normalize(word2);
  
  if (n1 === n2) return true;
  
  // Check Levenshtein distance
  const distance = levenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);
  
  return distance <= Math.ceil(maxLen * 0.3); // 30% error tolerance
};

/**
 * Levenshtein distance for close match detection
 */
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};