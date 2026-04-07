import mongoose from 'mongoose';

const waqfSchema = new mongoose.Schema( {
    symbol: String,
    unicode: String,
    type: String,
    label: String,
    meaning: String,
    charIndex: Number,
    wordBefore: String,
    wordAfter: String,
    waqfIndex: Number
}, { _id: false } );
const endWaqfSchema = new mongoose.Schema( {
    symbol: String,
    unicode: String,
    type: String,
    label: String,
    meaning: String,
    charIndex: Number,
    wordBefore: String,
    wordAfter: String,
}, { _id: false } );
const ayahSchema = new mongoose.Schema( {
    suraIndex: { type: Number, required: true },
    ayaIndex: { type: Number, required: true },
    text: { type: String, required: true },
    textTajweed: { type: String, required: true },
    page_no: Number,
    para_no: Number,
    juz: Number,
    hizb: Number,
    rubElHizb: Number,
    manzil: Number,
    sajda: Boolean,
    sajdaType: String,
    globalIndex: Number,
    waqf: [ waqfSchema ],
    hasWaqf: Boolean,
    waqfCount: Number,
    ruku_global: Number,
    ruku_para: Number,
    ruku_surah: Number,
    surah_name: String,
    para_name: String,
    bismillah: String, // Bismillah se pehle aya hai?

    // endWaqf: String,
    endWaqf: endWaqfSchema,
    endWaqfIndex: Number
} );

// export default mongoose.model( 'Ayah', ayahSchema );
export default mongoose.models.Ayah || mongoose.model( 'Ayah', ayahSchema );