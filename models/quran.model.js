// import mongoose from "mongoose";

// const quranSchema = new mongoose.Schema( {
//     para: Number,
//     suraIndex: Number,
//     suraName: String,
//     ayaIndex: Number,
//     text: String,
//     bismillah: String,
//     sajda: Boolean,
//     ruka: Number,
//     figra: Boolean,
//     manzil: Number
// } );

// export const Quran = mongoose.model( "Quran", quranSchema );
// import mongoose from "mongoose";

// const quranSchema = new mongoose.Schema( {
//     // Basic identification
//     suraIndex: Number,      // Surah number (1-114)
//     ayaIndex: Number,       // Ayah number in surah
//     suraName: String,       // Surah name (e.g., "Al-Fatiha")
//     suraNameArabic: String, // Arabic name

//     // Texts
//     textUthmani: String,          // Plain Uthmani text (without tajweed)
//     textUthmaniTajweed: String,   // Uthmani Tajweed (includes wakf marks)

//     // Quranic divisions
//     juz: Number,      // Para (1-30)
//     page: Number,     // Page number (1-604)
//     ruku: Number,     // Ruku number (1-558)
//     manzil: Number,   // Manzil (1-7)
//     hizb: Number,     // Hizb (1-60)
//     rubElHizb: Number, // Quarter (1-240) – "rub" / "nisf" / "salasa" is derived from this

//     // Special markers
//     sajda: Boolean,   // Sajda ayah?
//     bismillah: Boolean, // Is this Bismillah?

//     // Word-by-word (optional)
//     words: Array      // [{ word: "بِسْمِ", position: 1 }, ...]
// } );

// export const Quran = mongoose.model( "Quran", quranSchema );




import mongoose from "mongoose";

const waqfSchema = new mongoose.Schema( {
    symbol: String,  // Actual Unicode char (e.g. "ۖ")
    unicode: String,  // e.g. "U+06D6"
    type: String,  // mufassal | mutlaq | jaiz | la_waqf | murakhkhas | musta_naf | sakt
    label: String,  // Display label
    meaning: String,  // Urdu/English meaning
    charIndex: Number,  // Position in clean text
    wordBefore: String,  // 30 chars before - context
    wordAfter: String,  // 10 chars after - context
}, { _id: false } );

const quranSchema = new mongoose.Schema( {
    // --- Old Fields (XML se aane wale) ---
    para: Number,        // Juz/Para number (ab correct hoga)
    suraIndex: Number,
    suraName: String,
    ayaIndex: Number,
    text: String,        // Uthmani script (without wakf marks)
    bismillah: String,
    sajda: Boolean,
    // ruka: Number,        // Ruku number (558 total)
    ruka: { type: Number, min: 1, max: 558 }, // 558 total rukus

    figra: Boolean,
    manzil: Number,      // 7 manzil
    para_name:String,
    surah_name: String,
    bismillah: String, // Bismillah se pehle aya hai?



    waqf: [ waqfSchema ], // Array - all waqf in this ayah
    hasWaqf: Boolean,        // Fast filter
    waqfCount: Number,


    //  New fields for end-of-ayah waqf

    endWaqf: {
        type: {
            symbol: String,
            unicode: String,
            type: String,
            label: String,
            meaning: String,
            charIndex: Number,
            wordBefore: String,
            wordAfter: String,
        },
        default: null   
    },
    endWaqfIndex: { type: Number, default: null },  // per-surah sequential index

    // --- New Fields (Quran.com API se) ---
    page: Number,        // Page number (604 total)
    hizb: Number,        // Hizb number (60 total)
    rubElHizb: Number,   // Rub (quarter) within hizb: 1,2,3,4
    ruba: Boolean,       // true if rubElHizb == 1
    nisf: Boolean,       // true if rubElHizb == 2
    salasa: Boolean,     // true if rubElHizb == 3
    textTajweed: String, // Uthmani + Tajweed (wakf signs included)
    globalIndex: Number, // Unique index from 1 to 6236
    ekaf: Number         // Agar "ekaf" se matlab "hizb" hai to hizb hi use karo; warna extra field
} );



export const Quran = mongoose.model( "Quran", quranSchema );