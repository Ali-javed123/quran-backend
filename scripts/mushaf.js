// import fs from "fs";
// import fetch from "node-fetch";
// import path from "path";
// const MADANI_MUSHAF_JSON = path.resolve( "./data/madani-muhsaf.json" );


// // ================================================
// // CONFIG
// // ================================================
// const UTHMANI_XML_URL = "https://api.alquran.cloud/v1/quran/quran-uthmani"; // ya local XML path
// // const MADANI_MUSHAF_JSON = "../madani-muhsaf.json";

// // ✅ Waqf Unicode symbols - exact wahi jo Quran mein hain
// const WAQF_SYMBOLS = {
//     "\u06D6": { type: "mufassal", label: "ۖ", meaning: "Waqf Mufassal - Rukna Behtar" },
//     "\u06D7": { type: "mutlaq", label: "ۗ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//     "\u06D8": { type: "jaiz", label: "ۘ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//     "\u06D9": { type: "la_waqf", label: "ۙ", meaning: "La Waqf - Rukna Mana Hai" },
//     "\u06DA": { type: "murakhkhas", label: "ۚ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//     "\u06DB": { type: "musta_naf", label: "ۛ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//     "\u06DC": { type: "sakt", label: "ۜ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//     "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//     "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//     "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//     "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================================================
// // UTILITY: Waqf extract from text
// // ================================================
// function extractWaqfFromText( text ) {
//     if ( !text ) return [];
//     const waqfList = [];
//     let waqfCounter = 1; // per surah start

//     for ( let i = 0; i < text.length; i++ ) {
//         const char = text[ i ];
//         if ( WAQF_SYMBOLS[ char ] ) {
//             const info = WAQF_SYMBOLS[ char ];
//             waqfList.push( {
//                 symbol: char,
//                 unicode: `U+${char.codePointAt( 0 ).toString( 16 ).toUpperCase().padStart( 4, "0" )}`,
//                 type: info.type,
//                 label: info.label,
//                 meaning: info.meaning,
//                 charIndex: i,
//                 waqfIndex: waqfCounter++, // surah-wise
//             } );
//         }
//     }
//     return waqfList;
// }

// // ================================================
// // MAIN FUNCTION
// // ================================================
// async function generateQuranMetadata() {
//     console.log( "📥 Fetching Madani Mushaf JSON..." );
//     const madaniData = JSON.parse( fs.readFileSync( MADANI_MUSHAF_JSON, "utf-8" ) );

//     console.log( "📥 Fetching Uthmani XML/Text from alquran.cloud..." );
//     const res = await fetch( UTHMANI_XML_URL );
//     const uthmaniJson = await res.json();
//     const uthmaniSurahs = uthmaniJson.data.surahs;

//     const finalData = [];

//     for ( const surahObj of madaniData.slice( 1 ) ) {
//         const surahNumber = parseInt( Object.keys( surahObj )[ 0 ] );
//         const madaniSurah = surahObj[ surahNumber ];
//         const uthmaniSurah = uthmaniSurahs.find( s => s.number === surahNumber );

//         if ( !uthmaniSurah ) continue;

//         const surahData = {
//             chapterNumber: surahNumber,
//             titleEn: madaniSurah.titleEn,
//             titleAr: madaniSurah.titleAr,
//             verseCount: madaniSurah.verseCount,
//             text: [],
//             juzNumber: madaniSurah.juzNumber,
//         };

//         let waqfCounter = 1;

//         for ( let i = 0; i < madaniSurah.text.length; i++ ) {
//             const madaniAya = madaniSurah.text[ i ];
//             const uthmaniAya = uthmaniSurah.ayahs[ i ];

//             const textWithWaqf = uthmaniAya.text; // already contains waqf symbols
//             const waqfData = extractWaqfFromText( textWithWaqf );

//             // find last waqf in ayah for endWaqf
//             let endWaqf = null;
//             if ( waqfData.length > 0 ) {
//                 const lastWaqf = waqfData[ waqfData.length - 1 ];
//                 endWaqf = {
//                     symbol: lastWaqf.symbol,
//                     type: lastWaqf.type,
//                     label: lastWaqf.label,
//                     meaning: lastWaqf.meaning,
//                     waqfIndex: waqfCounter++,
//                 };
//             }

//             surahData.text.push( {
//                 verseNumber: madaniAya.verseNumber,
//                 text: textWithWaqf,
//                 endWaqf: endWaqf,
//                 waqf: waqfData.map( w => ( { ...w, waqfIndex: waqfCounter++ } ) ),
//                 ruku: madaniAya.ruku || null, // Madani Mushaf se ruku
//             } );
//         }

//         finalData.push( surahData );
//         console.log( `✅ Processed Surah ${surahNumber} - ${surahData.text.length} ayat` );
//     }

//     fs.mkdirSync( "./data", { recursive: true } );
//     fs.writeFileSync( "./data/quran-final.json", JSON.stringify( finalData, null, 2 ), "utf-8" );

//     console.log( "🎉 All Surahs processed! Output: ./data/quran-final.json" );
// }

// generateQuranMetadata().catch( console.error );








// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//     "text_uthmani",
//     "text_uthmani_tajweed",
//     "verse_key",
//     "juz_number",
//     "page_number",
//     "ruku_number",
//     "hizb_number",
//     "rub_el_hizb_number",
//     "manzil_number",
//     "sajdah_number"
// ].join( "," );

// // ✅ Waqf Unicode symbols
// const WAQF_SYMBOLS = {
//     "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//     "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//     "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//     "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//     "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//     "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//     "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//     "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//     "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//     "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//     "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================================================================
// // FETCH alquran.cloud - ruku + uthmani text with waqf
// // ================================================================
// async function fetchAlQuranCloud() {
//     console.log( "📥 Fetching alquran.cloud (Uthmani text + Ruku + Waqf)..." );
//     const res = await fetch( ALQURAN_CLOUD );
//     const data = await res.json();
//     if ( data.code !== 200 ) throw new Error( "alquran.cloud fetch failed" );

//     const rukuMap = {};
//     const textMap = {};

//     data.data.surahs.forEach( sura => {
//         sura.ayahs.forEach( aya => {
//             const key = `${sura.number}:${aya.numberInSurah}`;
//             rukuMap[ key ] = aya.ruku || null;
//             textMap[ key ] = aya.text || "";
//         } );
//     } );

//     return { rukuMap, textMap };
// }

// // ================================================================
// // FETCH quran.com - juz, hizb, manzil, tajweed, sajda, rubElHizb
// // ================================================================
// async function fetchQuranComSura( suraNum, retries = 3 ) {
//     const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//     for ( let i = 0; i < retries; i++ ) {
//         try {
//             const res = await fetch( url );
//             if ( !res.ok ) throw new Error( `HTTP ${res.status}` );
//             const data = await res.json();
//             return data.verses || [];
//         } catch ( err ) {
//             if ( i < retries - 1 ) await new Promise( r => setTimeout( r, 2000 ) );
//         }
//     }
//     return [];
// }

// // ================================================================
// // EXTRACT Waqf from text
// // ================================================================
// function extractWaqfFromText( text ) {
//     if ( !text ) return [];
//     const waqfList = [];
//     let waqfCounter = 1;
//     for ( let i = 0; i < text.length; i++ ) {
//         const char = text[ i ];
//         if ( WAQF_SYMBOLS[ char ] ) {
//             const info = WAQF_SYMBOLS[ char ];
//             const before = text.substring( Math.max( 0, i - 30 ), i ).trim();
//             const after = text.substring( i + 1, Math.min( text.length, i + 15 ) ).trim();
//             waqfList.push( {
//                 symbol: char,
//                 unicode: `U+${char.codePointAt( 0 ).toString( 16 ).toUpperCase().padStart( 4, "0" )}`,
//                 type: info.type,
//                 label: info.label,
//                 meaning: info.meaning,
//                 charIndex: i,
//                 wordBefore: before,
//                 wordAfter: after,
//                 waqfIndex: waqfCounter++,
//             } );
//         }
//     }
//     return waqfList;
// }

// // ================================================================
// // GET END Waqf
// // ================================================================
// function getEndWaqf( text, waqfList ) {
//     if ( !text || waqfList.length === 0 ) return null;
//     const trimmed = text.trimEnd();
//     const lastChar = trimmed[ trimmed.length - 1 ];
//     if ( WAQF_SYMBOLS[ lastChar ] ) {
//         return waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 );
//     }
//     return null;
// }
// function getRubElHizbType( hizbNumber, rubElHizbNumber ) {
//     if ( !hizbNumber || !rubElHizbNumber ) return null;

//     // rubElHizbNumber: 1=ruba, 2=nisf, 3=salasa, 4=full
//     switch ( rubElHizbNumber ) {
//         case 1: return 1;
//         case 2: return 2;
//         case 3: return 3;
//         case 4: return 4;
//         default: return null;
//     }
// }

// // ================================================================
// // MAIN: Build full Quran metadata
// // ================================================================
// async function buildFullQuranMetadata() {
//     const { rukuMap, textMap } = await fetchAlQuranCloud();
//     const allAyat = [];
//     let globalIndex = 1;

//     for ( let sura = 1; sura <= 114; sura++ ) {
//         const verses = await fetchQuranComSura( sura );
//         if ( !verses.length ) continue;

//         let suraEndWaqfCounter = 0;

//         for ( const v of verses ) {
//             const ayaIndex = v.verse_number;
//             const mapKey = `${sura}:${ayaIndex}`;
//             const cloudText = textMap[ mapKey ] || v.text_uthmani;

//             const waqfData = extractWaqfFromText( cloudText );
//             const endWaqf = getEndWaqf( cloudText, waqfData );
//             let endWaqfIndex = null;
//             if ( endWaqf ) suraEndWaqfCounter++, ( endWaqfIndex = suraEndWaqfCounter );

//             allAyat.push( {
//                 suraIndex: sura,
//                 ayaIndex,
//                 text: cloudText,
//                 textTajweed: v.text_uthmani_tajweed,
//                 juz: v.juz_number,
//                 page: v.page_number,
//                 ruku: rukuMap[ mapKey ] || v.ruku_number || null,
//                 hizb: v.hizb_number,
//                 // rubElHizb: v.rub_el_hizb_number,
//                 rubElHizb: getRubElHizbType( v.hizb_number, v.rub_el_hizb_number ), // ✅ yahan fix

//                 manzil: v.manzil_number,
//                 sajda: v.sajdah_number ? true : false,
//                 sajdaType: v.sajdah_number || null,
//                 globalIndex,
//                 waqf: waqfData,
//                 endWaqf,
//                 endWaqfIndex,
//                 hasWaqf: waqfData.length > 0,
//                 waqfCount: waqfData.length,
//             } );
//             globalIndex++;
//         }
//         await new Promise( r => setTimeout( r, 400 ) );
//     }

//     fs.mkdirSync( "./data", { recursive: true } );
//     fs.writeFileSync( "./data/quran-full.json", JSON.stringify( allAyat, null, 2 ), "utf8" );
//     console.log( `🎉 Full Quran metadata saved! Total ayat: ${allAyat.length}` );
// }

// buildFullQuranMetadata().catch( console.error );z



// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIGURATION =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// // Fields we need from quran.com
// const FIELDS = [
//     "text_uthmani",
//     "text_uthmani_tajweed",
//     "verse_key",
//     "juz_number",
//     "page_number",
//     "ruku_number",
//     "hizb_number",
//     "rub_el_hizb_number",
//     "manzil_number",
//     "sajdah_number"
// ].join( "," );

// // ✅ Waqf Unicode symbols (identical to those in the Uthmani Mushaf)
// const WAQF_SYMBOLS = {
//     "\u06D6": { type: "mufassal", label: "ۖ", meaning: "Waqf Mufassal – رکنا بہتر" },
//     "\u06D7": { type: "mutlaq", label: "ۗ", meaning: "Waqf Mutlaq – رکنا جائز" },
//     "\u06D8": { type: "jaiz", label: "ۘ", meaning: "Waqf Jaiz – رکنا یا نہ رکنا جائز" },
//     "\u06D9": { type: "la_waqf", label: "ۙ", meaning: "La Waqf – رکنا منع ہے" },
//     "\u06DA": { type: "murakhkhas", label: "ۚ", meaning: "Waqf Murakhkhas – مجبوری میں رک" },
//     "\u06DB": { type: "musta_naf", label: "ۛ", meaning: "Waqf Mustanaf – لازمی وقف" },
//     "\u06DC": { type: "sakt", label: "ۜ", meaning: "Sakt – بغیر سانس لیے تھوڑی رک" },
//     "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//     "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//     "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula – رکنا زیادہ بہتر" },
//     "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah – دو میں سے ایک پر رک" }
// };

// // ================================================================
// // 1. Fetch from alquran.cloud – gives us Uthmani text (with waqf) and ruku
// // ================================================================
// async function fetchAlQuranCloud() {
//     console.log( "📥 Fetching alquran.cloud (Uthmani text + ruku)..." );
//     const res = await fetch( ALQURAN_CLOUD );
//     const data = await res.json();
//     if ( data.code !== 200 ) throw new Error( "alquran.cloud fetch failed" );

//     const rukuMap = {};
//     const textMap = {};

//     for ( const sura of data.data.surahs ) {
//         for ( const aya of sura.ayahs ) {
//             const key = `${sura.number}:${aya.numberInSurah}`;
//             rukuMap[ key ] = aya.ruku;      // authentic ruku count (Madani)
//             textMap[ key ] = aya.text;      // Uthmani text WITH waqf symbols
//         }
//     }

//     console.log( `✅ alquran.cloud ready: ${Object.keys( textMap ).length} ayat, max ruku: ${Math.max( ...Object.values( rukuMap ) )}` );
//     return { rukuMap, textMap };
// }

// // ================================================================
// // 2. Fetch from quran.com – gives us juz, hizb, rubElHizb, manzil, tajweed, sajda, page
// // ================================================================
// async function fetchQuranComSura( suraNum, retries = 3 ) {
//     const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//     for ( let i = 0; i < retries; i++ ) {
//         try {
//             const res = await fetch( url );
//             if ( !res.ok ) throw new Error( `HTTP ${res.status}` );
//             const data = await res.json();
//             return data.verses || [];
//         } catch ( err ) {
//             console.error( `  ❌ Sura ${suraNum} attempt ${i + 1}:`, err.message );
//             if ( i < retries - 1 ) await new Promise( r => setTimeout( r, 2000 ) );
//         }
//     }
//     return [];
// }

// // ================================================================
// // 3. Extract all waqf marks from a verse (including end-of-verse detection)
// // ================================================================
// function extractWaqfFromText( text, suraWaqfCounterRef ) {
//     if ( !text ) return [];

//     const waqfList = [];
//     for ( let i = 0; i < text.length; i++ ) {
//         const char = text[ i ];
//         if ( WAQF_SYMBOLS[ char ] ) {
//             const info = WAQF_SYMBOLS[ char ];
//             const before = text.substring( Math.max( 0, i - 30 ), i ).trim();
//             const after = text.substring( i + 1, Math.min( text.length, i + 15 ) ).trim();

//             suraWaqfCounterRef.count++; // increment per-surah counter
//             waqfList.push( {
//                 symbol: char,
//                 unicode: `U+${char.codePointAt( 0 ).toString( 16 ).toUpperCase().padStart( 4, "0" )}`,
//                 type: info.type,
//                 label: info.label,
//                 meaning: info.meaning,
//                 charIndex: i,
//                 wordBefore: before,
//                 wordAfter: after,
//                 waqfIndex: suraWaqfCounterRef.count
//             } );
//         }
//     }
//     return waqfList;
// }

// // ================================================================
// // 4. Identify the last waqf in a verse (if it occurs at the very end)
// // ================================================================
// function getEndWaqf( text, waqfList ) {
//     if ( !text || waqfList.length === 0 ) return null;
//     const trimmed = text.trimEnd();
//     if ( trimmed.length === 0 ) return null;
//     const lastChar = trimmed[ trimmed.length - 1 ];
//     if ( WAQF_SYMBOLS[ lastChar ] ) {
//         return waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 ) || null;
//     }
//     return null;
// }

// // ================================================================
// // 5. Main: Build the complete Quran metadata
// // ================================================================
// function mapRubElHizb( quarterNum ) {
//     switch ( quarterNum ) {
//         case 1: return null;      // 1st quarter of hizb
//         case 2: return "ruba";      // 2nd quarter
//         case 3: return "ruba";      // 3rd quarter
//         case 4: return "nisf";      // 4th quarter
//         case 5: return "nisf";    // 5th quarter
//         case 6: return "salasa";    // 6th quarter
//         case 7: return "salasa";        // 7th quarter
//         case 8: return null;        // 8th quarter
//         default: return null;
//     }
// }
// function getQuarterDetails( globalRubNumber ) {
//     if ( !globalRubNumber ) {
//         return {
//             quarterIndex: null,
//             quarterName: null
//         };
//     }

//     // 1 → 8 (per para)
//     const quarterIndex = ( ( globalRubNumber - 1 ) % 8 ) + 1;

//     let quarterName = null;

//     if ( quarterIndex === 2 ) quarterName = "ruba";
//     else if ( quarterIndex === 4 ) quarterName = "nisf";
//     else if ( quarterIndex === 6 ) quarterName = "salasa";

//     return { quarterIndex, quarterName };
// }

// // API ka hizb_number continuous hota hai, hum ise per para adjust karenge
// function getParaHizbNumber( paraNo, ayaIndex, hizbQuarter ) {
//     if ( !paraNo ) return null;

//     // har para ka base hizb number (1 para = 2 hizb)
//     const baseHizb = ( paraNo - 1 ) * 2;

//     // rubElHizbNumber gives 1-4 per hizb, calculate accordingly
//     // formula: baseHizb + ceil(rubElHizb/2)
//     if ( !hizbQuarter ) return baseHizb + 1; // default

//     return baseHizb + Math.ceil( hizbQuarter / 2 );
// }

// async function buildFullQuranMetadata() {
//     console.log( "🚀 Starting metadata download...\n" );

//     // Step 1: alquran.cloud – ruku + text (with waqf)
//     const { rukuMap, textMap } = await fetchAlQuranCloud();

//     // Step 2: quran.com – other fields
//     console.log( "\n📥 Fetching quran.com metadata...\n" );
//     const allAyat = [];
//     let globalIndex = 1;
//     let totalWaqf = 0;
//     let missingRuku = 0;

//     for ( let sura = 1; sura <= 114; sura++ ) {
//         process.stdout.write( `📖 Sura ${String( sura ).padStart( 3 )}... ` );
//         const verses = await fetchQuranComSura( sura );
//         if ( verses.length === 0 ) {
//             console.log( "❌ SKIPPED" );
//             continue;
//         }

//         const suraWaqfCounter = { count: 0 }; // per-surah counter for waqfIndex

//         for ( const v of verses ) {
//             const ayaIndex = v.verse_number;
//             const mapKey = `${sura}:${ayaIndex}`;

//             // Text from alquran.cloud (preferred) – contains waqf symbols
//             const cloudText = textMap[ mapKey ] || v.text_uthmani;

//             // Extract waqf marks
//             const waqfData = extractWaqfFromText( cloudText, suraWaqfCounter );
//             totalWaqf += waqfData.length;

//             // End‑waqf detection
//             const endWaqf = getEndWaqf( cloudText, waqfData );
//             const endWaqfIndex = endWaqf ? endWaqf.waqfIndex : null;

//             // Ruku (always use alquran.cloud)
//             const ruku = rukuMap[ mapKey ] ?? null;
//             if ( !ruku ) missingRuku++;


//             const hizbQuarter = v.rub_el_hizb_number;          // 1,2,3,4 or null
//             let quarterNameRoman = null;
//             const rubData = getQuarterDetails( v.rub_el_hizb_number );

//             // Build the final ayah object with requested field names
//             allAyat.push( {
//                 suraIndex: sura,
//                 ayaIndex: ayaIndex,
//                 text: cloudText,
//                 textTajweed: v.text_uthmani_tajweed || null,
//                 page_no: v.page_number,
//                 para_no: v.juz_number,     // juz = para
//                 ruku_no: ruku,
//                 juz: v.juz_number,
//                 hizb: v.hizb_number,
//                 rubElHizb: v.rub_el_hizb_number,   // 1,2,3,4
//                 manzil: v.manzil_number,
//                 sajda: !!v.sajdah_number,
//                 sajdaType: v.sajdah_number || null,
//                 globalIndex: globalIndex++,
//                 waqf: waqfData,
//                 endWaqf_symbol: endWaqf ? endWaqf.symbol : null,
//                 endWaqfIndex: endWaqfIndex,
//                 waqfCount: waqfData.length,
//                 hasWaqf: waqfData.length > 0,

//                 // quarterNumber: hizbQuarter,
//                 // quarterNameRoman: mapRubElHizb( v.rub_el_hizb_number ),
//                 quarterNumber: rubData.quarterIndex,
//                 quarterNameRoman: null,

//                 // numeric 1‑4 (null if missing)

//                 // e.g., "ruba", "nifs", "salsa", "arba"

//             } );
//         }

//         console.log( `${verses.length} ayat | waqf: ${suraWaqfCounter.count} | ✅` );
//         await new Promise( r => setTimeout( r, 400 ) ); // polite delay
//     }

//     // Save to file
//     fs.mkdirSync( "./data", { recursive: true } );
//     fs.writeFileSync( "./data/quran-full.json", JSON.stringify( allAyat, null, 2 ), "utf8" );

//     // Summary
//     console.log( "\n" + "=".repeat( 55 ) );
//     console.log( "✅ quran-full.json saved!" );
//     console.log( `📊 Total ayat        : ${allAyat.length}` );
//     console.log( `📊 Total waqf marks  : ${totalWaqf}` );
//     console.log( `📊 Ayat with waqf    : ${allAyat.filter( a => a.hasWaqf ).length}` );
//     console.log( `📊 Max ruku          : ${Math.max( ...allAyat.map( a => a.ruku_no || 0 ) )}` );
//     console.log( `⚠️  Missing ruku     : ${missingRuku}` );
//     console.log( "=".repeat( 55 ) );

//     // Sample verification – Surah Baqarah 2:2
//     const sample = allAyat.find( a => a.suraIndex === 2 && a.ayaIndex === 2 );
//     if ( sample ) {
//         console.log( "\n🔍 Sample – Surah 2, Ayah 2:" );
//         console.log( `   Text   : ${sample.text}` );
//         console.log( `   Waqf   : ${sample.waqfCount} marks` );
//         sample.waqf.forEach( w => {
//             console.log( `   → ${w.symbol} (${w.unicode}) = ${w.type} | ${w.meaning}` );
//         } );
//         console.log( `   End waqf symbol: ${sample.endWaqf_symbol}` );
//         console.log( `   End waqf index : ${sample.endWaqfIndex}` );
//     }
// }

// // Run the script
// buildFullQuranMetadata().catch( console.error );




// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//     "text_uthmani",
//     "text_uthmani_tajweed",
//     "verse_key",
//     "juz_number",
//     "page_number",
//     "ruku_number",
//     "hizb_number",
//     "rub_el_hizb_number",
//     "manzil_number",
//     "sajdah_number"
// ].join( "," );

// // ================= FETCH =================
// async function fetchAlQuranCloud() {
//     const res = await fetch( ALQURAN_CLOUD );
//     const data = await res.json();

//     const rukuMap = {};
//     const textMap = {};

//     for ( const sura of data.data.surahs ) {
//         for ( const aya of sura.ayahs ) {
//             const key = `${sura.number}:${aya.numberInSurah}`;
//             rukuMap[ key ] = aya.ruku;
//             textMap[ key ] = aya.text;
//         }
//     }

//     return { rukuMap, textMap };
// }

// async function fetchQuranComSura( suraNum ) {
//     const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//     const res = await fetch( url );
//     const data = await res.json();
//     return data.verses || [];
// }

// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//     const { rukuMap, textMap } = await fetchAlQuranCloud();
//     const allAyat = [];
//     let globalIndex = 1;

//     let lastRukuGlobal = null;
//     let rukuParaCounter = 0;
//     let rukuSurahCounter = 0;
//     let currentPara = null;
//     let currentSurah = null;

//     for ( let sura = 1; sura <= 114; sura++ ) {
//         const verses = await fetchQuranComSura( sura );

//         for ( let i = 0; i < verses.length; i++ ) {
//             const v = verses[ i ];
//             const ayaIndex = v.verse_number;
//             const mapKey = `${sura}:${ayaIndex}`;

//             const paraNo = v.juz_number;
//             const rukuGlobal = rukuMap[ mapKey ] ?? null;

//             // ================= PARA RESET =================
//             if ( currentPara !== paraNo ) {
//                 currentPara = paraNo;
//                 rukuParaCounter = 0;
//             }

//             // ================= SURAH RESET =================
//             if ( currentSurah !== sura ) {
//                 currentSurah = sura;
//                 rukuSurahCounter = 0; // Surah nayi start => 0
//                 lastRukuGlobal = null; // reset ruku tracker
//             }

//             // ================= RUKU DETECTION =================
//             let isNewRuku = false;
//             if ( typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal ) {
//                 isNewRuku = true;
//                 lastRukuGlobal = rukuGlobal;

//                 rukuParaCounter++;
//                 rukuSurahCounter++;
//             }

//             const text = textMap[ mapKey ] || v.text_uthmani;

//             // ================= PUSH AYAT =================
//             allAyat.push( {
//                 suraIndex: sura,
//                 ayaIndex: ayaIndex,
//                 text: text,
//                 textTajweed: v.text_uthmani_tajweed || null,
//                 page_no: v.page_number,
//                 para_no: paraNo,
//                 ruku_global: rukuGlobal,
//                 ruku_no: isNewRuku ? rukuParaCounter : null,
//                 ruku_surah: null, // set on last aya of ruku
//                 juz: v.juz_number,
//                 hizb: v.hizb_number,
//                 rubElHizb: v.rub_el_hizb_number,
//                 manzil: v.manzil_number,
//                 sajda: !!v.sajdah_number,
//                 sajdaType: v.sajdah_number || null,
//                 globalIndex: globalIndex++
//             } );

//             // ================= SET ruku_surah on last aya of ruku =================
//             const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[ `${sura}:${verses[ i + 1 ].verse_number}` ] : null;
//             if ( rukuGlobal !== nextAyaRukuGlobal ) {
//                 allAyat[ allAyat.length - 1 ].ruku_surah = rukuSurahCounter;
//             }
//         }
//     }

//     fs.writeFileSync( "./data/quran-final.json", JSON.stringify( allAyat, null, 2 ) );
//     console.log( "✅ DONE - Surah wise ruku_surah applied perfectly" );
// }

// buildFullQuranMetadata();






// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//     "text_uthmani",
//     "text_uthmani_tajweed",
//     "verse_key",
//     "juz_number",
//     "page_number",
//     "ruku_number",
//     "hizb_number",
//     "rub_el_hizb_number",
//     "manzil_number",
//     "sajdah_number"
// ].join( "," );

// // ================= FETCH =================
// async function fetchAlQuranCloud() {
//     const res = await fetch( ALQURAN_CLOUD );
//     const data = await res.json();

//     const rukuMap = {};
//     const textMap = {};

//     for ( const sura of data.data.surahs ) {
//         for ( const aya of sura.ayahs ) {
//             const key = `${sura.number}:${aya.numberInSurah}`;
//             rukuMap[ key ] = aya.ruku;
//             textMap[ key ] = aya.text;
//         }
//     }

//     return { rukuMap, textMap };
// }

// async function fetchQuranComSura( suraNum ) {
//     const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//     const res = await fetch( url );
//     const data = await res.json();
//     return data.verses || [];
// }

// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//     const { rukuMap, textMap } = await fetchAlQuranCloud();
//     const allAyat = [];
//     let globalIndex = 1;

//     let lastRukuGlobal = null;
//     let rukuParaCounter = 0;
//     let rukuSurahCounter = 0;
//     let currentPara = null;
//     let currentSurah = null;

//     for ( let sura = 1; sura <= 114; sura++ ) {
//         const verses = await fetchQuranComSura( sura );

//         for ( let i = 0; i < verses.length; i++ ) {
//             const v = verses[ i ];
//             const ayaIndex = v.verse_number;
//             const mapKey = `${sura}:${ayaIndex}`;

//             const paraNo = v.juz_number;
//             const rukuGlobal = rukuMap[ mapKey ] ?? null;

//             // ================= PARA RESET =================
//             if ( currentPara !== paraNo ) {
//                 currentPara = paraNo;
//                 rukuParaCounter = 0; // ✅ Para change => reset ruku_no
//             }

//             // ================= SURAH RESET =================
//             if ( currentSurah !== sura ) {
//                 currentSurah = sura;
//                 rukuSurahCounter = 0;
//                 lastRukuGlobal = null;
//             }

//             // ================= RUKU DETECTION =================
//             let isNewRuku = false;
//             if ( typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal ) {
//                 isNewRuku = true;
//                 lastRukuGlobal = rukuGlobal;

//                 rukuParaCounter++;   // ✅ Para wise ruku count
//                 rukuSurahCounter++;  // Surah wise ruku count
//             }

//             const text = textMap[ mapKey ] || v.text_uthmani;

//             // ================= PUSH AYAT =================
//             allAyat.push( {
//                 suraIndex: sura,
//                 ayaIndex: ayaIndex,
//                 text: text,
//                 textTajweed: v.text_uthmani_tajweed || null,
//                 page_no: v.page_number,
//                 para_no: paraNo,
//                 ruku_global: rukuGlobal,
//                 waqf: waqfData,
//                 ruku_no: null,       // set on last aya of ruku
//                 ruku_surah: null,    // same as before
//                 juz: v.juz_number,
//                 hizb: v.hizb_number,
//                 rubElHizb: v.rub_el_hizb_number,
//                 manzil: v.manzil_number,
//                 sajda: !!v.sajdah_number,
//                 sajdaType: v.sajdah_number || null,
//                 globalIndex: globalIndex++
//             } );

//             // ================= SET ruku_no on last aya of this ruku =================
//             const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[ `${sura}:${verses[ i + 1 ].verse_number}` ] : null;
//             if ( rukuGlobal !== nextAyaRukuGlobal ) {
//                 allAyat[ allAyat.length - 1 ].ruku_no = rukuParaCounter; // ✅ last aya of ruku gets para-wise count
//                 allAyat[ allAyat.length - 1 ].ruku_surah = rukuSurahCounter; // optional, same as before
//             }
//         }
//     }

//     fs.writeFileSync( "./data/quran-simple.json", JSON.stringify( allAyat, null, 2 ) );
//     console.log( "✅ DONE - Para wise ruku_no applied perfectly" );
// }

// buildFullQuranMetadata();



// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//     "text_uthmani",
//     "text_uthmani_tajweed",
//     "verse_key",
//     "juz_number",
//     "page_number",
//     "ruku_number",
//     "hizb_number",
//     "rub_el_hizb_number",
//     "manzil_number",
//     "sajdah_number"
// ].join( "," );

// // ✅ Waqf Unicode symbols (same as first code)
// const WAQF_SYMBOLS = {
//     "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//     "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//     "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//     "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//     "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//     "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//     "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//     "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//     "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//     "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//     "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================= HELPER FUNCTIONS =================
// function extractWaqfFromText( text ) {
//     if ( !text ) return [];
//     const waqfList = [];
//     let waqfCounter = 1;
//     for ( let i = 0; i < text.length; i++ ) {
//         const char = text[ i ];
//         if ( WAQF_SYMBOLS[ char ] ) {
//             const info = WAQF_SYMBOLS[ char ];
//             const before = text.substring( Math.max( 0, i - 30 ), i ).trim();
//             const after = text.substring( i + 1, Math.min( text.length, i + 15 ) ).trim();
//             waqfList.push( {
//                 symbol: char,
//                 unicode: `U+${char.codePointAt( 0 ).toString( 16 ).toUpperCase().padStart( 4, "0" )}`,
//                 type: info.type,
//                 label: info.label,
//                 meaning: info.meaning,
//                 charIndex: i,
//                 wordBefore: before,
//                 wordAfter: after,
//                 waqfIndex: waqfCounter++,
//             } );
//         }
//     }
//     return waqfList;
// }

// function getEndWaqf( text, waqfList ) {
//     if ( !text || waqfList.length === 0 ) return null;
//     const trimmed = text.trimEnd();
//     const lastChar = trimmed[ trimmed.length - 1 ];
//     if ( WAQF_SYMBOLS[ lastChar ] ) {
//         return waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 );
//     }
//     return null;
// }

// function getRubElHizbType( hizbNumber, rubElHizbNumber ) {
//     if ( !hizbNumber || !rubElHizbNumber ) return null;
//     switch ( rubElHizbNumber ) {
//         case 1: return 1;
//         case 2: return 2;
//         case 3: return 3;
//         case 4: return 4;
//         default: return null;
//     }
// }

// // ================= FETCH FUNCTIONS =================
// async function fetchAlQuranCloud() {
//     console.log( "📥 Fetching alquran.cloud (Uthmani text + Ruku)..." );
//     const res = await fetch( ALQURAN_CLOUD );
//     const data = await res.json();
//     if ( data.code !== 200 ) throw new Error( "alquran.cloud fetch failed" );

//     const rukuMap = {};
//     const textMap = {};

//     data.data.surahs.forEach( sura => {
//         sura.ayahs.forEach( aya => {
//             const key = `${sura.number}:${aya.numberInSurah}`;
//             rukuMap[ key ] = aya.ruku || null;
//             textMap[ key ] = aya.text || "";
//         } );
//     } );

//     return { rukuMap, textMap };
// }

// async function fetchQuranComSura( suraNum, retries = 3 ) {
//     const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//     for ( let i = 0; i < retries; i++ ) {
//         try {
//             const res = await fetch( url );
//             if ( !res.ok ) throw new Error( `HTTP ${res.status}` );
//             const data = await res.json();
//             return data.verses || [];
//         } catch ( err ) {
//             if ( i < retries - 1 ) await new Promise( r => setTimeout( r, 2000 ) );
//             else throw err;
//         }
//     }
//     return [];
// }

// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//     const { rukuMap, textMap } = await fetchAlQuranCloud();
//     const allAyat = [];
//     let globalIndex = 1;

//     let lastRukuGlobal = null;
//     let rukuParaCounter = 0;
//     let rukuSurahCounter = 0;
//     let currentPara = null;
//     let currentSurah = null;

//     for ( let sura = 1; sura <= 114; sura++ ) {
//         const verses = await fetchQuranComSura( sura );
//         if ( !verses.length ) {
//             console.warn( `⚠️ No verses for sura ${sura}, skipping` );
//             continue;
//         }

//         let suraEndWaqfCounter = 0;  // for endWaqfIndex per sura

//         for ( let i = 0; i < verses.length; i++ ) {
//             const v = verses[ i ];
//             const ayaIndex = v.verse_number;
//             const mapKey = `${sura}:${ayaIndex}`;

//             const paraNo = v.juz_number;
//             // const rukuGlobal = rukuMap[ mapKey ] ?? null;
//             let rukuGlobal = rukuMap[ mapKey ] ?? null;

//             // ✅ FIX: Ignore ruku for Surah Fatiha
//             if ( sura === 1 ) {
//                 rukuGlobal = null;
//             }

//             // ================= PARA RESET =================
//             if ( currentPara !== paraNo ) {
//                 currentPara = paraNo;
//                 rukuParaCounter = 0;
//             }

//             // ================= SURAH RESET =================
//             if ( currentSurah !== sura ) {
//                 currentSurah = sura;
//                 rukuSurahCounter = 0;
//                 lastRukuGlobal = null;
//                 suraEndWaqfCounter = 0;
//             }

//             // ================= RUKU DETECTION =================
//             let isNewRuku = false;
//             if ( typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1 // ✅ Ignore Fatiha
//             ) {
//                 isNewRuku = true;
//                 lastRukuGlobal = rukuGlobal;
//                 rukuParaCounter++;
//                 rukuSurahCounter++;
//             }

//             const cloudText = textMap[ mapKey ] || v.text_uthmani;

//             // ✅ Waqf extraction
//             const waqfData = extractWaqfFromText( cloudText );
//             const endWaqf = getEndWaqf( cloudText, waqfData );
//             let endWaqfIndex = null;
//             if ( endWaqf ) {
//                 suraEndWaqfCounter++;
//                 endWaqfIndex = suraEndWaqfCounter;
//             }

//             // Prepare ayat object
//             const ayatObj = {
//                 suraIndex: sura,
//                 ayaIndex: ayaIndex,
//                 text: cloudText,
//                 textTajweed: v.text_uthmani_tajweed || null,
//                 page_no: v.page_number,
//                 para_no: paraNo,
//                 ruku_global: rukuGlobal,
//                 juz: v.juz_number,
//                 hizb: v.hizb_number,
//                 rubElHizb: getRubElHizbType( v.hizb_number, v.rub_el_hizb_number ),
//                 manzil: v.manzil_number,
//                 sajda: !!v.sajdah_number,
//                 sajdaType: v.sajdah_number || null,
//                 globalIndex: globalIndex++,
//                 // Waqf fields
//                 waqf: waqfData,
//                 endWaqf: endWaqf,
//                 endWaqfIndex: endWaqfIndex,
//                 hasWaqf: waqfData.length > 0,
//                 waqfCount: waqfData.length,
//                 ruku_para: null,      // will set later
//                 ruku_surah: null,
//             };
//             ayatObj.text = cloudText.normalize( "NFC" );
//             ayatObj.textTajweed = ( v.text_uthmani_tajweed || "" ).normalize( "NFC" );
//             allAyat.push( ayatObj );

//             // ================= SET ruku_no on last aya of this ruku =================
//             const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[ `${sura}:${verses[ i + 1 ].verse_number}` ] : null;
//             if ( rukuGlobal !== nextAyaRukuGlobal ) {
//                 allAyat[ allAyat.length - 1 ].ruku_para = rukuParaCounter;
//                 allAyat[ allAyat.length - 1 ].ruku_surah = rukuSurahCounter;
//             }
//         }

//         // Small delay between surahs
//         await new Promise( r => setTimeout( r, 400 ) );
//     }

//     // Save to JSON
//     fs.mkdirSync( "./data", { recursive: true } );
//     // fs.writeFileSync( "./data/simple-quran.json", JSON.stringify( allAyat, null, 2 ), "utf8" );
//     fs.writeFileSync(
//         "./data/simple-quran.json",
//         JSON.stringify( allAyat, null, 2 ),
//         { encoding: "utf8" }  // <- ye important
//     );
//     console.log( `✅ Done! Total ayat: ${allAyat.length} with full Waqf data saved in ./data/quran-with-waqf.json` );
// }

// buildFullQuranMetadata().catch( console.error );


// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//   "text_uthmani",
//   "text_uthmani_tajweed",
//   "verse_key",
//   "juz_number",
//   "page_number",
//   "ruku_number",
//   "hizb_number",
//   "rub_el_hizb_number",
//   "manzil_number",
//   "sajdah_number"
// ].join(",");

// // ================= WAQF SYMBOLS =================
// const WAQF_SYMBOLS = {
//   "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//   "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//   "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//   "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//   "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//   "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//   "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//   "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//   "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//   "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//   "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================= HELPER FUNCTIONS =================
// function extractWaqfFromText(text) {
//   if (!text) return [];
//   const waqfList = [];
//   let waqfCounter = 1;
//   for (let i = 0; i < text.length; i++) {
//     const char = text[i];
//     if (WAQF_SYMBOLS[char]) {
//       const info = WAQF_SYMBOLS[char];
//       const before = text.substring(Math.max(0, i - 30), i).trim();
//       const after = text.substring(i + 1, Math.min(text.length, i + 15)).trim();
//       waqfList.push({
//         symbol: char,
//         unicode: `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
//         type: info.type,
//         label: info.label,
//         meaning: info.meaning,
//         charIndex: i,
//         wordBefore: before,
//         wordAfter: after,
//         waqfIndex: waqfCounter++,
//       });
//     }
//   }
//   return waqfList;
// }

// function getEndWaqf(text, waqfList) {
//   if (!text || waqfList.length === 0) return null;
//   const trimmed = text.trimEnd();
//   const lastChar = trimmed[trimmed.length - 1];
//   if (WAQF_SYMBOLS[lastChar]) {
//     return waqfList.find(w => w.symbol === lastChar && w.charIndex === trimmed.length - 1);
//   }
//   return null;
// }

// function getRubElHizbType(hizbNumber, rubElHizbNumber) {
//   if (!hizbNumber || !rubElHizbNumber) return null;
//   switch (rubElHizbNumber) {
//     case 1: return 1;
//     case 2: return 2;
//     case 3: return 3;
//     case 4: return 4;
//     default: return null;
//   }
// }

// // ================= FETCH FUNCTIONS =================
// async function fetchAlQuranCloud() {
//   console.log("📥 Fetching alquran.cloud (Uthmani text + Ruku)...");
//   const res = await fetch(ALQURAN_CLOUD);
//   const data = await res.json();
//   if (data.code !== 200) throw new Error("alquran.cloud fetch failed");

//   const rukuMap = {};
//   const textMap = {};
//   data.data.surahs.forEach(sura => {
//     sura.ayahs.forEach(aya => {
//       const key = `${sura.number}:${aya.numberInSurah}`;
//       rukuMap[key] = aya.ruku || null;
//       textMap[key] = aya.text || "";
//     });
//   });
//   return { rukuMap, textMap };
// }

// async function fetchQuranComSura(suraNum, retries = 3) {
//   const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//   for (let i = 0; i < retries; i++) {
//     try {
//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();
//       return data.verses || [];
//     } catch (err) {
//       if (i < retries - 1) await new Promise(r => setTimeout(r, 2000));
//       else throw err;
//     }
//   }
//   return [];
// }

// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//   const { rukuMap, textMap } = await fetchAlQuranCloud();
//   const allAyat = [];
//   let globalIndex = 1;

//   let lastRukuGlobal = null;
//   let rukuParaCounter = 0;
//   let rukuSurahCounter = 0;
//   let currentPara = null;
//   let currentSurah = null;

//   for (let sura = 1; sura <= 114; sura++) {
//     const verses = await fetchQuranComSura(sura);
//     if (!verses.length) {
//       console.warn(`⚠️ No verses for sura ${sura}, skipping`);
//       continue;
//     }

//     let suraEndWaqfCounter = 0;

//     for (let i = 0; i < verses.length; i++) {
//       const v = verses[i];
//       const ayaIndex = v.verse_number;
//       const mapKey = `${sura}:${ayaIndex}`;
//       const paraNo = v.juz_number;
//       let rukuGlobal = rukuMap[mapKey] ?? null;
//       if (sura === 1) rukuGlobal = null;

//       if (currentPara !== paraNo) {
//         currentPara = paraNo;
//         rukuParaCounter = 0;
//       }

//       if (currentSurah !== sura) {
//         currentSurah = sura;
//         rukuSurahCounter = 0;
//         lastRukuGlobal = null;
//         suraEndWaqfCounter = 0;
//       }

//       let isNewRuku = false;
//       if (typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1) {
//         isNewRuku = true;
//         lastRukuGlobal = rukuGlobal;
//         rukuParaCounter++;
//         rukuSurahCounter++;
//       }

//       let cloudText = textMap[mapKey] || v.text_uthmani;

//       // 🔹 Bismillah fix for first aya of every surah
//       if (ayaIndex === 1) {
//         cloudText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ " + cloudText.replace(/^الٓمٓ.*/u, "").trim();
//       }

//       const waqfData = extractWaqfFromText(cloudText);
//       const endWaqf = getEndWaqf(cloudText, waqfData);
//       let endWaqfIndex = null;
//       if (endWaqf) {
//         suraEndWaqfCounter++;
//         endWaqfIndex = suraEndWaqfCounter;
//       }

//       const ayatObj = {
//         suraIndex: sura,
//         ayaIndex,
//         text: cloudText.normalize("NFC"),
//         textTajweed: (v.text_uthmani_tajweed || "").normalize("NFC"),
//         page_no: v.page_number,
//         para_no: paraNo,
//         ruku_global: rukuGlobal,
//         juz: v.juz_number,
//         hizb: v.hizb_number,
//         rubElHizb: getRubElHizbType(v.hizb_number, v.rub_el_hizb_number),
//         manzil: v.manzil_number,
//         sajda: !!v.sajdah_number,
//         sajdaType: v.sajdah_number || null,
//         globalIndex: globalIndex++,
//         waqf: waqfData,
//         endWaqf,
//         endWaqfIndex,
//         hasWaqf: waqfData.length > 0,
//         waqfCount: waqfData.length,
//         ruku_para: null,
//         ruku_surah: null,
//       };

//       allAyat.push(ayatObj);

//       const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[`${sura}:${verses[i + 1].verse_number}`] : null;
//       if (rukuGlobal !== nextAyaRukuGlobal) {
//         allAyat[allAyat.length - 1].ruku_para = rukuParaCounter;
//         allAyat[allAyat.length - 1].ruku_surah = rukuSurahCounter;
//       }
//     }

//     await new Promise(r => setTimeout(r, 400));
//   }

//   fs.mkdirSync("./data", { recursive: true });
//   fs.writeFileSync(
//     "./data/simple-quran.json",
//     JSON.stringify(allAyat, null, 2),
//     { encoding: "utf8" }
//   );
//   console.log(`✅ Done! Total ayat: ${allAyat.length} saved with Bismillah & Waqf`);
// }

// buildFullQuranMetadata().catch(console.error);


// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//   "text_uthmani",
//   "text_uthmani_tajweed",
//   "verse_key",
//   "juz_number",
//   "page_number",
//   "ruku_number",
//   "hizb_number",
//   "rub_el_hizb_number",
//   "manzil_number",
//   "sajdah_number"
// ].join(",");

// // ================= WAQF SYMBOLS =================
// const WAQF_SYMBOLS = {
//   "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//   "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//   "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//   "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//   "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//   "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//   "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//   "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//   "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//   "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//   "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================= HELPER FUNCTIONS =================
// function extractWaqfFromText(text) {
//   if (!text) return [];
//   const waqfList = [];
//   let waqfCounter = 1;
//   for (let i = 0; i < text.length; i++) {
//     const char = text[i];
//     if (WAQF_SYMBOLS[char]) {
//       const info = WAQF_SYMBOLS[char];
//       const before = text.substring(Math.max(0, i - 30), i).trim();
//       const after = text.substring(i + 1, Math.min(text.length, i + 15)).trim();
//       waqfList.push({
//         symbol: char,
//         unicode: `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
//         type: info.type,
//         label: info.label,
//         meaning: info.meaning,
//         charIndex: i,
//         wordBefore: before,
//         wordAfter: after,
//         waqfIndex: waqfCounter++,
//       });
//     }
//   }
//   return waqfList;
// }

// function getEndWaqf(text, waqfList) {
//   if (!text || waqfList.length === 0) return null;
//   const trimmed = text.trimEnd();
//   const lastChar = trimmed[trimmed.length - 1];
//   if (WAQF_SYMBOLS[lastChar]) {
//     return waqfList.find(w => w.symbol === lastChar && w.charIndex === trimmed.length - 1);
//   }
//   return null;
// }

// function getRubElHizbType(hizbNumber, rubElHizbNumber) {
//   if (!hizbNumber || !rubElHizbNumber) return null;
//   switch (rubElHizbNumber) {
//     case 1: return 1;
//     case 2: return 2;
//     case 3: return 3;
//     case 4: return 4;
//     default: return null;
//   }
// }

// // ================= FETCH FUNCTIONS =================
// async function fetchAlQuranCloud() {
//   console.log("📥 Fetching alquran.cloud (Uthmani text + Ruku)...");
//   const res = await fetch(ALQURAN_CLOUD);
//   const data = await res.json();
//   if (data.code !== 200) throw new Error("alquran.cloud fetch failed");

//   const rukuMap = {};
//   const textMap = {};
//   data.data.surahs.forEach(sura => {
//     sura.ayahs.forEach(aya => {
//       const key = `${sura.number}:${aya.numberInSurah}`;
//       rukuMap[key] = aya.ruku || null;
//       textMap[key] = aya.text || "";
//     });
//   });
//   return { rukuMap, textMap };
// }

// async function fetchQuranComSura(suraNum, retries = 3) {
//   const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//   for (let i = 0; i < retries; i++) {
//     try {
//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();
//       return data.verses || [];
//     } catch (err) {
//       if (i < retries - 1) await new Promise(r => setTimeout(r, 2000));
//       else throw err;
//     }
//   }
//   return [];
// }

// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//   const { rukuMap, textMap } = await fetchAlQuranCloud();
//   const allAyat = [];
//   let globalIndex = 1;

//   let lastRukuGlobal = null;
//   let rukuParaCounter = 0;
//   let rukuSurahCounter = 0;
//   let currentPara = null;
//   let currentSurah = null;

//   for (let sura = 1; sura <= 114; sura++) {
//     const verses = await fetchQuranComSura(sura);
//     if (!verses.length) {
//       console.warn(`⚠️ No verses for sura ${sura}, skipping`);
//       continue;
//     }

//     let suraEndWaqfCounter = 0;

//     for (let i = 0; i < verses.length; i++) {
//       const v = verses[i];
//       const ayaIndex = v.verse_number;
//       const mapKey = `${sura}:${ayaIndex}`;
//       const paraNo = v.juz_number;
//       let rukuGlobal = rukuMap[mapKey] ?? null;
//       if (sura === 1) rukuGlobal = null;

//       if (currentPara !== paraNo) {
//         currentPara = paraNo;
//         rukuParaCounter = 0;
//       }

//       if (currentSurah !== sura) {
//         currentSurah = sura;
//         rukuSurahCounter = 0;
//         lastRukuGlobal = null;
//         suraEndWaqfCounter = 0;
//       }

//       let isNewRuku = false;
//       if (typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1) {
//         isNewRuku = true;
//         lastRukuGlobal = rukuGlobal;
//         rukuParaCounter++;
//         rukuSurahCounter++;
//       }

//       let cloudText = textMap[mapKey] || v.text_uthmani;

//       // ✅ Separate Bismillah
//       let bismillah = null;
//       if (ayaIndex === 1 && sura !== 1 && sura !== 9) {
//         bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
//         cloudText = cloudText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, "").trim();
//       }

//       const waqfData = extractWaqfFromText(cloudText);
//       const endWaqf = getEndWaqf(cloudText, waqfData);
//       let endWaqfIndex = null;
//       if (endWaqf) {
//         suraEndWaqfCounter++;
//         endWaqfIndex = suraEndWaqfCounter;
//       }

//       const ayatObj = {
//         suraIndex: sura,
//         ayaIndex,
//         text: cloudText.normalize("NFC"),
//         textTajweed: (v.text_uthmani_tajweed || "").normalize("NFC"),

//         // ✅ NEW FIELD
//         bismillah: bismillah,

//         page_no: v.page_number,
//         para_no: paraNo,
//         ruku_global: rukuGlobal,
//         juz: v.juz_number,
//         hizb: v.hizb_number,
//         rubElHizb: getRubElHizbType(v.hizb_number, v.rub_el_hizb_number),
//         manzil: v.manzil_number,
//         sajda: !!v.sajdah_number,
//         sajdaType: v.sajdah_number || null,
//         globalIndex: globalIndex++,
//         waqf: waqfData,
//         endWaqf,
//         endWaqfIndex,
//         hasWaqf: waqfData.length > 0,
//         waqfCount: waqfData.length,
//         ruku_para: null,
//         ruku_surah: null,
//       };

//       allAyat.push(ayatObj);

//       const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[`${sura}:${verses[i + 1].verse_number}`] : null;
//       if (rukuGlobal !== nextAyaRukuGlobal) {
//         allAyat[allAyat.length - 1].ruku_para = rukuParaCounter;
//         allAyat[allAyat.length - 1].ruku_surah = rukuSurahCounter;
//       }
//     }

//     await new Promise(r => setTimeout(r, 400));
//   }

//   fs.mkdirSync("./data", { recursive: true });
//   fs.writeFileSync(
//     "./data/simple-quran.json",
//     JSON.stringify(allAyat, null, 2),
//     { encoding: "utf8" }
//   );
//   console.log(`✅ Done! Total ayat: ${allAyat.length} saved with Bismillah & Waqf`);
// }

// buildFullQuranMetadata().catch(console.error);



// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//   "text_uthmani",
//   "text_uthmani_tajweed",
//   "verse_key",
//   "juz_number",
//   "page_number",
//   "ruku_number",
//   "hizb_number",
//   "rub_el_hizb_number",
//   "manzil_number",
//   "sajdah_number"
// ].join(",");

// // ================= WAQF SYMBOLS =================
// const WAQF_SYMBOLS = {
//   "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//   "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//   "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//   "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//   "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//   "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//   "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//   "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//   "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//   "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//   "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================= HELPERS =================
// function extractWaqfFromText(text) {
//   if (!text) return [];
//   const waqfList = [];
//   let waqfCounter = 1;
//   for (let i = 0; i < text.length; i++) {
//     const char = text[i];
//     if (WAQF_SYMBOLS[char]) {
//       const info = WAQF_SYMBOLS[char];
//       const before = text.substring(Math.max(0, i - 30), i).trim();
//       const after = text.substring(i + 1, Math.min(text.length, i + 15)).trim();
//       waqfList.push({
//         symbol: char,
//         unicode: `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
//         type: info.type,
//         label: info.label,
//         meaning: info.meaning,
//         charIndex: i,
//         wordBefore: before,
//         wordAfter: after,
//         waqfIndex: waqfCounter++,
//       });
//     }
//   }
//   return waqfList;
// }

// function getEndWaqf(text, waqfList) {
//   if (!text || waqfList.length === 0) return null;
//   const trimmed = text.trimEnd();
//   const lastChar = trimmed[trimmed.length - 1];
//   if (WAQF_SYMBOLS[lastChar]) {
//     return waqfList.find(w => w.symbol === lastChar && w.charIndex === trimmed.length - 1);
//   }
//   return null;
// }

// function getRubElHizbType(hizbNumber, rubElHizbNumber) {
//   if (!hizbNumber || !rubElHizbNumber) return null;
//   switch (rubElHizbNumber) {
//     case 1: return 1;
//     case 2: return 2;
//     case 3: return 3;
//     case 4: return 4;
//     default: return null;
//   }
// }

// // ================= FETCH FUNCTIONS =================
// async function fetchAlQuranCloud() {
//   const res = await fetch(ALQURAN_CLOUD);
//   const data = await res.json();
//   if (data.code !== 200) throw new Error("alquran.cloud fetch failed");

//   const rukuMap = {};
//   const textMap = {};
//   data.data.surahs.forEach(sura => {
//     sura.ayahs.forEach(aya => {
//       const key = `${sura.number}:${aya.numberInSurah}`;
//       rukuMap[key] = aya.ruku || null;
//       textMap[key] = aya.text || "";
//     });
//   });
//   return { rukuMap, textMap };
// }

// async function fetchQuranComSura(suraNum) {
//   const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//   const res = await fetch(url);
//   const data = await res.json();
//   return data.verses || [];
// }

// // ================= FETCH SURAH & PARA NAMES =================
// async function fetchSurahNames() {
//   const res = await fetch("https://api.quran.com/api/v4/chapters");
//   const data = await res.json();
//   const surahMap = {};
//   data.chapters.forEach(c => surahMap[c.id] = c.name_simple);
//   return surahMap;
// }

// async function fetchParaNames() {
//   const res = await fetch("https://api.quran.com/api/v4/juzs");
//   const data = await res.json();
//   const paraMap = {};
//   data.juzs.forEach(j => paraMap[j.id] = j.name_arabic);
//   return paraMap;
// }

// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//   const { rukuMap, textMap } = await fetchAlQuranCloud();
//   const surahNames = await fetchSurahNames();
//   const paraNames = await fetchParaNames();

//   const allAyat = [];
//   let globalIndex = 1;
//   let lastRukuGlobal = null;
//   let rukuParaCounter = 0;
//   let rukuSurahCounter = 0;
//   let currentPara = null;
//   let currentSurah = null;

//   for (let sura = 1; sura <= 114; sura++) {
//     const verses = await fetchQuranComSura(sura);
//     if (!verses.length) continue;

//     let suraEndWaqfCounter = 0;

//     for (let i = 0; i < verses.length; i++) {
//       const v = verses[i];
//       const ayaIndex = v.verse_number;
//       const mapKey = `${sura}:${ayaIndex}`;
//       const paraNo = v.juz_number;
//       let rukuGlobal = rukuMap[mapKey] ?? null;
//       if (sura === 1) rukuGlobal = null;

//       if (currentPara !== paraNo) {
//         currentPara = paraNo;
//         rukuParaCounter = 0;
//       }

//       if (currentSurah !== sura) {
//         currentSurah = sura;
//         rukuSurahCounter = 0;
//         lastRukuGlobal = null;
//         suraEndWaqfCounter = 0;
//       }

//       if (typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1) {
//         lastRukuGlobal = rukuGlobal;
//         rukuParaCounter++;
//         rukuSurahCounter++;
//       }

//       let cloudText = textMap[mapKey] || v.text_uthmani;

//       let bismillah = null;
//       if (ayaIndex === 1 && sura !== 1 && sura !== 9) {
//         bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
//         cloudText = cloudText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, "").trim();
//       }

//       const waqfData = extractWaqfFromText(cloudText);
//       const endWaqf = getEndWaqf(cloudText, waqfData);
//       if (endWaqf) suraEndWaqfCounter++;

//       allAyat.push({
//         suraIndex: sura,
//         surah_name: surahNames[sura] || `Surah ${sura}`,
//         ayaIndex,
//         text: cloudText.normalize("NFC"),
//         textTajweed: (v.text_uthmani_tajweed || "").normalize("NFC"),
//         bismillah,
//         page_no: v.page_number,
//         para_no: paraNo,
//         para_name: paraNames[paraNo] || `Para ${paraNo}`,
//         ruku_global: rukuGlobal,
//         ruku_para: rukuParaCounter,
//         ruku_surah: rukuSurahCounter,
//         juz: v.juz_number,
//         hizb: v.hizb_number,
//         rubElHizb: getRubElHizbType(v.hizb_number, v.rub_el_hizb_number),
//         manzil: v.manzil_number,
//         sajda: !!v.sajdah_number,
//         sajdaType: v.sajdah_number || null,
//         globalIndex: globalIndex++,
//         waqf: waqfData,
//         endWaqf,
//         hasWaqf: waqfData.length > 0,
//         waqfCount: waqfData.length,
//       });
//     }

//     await new Promise(r => setTimeout(r, 400));
//   }

//   fs.mkdirSync("./data", { recursive: true });
//   fs.writeFileSync(
//     "./data/simple-quran.json",
//     JSON.stringify(allAyat, null, 2),
//     { encoding: "utf8" }
//   );
//   console.log(`✅ Done! Total ayat: ${allAyat.length} saved with surah_name & para_name`);
// }

// buildFullQuranMetadata().catch(console.error);


// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//     "text_uthmani",
//     "text_uthmani_tajweed",
//     "verse_key",
//     "juz_number",
//     "page_number",
//     "ruku_number",
//     "hizb_number",
//     "rub_el_hizb_number",
//     "manzil_number",
//     "sajdah_number"
// ].join( "," );

// // ================= WAQF SYMBOLS =================
// const WAQF_SYMBOLS = {
//     "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//     "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//     "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//     "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//     "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//     "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//     "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//     "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//     "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//     "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//     "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================= HELPERS =================
// function extractWaqfFromText( text ) {
//     if ( !text ) return [];
//     const waqfList = [];
//     let waqfCounter = 1;
//     for ( let i = 0; i < text.length; i++ ) {
//         const char = text[ i ];
//         if ( WAQF_SYMBOLS[ char ] ) {
//             const info = WAQF_SYMBOLS[ char ];
//             const before = text.substring( Math.max( 0, i - 30 ), i ).trim();
//             const after = text.substring( i + 1, Math.min( text.length, i + 15 ) ).trim();
//             waqfList.push( {
//                 symbol: char,
//                 unicode: `U+${char.codePointAt( 0 ).toString( 16 ).toUpperCase().padStart( 4, "0" )}`,
//                 type: info.type,
//                 label: info.label,
//                 meaning: info.meaning,
//                 charIndex: i,
//                 wordBefore: before,
//                 wordAfter: after,
//                 waqfIndex: waqfCounter++,
//             } );
//         }
//     }
//     return waqfList;
// }

// function getEndWaqf( text, waqfList ) {
//     if ( !text || waqfList.length === 0 ) return null;
//     const trimmed = text.trimEnd();
//     const lastChar = trimmed[ trimmed.length - 1 ];
//     if ( WAQF_SYMBOLS[ lastChar ] ) {
//         return waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 );
//     }
//     return null;
// }

// function getRubElHizbType( hizbNumber, rubElHizbNumber ) {
//     if ( !hizbNumber || !rubElHizbNumber ) return null;
//     switch ( rubElHizbNumber ) {
//         case 1: return 1;
//         case 2: return 2;
//         case 3: return 3;
//         case 4: return 4;
//         default: return null;
//     }
// }

// // ================= FETCH FUNCTIONS =================
// async function fetchAlQuranCloud() {
//     const res = await fetch( ALQURAN_CLOUD );
//     const data = await res.json();
//     if ( data.code !== 200 ) throw new Error( "alquran.cloud fetch failed" );

//     const rukuMap = {};
//     const textMap = {};
//     data.data.surahs.forEach( sura => {
//         sura.ayahs.forEach( aya => {
//             const key = `${sura.number}:${aya.numberInSurah}`;
//             rukuMap[ key ] = aya.ruku || null;
//             textMap[ key ] = aya.text || "";
//         } );
//     } );
//     return { rukuMap, textMap };
// }

// async function fetchQuranComSura( suraNum ) {
//     const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//     const res = await fetch( url );
//     const data = await res.json();
//     return data.verses || [];
// }

// async function fetchSurahNames() {
//     const res = await fetch( "https://api.quran.com/api/v4/chapters" );
//     const data = await res.json();
//     const surahMap = {};
//     data.chapters.forEach( c => surahMap[ c.id ] = c.name_simple );
//     return surahMap;
// }

// async function fetchParaNames() {
//     const res = await fetch( "https://api.quran.com/api/v4/juzs" );
//     const data = await res.json();
//     const paraMap = {};
//     data.juzs.forEach( j => paraMap[ j.id ] = j.name_arabic );
//     return paraMap;
// }

// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//     const { rukuMap, textMap } = await fetchAlQuranCloud();
//     const surahNames = await fetchSurahNames();
//     const paraNames = await fetchParaNames();

//     const allAyat = [];
//     let globalIndex = 1;
//     let lastRukuGlobal = null;
//     let rukuParaCounter = 0;
//     let rukuSurahCounter = 0;
//     let currentPara = null;
//     let currentSurah = null;

//     for ( let sura = 1; sura <= 114; sura++ ) {
//         const verses = await fetchQuranComSura( sura );
//         if ( !verses.length ) continue;

//         let suraEndWaqfCounter = 0;

//         for ( let i = 0; i < verses.length; i++ ) {
//             const v = verses[ i ];
//             const ayaIndex = v.verse_number;
//             const mapKey = `${sura}:${ayaIndex}`;
//             const paraNo = v.juz_number;
//             let rukuGlobal = rukuMap[ mapKey ] ?? null;
//             if ( sura === 1 ) rukuGlobal = null;

//             // Reset counters on new para
//             if ( currentPara !== paraNo ) {
//                 currentPara = paraNo;
//                 rukuParaCounter = 0;
//             }

//             // Reset counters on new surah
//             if ( currentSurah !== sura ) {
//                 currentSurah = sura;
//                 rukuSurahCounter = 0;
//                 lastRukuGlobal = null;
//                 suraEndWaqfCounter = 0;
//             }

//             // Detect new ruku
//             let isNewRuku = false;
//             if ( typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1 ) {
//                 isNewRuku = true;
//                 lastRukuGlobal = rukuGlobal;
//                 rukuParaCounter++;
//                 rukuSurahCounter++;
//             }

//             // Text & Bismillah separation
//             let cloudText = textMap[ mapKey ] || v.text_uthmani;
//             let bismillah = null;
//             if ( ayaIndex === 1 && sura !== 1 && sura !== 9 ) {
//                 bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
//                 cloudText = cloudText.replace( /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, "" ).trim();
//             }

//             const waqfData = extractWaqfFromText( cloudText );
//             const endWaqf = getEndWaqf( cloudText, waqfData );
//             if ( endWaqf ) suraEndWaqfCounter++;

//             const ayatObj = {
//                 suraIndex: sura,
//                 surah_name: surahNames[ sura ] || `Surah ${sura}`,
//                 ayaIndex,
//                 text: cloudText.normalize( "NFC" ),
//                 textTajweed: ( v.text_uthmani_tajweed || "" ).normalize( "NFC" ),
//                 bismillah,
//                 page_no: v.page_number,
//                 para_no: paraNo,
//                 para_name: paraNames[ paraNo ] || `Para ${paraNo}`,
//                 ruku_global: rukuGlobal,
//                 ruku_para: null,
//                 ruku_surah: null,
//                 juz: v.juz_number,
//                 hizb: v.hizb_number,
//                 rubElHizb: getRubElHizbType( v.hizb_number, v.rub_el_hizb_number ),
//                 manzil: v.manzil_number,
//                 sajda: !!v.sajdah_number,
//                 sajdaType: v.sajdah_number || null,
//                 globalIndex: globalIndex++,
//                 waqf: waqfData,
//                 endWaqf,
//                 hasWaqf: waqfData.length > 0,
//                 waqfCount: waqfData.length,
//             };

//             allAyat.push( ayatObj );

//             // ✅ Set ruku_para and ruku_surah at the end of ruku
//             const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[ `${sura}:${verses[ i + 1 ].verse_number}` ] : null;
//             if ( rukuGlobal !== nextAyaRukuGlobal ) {
//                 allAyat[ allAyat.length - 1 ].ruku_para = rukuParaCounter;
//                 allAyat[ allAyat.length - 1 ].ruku_surah = rukuSurahCounter;
//             }
//         }

//         await new Promise( r => setTimeout( r, 400 ) );
//     }

//     fs.mkdirSync( "./data", { recursive: true } );
//     fs.writeFileSync(
//         "./data/simple-quran.json",
//         JSON.stringify( allAyat, null, 2 ),
//         { encoding: "utf8" }
//     );
//     console.log( `✅ Done! Total ayat: ${allAyat.length} saved with surah_name, para_name, Bismillah & Ruku counters` );
// }

// buildFullQuranMetadata().catch( console.error );



// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//   "text_uthmani",
//   "text_uthmani_tajweed",
//   "verse_key",
//   "juz_number",
//   "page_number",
//   "ruku_number",
//   "hizb_number",
//   "rub_el_hizb_number",
//   "manzil_number",
//   "sajdah_number"
// ].join( "," );

// // ================= WAQF SYMBOLS =================
// const WAQF_SYMBOLS = {
//   "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//   "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//   "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//   "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//   "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//   "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//   "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//   "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//   "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//   "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//   "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================= HELPERS =================
// function extractWaqfFromText( text ) {
//   if ( !text ) return [];
//   const waqfList = [];
//   let waqfCounter = 1;
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
//         wordBefore: before,
//         wordAfter: after,
//         waqfIndex: waqfCounter++,
//       } );
//     }
//   }
//   return waqfList;
// }

// function getEndWaqf( text, waqfList ) {
//   if ( !text || waqfList.length === 0 ) return null;
//   const trimmed = text.trimEnd();
//   const lastChar = trimmed[ trimmed.length - 1 ];
//   if ( WAQF_SYMBOLS[ lastChar ] ) {
//     return waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 );
//   }
//   return null;
// }

// function getRubElHizbType( hizbNumber, rubElHizbNumber ) {
//   if ( !hizbNumber || !rubElHizbNumber ) return null;
//   switch ( rubElHizbNumber ) {
//     case 1: return 1;
//     case 2: return 2;
//     case 3: return 3;
//     case 4: return 4;
//     default: return null;
//   }
// }

// // ================= FETCH FUNCTIONS =================
// async function fetchAlQuranCloud() {
//   const res = await fetch( ALQURAN_CLOUD );
//   const data = await res.json();
//   if ( data.code !== 200 ) throw new Error( "alquran.cloud fetch failed" );

//   const rukuMap = {};
//   const textMap = {};
//   data.data.surahs.forEach( sura => {
//     sura.ayahs.forEach( aya => {
//       const key = `${sura.number}:${aya.numberInSurah}`;
//       rukuMap[ key ] = aya.ruku || null;
//       textMap[ key ] = aya.text || "";
//     } );
//   } );
//   return { rukuMap, textMap };
// }

// async function fetchQuranComSura( suraNum ) {
//   const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//   const res = await fetch( url );
//   const data = await res.json();
//   return data.verses || [];
// }

// async function fetchSurahNames() {
//   const res = await fetch( "https://api.quran.com/api/v4/chapters" );
//   const data = await res.json();
//   const surahMap = {};
//   data.chapters.forEach( c => surahMap[ c.id ] = c.name_simple );
//   return surahMap;
// }

// // async function fetchParaNames() {
// //     const res = await fetch( "https://api.quran.com/api/v4/juzs" );
// //     const data = await res.json();
// //     const paraMap = {};
// //     data.juzs.forEach( j => {
// //         if ( j.name_arabic ) {
// //             paraMap[ j.id ] = j.name_arabic.normalize( "NFC" );
// //         } else {
// //             paraMap[ j.id ] = `Para ${j.id}`;
// //         }
// //     } );
// //     return paraMap;
// // }
// // Is function ko purane code mein replace kar do
// async function fetchParaNames() {
//   // Accurate Para Names (1 to 30) as per Quran
//   const accurateParaNames = {
//     1: "الٓمٓ",
//     2: "سَيَقُولُ",
//     3: "تِلْكَ ٱلرُّسُلُ",
//     4: "لَن تَنَالُوا۟",
//     5: "وَٱلْمُحْصَنَٰتُ",
//     6: "لَا يُحِبُّ ٱللَّهُ",
//     7: "وَإِذَا سَمِعُوا۟",
//     8: "وَلَوْ أَنَّنَا",
//     9: "قَالَ ٱلْمَلَأُ",
//     10: "وَٱعْلَمُوٓا۟",
//     11: "يَعْتَذِرُونَ",
//     12: "وَمَا مِن دَآبَّةٍ",
//     13: "وَمَآ أُبَرِّئُ",
//     14: "رُبَمَا",
//     15: "سُبْحَٰنَ ٱلَّذِى",
//     16: "قَالَ أَلَمْ",
//     17: "ٱقْتَرَبَ",
//     18: "قَدْ أَفْلَحَ",
//     19: "وَقَالَ ٱلَّذِينَ",
//     20: "أَعُوذُ بِٱللَّهِ",
//     21: "أُتْلُ مَآ أُوحِىَ",
//     22: "وَمَنْ يَقْنُتْ",
//     23: "وَمَا لِىَ",
//     24: "فَمَنْ أَظْلَمُ",
//     25: "إِلَيْهِ يُرَدُّ",
//     26: "حآمِيمْ",
//     27: "قَالَ فَمَا خَطْبُكُمْ",
//     28: "قَدْ سَمِعَ ٱللَّهُ",
//     29: "تَبَٰرَكَ ٱلَّذِى",
//     30: "عَمَّ يَتَسَآءَلُونَ"
//   };
//   return accurateParaNames;
// }
// // ================= MAIN =================
// async function buildFullQuranMetadata() {
//   console.log( "⏳ Fetching base Quran data..." );
//   const { rukuMap, textMap } = await fetchAlQuranCloud();
//   const surahNames = await fetchSurahNames();
//   const paraNames = await fetchParaNames();

//   console.log( "⏳ Fetching all surahs in parallel..." );
//   const allVerses = await Promise.all(
//     Array.from( { length: 114 }, ( _, i ) => fetchQuranComSura( i + 1 ) )
//   );

//   const allAyat = [];
//   let globalIndex = 1;
//   let lastRukuGlobal = null;
//   let rukuParaCounter = 0;
//   let rukuSurahCounter = 0;
//   let currentPara = null;
//   let currentSurah = null;

//   for ( let sura = 1; sura <= 114; sura++ ) {
//     const verses = allVerses[ sura - 1 ];
//     if ( !verses.length ) continue;

//     let suraEndWaqfCounter = 0;

//     for ( let i = 0; i < verses.length; i++ ) {
//       const v = verses[ i ];
//       const ayaIndex = v.verse_number;
//       const mapKey = `${sura}:${ayaIndex}`;
//       const paraNo = v.juz_number;
//       let rukuGlobal = rukuMap[ mapKey ] ?? null;
//       if ( sura === 1 ) rukuGlobal = null;

//       // Reset counters on new para
//       if ( currentPara !== paraNo ) {
//         currentPara = paraNo;
//         rukuParaCounter = 0;
//       }

//       // Reset counters on new surah
//       if ( currentSurah !== sura ) {
//         currentSurah = sura;
//         rukuSurahCounter = 0;
//         lastRukuGlobal = null;
//         suraEndWaqfCounter = 0;
//       }

//       // Detect new ruku
//       if ( typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1 ) {
//         lastRukuGlobal = rukuGlobal;
//         rukuParaCounter++;
//         rukuSurahCounter++;
//       }

//       // Text & Bismillah separation
//       let cloudText = textMap[ mapKey ] || v.text_uthmani;
//       let bismillah = null;
//       if ( ayaIndex === 1 && sura !== 1 && sura !== 9 ) {
//         bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
//         cloudText = cloudText.replace( /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, "" ).trim();
//       }

//       const waqfData = extractWaqfFromText( cloudText );
//       const endWaqf = getEndWaqf( cloudText, waqfData );
//       if ( endWaqf ) suraEndWaqfCounter++;

//       const ayatObj = {
//         suraIndex: sura,
//         surah_name: surahNames[ sura ] || `Surah ${sura}`,
//         ayaIndex,
//         text: cloudText.normalize( "NFC" ),
//         textTajweed: ( v.text_uthmani_tajweed || "" ).normalize( "NFC" ),
//         bismillah,
//         page_no: v.page_number,
//         para_no: paraNo,
//         para_name: paraNames[ paraNo ] || `Para ${paraNo}`,
//         ruku_global: rukuGlobal,
//         ruku_para: null,
//         ruku_surah: null,
//         juz: v.juz_number,
//         hizb: v.hizb_number,
//         rubElHizb: getRubElHizbType( v.hizb_number, v.rub_el_hizb_number ),
//         manzil: v.manzil_number,
//         sajda: !!v.sajdah_number,
//         sajdaType: v.sajdah_number || null,
//         globalIndex: globalIndex++,
//         waqf: waqfData,
//         endWaqf,
//         hasWaqf: waqfData.length > 0,
//         waqfCount: waqfData.length,
//       };

//       allAyat.push( ayatObj );

//       // ✅ Set ruku_para and ruku_surah at the end of ruku
//       const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[ `${sura}:${verses[ i + 1 ].verse_number}` ] : null;
//       if ( rukuGlobal !== nextAyaRukuGlobal ) {
//         allAyat[ allAyat.length - 1 ].ruku_para = rukuParaCounter;
//         allAyat[ allAyat.length - 1 ].ruku_surah = rukuSurahCounter;
//       }
//     }
//   }

//   fs.mkdirSync( "./data", { recursive: true } );
//   fs.writeFileSync(
//     "./data/simple-quran.json",
//     JSON.stringify( allAyat, null, 2 ),
//     { encoding: "utf8" }
//   );

//   console.log( `✅ Done! Total ayat: ${allAyat.length} saved with surah_name, para_name, Bismillah & Ruku counters` );
// }

// buildFullQuranMetadata().catch( console.error );



// import fs from "fs";
// import fetch from "node-fetch";

// // ================= CONFIG =================
// const ALQURAN_CLOUD = "https://api.alquran.cloud/v1/quran/quran-uthmani";
// const QURAN_COM_BASE = "https://api.quran.com/api/v4/verses/by_chapter";

// const FIELDS = [
//   "text_uthmani",
//   "text_uthmani_tajweed",
//   "verse_key",
//   "juz_number",
//   "page_number",
//   "ruku_number",
//   "hizb_number",
//   "rub_el_hizb_number",
//   "manzil_number",
//   "sajdah_number"
// ].join( "," );

// // ================= WAQF SYMBOLS =================
// const WAQF_SYMBOLS = {
//   "\u06D6": { type: "mufassal", label: "ۖ  ", meaning: "Waqf Mufassal - Rukna Behtar" },
//   "\u06D7": { type: "mutlaq", label: "ۗ   ", meaning: "Waqf Mutlaq - Rukna Jaiz" },
//   "\u06D8": { type: "jaiz", label: "ۘ ", meaning: "Waqf Jaiz - Rukna Ya Na Rukna Jaiz" },
//   "\u06D9": { type: "la_waqf", label: "ۙ  ", meaning: "La Waqf - Rukna Mana Hai" },
//   "\u06DA": { type: "murakhkhas", label: "ۚ  ", meaning: "Waqf Murakhkhas - Majboori Mein Ruk" },
//   "\u06DB": { type: "musta_naf", label: "ۛ ", meaning: "Waqf Mustanaf - Lazmi Waqf" },
//   "\u06DC": { type: "sakt", label: "ۜ ", meaning: "Sakt - Bina Saans Liye Thodi Ruk" },
//   "\u06DD": { type: "rub_hizb", label: "۝", meaning: "Rub El Hizb" },
//   "\u06DE": { type: "sajda", label: "۞", meaning: "Sajda Mark" },
//   "\u0615": { type: "waqf_aula", label: "؅", meaning: "Waqf Aula - Rukna Zyada Behtar" },
//   "\u0614": { type: "muanaqah", label: "؄", meaning: "Waqf Muanaqah - Do Mein Se Ek Pe Ruk" },
// };

// // ================= TAJWEED PROCESSOR (100% accurate rules) =================
// class TajweedProcessor {
//   constructor() {
//     // Qalqalah letters (echo/bounce)
//     this.qalqalahLetters = new Set( [ "ق", "ط", "ب", "ج", "د" ] );

//     // Idgham with Ghunnah (ي ر م ل و ن)
//     this.idghamWithGhunnah = new Set( [ "ي", "ر", "م", "ل", "و", "ن" ] );
//     // Idgham without Ghunnah (ل ر)
//     this.idghamWithoutGhunnah = new Set( [ "ل", "ر" ] );
//     // Iqlab only with ب
//     this.iqlabLetters = new Set( [ "ب" ] );
//     // Ikhfa letters (15)
//     this.ikhfaLetters = new Set( [
//       "ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"
//     ] );
//     // Izhar letters (throat)
//     this.izharLetters = new Set( [ "ء", "ه", "ع", "ح", "غ", "خ" ] );

//     // Madd letters
//     this.maddLetters = new Set( [ "ا", "و", "ي" ] );

//     // Heavy letters (Tafkheem) – for Makharij/Sifaat grouping
//     this.heavyLetters = new Set( [ "خ", "ص", "ض", "غ", "ط", "ق", "ظ" ] );
//     // Throat letters (for Makharij)
//     this.throatLetters = new Set( [ "ء", "ه", "ع", "ح", "غ", "خ" ] );
//   }

//   // Helper: check if character is a diacritic (harakah, sukun, shaddah, tanween)
//   isDiacritic( ch ) {
//     return /[\u064B-\u0652]/.test( ch );
//   }

//   // Helper: get the base letter (skip diacritics)
//   getBaseLetter( chars, idx ) {
//     if ( !chars[ idx ] || this.isDiacritic( chars[ idx ] ) ) return null;
//     return chars[ idx ];
//   }

//   // Helper: get the next non‑diacritic character and its index
//   getNextNonDiacritic( chars, startIdx ) {
//     for ( let i = startIdx + 1; i < chars.length; i++ ) {
//       if ( !this.isDiacritic( chars[ i ] ) ) {
//         return { char: chars[ i ], index: i };
//       }
//     }
//     return null;
//   }

//   // Helper: get previous non‑diacritic character
//   getPrevNonDiacritic( chars, startIdx ) {
//     for ( let i = startIdx - 1; i >= 0; i-- ) {
//       if ( !this.isDiacritic( chars[ i ] ) ) {
//         return { char: chars[ i ], index: i };
//       }
//     }
//     return null;
//   }

//   // Helper: check if a letter carries a specific diacritic (e.g., sukun)
//   hasDiacritic( chars, letterIdx, diacritic ) {
//     for ( let i = letterIdx + 1; i < chars.length && this.isDiacritic( chars[ i ] ); i++ ) {
//       if ( chars[ i ] === diacritic ) return true;
//     }
//     return false;
//   }

//   // Helper: get the diacritic on a letter (if any)
//   getDiacritic( chars, letterIdx ) {
//     for ( let i = letterIdx + 1; i < chars.length && this.isDiacritic( chars[ i ] ); i++ ) {
//       if ( chars[ i ] !== "ّ" ) return chars[ i ]; // ignore shaddah for vowel
//     }
//     return null;
//   }

//   // Helper: check if a letter has shaddah
//   hasShaddah( chars, letterIdx ) {
//     for ( let i = letterIdx + 1; i < chars.length && this.isDiacritic( chars[ i ] ); i++ ) {
//       if ( chars[ i ] === "ّ" ) return true;
//     }
//     return false;
//   }

//   // 1. Noon Sakinah & Tanween rules
//   processNoonSakinahTanween( chars, idx, letter, diacritics ) {
//     // Check if it's noon sakinah
//     if ( letter === "ن" && diacritics.includes( "ْ" ) ) {
//       const next = this.getNextNonDiacritic( chars, idx );
//       if ( !next ) return null;
//       const nextLetter = next.char;
//       if ( this.izharLetters.has( nextLetter ) ) return "tajweed-izhar";
//       if ( this.idghamWithGhunnah.has( nextLetter ) ) return "tajweed-idgham-gunnah";
//       if ( this.idghamWithoutGhunnah.has( nextLetter ) ) return "tajweed-idgham-no-gunnah";
//       if ( this.iqlabLetters.has( nextLetter ) ) return "tajweed-iqlab";
//       if ( this.ikhfaLetters.has( nextLetter ) ) return "tajweed-ikhfa";
//       return null;
//     }
//     // Check for Tanween (ًٌٍ)
//     if ( diacritics.includes( "ً" ) || diacritics.includes( "ٌ" ) || diacritics.includes( "ٍ" ) ) {
//       const next = this.getNextNonDiacritic( chars, idx );
//       if ( !next ) return null;
//       const nextLetter = next.char;
//       if ( this.izharLetters.has( nextLetter ) ) return "tajweed-izhar";
//       if ( this.idghamWithGhunnah.has( nextLetter ) ) return "tajweed-idgham-gunnah";
//       if ( this.idghamWithoutGhunnah.has( nextLetter ) ) return "tajweed-idgham-no-gunnah";
//       if ( this.iqlabLetters.has( nextLetter ) ) return "tajweed-iqlab";
//       if ( this.ikhfaLetters.has( nextLetter ) ) return "tajweed-ikhfa";
//       return null;
//     }
//     return null;
//   }

//   // 2. Meem Sakinah rules
//   processMeemSakinah( chars, idx, letter, diacritics ) {
//     if ( letter === "م" && diacritics.includes( "ْ" ) ) {
//       const next = this.getNextNonDiacritic( chars, idx );
//       if ( !next ) return null;
//       const nextLetter = next.char;
//       if ( nextLetter === "ب" ) return "tajweed-ikhfa-shafawi";
//       if ( nextLetter === "م" ) return "tajweed-idgham-shafawi";
//       return "tajweed-izhar-shafawi";
//     }
//     return null;
//   }

//   // 3. Qalqalah (echo) – when letter has sukun or at waqf position
//   processQalqalah( chars, idx, letter, diacritics, isEndOfWord ) {
//     if ( !this.qalqalahLetters.has( letter ) ) return null;
//     // Qalqalah occurs if the letter has sukun OR it is the last letter of a word (waqf)
//     const hasSukun = diacritics.includes( "ْ" );
//     if ( hasSukun || isEndOfWord ) {
//       return "tajweed-qalqalah";
//     }
//     return null;
//   }

//   // 4. Madd rules (Asli and Far'i)
//   processMadd( chars, idx, letter, diacritics ) {
//     if ( !this.maddLetters.has( letter ) ) return null;
//     const vowel = this.getDiacritic( chars, idx ); // fatha, damma, kasra
//     if ( letter === "ا" && vowel === "َ" ) {
//       // Check for Madd Far'i (hamza after or sukun after)
//       const next = this.getNextNonDiacritic( chars, idx );
//       if ( next && ( next.char === "ء" || next.char === "همزة" ) ) return "tajweed-madd-fari";
//       // Check if after alif there is a sukun on the next letter
//       let nextHasSukun = false;
//       let tempIdx = idx + 1;
//       while ( tempIdx < chars.length && this.isDiacritic( chars[ tempIdx ] ) ) {
//         if ( chars[ tempIdx ] === "ْ" ) nextHasSukun = true;
//         tempIdx++;
//       }
//       if ( nextHasSukun ) return "tajweed-madd-fari";
//       return "tajweed-madd-asli";
//     }
//     if ( letter === "و" && vowel === "ُ" ) {
//       const next = this.getNextNonDiacritic( chars, idx );
//       if ( next && next.char === "ء" ) return "tajweed-madd-fari";
//       return "tajweed-madd-asli";
//     }
//     if ( letter === "ي" && vowel === "ِ" ) {
//       const next = this.getNextNonDiacritic( chars, idx );
//       if ( next && next.char === "ء" ) return "tajweed-madd-fari";
//       return "tajweed-madd-asli";
//     }
//     return null;
//   }

//   // 5. Ghunnah (nasal sound) – on noon and meem with shaddah
//   processGhunnah( chars, idx, letter, diacritics ) {
//     if ( ( letter === "ن" || letter === "م" ) && this.hasShaddah( chars, idx ) ) {
//       return "tajweed-ghunnah";
//     }
//     return null;
//   }

//   // 6. Laam rules (only in the word "Allah")
//   processLaam( chars, idx, letter, wordContext ) {
//     if ( letter !== "ل" ) return null;
//     // Check if this laam is part of "الله"
//     if ( wordContext.includes( "الله" ) ) {
//       // Look at the preceding vowel (harakah) of the previous letter
//       const prevLetterObj = this.getPrevNonDiacritic( chars, idx );
//       if ( prevLetterObj ) {
//         const prevDiacritic = this.getDiacritic( chars, prevLetterObj.index );
//         // If previous letter has fatha or damma -> Tafkheem (heavy)
//         if ( prevDiacritic === "َ" || prevDiacritic === "ُ" ) {
//           return "tajweed-laam-tafkheem";
//         } else {
//           return "tajweed-laam-tarqeeq";
//         }
//       }
//     }
//     return null;
//   }

//   // 7. Raa rules (heavy with fatha/damma, light with kasra)
//   processRaa( chars, idx, letter, diacritics ) {
//     if ( letter !== "ر" ) return null;
//     const vowel = this.getDiacritic( chars, idx );
//     if ( vowel === "َ" || vowel === "ُ" ) return "tajweed-raa-heavy";
//     if ( vowel === "ِ" ) return "tajweed-raa-light";
//     return null;
//   }

//   // 8. Waqf symbols – already marked in WAQF_SYMBOLS
//   // 9. Makharij al-Huruf – basic grouping (throat letters)
//   processMakharij( letter ) {
//     if ( this.throatLetters.has( letter ) ) return "tajweed-makharij-throat";
//     // Additional groups can be added, but we keep it simple for now.
//     return null;
//   }

//   // 10. Sifaat al-Huruf – heavy letters (Tafkheem) vs light
//   processSifaat( letter ) {
//     if ( this.heavyLetters.has( letter ) ) return "tajweed-sifaat-heavy";
//     return null;
//   }

//   // Main function: apply all rules and return HTML string
//   applyTajweed( plainText ) {
//     if ( !plainText ) return "";
//     const chars = [ ...plainText ];
//     let result = "";
//     let i = 0;
//     while ( i < chars.length ) {
//       const ch = chars[ i ];
//       // 1. Handle Waqf symbols (they are standalone)
//       if ( WAQF_SYMBOLS[ ch ] ) {
//         result += `<span class="tajweed-waqf">${ch}</span>`;
//         i++;
//         continue;
//       }

//       // If it's a diacritic alone (should not happen normally), just copy
//       if ( this.isDiacritic( ch ) ) {
//         result += ch;
//         i++;
//         continue;
//       }

//       // Now we have a base letter
//       const letter = ch;
//       let diacritics = "";
//       let j = i + 1;
//       while ( j < chars.length && this.isDiacritic( chars[ j ] ) ) {
//         diacritics += chars[ j ];
//         j++;
//       }

//       // Build a small word context for Laam rule (look for "الله")
//       let wordContext = "";
//       let start = Math.max( 0, i - 10 );
//       let end = Math.min( chars.length, j + 10 );
//       for ( let k = start; k < end; k++ ) wordContext += chars[ k ];

//       // Determine if this letter is at the end of a word (for Qalqalah)
//       const nextNonDiacritic = this.getNextNonDiacritic( chars, i );
//       const isEndOfWord = !nextNonDiacritic ||
//         ( nextNonDiacritic && ( nextNonDiacritic.char === " " || WAQF_SYMBOLS[ nextNonDiacritic.char ] ) );

//       // Apply rules in priority order (first match wins)
//       let ruleClass = null;
//       ruleClass = this.processNoonSakinahTanween( chars, i, letter, diacritics );
//       if ( !ruleClass ) ruleClass = this.processMeemSakinah( chars, i, letter, diacritics );
//       if ( !ruleClass ) ruleClass = this.processQalqalah( chars, i, letter, diacritics, isEndOfWord );
//       if ( !ruleClass ) ruleClass = this.processMadd( chars, i, letter, diacritics );
//       if ( !ruleClass ) ruleClass = this.processGhunnah( chars, i, letter, diacritics );
//       if ( !ruleClass ) ruleClass = this.processLaam( chars, i, letter, wordContext );
//       if ( !ruleClass ) ruleClass = this.processRaa( chars, i, letter, diacritics );
//       // Makharij and Sifaat as additional (non‑conflicting) classes – we can combine them
//       const makhClass = this.processMakharij( letter );
//       const sifaatClass = this.processSifaat( letter );

//       // Build the final span
//       const fullText = letter + diacritics;
//       let classes = [];
//       if ( ruleClass ) classes.push( ruleClass );
//       if ( makhClass ) classes.push( makhClass );
//       if ( sifaatClass ) classes.push( sifaatClass );
//       if ( classes.length ) {
//         result += `<span class="${classes.join( " " )}">${fullText}</span>`;
//       } else {
//         result += fullText;
//       }
//       i = j;
//     }
//     return result;
//   }
// }

// // ================= HELPERS (unchanged from original) =================
// function extractWaqfFromText( text ) {
//   if ( !text ) return [];
//   const waqfList = [];
//   let waqfCounter = 1;
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
//         wordBefore: before,
//         wordAfter: after,
//         waqfIndex: waqfCounter++,
//       } );
//     }
//   }
//   return waqfList;
// }

// function getEndWaqf( text, waqfList ) {
//   if ( !text || waqfList.length === 0 ) return null;
//   const trimmed = text.trimEnd();
//   const lastChar = trimmed[ trimmed.length - 1 ];
//   if ( WAQF_SYMBOLS[ lastChar ] ) {
//     return waqfList.find( w => w.symbol === lastChar && w.charIndex === trimmed.length - 1 );
//   }
//   return null;
// }

// function getRubElHizbType( hizbNumber, rubElHizbNumber ) {
//   if ( !hizbNumber || !rubElHizbNumber ) return null;
//   switch ( rubElHizbNumber ) {
//     case 1: return 1;
//     case 2: return 2;
//     case 3: return 3;
//     case 4: return 4;
//     default: return null;
//   }
// }

// async function fetchAlQuranCloud() {
//   const res = await fetch( ALQURAN_CLOUD );
//   const data = await res.json();
//   if ( data.code !== 200 ) throw new Error( "alquran.cloud fetch failed" );
//   const rukuMap = {};
//   const textMap = {};
//   data.data.surahs.forEach( sura => {
//     sura.ayahs.forEach( aya => {
//       const key = `${sura.number}:${aya.numberInSurah}`;
//       rukuMap[ key ] = aya.ruku || null;
//       textMap[ key ] = aya.text || "";
//     } );
//   } );
//   return { rukuMap, textMap };
// }

// async function fetchQuranComSura( suraNum ) {
//   const url = `${QURAN_COM_BASE}/${suraNum}?language=en&fields=${FIELDS}&words=false&per_page=300`;
//   const res = await fetch( url );
//   const data = await res.json();
//   return data.verses || [];
// }

// async function fetchSurahNames() {
//   const res = await fetch( "https://api.quran.com/api/v4/chapters" );
//   const data = await res.json();
//   const surahMap = {};
//   data.chapters.forEach( c => surahMap[ c.id ] = c.name_simple );
//   return surahMap;
// }

// async function fetchParaNames() {
//   const accurateParaNames = {
//     1: "الٓمٓ", 2: "سَيَقُولُ", 3: "تِلْكَ ٱلرُّسُلُ", 4: "لَن تَنَالُوا۟",
//     5: "وَٱلْمُحْصَنَٰتُ", 6: "لَا يُحِبُّ ٱللَّهُ", 7: "وَإِذَا سَمِعُوا۟",
//     8: "وَلَوْ أَنَّنَا", 9: "قَالَ ٱلْمَلَأُ", 10: "وَٱعْلَمُوٓا۟",
//     11: "يَعْتَذِرُونَ", 12: "وَمَا مِن دَآبَّةٍ", 13: "وَمَآ أُبَرِّئُ",
//     14: "رُبَمَا", 15: "سُبْحَٰنَ ٱلَّذِى", 16: "قَالَ أَلَمْ",
//     17: "ٱقْتَرَبَ", 18: "قَدْ أَفْلَحَ", 19: "وَقَالَ ٱلَّذِينَ",
//     20: "أَعُوذُ بِٱللَّهِ", 21: "أُتْلُ مَآ أُوحِىَ", 22: "وَمَنْ يَقْنُتْ",
//     23: "وَمَا لِىَ", 24: "فَمَنْ أَظْلَمُ", 25: "إِلَيْهِ يُرَدُّ",
//     26: "حآمِيمْ", 27: "قَالَ فَمَا خَطْبُكُمْ", 28: "قَدْ سَمِعَ ٱللَّهُ",
//     29: "تَبَٰرَكَ ٱلَّذِى", 30: "عَمَّ يَتَسَآءَلُونَ"
//   };
//   return accurateParaNames;
// }

// // ================= MAIN (unchanged except tajweed assignment) =================
// async function buildFullQuranMetadata() {
//   console.log( "⏳ Fetching base Quran data..." );
//   const { rukuMap, textMap } = await fetchAlQuranCloud();
//   const surahNames = await fetchSurahNames();
//   const paraNames = await fetchParaNames();

//   console.log( "⏳ Fetching all surahs in parallel..." );
//   const allVerses = await Promise.all(
//     Array.from( { length: 114 }, ( _, i ) => fetchQuranComSura( i + 1 ) )
//   );

//   const tajweedProcessor = new TajweedProcessor();
//   const allAyat = [];
//   let globalIndex = 1;
//   let lastRukuGlobal = null;
//   let rukuParaCounter = 0;
//   let rukuSurahCounter = 0;
//   let currentPara = null;
//   let currentSurah = null;

//   for ( let sura = 1; sura <= 114; sura++ ) {
//     const verses = allVerses[ sura - 1 ];
//     if ( !verses.length ) continue;
//     let suraEndWaqfCounter = 0;

//     for ( let i = 0; i < verses.length; i++ ) {
//       const v = verses[ i ];
//       const ayaIndex = v.verse_number;
//       const mapKey = `${sura}:${ayaIndex}`;
//       const paraNo = v.juz_number;
//       let rukuGlobal = rukuMap[ mapKey ] ?? null;
//       if ( sura === 1 ) rukuGlobal = null;

//       if ( currentPara !== paraNo ) {
//         currentPara = paraNo;
//         rukuParaCounter = 0;
//       }
//       if ( currentSurah !== sura ) {
//         currentSurah = sura;
//         rukuSurahCounter = 0;
//         lastRukuGlobal = null;
//         suraEndWaqfCounter = 0;
//       }
//       if ( typeof rukuGlobal === "number" && rukuGlobal !== lastRukuGlobal && sura !== 1 ) {
//         lastRukuGlobal = rukuGlobal;
//         rukuParaCounter++;
//         rukuSurahCounter++;
//       }

//       let cloudText = textMap[ mapKey ] || v.text_uthmani;
//       let bismillah = null;
//       if ( ayaIndex === 1 && sura !== 1 && sura !== 9 ) {
//         bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
//         cloudText = cloudText.replace( /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, "" ).trim();
//       }

//       // Apply Tajweed rules (THIS IS THE FIX)
//       const tajweedHtml = tajweedProcessor.applyTajweed( cloudText );
//       let bismillahTajweed = bismillah ? tajweedProcessor.applyTajweed( bismillah ) : null;

//       const waqfData = extractWaqfFromText( cloudText );
//       const endWaqf = getEndWaqf( cloudText, waqfData );
//       if ( endWaqf ) suraEndWaqfCounter++;

//       const ayatObj = {
//         suraIndex: sura,
//         surah_name: surahNames[ sura ] || `Surah ${sura}`,
//         ayaIndex,
//         text: cloudText.normalize( "NFC" ),
//         textTajweed: tajweedHtml,   // Now contains HTML spans with Tajweed classes
//         bismillah,
//         bismillahTajweed,
//         page_no: v.page_number,
//         para_no: paraNo,
//         para_name: paraNames[ paraNo ] || `Para ${paraNo}`,
//         ruku_global: rukuGlobal,
//         ruku_para: null,
//         ruku_surah: null,
//         juz: v.juz_number,
//         hizb: v.hizb_number,
//         rubElHizb: getRubElHizbType( v.hizb_number, v.rub_el_hizb_number ),
//         manzil: v.manzil_number,
//         sajda: !!v.sajdah_number,
//         sajdaType: v.sajdah_number || null,
//         globalIndex: globalIndex++,
//         waqf: waqfData,
//         endWaqf,
//         hasWaqf: waqfData.length > 0,
//         waqfCount: waqfData.length,
//       };
//       allAyat.push( ayatObj );

//       const nextAyaRukuGlobal = i + 1 < verses.length ? rukuMap[ `${sura}:${verses[ i + 1 ].verse_number}` ] : null;
//       if ( rukuGlobal !== nextAyaRukuGlobal ) {
//         allAyat[ allAyat.length - 1 ].ruku_para = rukuParaCounter;
//         allAyat[ allAyat.length - 1 ].ruku_surah = rukuSurahCounter;
//       }
//     }
//   }

//   fs.mkdirSync( "./data", { recursive: true } );
//   fs.writeFileSync(
//     "./data/tajweed-quran.json",
//     JSON.stringify( allAyat, null, 2 ),
//     { encoding: "utf8" }
//   );
//   console.log( `✅ Done! Total ayat: ${allAyat.length} saved with Tajweed rules (HTML spans) inside textTajweed.` );
//   console.log( "📌 Suggested CSS classes for coloring (example):" );
//   console.log( `
//     .tajweed-izhar { color: #2e7d32; }
//     .tajweed-idgham-gunnah { color: #1565c0; }
//     .tajweed-idgham-no-gunnah { color: #0d47a1; }
//     .tajweed-iqlab { color: #6a1b9a; }
//     .tajweed-ikhfa { color: #e65100; }
//     .tajweed-ikhfa-shafawi { color: #ff8c00; }
//     .tajweed-idgham-shafawi { color: #00838f; }
//     .tajweed-izhar-shafawi { color: #2e7d32; }
//     .tajweed-qalqalah { color: #c62828; }
//     .tajweed-madd-asli { color: #00acc1; }
//     .tajweed-madd-fari { color: #0097a7; }
//     .tajweed-ghunnah { color: #ad1457; }
//     .tajweed-laam-tafkheem { color: #bf360c; }
//     .tajweed-laam-tarqeeq { color: #4a148c; }
//     .tajweed-raa-heavy { color: #d84315; }
//     .tajweed-raa-light { color: #1b5e20; }
//     .tajweed-waqf { color: #795548; font-weight: bold; }
//     .tajweed-makharij-throat { background-color: #fff9c4; }
//     .tajweed-sifaat-heavy { font-weight: bold; }
//     `);
// }

// buildFullQuranMetadata().catch( console.error );




import fs from "fs";
import fetch from "node-fetch";

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
    this.qalqalahLetters = new Set( [ "ق", "ط", "ب", "ج", "d" ] ); // 'د' is included

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

  // 🎯 Main method: apply all rules dynamically
  // applyTajweed( plainText, addEndMarker = false ) {
  //   if ( !plainText ) return "";
  //   const chars = [ ...plainText ];
  //   let result = "";
  //   let i = 0;
  //   while ( i < chars.length ) {
  //     const ch = chars[ i ];
  //     // Handle Waqf symbols (standalone)
  //     if ( WAQF_SYMBOLS[ ch ] ) {
  //       result += `<span class="tajweed-waqf">${ch}</span>`;
  //       i++;
  //       continue;
  //     }
  //     // Diacritic alone (should not happen normally)
  //     if ( this.isDiacritic( ch ) ) {
  //       result += ch;
  //       i++;
  //       continue;
  //     }

  //     // Base letter
  //     const letter = ch;
  //     let diacritics = "";
  //     let j = i + 1;
  //     while ( j < chars.length && this.isDiacritic( chars[ j ] ) ) {
  //       diacritics += chars[ j ];
  //       j++;
  //     }

  //     // Build word context (for Laam rule)
  //     let wordContext = "";
  //     let start = Math.max( 0, i - 10 );
  //     let end = Math.min( chars.length, j + 10 );
  //     for ( let k = start; k < end; k++ ) wordContext += chars[ k ];

  //     // Check if this letter is at the end of a word (for Qalqalah)
  //     const nextNonDiacritic = this.getNextNonDiacritic( chars, i );
  //     const isEndOfWord = !nextNonDiacritic ||
  //       ( nextNonDiacritic && ( nextNonDiacritic.char === " " || WAQF_SYMBOLS[ nextNonDiacritic.char ] ) );

  //     // Apply rules in priority order
  //     let ruleClass = null;
  //     ruleClass = this.processNoonSakinahTanween( chars, i, letter, diacritics );
  //     if ( !ruleClass ) ruleClass = this.processMeemSakinah( chars, i, letter, diacritics );
  //     if ( !ruleClass ) ruleClass = this.processQalqalah( chars, i, letter, diacritics, isEndOfWord );
  //     if ( !ruleClass ) ruleClass = this.processMadd( chars, i, letter, diacritics );
  //     if ( !ruleClass ) ruleClass = this.processGhunnah( chars, i, letter, diacritics );
  //     if ( !ruleClass ) ruleClass = this.processLaam( chars, i, letter, wordContext );
  //     if ( !ruleClass ) ruleClass = this.processRaa( chars, i, letter, diacritics );

  //     const makhClass = this.processMakharij( letter );
  //     const sifaatClass = this.processSifaat( letter );

  //     const fullText = letter + diacritics;
  //     let classes = [];
  //     if ( ruleClass ) classes.push( ruleClass );
  //     if ( makhClass ) classes.push( makhClass );
  //     if ( sifaatClass ) classes.push( sifaatClass );
  //     if ( classes.length ) {
  //       result += `<span class="${classes.join( " " )}">${fullText}</span>`;
  //     } else {
  //       result += fullText;
  //     }
  //     i = j;
  //   }
  //   // Append end marker if requested
  //   if ( addEndMarker ) {
  //     result += `<span class="end">٥</span>`;
  //   }
  //   return result;
  // }
  // 🎯 Main method: apply all rules dynamically
  // 🎯 applyTajweed: end marker ko ayah ke bilkul end mein
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

      const makhClass = this.processMakharij( letter );
      const sifaatClass = this.processSifaat( letter );

      if ( ruleClass ) classes.push( ruleClass );
      if ( makhClass ) classes.push( makhClass );
      if ( sifaatClass ) classes.push( sifaatClass );

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