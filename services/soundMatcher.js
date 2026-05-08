// // services/soundMatcher.js (COMPLETE UPDATED FILE)
// // Sound-based word matching engine with khara zabar = zabar

// // =====================================================
// // HARKAAT EQUIVALENCE MAPPING
// // =====================================================

// // Harakat that sound the same
// export const harakatEquivalence = {
//   // Zabar group (all sound like 'a')
//   'zabar': ['\u064E', '\u0670'],  // regular zabar (َ) and khara zabar (ٰ)
  
//   // Pesh group
//   'pesh': ['\u064F'],              // ضمة
  
//   // Zeer group  
//   'zeer': ['\u0650'],              // كسرة
  
//   // Tanween group
//   'tanween_fatha': ['\u064B'],     // تنوين فتح
//   'tanween_damma': ['\u064C'],     // تنوين ضم
//   'tanween_kasra': ['\u064D'],     // تنوين كسر
// };

// // Inverse mapping for quick lookup
// const harakatToGroup = {};
// for (const [group, chars] of Object.entries(harakatEquivalence)) {
//   for (const char of chars) {
//     harakatToGroup[char] = group;
//   }
// }

// // =====================================================
// // REMOVE DIACRITICS (FOR SOUND COMPARISON)
// // =====================================================

// /**
//  * Remove ALL diacritics for sound comparison
//  * Treats khara zabar (ٰ) same as regular zabar (َ) - both removed
//  */
// const removeAllDiacritics = (text) => {
//   if (!text) return '';
  
//   // Remove ALL harakat including khara zabar
//   return text
//     .replace(/[\u064B-\u065F]/g, '')   // All standard diacritics
//     .replace(/\u0670/g, '')             // Khara zabar (superscript alif)
//     .replace(/[\u06D6-\u06ED]/g, '');   // Other Quranic marks
// };

// /**
//  * Check if character is Alif (any form)
//  */
// const isAlif = (char) => {
//   return ['\u0622', '\u0623', '\u0625', '\u0671', '\u0627'].includes(char);
// };

// /**
//  * Normalize for sound comparison (khara zabar = zabar = alif)
//  * Alif (ا) sounds like zabar (َ) which sounds like khara zabar (ٰ)
//  * All three should be treated as equivalent!
//  */
// const normalizeForSound = (text) => {
//   if (!text) return '';
  
//   let normalized = text;
  
//   // Step 1: Remove ALL diacritics (zabar, khara zabar, pesh, zeer, etc.)
//   normalized = removeAllDiacritics(normalized);
  
//   // Step 2: Normalize alif variations to standard alif
//   normalized = normalized.replace(/[\u0622\u0623\u0625\u0671\u0649]/g, '\u0627');
  
//   // Step 3: CRITICAL FIX - Alif and vowels are equivalent in sound
//   // When user says "alif" but should be "zabar" or "khara zabar" -> STILL CORRECT
  
//   // Step 4: Sound groups (Pakistani/Urdu accent)
//   normalized = normalized.replace(/[\u0635\u062B]/g, '\u0633');      // ص ث -> س
//   normalized = normalized.replace(/[\u0630\u0638\u0636]/g, '\u0632'); // ذ ظ ض -> ز
//   normalized = normalized.replace(/\u0637/g, '\u062A');               // ط -> ت
//   normalized = normalized.replace(/[\u0642\u0643]/g, '\u0643');       // ق ك -> ك (flexible)
//   normalized = normalized.replace(/\u062D/g, '\u0647');               // ح -> ه
//   normalized = normalized.replace(/\u0624/g, '\u0648');               // ؤ -> و
//   normalized = normalized.replace(/[\u0626\u0649]/g, '\u064A');       // ئ ى -> ي
//   normalized = normalized.replace(/\u0629/g, '\u0647');               // ة -> ه
  
//   // Step 5: Clean up
//   normalized = normalized.replace(/[^\u0600-\u06FF\s]/g, '');
//   normalized = normalized.replace(/\s+/g, ' ').trim();
  
//   return normalized;
// };

// /**
//  * Check if two words are equivalent in vowel sound
//  * This handles: Alif (ا) = Zabar (َ) = Khara Zabar (ٰ)
//  */
// const areVowelEquivalent = (word1, word2) => {
//   if (!word1 || !word2) return false;
  
//   // Remove all diacritics first
//   const noDiacritics1 = word1.replace(/[\u064B-\u065F]/g, '').replace(/\u0670/g, '');
//   const noDiacritics2 = word2.replace(/[\u064B-\u065F]/g, '').replace(/\u0670/g, '');
  
//   // If base letters are same, they are equivalent
//   if (noDiacritics1 === noDiacritics2) return true;
  
//   // Get base letters (remove all vowel markers)
//   const baseLetters1 = word1.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
//   const baseLetters2 = word2.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
  
//   // If base letters match and the difference is just alif vs zabar (both are 'a' sounds)
//   if (baseLetters1 === baseLetters2) {
//     const diff1 = word1.replace(baseLetters1, '');
//     const diff2 = word2.replace(baseLetters2, '');
    
//     // Check if both have some kind of 'a' vowel (alif, zabar, or khara zabar)
//     const hasAVowel1 = /[\u0622\u0623\u0625\u0671\u0627\u064E\u0670]/.test(diff1);
//     const hasAVowel2 = /[\u0622\u0623\u0625\u0671\u0627\u064E\u0670]/.test(diff2);
    
//     if (hasAVowel1 && hasAVowel2) {
//       return true;  // Both have 'a' sound - equivalent!
//     }
//   }
  
//   return false;
// };

// // =====================================================
// // PRESERVE ORIGINAL FOR DISPLAY
// // =====================================================

// /**
//  * Preserve original Arabic for display (keeps khara zabar visible)
//  */
// export const preserveForDisplay = (text) => {
//   if (!text) return '';
  
//   // Remove HTML but keep Arabic characters including diacritics
//   return text.replace(/<[^>]*>/g, '');
// };

// /**
//  * Check if two words differ only in harakat (khara zabar vs zabar vs alif)
//  */
// export const areDifferentOnlyInHarakat = (word1, word2) => {
//   if (!word1 || !word2) return false;
  
//   // Remove ALL harakat from both (including khara zabar)
//   const removeHarakat = (text) => {
//     return text
//       .replace(/[\u064B-\u065F]/g, '')
//       .replace(/\u0670/g, '');
//   };
  
//   const w1NoHarakat = removeHarakat(word1);
//   const w2NoHarakat = removeHarakat(word2);
  
//   // If base letters are same, difference is only in harakat
//   if (w1NoHarakat === w2NoHarakat) return true;
  
//   // Also check alif vs no alif (both produce 'a' sound)
//   const removeAlif = (text) => {
//     return text.replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
//   };
  
//   const w1NoAlif = removeAlif(w1NoHarakat);
//   const w2NoAlif = removeAlif(w2NoHarakat);
  
//   if (w1NoAlif === w2NoAlif) {
//     // Difference is presence/absence of alif - both are 'a' sounds
//     return true;
//   }
  
//   return false;
// };

// /**
//  * Check if two words have same sound (khara zabar = zabar = alif)
//  */
// export const soundMatch = (userWord, correctWord) => {
//   if (!userWord || !correctWord) return false;
  
//   // Quick exact match (including diacritics)
//   if (userWord === correctWord) return true;
  
//   // Check if difference is only harakat (khara zabar vs zabar vs alif)
//   if (areDifferentOnlyInHarakat(userWord, correctWord)) {
//     return true;
//   }
  
//   // Check vowel equivalence specifically (alif vs zabar)
//   if (areVowelEquivalent(userWord, correctWord)) {
//     return true;
//   }
  
//   // Sound-based normalization (removes ALL diacritics)
//   const userSound = normalizeForSound(userWord);
//   const correctSound = normalizeForSound(correctWord);
  
//   if (userSound === correctSound) return true;
  
//   // Check with waw prefix removed
//   const userNoWaw = userWord.replace(/^و/, '');
//   const correctNoWaw = correctWord.replace(/^و/, '');
  
//   if (normalizeForSound(userNoWaw) === normalizeForSound(correctNoWaw)) return true;
  
//   // Check for common substitutions (length difference)
//   if (Math.abs(userSound.length - correctSound.length) <= 2) {
//     // Check if one is subset of other
//     if (userSound.includes(correctSound) || correctSound.includes(userSound)) {
//       return true;
//     }
//   }
  
//   return false;
// };

// // =====================================================
// // GET DISPLAY VERSION WITH ORIGINAL DIACRITICS
// // =====================================================

// /**
//  * Get word for display (keeps khara zabar visible)
//  */
// export const getDisplayWord = (word, originalText) => {
//   if (!word) return '';
  
//   // Try to find original with diacritics
//   if (originalText) {
//     const words = originalText.split(/\s+/);
//     for (const w of words) {
//       const withoutDiacritics = removeAllDiacritics(w);
//       const targetWithout = removeAllDiacritics(word);
//       if (withoutDiacritics === targetWithout) {
//         return w; // Return original with diacritics
//       }
//     }
//   }
  
//   return word;
// };

// // =====================================================
// // WORD SIMILARITY SCORE (SOUND-BASED)
// // =====================================================

// export const wordSimilarityScore = (userWord, correctWord) => {
//   // Exact match including diacritics = 100%
//   if (userWord === correctWord) return 100;
  
//   // Sound match = 100% (khara zabar vs zabar is perfect)
//   if (soundMatch(userWord, correctWord)) return 100;
  
//   const userSound = normalizeForSound(userWord);
//   const correctSound = normalizeForSound(correctWord);
  
//   // Calculate character-by-character match
//   let matches = 0;
//   const maxLen = Math.max(userSound.length, correctSound.length);
  
//   for (let i = 0; i < Math.min(userSound.length, correctSound.length); i++) {
//     if (userSound[i] === correctSound[i]) {
//       matches++;
//     }
//   }
  
//   const percentage = Math.round((matches / maxLen) * 100);
  
//   // If similarity is high enough (85%+), treat as correct
//   return percentage;
// };

// // =====================================================
// // COMPARE WORDS AND GENERATE DISPLAY
// // =====================================================

// export const compareWordsWithDisplay = (userWord, correctWord, userOriginal, correctOriginal) => {
//   const isSoundMatch = soundMatch(userWord, correctWord);
//   const similarity = wordSimilarityScore(userWord, correctWord);
  
//   // For display: keep original diacritics
//   const userDisplay = userOriginal || userWord;
//   const correctDisplay = correctOriginal || correctWord;
  
//   return {
//     isMatch: isSoundMatch || similarity >= 90,
//     similarity,
//     userWord: userDisplay,
//     correctWord: correctDisplay,
//     userSound: normalizeForSound(userWord),
//     correctSound: normalizeForSound(correctWord),
//     // Check if difference is only harakat (khara zabar vs zabar)
//     isOnlyHarakatDifference: areDifferentOnlyInHarakat(userWord, correctWord)
//   };
// };

// // =====================================================
// // MATCH WORDS BY SOUND (WITH DISPLAY PRESERVATION)
// // =====================================================

// export const matchWordsBySound = (userWords, correctWords, userOriginalText = '', correctOriginalText = '') => {
//   const wrongWords = [];
//   let correctCount = 0;
//   let userIdx = 0;
//   let correctIdx = 0;
  
//   // Get original words with diacritics for display
//   const userOriginalWords = userOriginalText ? 
//     userOriginalText.split(/\s+/).filter(Boolean) : userWords;
//   const correctOriginalWords = correctOriginalText ? 
//     correctOriginalText.split(/\s+/).filter(Boolean) : correctWords;
  
//   while (userIdx < userWords.length && correctIdx < correctWords.length) {
//     const userWord = userWords[userIdx];
//     const correctWord = correctWords[correctIdx];
//     const userOriginal = userOriginalWords[userIdx] || userWord;
//     const correctOriginal = correctOriginalWords[correctIdx] || correctWord;
    
//     // Check if they sound the same (khara zabar = zabar = alif)
//     if (soundMatch(userWord, correctWord)) {
//       correctCount++;
//       userIdx++;
//       correctIdx++;
//       continue;
//     }
    
//     // Check if difference is only in harakat (should not be shown as error)
//     if (areDifferentOnlyInHarakat(userWord, correctWord)) {
//       // Sound-wise same, don't count as error
//       correctCount++;
//       userIdx++;
//       correctIdx++;
//       continue;
//     }
    
//     // Try merged word
//     if (userIdx + 1 < userWords.length) {
//       const mergedUser = userWords[userIdx] + userWords[userIdx + 1];
//       if (soundMatch(mergedUser, correctWord)) {
//         correctCount++;
//         userIdx += 2;
//         correctIdx++;
//         continue;
//       }
//     }
    
//     // Real error - different word
//     const similarity = wordSimilarityScore(userWord, correctWord);
    
//     // Only show as error if similarity < 85% (very different)
//     // AND not just harakat difference
//     if (similarity < 85 && !areDifferentOnlyInHarakat(userWord, correctWord)) {
//       wrongWords.push({
//         position: correctIdx + 1,
//         userWord: userOriginal,
//         correctWord: correctOriginal,
//         userWordRaw: userWord,
//         correctWordRaw: correctWord,
//         errorType: 'substitution',
//         similarity,
//         isOnlyHarakat: false
//       });
//     } else {
//       // Count as correct if similarity is high or only harakat difference
//       correctCount++;
//     }
    
//     userIdx++;
//     correctIdx++;
//   }
  
//   // Handle remaining words
//   while (correctIdx < correctWords.length) {
//     wrongWords.push({
//       position: correctIdx + 1,
//       userWord: null,
//       correctWord: correctOriginalWords[correctIdx] || correctWords[correctIdx],
//       errorType: 'missing'
//     });
//     correctIdx++;
//   }
  
//   while (userIdx < userWords.length) {
//     wrongWords.push({
//       position: correctWords.length + 1,
//       userWord: userOriginalWords[userIdx] || userWords[userIdx],
//       correctWord: null,
//       errorType: 'extra'
//     });
//     userIdx++;
//   }
  
//   const accuracy = correctWords.length > 0 
//     ? Math.round((correctCount / correctWords.length) * 100)
//     : 0;
  
//   return {
//     accuracy,
//     wrongWords,
//     correctCount,
//     totalCorrect: correctWords.length
//   };
// };

// // Export main functions
// export default {
//   soundMatch,
//   wordSimilarityScore,
//   matchWordsBySound,
//   compareWordsWithDisplay,
//   areDifferentOnlyInHarakat,
//   preserveForDisplay,
//   getDisplayWord
// };
// services/soundMatcher.js - COMPLETE FIXED VERSION
// Handles: Khara Zabar = Zabar = Alif, Fast/Slow recitation, Letter merging

// =====================================================
// HARKAAT EQUIVALENCE MAPPING
// =====================================================

// Harakat that sound the same (ALL ARE EQUIVALENT)
export const harakatEquivalence = {
  // Zabar group (all sound like 'a') - THIS IS KEY FIX
  'zabar': ['\u064E', '\u0670', '\u0627', '\u0622', '\u0623', '\u0625'], // zabar, khara zabar, alif = SAME SOUND!
  
  // Pesh group (sound like 'u')
  'pesh': ['\u064F'],
  
  // Zeer group (sound like 'i')  
  'zeer': ['\u0650'],
  
  // Tanween group
  'tanween_fatha': ['\u064B'],
  'tanween_damma': ['\u064C'],
  'tanween_kasra': ['\u064D'],
};

// Inverse mapping for quick lookup
const harakatToGroup = {};
for (const [group, chars] of Object.entries(harakatEquivalence)) {
  for (const char of chars) {
    harakatToGroup[char] = group;
  }
}

// =====================================================
// REMOVE ALL DIACRITICS (FOR SOUND COMPARISON)
// =====================================================

/**
 * Remove ALL diacritics for sound comparison
 * Treats khara zabar (ٰ) same as regular zabar (َ) - both removed
 */
const removeAllDiacritics = (text) => {
  if (!text) return '';
  
  // Remove ALL harakat including khara zabar
  return text
    .replace(/[\u064B-\u065F]/g, '')   // All standard diacritics
    .replace(/\u0670/g, '')             // Khara zabar (superscript alif)
    .replace(/[\u06D6-\u06ED]/g, '');   // Other Quranic marks
};

/**
 * Check if character is Alif (any form)
 */
const isAlif = (char) => {
  return ['\u0622', '\u0623', '\u0625', '\u0671', '\u0627'].includes(char);
};

/**
 * NORMALIZE FOR SOUND COMPARISON - KEY FIX
 * Alif (ا) = Zabar (َ) = Khara Zabar (ٰ) = ALL SAME SOUND
 */
export const normalizeForSound = (text) => {
  if (!text) return '';
  
  let normalized = text;
  
  // STEP 1: Remove ALL diacritics (zabar, khara zabar, pesh, zeer, etc.)
  normalized = removeAllDiacritics(normalized);
  
  // STEP 2: Normalize alif variations to standard alif
  normalized = normalized.replace(/[\u0622\u0623\u0625\u0671\u0649]/g, '\u0627');
  
  // STEP 3: Remove ALL alif for vowel equivalence? No - but treat as sound
  // Actually alif IS a vowel sound like zabar
  
  // STEP 4: Sound groups (Pakistani/Urdu accent)
  normalized = normalized.replace(/[\u0635\u062B]/g, '\u0633');      // ص ث -> س
  normalized = normalized.replace(/[\u0630\u0638\u0636]/g, '\u0632'); // ذ ظ ض -> ز
  normalized = normalized.replace(/\u0637/g, '\u062A');               // ط -> ت
  normalized = normalized.replace(/[\u0642\u0643]/g, '\u0643');       // ق ك -> ك
  normalized = normalized.replace(/\u062D/g, '\u0647');               // ح -> ه
  normalized = normalized.replace(/\u0624/g, '\u0648');               // ؤ -> و
  normalized = normalized.replace(/[\u0626\u0649]/g, '\u064A');       // ئ ى -> ي
  normalized = normalized.replace(/\u0629/g, '\u0647');               // ة -> ه
  
  // STEP 5: Clean up
  normalized = normalized.replace(/[^\u0600-\u06FF\s]/g, '');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Check if two words are equivalent in vowel sound
 * This handles: Alif (ا) = Zabar (َ) = Khara Zabar (ٰ)
 */
export const areVowelEquivalent = (word1, word2) => {
  if (!word1 || !word2) return false;
  
  // Quick check if they are already equal after normalization
  const norm1 = normalizeForSound(word1);
  const norm2 = normalizeForSound(word2);
  if (norm1 === norm2) return true;
  
  // Remove all diacritics first from original words
  const noDiacritics1 = word1.replace(/[\u064B-\u065F]/g, '').replace(/\u0670/g, '');
  const noDiacritics2 = word2.replace(/[\u064B-\u065F]/g, '').replace(/\u0670/g, '');
  
  // If base letters are same, they are equivalent
  if (noDiacritics1 === noDiacritics2) return true;
  
  // Get base letters (remove all vowel markers including alif)
  const baseLetters1 = word1.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
  const baseLetters2 = word2.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
  
  // If base letters match, difference is only vowels
  if (baseLetters1 === baseLetters2) {
    return true;  // All vowel-only differences are acceptable
  }
  
  return false;
};

/**
 * Check if two words differ only in harakat (khara zabar vs zabar vs alif)
 */
export const areDifferentOnlyInHarakat = (word1, word2) => {
  if (!word1 || !word2) return false;
  
  // Remove ALL harakat from both (including khara zabar)
  const removeHarakat = (text) => {
    return text
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/\u0670/g, '');
  };
  
  const w1NoHarakat = removeHarakat(word1);
  const w2NoHarakat = removeHarakat(word2);
  
  // If base letters are same, difference is only in harakat
  if (w1NoHarakat === w2NoHarakat) return true;
  
  // Also check alif vs no alif (both produce 'a' sound)
  const removeAlif = (text) => {
    return text.replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '');
  };
  
  const w1NoAlif = removeAlif(w1NoHarakat);
  const w2NoAlif = removeAlif(w2NoHarakat);
  
  if (w1NoAlif === w2NoAlif) {
    // Difference is presence/absence of alif - both are 'a' sounds
    return true;
  }
  
  return false;
};

/**
 * Check if two words have same sound (khara zabar = zabar = alif)
 */
export const soundMatch = (userWord, correctWord) => {
  if (!userWord || !correctWord) return false;
  
  // Quick exact match (including diacritics)
  if (userWord === correctWord) return true;
  
  // Check if difference is only harakat (khara zabar vs zabar vs alif)
  if (areDifferentOnlyInHarakat(userWord, correctWord)) {
    return true;
  }
  
  // Check vowel equivalence specifically (alif vs zabar)
  if (areVowelEquivalent(userWord, correctWord)) {
    return true;
  }
  
  // Sound-based normalization (removes ALL diacritics)
  const userSound = normalizeForSound(userWord);
  const correctSound = normalizeForSound(correctWord);
  
  if (userSound === correctSound) return true;
  
  // Check with waw prefix removed
  const userNoWaw = userWord.replace(/^و/, '');
  const correctNoWaw = correctWord.replace(/^و/, '');
  
  if (normalizeForSound(userNoWaw) === normalizeForSound(correctNoWaw)) return true;
  
  // Check for merged words (fast recitation)
  // If user said "bismillah" but should be "bismi allah"
  if (userSound.length < correctSound.length) {
    // Check if user's word is a prefix of correct word
    if (correctSound.startsWith(userSound)) return true;
  }
  if (correctSound.length < userSound.length) {
    if (userSound.startsWith(correctSound)) return true;
  }
  
  // Check for common substitutions (length difference)
  if (Math.abs(userSound.length - correctSound.length) <= 2) {
    // Check if one is subset of other
    if (userSound.includes(correctSound) || correctSound.includes(userSound)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get word for display (keeps khara zabar visible)
 */
export const getDisplayWord = (word, originalText) => {
  if (!word) return '';
  
  // Try to find original with diacritics
  if (originalText) {
    const words = originalText.split(/\s+/);
    for (const w of words) {
      const withoutDiacritics = w.replace(/[\u064B-\u065F\u0670]/g, '');
      const targetWithout = word.replace(/[\u064B-\u065F\u0670]/g, '');
      if (withoutDiacritics === targetWithout) {
        return w; // Return original with diacritics
      }
    }
  }
  
  return word;
};

/**
 * WORD SIMILARITY SCORE (SOUND-BASED)
 */
export const wordSimilarityScore = (userWord, correctWord) => {
  // Exact match including diacritics = 100%
  if (userWord === correctWord) return 100;
  
  // Sound match = 100% (khara zabar vs zabar is perfect)
  if (soundMatch(userWord, correctWord)) return 100;
  
  // Check vowel equivalence = 100% (alif vs zabar)
  if (areVowelEquivalent(userWord, correctWord)) return 100;
  
  // Check only harakat difference = 100%
  if (areDifferentOnlyInHarakat(userWord, correctWord)) return 100;
  
  const userSound = normalizeForSound(userWord);
  const correctSound = normalizeForSound(correctWord);
  
  // Calculate character-by-character match
  let matches = 0;
  const maxLen = Math.max(userSound.length, correctSound.length);
  
  for (let i = 0; i < Math.min(userSound.length, correctSound.length); i++) {
    if (userSound[i] === correctSound[i]) {
      matches++;
    }
  }
  
  const percentage = maxLen > 0 ? Math.round((matches / maxLen) * 100) : 0;
  
  // If similarity is high enough (85%+), treat as correct for fast recitation
  if (percentage >= 85) return 100;
  
  return percentage;
};

/**
 * COMPARE WORDS WITH DISPLAY (PRESERVING ORIGINAL)
 */
export const compareWordsWithDisplay = (userWord, correctWord, userOriginal, correctOriginal) => {
  const isSoundMatch = soundMatch(userWord, correctWord);
  const similarity = wordSimilarityScore(userWord, correctWord);
  const isOnlyHarakat = areDifferentOnlyInHarakat(userWord, correctWord);
  const isVowelEq = areVowelEquivalent(userWord, correctWord);
  
  // For display: keep original diacritics
  const userDisplay = userOriginal || userWord;
  const correctDisplay = correctOriginal || correctWord;
  
  return {
    isMatch: isSoundMatch || similarity >= 85 || isOnlyHarakat || isVowelEq,
    similarity: isSoundMatch || isOnlyHarakat || isVowelEq ? 100 : similarity,
    userWord: userDisplay,
    correctWord: correctDisplay,
    userSound: normalizeForSound(userWord),
    correctSound: normalizeForSound(correctWord),
    isOnlyHarakatDifference: isOnlyHarakat,
    isVowelEquivalent: isVowelEq
  };
};

/**
 * MATCH WORDS BY SOUND WITH FAST RECITATION SUPPORT
 * This handles word merging that happens in fast recitation
 */
export const matchWordsBySound = (userWords, correctWords, userOriginalText = '', correctOriginalText = '') => {
  const wrongWords = [];
  let correctCount = 0;
  let userIdx = 0;
  let correctIdx = 0;
  
  // Get original words with diacritics for display
  const userOriginalWords = userOriginalText ? 
    userOriginalText.split(/\s+/).filter(Boolean) : userWords;
  const correctOriginalWords = correctOriginalText ? 
    correctOriginalText.split(/\s+/).filter(Boolean) : correctWords;
  
  while (userIdx < userWords.length && correctIdx < correctWords.length) {
    const userWord = userWords[userIdx];
    const correctWord = correctWords[correctIdx];
    const userOriginal = userOriginalWords[userIdx] || userWord;
    const correctOriginal = correctOriginalWords[correctIdx] || correctWord;
    
    // Check if they sound the same (khara zabar = zabar = alif)
    if (soundMatch(userWord, correctWord)) {
      correctCount++;
      userIdx++;
      correctIdx++;
      continue;
    }
    
    // Check if difference is only in harakat (should not be shown as error)
    if (areDifferentOnlyInHarakat(userWord, correctWord)) {
      correctCount++;
      userIdx++;
      correctIdx++;
      continue;
    }
    
    // Check vowel equivalence
    if (areVowelEquivalent(userWord, correctWord)) {
      correctCount++;
      userIdx++;
      correctIdx++;
      continue;
    }
    
    // FAST RECITATION HANDLING: Try merging current user word with next user word
    // This is key for fast recitation where words get combined
    if (userIdx + 1 < userWords.length) {
      const mergedUser = userWords[userIdx] + userWords[userIdx + 1];
      if (soundMatch(mergedUser, correctWord)) {
        correctCount++;
        userIdx += 2;
        correctIdx++;
        continue;
      }
    }
    
    // FAST RECITATION: Try merging current correct word with next correct word
    // User might be reading slower, separating a word into two
    if (correctIdx + 1 < correctWords.length) {
      const mergedCorrect = correctWords[correctIdx] + correctWords[correctIdx + 1];
      if (soundMatch(userWord, mergedCorrect)) {
        correctCount++;
        userIdx++;
        correctIdx += 2;
        continue;
      }
    }
    
    // Check similarity score
    const similarity = wordSimilarityScore(userWord, correctWord);
    
    // Only show as error if similarity < 85% (very different)
    // AND not just harakat/vowel difference
    if (similarity < 85 && !areDifferentOnlyInHarakat(userWord, correctWord) && !areVowelEquivalent(userWord, correctWord)) {
      wrongWords.push({
        position: correctIdx + 1,
        userWord: userOriginal,
        correctWord: correctOriginal,
        userWordRaw: userWord,
        correctWordRaw: correctWord,
        errorType: 'substitution',
        similarity,
        isOnlyHarakat: false
      });
    } else {
      // Count as correct if similarity is high or only harakat difference
      correctCount++;
    }
    
    userIdx++;
    correctIdx++;
  }
  
  // Handle remaining words in correct text (user missed them)
  while (correctIdx < correctWords.length) {
    wrongWords.push({
      position: correctIdx + 1,
      userWord: null,
      correctWord: correctOriginalWords[correctIdx] || correctWords[correctIdx],
      errorType: 'missing'
    });
    correctIdx++;
  }
  
  // Handle extra words in user text (user added words)
  while (userIdx < userWords.length) {
    // Don't show extra "wa" (و) as error - common in recitation
    const extraWord = userOriginalWords[userIdx] || userWords[userIdx];
    const isJustWaw = extraWord === 'و' || extraWord === 'وا' || extraWord === 'وَا';
    
    if (!isJustWaw) {
      wrongWords.push({
        position: correctWords.length + 1,
        userWord: extraWord,
        correctWord: null,
        errorType: 'extra'
      });
    } else {
      // Count waw as correct (it's optional in recitation)
      correctCount++;
    }
    userIdx++;
  }
  
  const accuracy = correctWords.length > 0 
    ? Math.round((correctCount / correctWords.length) * 100)
    : 0;
  
  return {
    accuracy,
    wrongWords,
    correctCount,
    totalCorrect: correctWords.length
  };
};

export default {
  soundMatch,
  wordSimilarityScore,
  matchWordsBySound,
  compareWordsWithDisplay,
  areDifferentOnlyInHarakat,
  areVowelEquivalent,
  normalizeForSound,
  getDisplayWord
};