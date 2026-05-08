// utils/romanMapping.js
// WhatsApp style Roman conversion with harkaat & muqataat mapping

export const harkaatMapping = {
  // Fatha (zabar)
  '\u064E': 'a',     // fatHa
  '\u064F': 'u',     // Damma (pesh)
  '\u0650': 'i',     // Kasra (zeer)
  
  // Double fatha (tanween fatha)
  '\u064B': 'an',
  '\u064C': 'un',    // tanween damma
  '\u064D': 'in',    // tanween kasra
  
  // Shadda (tashdeed)
  '\u0651': '',
  
  // Madd
  '\u0653': 'aa',    // madd madd
  '\u0670': 'a',     // khara zabar (superscrip alif) - SAME AS ZABAR
  '\u0654': 'i',     // hamza below
  '\u0655': 'a',     // hamza above
  
  // Sukun
  '\u0652': '',
};

// Letter to Roman mapping (base sounds)
export const letterToRoman = {
  // Alif group
  '\u0627': 'a',     // ا
  '\u0622': 'aa',    // آ
  '\u0623': 'a',     // أ
  '\u0625': 'i',     // إ
  '\u0671': 'a',     // ٱ (alif wasla)
  
  // Ba
  '\u0628': 'b',     // ب
  
  // Ta
  '\u062A': 't',     // ت
  '\u062B': 's',     // ث -> s (Pakistani accent)
  
  // Jeem
  '\u062C': 'j',     // ج
  '\u062D': 'h',     // ح -> h
  '\u062E': 'kh',    // خ
  
  // Dal group
  '\u062F': 'd',     // د
  '\u0630': 'z',     // ذ -> z
  
  // Ra
  '\u0631': 'r',     // ر
  '\u0632': 'z',     // ز
  
  // Seen group
  '\u0633': 's',     // س
  '\u0634': 'sh',    // ش
  '\u0635': 's',     // ص -> s
  
  // Dad
  '\u0636': 'z',     // ض -> z
  
  // Ta group
  '\u0637': 't',     // ط -> t
  '\u0638': 'z',     // ظ -> z
  
  // Ain group
  '\u0639': 'a',     // ع -> a
  '\u063A': 'gh',    // غ
  
  // Fa
  '\u0641': 'f',     // ف
  
  // Qaf
  '\u0642': 'q',     // ق
  '\u0643': 'k',     // ك
  
  // Lam
  '\u0644': 'l',     // ل
  
  // Meem
  '\u0645': 'm',     // م
  
  // Noon
  '\u0646': 'n',     // ن
  
  // Ha
  '\u0647': 'h',     // ه
  '\u0629': 'h',     // ة -> h
  
  // Waw
  '\u0648': 'w',     // و
  
  // Ya
  '\u064A': 'y',     // ي
  '\u0649': 'a',     // ى (alif maqsura) -> a
  '\u0626': 'y',     // ئ -> y
  '\u0624': 'w',     // ؤ -> w
};

// Special muqataat (disjoint letters) mapping
export const muqataatMapping = {
  'الٓمٓ': 'alif-laam-meem',
  'الٓمٓصٓ': 'alif-laam-meem-saad',
  'الٓر': 'alif-laam-ra',
  'الٓمٓر': 'alif-laam-meem-ra',
  'طٰهٰ': 'taa-haa',
  'طٰسٓمٓ': 'taa-seen-meem',
  'طٰسٓ': 'taa-seen',
  'يٰسٓ': 'yaa-seen',
  'صٓ': 'saad',
  'حمٓ': 'haa-meem',
  'حمٓعسٓقٓ': 'haa-meem-ain-seen-qaaf',
  'قٓ': 'qaaf',
  'نٓ': 'noon',
  'عٓسٓقٓ': 'ain-seen-qaaf',
  'كٓهٰيٰعٓصٓ': 'kaaf-haa-yaa-ain-saad',
};

/**
 * Convert Arabic text to WhatsApp style Roman
 * @param {string} arabicText - Arabic text with tajweed
 * @param {boolean} consoleLog - Whether to log to console
 * @returns {string} Romanized text
 */
export const convertToRoman = (arabicText, consoleLog = true) => {
  if (!arabicText) return '';
  
  let text = arabicText;
  
  // Remove HTML tags like <tajweed>, <span>, etc.
  text = text.replace(/<[^>]*>/g, '');
  
  // Remove end markers (١, ٢, etc.)
  text = text.replace(/<span[^>]*class="end"[^>]*>[\u0660-\u0669]+<\/span>/g, '');
  text = text.replace(/[\u0660-\u0669]/g, '');
  
  // Check for muqataat first
  for (const [muqataat, roman] of Object.entries(muqataatMapping)) {
    if (text.includes(muqataat)) {
      text = text.replace(new RegExp(muqataat, 'g'), roman);
    }
  }
  
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    
    // Skip diacritics for now (they modify previous letter)
    if (char >= '\u064B' && char <= '\u065F') {
      i++;
      continue;
    }
    
    // Check for letter
    if (letterToRoman[char]) {
      let romanChar = letterToRoman[char];
      
      // Look ahead for diacritics
      let nextChar = text[i + 1];
      let diacritic = '';
      
      if (nextChar >= '\u064B' && nextChar <= '\u065F') {
        diacritic = nextChar;
        
        // Apply diacritic mapping
        if (diacritic === '\u064E') { // zabar
          romanChar = romanChar === 'a' ? 'a' : romanChar + 'a';
        } else if (diacritic === '\u064F') { // pesh
          romanChar = romanChar === 'w' ? 'u' : romanChar + 'u';
        } else if (diacritic === '\u0650') { // zeer
          romanChar = romanChar === 'y' ? 'i' : romanChar + 'i';
        } else if (diacritic === '\u064B') { // tanween fatha
          romanChar = romanChar + 'an';
        } else if (diacritic === '\u064C') { // tanween damma
          romanChar = romanChar + 'un';
        } else if (diacritic === '\u064D') { // tanween kasra
          romanChar = romanChar + 'in';
        } else if (diacritic === '\u0651') { // shadda
          romanChar = romanChar + romanChar;
        } else if (diacritic === '\u0670') { // khara zabar
          romanChar = romanChar === 'a' ? 'a' : romanChar + 'a';
        }
        
        i++; // Skip diacritic
      }
      
      result += romanChar;
    } else if (char === ' ') {
      result += ' ';
    } else if (char === '\u0652') { // Sukun - ignore
      // Skip
    } else {
      // Unknown character - keep as is
      result += char;
    }
    
    i++;
  }
  
  // Clean up result
  result = result.replace(/\s+/g, ' ').trim();
  result = result.replace(/aa+/g, 'aa');
  result = result.replace(/ii+/g, 'ii');
  result = result.replace(/uu+/g, 'uu');
  
  if (consoleLog) {
    console.log('📝 Roman Conversion:', {
      input: arabicText.substring(0, 100),
      output: result.substring(0, 100),
      fullOutput: result
    });
  }
  
  return result;
};

/**
 * Convert for display in WhatsApp style (more readable)
 */
export const convertToWhatsAppStyle = (arabicText) => {
  const roman = convertToRoman(arabicText, false);
  
  // Make more readable
  return roman
    .replace(/allah/g, 'Allah')
    .replace(/muhammad/g, 'Muhammad')
    .replace(/bismillah/g, 'Bismillah')
    .replace(/rahman/g, 'Rahman')
    .replace(/rahim/g, 'Rahim')
    .replace(/alhamdulillah/g, 'Alhamdulillah');
};

export default {
  harkaatMapping,
  letterToRoman,
  muqataatMapping,
  convertToRoman,
  convertToWhatsAppStyle
};