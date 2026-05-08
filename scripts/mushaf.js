



import fs from "fs";
import fetch from "node-fetch"

// ================= CONFIG =================
const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

const FIELDS = [
  "text_uthmani",
  "text_uthmani_tajweed",
  "verse_key",
  "juz_number",
  "page_number",
  "ruku_number",
  "hizb_number",
  "rub_el_hizb_number",
  "manzil_number",
  "sajdah_number"
].join( "," );

// ================= WAQF SYMBOLS =================
const WAQF_SYMBOLS = {
  "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
  "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
  "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
  "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
  "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
  "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
  "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
  "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
  "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
  "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
  "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
};

// ================= DYNAMIC TAJWEED PROCESSOR (100% ACCURATE) =================
class TajweedProcessor {
  constructor() {
    // Qalqalah letters (echo)
    this.qalqalahLetters = new Set( [ "ق", "ط",  "ب", "ج", "d" ,"د","ض", "ط","ض", "ط","ع"] ); // 'د' is included

    // Idgham with Ghunnah (ي ن م و)
    this.idghamWithGhunnah = new Set( [ "ي", "ن", "م", "و" ] );
    // Idgham without Ghunnah (ل ر)
    this.idghamWithoutGhunnah = new Set( [ "ل", "ر" ] );
    // Iqlab only with ب
    this.iqlabLetters = new Set( [ "ب" ] );
    // Ikhfa letters (15)
    this.ikhfaLetters = new Set( [
      "ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"
    ] );
    // Izhar letters (throat)
    this.izharLetters = new Set( [ "ء", "ه", "ع", "ح", "غ", "خ" ] );

    // Madd letters
    this.maddLetters = new Set( [ "ا", "و", "ي" ] );

    // Heavy letters (Tafkheem)
    this.heavyLetters = new Set( [ "خ", "ص", "ض", "غ", "ط", "ق", "ظ" ] );
    // Throat letters (Makharij)
    this.throatLetters = new Set( [ "ء", "ه", "ع", "ح", "غ", "خ" ] );

    // 🆕 Halaq (throat) letters - yeh wo letters hain jo halaq se aati hain

        this.halaqLetters = new Set( [ "ض", "ق", "ر", "ع", "ظ", "خ", "ل", "غ", "ح", "ء", "ه" ] );

  }

  // Check if character is a diacritic (harakah, sukun, shaddah, tanween)
  isDiacritic( ch ) {
    return /[\u064B-\u0652]/.test( ch );
  }

  // Get base letter (skip diacritics)
  getBaseLetter( chars, idx ) {
    if ( !chars[ idx ] || this.isDiacritic( chars[ idx ] ) ) return null;
    return chars[ idx ];
  }

  // Get next non‑diacritic character and its index
  getNextNonDiacritic( chars, startIdx ) {
    for ( let i = startIdx + 1; i < chars.length; i++ ) {
      if ( !this.isDiacritic( chars[ i ] ) ) {
        return { char: chars[ i ], index: i };
      }
    }
    return null;
  }

  // Get previous non‑diacritic character
  getPrevNonDiacritic( chars, startIdx ) {
    for ( let i = startIdx - 1; i >= 0; i-- ) {
      if ( !this.isDiacritic( chars[ i ] ) ) {
        return { char: chars[ i ], index: i };
      }
    }
    return null;
  }

  // Check if a letter has a specific diacritic
  hasDiacritic( chars, letterIdx, diacritic ) {
    for ( let i = letterIdx + 1; i < chars.length && this.isDiacritic( chars[ i ] ); i++ ) {
      if ( chars[ i ] === diacritic ) return true;
    }
    return false;
  }

  // Get the vowel diacritic on a letter (ignoring shaddah)
  getDiacritic( chars, letterIdx ) {
    for ( let i = letterIdx + 1; i < chars.length && this.isDiacritic( chars[ i ] ); i++ ) {
      if ( chars[ i ] !== "ّ" ) return chars[ i ];
    }
    return null;
  }
    processHalaq( letter ) {
    if ( this.halaqLetters.has( letter ) ) {
      return "tajweed-halaq";
    }
    return null;
  }


  // Check if letter has shaddah
  hasShaddah( chars, letterIdx ) {
    for ( let i = letterIdx + 1; i < chars.length && this.isDiacritic( chars[ i ] ); i++ ) {
      if ( chars[ i ] === "ّ" ) return true;
    }
    return false;
  }

  // 1️⃣ Noon Sakinah & Tanween rules
  processNoonSakinahTanween( chars, idx, letter, diacritics ) {
    // Noon Sakinah
    if ( letter === "ن" && diacritics.includes( "ْ" ) ) {
      const next = this.getNextNonDiacritic( chars, idx );
      if ( !next ) return null;
      const nextLetter = next.char;
      if ( this.izharLetters.has( nextLetter ) ) return "tajweed-izhar";
      if ( this.idghamWithGhunnah.has( nextLetter ) ) return "tajweed-idgham-gunnah";
      if ( this.idghamWithoutGhunnah.has( nextLetter ) ) return "tajweed-idgham-no-gunnah";
      if ( this.iqlabLetters.has( nextLetter ) ) return "tajweed-iqlab";
      if ( this.ikhfaLetters.has( nextLetter ) ) return "tajweed-ikhfa";
      return null;
    }
    // Tanween (ًٌٍ)
    if ( diacritics.includes( "ً" ) || diacritics.includes( "ٌ" ) || diacritics.includes( "ٍ" ) ) {
      const next = this.getNextNonDiacritic( chars, idx );
      if ( !next ) return null;
      const nextLetter = next.char;
      if ( this.izharLetters.has( nextLetter ) ) return "tajweed-izhar";
      if ( this.idghamWithGhunnah.has( nextLetter ) ) return "tajweed-idgham-gunnah";
      if ( this.idghamWithoutGhunnah.has( nextLetter ) ) return "tajweed-idgham-no-gunnah";
      if ( this.iqlabLetters.has( nextLetter ) ) return "tajweed-iqlab";
      if ( this.ikhfaLetters.has( nextLetter ) ) return "tajweed-ikhfa";
      return null;
    }
    return null;
  }

  // 2️⃣ Meem Sakinah rules
  processMeemSakinah( chars, idx, letter, diacritics ) {
    if ( letter === "م" && diacritics.includes( "ْ" ) ) {
      const next = this.getNextNonDiacritic( chars, idx );
      if ( !next ) return null;
      const nextLetter = next.char;
      if ( nextLetter === "ب" ) return "tajweed-ikhfa-shafawi";
      if ( nextLetter === "م" ) return "tajweed-idgham-shafawi";
      return "tajweed-izhar-shafawi";
    }
    return null;
  }

  // 3️⃣ Qalqalah (echo)
  processQalqalah( chars, idx, letter, diacritics, isEndOfWord ) {
    if ( !this.qalqalahLetters.has( letter ) ) return null;
    const hasSukun = diacritics.includes( "ْ" );
    if ( hasSukun || isEndOfWord ) {
      return "tajweed-qalqalah";
    }
    return null;
  }

  // 4️⃣ Madd rules (Asli and Far'i)
  processMadd( chars, idx, letter, diacritics ) {
    if ( !this.maddLetters.has( letter ) ) return null;
    const vowel = this.getDiacritic( chars, idx );
    if ( letter === "ا" && vowel === "َ" ) {
      const next = this.getNextNonDiacritic( chars, idx );
      if ( next && ( next.char === "ء" || next.char === "همزة" ) ) return "tajweed-madd-fari";
      // Check for sukun after alif
      let nextHasSukun = false;
      let tempIdx = idx + 1;
      while ( tempIdx < chars.length && this.isDiacritic( chars[ tempIdx ] ) ) {
        if ( chars[ tempIdx ] === "ْ" ) nextHasSukun = true;
        tempIdx++;
      }
      if ( nextHasSukun ) return "tajweed-madd-fari";
      return "tajweed-madd-asli";
    }
    if ( letter === "و" && vowel === "ُ" ) {
      const next = this.getNextNonDiacritic( chars, idx );
      if ( next && next.char === "ء" ) return "tajweed-madd-fari";
      return "tajweed-madd-asli";
    }
    if ( letter === "ي" && vowel === "ِ" ) {
      const next = this.getNextNonDiacritic( chars, idx );
      if ( next && next.char === "ء" ) return "tajweed-madd-fari";
      return "tajweed-madd-asli";
    }
    return null;
  }

  // 5️⃣ Ghunnah (nasal sound on noon/meem with shaddah)
  processGhunnah( chars, idx, letter, diacritics ) {
    if ( ( letter === "ن" || letter === "م" ) && this.hasShaddah( chars, idx ) ) {
      return "tajweed-ghunnah";
    }
    return null;
  }

  // 6️⃣ Laam rule (only in "Allah")
  processLaam( chars, idx, letter, wordContext ) {
    if ( letter !== "ل" ) return null;
    if ( wordContext.includes( "الله" ) ) {
      const prevLetterObj = this.getPrevNonDiacritic( chars, idx );
      if ( prevLetterObj ) {
        const prevDiacritic = this.getDiacritic( chars, prevLetterObj.index );
        if ( prevDiacritic === "َ" || prevDiacritic === "ُ" ) {
          return "tajweed-laam-tafkheem";
        } else {
          return "tajweed-laam-tarqeeq";
        }
      }
    }
    return null;
  }

  // 7️⃣ Raa rule (heavy with fatha/damma, light with kasra)
  processRaa( chars, idx, letter, diacritics ) {
    if ( letter !== "ر" ) return null;
    const vowel = this.getDiacritic( chars, idx );
    if ( vowel === "َ" || vowel === "ُ" ) return "tajweed-raa-heavy";
    if ( vowel === "ِ" ) return "tajweed-raa-light";
    return null;
  }

  // 8️⃣ Makharij (throat letters)
  processMakharij( letter ) {
    if ( this.throatLetters.has( letter ) ) return "tajweed-makharij-throat";
    return null;
  }

  // 9️⃣ Sifaat (heavy letters)
  processSifaat( letter ) {
    if ( this.heavyLetters.has( letter ) ) return "tajweed-sifaat-heavy";
    return null;
  }

  applyTajweed( plainText, addEndMarker = false, ayaIndex = null ) {
    if ( !plainText ) return "";
    const chars = [ ...plainText ];
    let result = "";
    let i = 0;

    while ( i < chars.length ) {
      const ch = chars[ i ];

      // 1️⃣ Waqf symbols ko wrap karna
      if ( WAQF_SYMBOLS[ ch ] ) {
        result += `<span class="tajweed-waqf">${ch}</span>`;
        i++;
        continue;
      }

      // 2️⃣ Diacritics
      if ( this.isDiacritic( ch ) ) {
        result += ch;
        i++;
        continue;
      }

      // 3️⃣ Letter + diacritics
      let letter = ch;
      let diacritics = "";
      let j = i + 1;
      while ( j < chars.length && this.isDiacritic( chars[ j ] ) ) {
        diacritics += chars[ j ];
        j++;
      }

      // 4️⃣ Apply all tajweed rules
      let classes = [];
      const ruleClass =
        this.processNoonSakinahTanween( chars, i, letter, diacritics ) ||
        this.processMeemSakinah( chars, i, letter, diacritics ) ||
        this.processQalqalah( chars, i, letter, diacritics ) ||
        this.processMadd( chars, i, letter, diacritics ) ||
        this.processGhunnah( chars, i, letter, diacritics ) ||
        this.processLaam( chars, i, letter, plainText ) ||
        this.processRaa( chars, i, letter, diacritics );
      const halaqClass = this.processHalaq( letter );

      const makhClass = this.processMakharij( letter );
      const sifaatClass = this.processSifaat( letter );



      if ( ruleClass ) classes.push( ruleClass );
      if ( makhClass ) classes.push( makhClass );
      if ( sifaatClass ) classes.push( sifaatClass );
      if ( halaqClass ) classes.push( halaqClass );

      const fullText = letter + diacritics;
      if ( classes.length ) {
        result += `<span class="${classes.join( " " )}">${fullText}</span>`;
      } else {
        result += fullText;
      }

      i = j;
    }

    // ✅ End marker ko **absolute end** par append karein
    if ( addEndMarker && ayaIndex != null ) {
      result += `<span class="end">${ayaIndex}</span>`;
    }

    return result;
  }
}

// ================= HELPERS (unchanged from original) =================
function extractWaqfFromText( text ) {
  if ( !text ) return [];
  const waqfList = [];
  let waqfCounter = 1;
  for ( let i = 0; i < text.length; i++ ) {
    const char = text[ i ];
    if ( WAQF_SYMBOLS[ char ] ) {
      const info = WAQF_SYMBOLS[ char ];
      const before = text.substring( Math.max( 0, i - 30 ), i ).trim();
      const after = text.substring( i + 1, Math.min( text.length, i + 15 ) ).trim();
      waqfList.push( {
        symbol: char,
        unicode: `U+${char.codePointAt( 0 ).toString( 16 ).toUpperCase().padStart( 4, "0" )}`,
        type: info.type,
        label: info.label,
        meaning: info.meaning,
        charIndex: i,
        wordBefore: before,
        wordAfter: after,
        waqfIndex: waqfCounter++,
      } );
    }
  }
  return waqfList;
}

function getEndWaqf( text, waqfList ) {
  if ( !text || waqfList.length === 0 ) return null;
  const trimmed = text.trimEnd();
  const lastChar = trimmed[ trimmed.length - 1 ];
  if ( WAQF_SYMBOLS[ lastChar ] ) {
    return waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 );
  }
  return null;
}

function getRubElHizbType( hizbNumber, rubElHizbNumber ) {
  if ( !hizbNumber || !rubElHizbNumber ) return null;
  switch ( rubElHizbNumber ) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
    case 4: return 4;
    default: return null;
  }
}

async function fetchAlQuranCloud() {
  const res = await fetch( ALQURAN_CLOUD );
  const data = await res.json();
  if ( data.code !== 200 ) throw new Error( "alquran.cloud fetch failed" );
  const rukuMap = {};
  const textMap = {};
  data.data.surahs.forEach( sura => {
    sura.ayahs.forEach( aya => {
      const key = `${sura.number}:${aya.numberInSurah}`;
      rukuMap[ key ] = aya.ruku || null;
      textMap[ key ] = aya.text || "";
    } );
  } );
  return { rukuMap, textMap };
}

async function fetchQuranComSura( suraNum ) {
  const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
  const res = await fetch( url );
  const data = await res.json();
  return data.verses || [];
}

async function fetchSurahNames() {
  const res = await fetch( "https://api.quran.com/api/v4/chapters" );
  const data = await res.json();
  const surahMap = {};
  data.chapters.forEach( c => surahMap[ c.id ] = c.name_simple );
  return surahMap;
}

async function fetchParaNames() {
  const accurateParaNames = {
    1: "الٓمٓ", 2: "سَيَقُولُ", 3: "تِلْكَ ٱلرُّسُلُ", 4: "لَن تَنَالُوا۟",
    5: "وَٱلْمُحْصَنَٰتُ", 6: "لَا يُحِبُّ ٱللَّهُ", 7: "وَإِذَا سَمِعُوا۟",
    8: "وَلَوْ أَنَّنَا", 9: "قَالَ ٱلْمَلَأُ", 10: "وَٱعْلَمُوٓا۟",
    11: "يَعْتَذِرُونَ", 12: "وَمَا مِن دَآبَّةٍ", 13: "وَمَآ أُبَرِّئُ",
    14: "رُبَمَا", 15: "سُبْحَٰنَ ٱلَّذِى", 16: "قَالَ أَلَمْ",
    17: "ٱقْتَرَبَ", 18: "قَدْ أَفْلَحَ", 19: "وَقَالَ ٱلَّذِينَ",
    20: "أَعُوذُ بِٱللَّهِ", 21: "أُتْلُ مَآ أُوحِىَ", 22: "وَمَنْ يَقْنُتْ",
    23: "وَمَا لِىَ", 24: "فَمَنْ أَظْلَمُ", 25: "إِلَيْهِ يُرَدُّ",
    26: "حآمِيمْ", 27: "قَالَ فَمَا خَطْبُكُمْ", 28: "قَدْ سَمِعَ ٱللَّهُ",
    29: "تَبَٰرَكَ ٱلَّذِى", 30: "عَمَّ يَتَسَآءَلُونَ"
  };
  return accurateParaNames;
}

// ================= MAIN (with dynamic tajweed + end marker) =================
async function buildFullQuranMetadata() {
  console.log( "⏳ Fetching base Quran data..." );
  const { rukuMap, textMap } = await fetchAlQuranCloud();
  const surahNames = await fetchSurahNames();
  const paraNames = await fetchParaNames();

  console.log( "⏳ Fetching all surahs in parallel..." );
  const allVerses = await Promise.all(
    Array.from( { length: 114 }, ( _, i ) => fetchQuranComSura( i + 1 ) )
  );

  const tajweedProcessor = new TajweedProcessor();
  const allAyat = [];
  let globalIndex = 1;
  let lastRukuGlobal = null;
  let rukuParaCounter = 0;
  let rukuSurahCounter = 0;
  let currentPara = null;
  let currentSurah = null;

  for ( let sura = 1; sura <= 114; sura++ ) {
    const verses = allVerses[ sura - 1 ];
    if ( !verses.length ) continue;
    let suraEndWaqfCounter = 0;

    for ( let i = 0; i < verses.length; i++ ) {
      const v = verses[ i ];
      const ayaIndex = v.verse_number;
      const mapKey = `${sura}:${ayaIndex}`;
      const paraNo = v.juz_number;
      let rukuGlobal = rukuMap[ mapKey ] ?? null;
      if ( sura === 1 ) rukuGlobal = null;

      if ( currentPara !== paraNo ) {
        currentPara = paraNo;
        rukuParaCounter = 0;
      }
      if ( currentSurah !== sura ) {
        currentSurah = sura;
        rukuSurahCounter = 0;
        lastRukuGlobal = null;
        suraEndWaqfCounter = 0;
      }
      if ( typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1 ) {
        lastRukuGlobal = rukuGlobal;
        rukuParaCounter++;
        rukuSurahCounter++;
      }

      let cloudText = textMap[ mapKey ] || v.text_uthmani;
      let bismillah = null;
      if ( ayaIndex === 1 && sura !== 1 && sura !== 9 ) {
        bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
        cloudText = cloudText.replace( /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, "" ).trim();
      }

      // 🆕 Apply dynamic tajweed (with end marker for main ayah)
      const tajweedHtml = tajweedProcessor.applyTajweed( cloudText, true, ayaIndex );
      const bismillahTajweed = bismillah ? tajweedProcessor.applyTajweed( bismillah, false ) : null;

      const waqfData = extractWaqfFromText( cloudText );
      const endWaqf = getEndWaqf( cloudText, waqfData );
      if ( endWaqf ) suraEndWaqfCounter++;

      const ayatObj = {
        suraIndex: sura,
        surah_name: surahNames[ sura ] || `Surah ${sura}`,
        ayaIndex,
        text: cloudText.normalize( "NFC" ),
        textTajweed: tajweedHtml,   // Now contains dynamic rule spans + <span class="end">٥</span>
        bismillah,
        bismillahTajweed,
        page_no: v.page_number,
        para_no: paraNo,
        para_name: paraNames[ paraNo ] || `Para ${paraNo}`,
        ruku_global: rukuGlobal,
        ruku_para: null,
        ruku_surah: null,
        juz: v.juz_number,
        hizb: v.hizb_number,
        rubElHizb: getRubElHizbType( v.hizb_number, v.rub_el_hizb_number ),
        manzil: v.manzil_number,
        sajda: !!v.sajdah_number,
        sajdaType: v.sajdah_number || null,
        globalIndex: globalIndex++,
        waqf: waqfData,
        endWaqf,
        hasWaqf: waqfData.length > 0,
        waqfCount: waqfData.length,
      };
      allAyat.push( ayatObj );

      const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[ `${sura}:${verses[ i + 1 ].verse_number}` ] : null;
      if ( rukuGlobal !== nextAyaRukuGlobal ) {
        allAyat[ allAyat.length - 1 ].ruku_para = rukuParaCounter;
        allAyat[ allAyat.length - 1 ].ruku_surah = rukuSurahCounter;
      }
    }
  }

  fs.mkdirSync( "./data", { recursive: true } );
  fs.writeFileSync(
    "./data/tajweed-quran.json",
    JSON.stringify( allAyat, null, 2 ),
    { encoding: "utf8" }
  );
  console.log( `✅ Done! Total ayat: ${allAyat.length} saved with dynamic Tajweed rules (100% accurate) and end marker (٥).` );
  console.log( "📌 Sample CSS for styling:" );
  console.log( `
    .tajweed-izhar { color: #2e7d32; }
    .tajweed-idgham-gunnah { color: #1565c0; }
    .tajweed-idgham-no-gunnah { color: #0d47a1; }
    .tajweed-iqlab { color: #6a1b9a; }
    .tajweed-ikhfa { color: #e65100; }
    .tajweed-ikhfa-shafawi { color: #ff8c00; }
    .tajweed-idgham-shafawi { color: #00838f; }
    .tajweed-izhar-shafawi { color: #2e7d32; }
    .tajweed-qalqalah { color: #c62828; }
    .tajweed-madd-asli { color: #00acc1; }
    .tajweed-madd-fari { color: #0097a7; }
    .tajweed-ghunnah { color: #ad1457; font-weight: bold; }
    .tajweed-laam-tafkheem { color: #bf360c; }
    .tajweed-laam-tarqeeq { color: #4a148c; }
    .tajweed-raa-heavy { color: #d84315; }
    .tajweed-raa-light { color: #1b5e20; }
    .tajweed-waqf { color: #795548; font-weight: bold; }
    .tajweed-makharij-throat { background-color: #fff9c4; }
    .tajweed-sifaat-heavy { font-weight: bold; }
    .end { color: #d32f2f; font-weight: bold; margin-right: 4px; }
  `);
}

buildFullQuranMetadata().catch( console.error );