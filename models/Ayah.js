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
    suraIndex: { type: Number, required: true, index: true },
    ayaIndex: { type: Number, required: true, index: true },
    text: { type: String, required: true },
    textTajweed: { type: String, required: true },
    page_no: { type: Number, index: true },
    para_no: { type: Number, index: true },
    juz: Number,
    hizb: Number,
    rubElHizb: Number,
    manzil: Number,
    sajda: Boolean,
    sajdaType: String,
    globalIndex: { type: Number, index: true },
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
ayahSchema.index({ suraIndex: 1, ayaIndex: 1 });
ayahSchema.index({ para_no: 1, globalIndex: 1 });
ayahSchema.index({ page_no: 1, globalIndex: 1 });
ayahSchema.index({ suraIndex: 1, page_no: 1 });
ayahSchema.index({ para_no: 1, page_no: 1 });
// export default mongoose.model( 'Ayah', ayahSchema );
export default mongoose.models.Ayah || mongoose.model( 'Ayah', ayahSchema );