// import fs from "fs";
// import xml2js from "xml2js";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { Quran } from "../models/Quran.js";

// dotenv.config();

// mongoose.connect( process.env.MONGO_URI )
//     .then( () => console.log( "MongoDB Connected" ) )
//     .catch( err => console.log( err ) );

// const parser = new xml2js.Parser();

// fs.readFile( "./data/quran-uthmani.xml", ( err, data ) => {
//     if ( err ) throw err;
//     parser.parseString( data, async ( err, result ) => {
//         if ( err ) throw err;

//         let para = 1;
//         for ( const sura of result.quran.sura ) {
//             let suraIndex = parseInt( sura.$.index );
//             let suraName = sura.$.name;

//             for ( const aya of sura.aya ) {
//                 const ayaIndex = parseInt( aya.$.index );
//                 const text = aya.$.text;
//                 const bismillah = aya.$.bismillah || "";
//                 const sajda = aya.$.sajda === "true" ? true : false;
//                 const ruka = aya.$.ruko ? parseInt( aya.$.ruko ) : null;
//                 const figra = aya.$.figra === "true" ? true : false;
//                 const manzil = aya.$.manzil ? parseInt( aya.$.manzil ) : null;

//                 await Quran.create( {
//                     para,
//                     suraIndex,
//                     suraName,
//                     ayaIndex,
//                     text,
//                     bismillah,
//                     sajda,
//                     ruka,
//                     figra,
//                     manzil
//                 } );
//             }
//             para++;
//         }
//         console.log( "Normal Quran imported successfully!" );
//         mongoose.connection.close();
//     } );
// } );
// import fs from "fs";
// import axios from "axios";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { Quran } from "../models/quran.model.js";

// dotenv.config();

// mongoose.connect( process.env.MONGO_URI )
//     .then( () => console.log( "MongoDB Connected" ) )
//     .catch( err => console.log( err ) );

// const BASE_URL = "https://api.quran.com/api/v4";

// // Fetch all surahs first
// async function fetchSurahs() {
//     const response = await axios.get( `${BASE_URL}/chapters?language=en` );
//     return response.data.chapters;
// }

// // Fetch verses for a given surah with all required fields
// async function fetchVerses( surahNumber ) {
//     const response = await axios.get(
//         `${BASE_URL}/verses/by_chapter/${surahNumber}?language=en&fields=text_uthmani,text_uthmani_tajweed,verse_key,words&words=true&translations=null`
//     );
//     return response.data.verses;
// }

// // Main import function
// async function importQuran() {
//     try {
//         const surahs = await fetchSurahs();
//         console.log( `Found ${surahs.length} surahs` );

//         let totalAyat = 0;

//         for ( const surah of surahs ) {
//             const suraIndex = surah.id;
//             const suraName = surah.name_simple;
//             const suraNameArabic = surah.name_arabic;

//             console.log( `Importing Surah ${suraIndex}: ${suraName}` );

//             const verses = await fetchVerses( suraIndex );
//             const ayats = [];

//             for ( const verse of verses ) {
//                 const ayaIndex = verse.verse_number;
//                 const textUthmani = verse.text_uthmani;
//                 const textUthmaniTajweed = verse.text_uthmani_tajweed;

//                 // Extract divisions from verse_meta (if available)
//                 const verseMeta = verse.verse_meta || {};
//                 const juz = verseMeta.juz_number;
//                 const page = verseMeta.page_number;
//                 const ruku = verseMeta.ruku_number;
//                 const manzil = verseMeta.manzil_number;
//                 const hizb = verseMeta.hizb_number;
//                 const rubElHizb = verseMeta.rub_el_hizb_number;
//                 const sajda = verseMeta.sajdah ? verseMeta.sajdah.required : false;
//                 const bismillah = ( suraIndex === 1 && ayaIndex === 1 ) ? true : false;

//                 // Words (optional)
//                 const words = verse.words.map( w => ( {
//                     word: w.text_uthmani,
//                     position: w.position
//                 } ) );

//                 ayats.push( {
//                     suraIndex,
//                     ayaIndex,
//                     suraName,
//                     suraNameArabic,
//                     textUthmani,
//                     textUthmaniTajweed,
//                     juz,
//                     page,
//                     ruku,
//                     manzil,
//                     hizb,
//                     rubElHizb,
//                     sajda,
//                     bismillah,
//                     words
//                 } );

//                 totalAyat++;
//             }

//             // Bulk insert for this surah
//             await Quran.insertMany( ayats, { ordered: false } );
//             console.log( `  Inserted ${ayats.length} ayats` );
//         }

//         console.log( `✅ Total ${totalAyat} ayats imported successfully!` );
//         mongoose.connection.close();
//     } catch ( error ) {
//         console.error( "Import failed:", error.message );
//         mongoose.connection.close();
//     }
// }

// importQuran();



import fs from "fs";
import xml2js from "xml2js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Quran } from "../models/quran.model.js";

dotenv.config();
mongoose.connect( process.env.MONGO_URI )
    .then( () => console.log( "MongoDB Connected" ) )
    .catch( err => console.log( err ) );

const parser = new xml2js.Parser();

async function importQuran() {
    // 1. Read metadata from API
    const metadata = JSON.parse( fs.readFileSync( "../data/metadata.json", "utf8" ) );
    // 2. Read XML
    const xmlData = fs.readFileSync( "../data/quran-uthmani.xml" );
    const xmlResult = await parser.parseStringPromise( xmlData );

    let allDocs = [];

    for ( const sura of xmlResult.quran.sura ) {
        const suraIndex = parseInt( sura.$.index );
        const suraName = sura.$.name;

        for ( const aya of sura.aya ) {
            const ayaIndex = parseInt( aya.$.index );
            const text = aya.$.text;
            const bismillah = aya.$.bismillah || "";
            const sajdaXml = aya.$.sajda === "true";
            const rukaXml = aya.$.ruko ? parseInt( aya.$.ruko ) : null;
            const figra = aya.$.figra === "true";
            const manzilXml = aya.$.manzil ? parseInt( aya.$.manzil ) : null;

            // Find matching metadata
            const meta = metadata.find( m => m.suraIndex === suraIndex && m.ayaIndex === ayaIndex );
            if ( !meta ) {
                console.warn( `⚠️ Metadata missing for ${suraIndex}:${ayaIndex}` );
                continue;
            }

            // Prepare final document
            const doc = {
                // XML base
                suraIndex,
                suraName,
                ayaIndex,
                text: text,                           // XML ka text (Uthmani)
                bismillah,
                sajda: sajdaXml || meta.sajda,        // prioritize XML? or API? we use OR
                ruka: rukaXml || meta.ruku,           // XML se agar mile to use karo
                figra,
                manzil: manzilXml || meta.manzil,

                // API extra fields
                para: meta.juz,                       // correct juz/para
                page: meta.page,
                hizb: meta.hizb,
                rubElHizb: meta.rubElHizb,
                textTajweed: meta.textTajweed,        // isme wakf signs honge
                globalIndex: meta.globalIndex,

                // Ruba, Nisf, Salasa flags
                ruba: meta.rubElHizb === 1,
                nisf: meta.rubElHizb === 2,
                salasa: meta.rubElHizb === 3,
                ekaf: meta.hizb   // agar "ekaf" ka matlab hizb hai to
            };

            allDocs.push( doc );
        }
    }

    // Bulk insert with upsert (to avoid duplicates if script run multiple times)
    const bulkOps = allDocs.map( doc => ( {
        updateOne: {
            filter: { suraIndex: doc.suraIndex, ayaIndex: doc.ayaIndex },
            update: { $set: doc },
            upsert: true
        }
    } ) );

    await Quran.bulkWrite( bulkOps );
    console.log( `✅ ${allDocs.length} ayat successfully imported/updated.` );
    mongoose.connection.close();
}

importQuran().catch( console.error );