// import fs from "fs";
// import fetch from "node-fetch";

// const BASE_URL = "https://api.quran.com/api/v4/verses/by_chapter";
// // const FIELDS = "text_uthmani,text_uthmani_tajweed,verse_key,juz_number,page_number,ruku_number,hizb_number,rub_el_location,hizb_number,manzil_number,sajdah_number";
// const FIELDS = "text_uthmani,text_uthmani_tajweed,verse_key,juz_number,page_number,ruku_number,hizb_number,rub_el_hizb_number,manzil_number,sajdah_number";

// async function downloadAllMetadata() {
//   let allAyat = [];
//   for ( let sura = 1; sura <= 114; sura++ ) {
//     const url = `${BASE_URL}/${sura}?language=en&fields=${FIELDS}&words=false&translations=null`;
//     console.log( `Fetching Sura ${sura}...` );
//     const res = await fetch( url );
//     const data = await res.json();
//     const verses = data.verses;
//     for ( const v of verses ) {
//       allAyat.push( {
//         suraIndex: sura,
//         ayaIndex: v.verse_number,
//         text: v.text_uthmani,
//         textTajweed: v.text_uthmani_tajweed,
//         juz: v.juz_number,
//         page: v.page_number,
//         ruku: v.ruku_number,
//         hizb: v.hizb_number,
//         rubElHizb: v.rub_el_hizb_number,
//         manzil: v.manzil_number,
//         sajda: v.sajdah_number ? true : false,
//         globalIndex: v.verse_key.split( ":" )[ 1 ] // not perfect, but we'll recalc
//       } );
//     }
//   }
//   // Assign correct global index
//   allAyat.forEach( ( ay, idx ) => { ay.globalIndex = idx + 1; } );
//   fs.writeFileSync( "./data/metadata.json", JSON.stringify( allAyat, null, 2 ) );
//   console.log( "✅ metadata.json saved with", allAyat.length, "ayat" );
// }

// downloadAllMetadata().catch( console.error );





import fs from "fs";
import fetch from "node-fetch";

const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";
const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";

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

// ✅ Waqf Unicode symbols - exact wahi jo Quran mein hain
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

// ================================================================
// SOURCE 1 + 2 COMBINED: alquran.cloud
// Ek hi call mein ruku + waqf text dono milenge
// ================================================================
async function fetchAlQuranCloudData() {
  console.log( "📥 [1/2] Fetching from alquran.cloud (ruku + waqf text)..." );

  // ✅ Sahi URL - quran-uthmani edition mein waqf symbols hote hain
  const res = await fetch( ALQURAN_CLOUD );
  const data = await res.json();

  if ( data.code !== 200 ) {
    throw new Error( `alquran.cloud error: ${data.status}` );
  }

  const rukuMap = {};
  const textMap = {};

  for ( const sura of data.data.surahs ) {
    for ( const aya of sura.ayahs ) {
      const key = `${sura.number}:${aya.numberInSurah}`;

      rukuMap[ key ] = aya.ruku;    // ✅ Accurate ruku (556-558)
      textMap[ key ] = aya.text;    // ✅ Uthmani text WITH waqf symbols
    }
  }

  const maxRuku = Math.max( ...Object.values( rukuMap ) );
  const totalAyat = Object.keys( rukuMap ).length;

  console.log( `✅ alquran.cloud ready: ${totalAyat} ayat, max ruku: ${maxRuku}` );

  // Debug: Ek ayah check karo ke waqf symbols hain ya nahi
  const testKey = "2:2"; // Surah Baqarah 2:2 mein ۛ hona chahiye
  const testText = textMap[ testKey ] || "";
  console.log( `🔍 Test (2:2): "${testText.substring( 0, 50 )}..."` );

  const waqfInTest = [ ...testText ].filter( c => WAQF_SYMBOLS[ c ] );
  console.log( `🔍 Waqf symbols in 2:2: ${waqfInTest.length > 0 ? waqfInTest.join( " " ) : "NONE - text may not have waqf"}` );

  return { rukuMap, textMap };
}

// ================================================================
// SOURCE 3: quran.com - page, juz, hizb, manzil, tajweed
// ================================================================
async function fetchQuranComSura( suraNum, retries = 3 ) {
  const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;

  for ( let i = 0; i < retries; i++ ) {
    try {
      const res = await fetch( url );
      if ( !res.ok ) throw new Error( `HTTP ${res.status}` );
      const data = await res.json();
      return data.verses || [];
    } catch ( err ) {
      console.error( `  ❌ Sura ${suraNum} attempt ${i + 1}:`, err.message );
      if ( i < retries - 1 ) await new Promise( r => setTimeout( r, 2000 ) );
    }
  }
  return [];
}

// ================================================================
// Waqf extract - clean text se char by char scan
// ================================================================
// function extractWaqfFromText( text ) {
//   if ( !text ) return [];

//   const waqfList = [];

//   for ( let i = 0; i < text.length; i++ ) {
//     const char = text[ i ];

//     if ( WAQF_SYMBOLS[ char ] ) {
//       const info = WAQF_SYMBOLS[ char ];
//       const before = text.substring( Math.max( 0, i - 30 ), i ).trim();
//       const after = text.substring( i + 1, Math.min( text.length, i + 15 ) ).trim();

//       waqfList.push( {
//         symbol: char,
//         unicode: `U+${char.codePointAt( 0 ).toString( 16 ).toUpperCase().padStart( 4, "0" )}`,
//         type: info.type,
//         label: info.label,
//         meaning: info.meaning,
//         charIndex: i,
//         before: before,
//         after: after,
//       } );
//     }
//   }

//   return waqfList;
// }
function extractWaqfFromText( text ) {
  if ( !text ) return [];

  const waqfList = [];
  let waqfCounter = 1; // Surah ke andar start

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
        waqfIndex: waqfCounter++ // ✅ New: surah-wise count
      } );
    }
  }

  return waqfList;
}
// ================================================================
// MAIN
// ================================================================
function getEndWaqf( text, waqfList ) {
  if ( !text || waqfList.length === 0 ) return null;

  // Remove trailing whitespace
  const trimmed = text.trimEnd();
  if ( trimmed.length === 0 ) return null;

  const lastChar = trimmed[ trimmed.length - 1 ];
  if ( WAQF_SYMBOLS[ lastChar ] ) {
    // Find the corresponding waqf object in waqfList
    const endWaqfObj = waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 );
    if ( endWaqfObj ) return endWaqfObj;
  }
  return null;
}
async function downloadAllMetadata() {
  console.log( "🚀 Starting metadata download...\n" );

  // Step 1+2: alquran.cloud se ruku + text (waqf ke saath)
  let rukuMap = {};
  let textMap = {};

  try {
    const result = await fetchAlQuranCloudData();
    rukuMap = result.rukuMap;
    textMap = result.textMap;
  } catch ( err ) {
    console.error( "❌ alquran.cloud failed:", err.message );
    console.log( "⚠️  Ruku aur waqf text unavailable. Continuing without..." );
  }

  console.log( "\n📥 [2/2] Fetching quran.com metadata...\n" );

  let allAyat = [];
  let globalIndex = 1;
  let totalWaqf = 0;
  let nullRuku = 0;

  for ( let sura = 1; sura <= 114; sura++ ) {
    process.stdout.write( `📖 Sura ${String( sura ).padStart( 3 )}... ` );

    const verses = await fetchQuranComSura( sura );

    if ( verses.length === 0 ) {
      console.log( "❌ SKIPPED" );
      continue;
    }

    let suraWaqf = 0;
    let suraEndWaqfCounter = 0;   // per surah counter

    for ( const v of verses ) {
      const ayaIndex = v.verse_number;
      const mapKey = `${sura}:${ayaIndex}`;

      // ✅ Text: alquran.cloud se (waqf symbols ke saath)
      const cloudText = textMap[ mapKey ] || "";

      // ✅ Waqf: cloudText se extract
      const waqfData = extractWaqfFromText( cloudText );
      suraWaqf += waqfData.length;



      const endWaqf = getEndWaqf( cloudText, waqfData );
      let endWaqfIndex = null;
      if ( endWaqf ) {
        suraEndWaqfCounter++;
        endWaqfIndex = suraEndWaqfCounter;
      }
      // ✅ Ruku: alquran.cloud se accurate
      const ruku = rukuMap[ mapKey ] || null;
      if ( !ruku ) nullRuku++;

      allAyat.push( {
        suraIndex: sura,
        ayaIndex: ayaIndex,
        text: cloudText || v.text_uthmani,  // cloud prefer, fallback quran.com
        textTajweed: v.text_uthmani_tajweed,
        juz: v.juz_number,
        page: v.page_number,
        ruku: ruku,
        hizb: v.hizb_number,
        rubElHizb: v.rub_el_hizb_number,
        manzil: v.manzil_number,
        sajda: v.sajdah_number ? true : false,
        sajdaType: v.sajdah_number || null,
        globalIndex: globalIndex,
        waqf: waqfData,

        endWaqf: endWaqf,
        endWaqfIndex: endWaqfIndex,

        hasWaqf: waqfData.length > 0,
        waqfCount: waqfData.length,
      } );

      globalIndex++;
    }

    totalWaqf += suraWaqf;
    console.log( `${verses.length} ayat | waqf: ${suraWaqf} | ✅` );

    await new Promise( r => setTimeout( r, 400 ) );
  }

  // Save
  fs.mkdirSync( "./data", { recursive: true } );
  fs.writeFileSync( "./data/metadata2.json", JSON.stringify( allAyat, null, 2 ), "utf8" );

  console.log( "\n" + "=".repeat( 55 ) );
  console.log( "✅ metadata.json saved!" );
  console.log( `📊 Total ayat        : ${allAyat.length}` );
  console.log( `📊 Total waqf marks  : ${totalWaqf}` );
  console.log( `📊 Ayat with waqf    : ${allAyat.filter( a => a.hasWaqf ).length}` );
  console.log( `📊 Max ruku          : ${Math.max( ...allAyat.map( a => a.ruku || 0 ) )}` );
  console.log( `⚠️  Null ruku        : ${nullRuku}` );
  console.log( "=".repeat( 55 ) );

  // ✅ Sample verify - Surah Baqarah 2:2 check
  const sample = allAyat.find( a => a.suraIndex === 2 && a.ayaIndex === 2 );
  if ( sample ) {
    console.log( "\n🔍 Sample - Surah 2, Ayah 2:" );
    console.log( `   Text    : ${sample.text}` );
    console.log( `   Waqf    : ${sample.waqfCount} marks` );
    sample.waqf.forEach( w => {
      console.log( `   → ${w.symbol} (${w.unicode}) = ${w.type} | ${w.meaning}` );
    } );
  }
}

downloadAllMetadata().catch( console.error );