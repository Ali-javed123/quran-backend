import Ayah from "../models/Ayah.js";
import { redis } from "../config/redis.js";

/* ===================================================== */
/* 🔥 SAFE PARSE */
/* ===================================================== */

const safeParse = ( value ) => {
    try {
        if ( !value ) return null;

        // Upstash sometimes returns object directly
        if ( typeof value !== "string" ) return value;

        return JSON.parse( value );
    } catch ( e ) {
        return null;
    }
};

/* ===================================================== */
/* 🔥 CACHE KEY */
/* ===================================================== */

const getCacheKey = ( prefix, params, query ) => {
    return `${prefix}:${JSON.stringify( params )}:${JSON.stringify( query )}`;
};

/* ===================================================== */
/* 🔥 SET CACHE (UPSTASH SAFE) */
/* ===================================================== */

const setCache = async ( key, data ) => {
    try {
        await redis.set( key, JSON.stringify( data ), {
            ex: 3600,
        } );
    } catch ( err ) {
        console.log( "CACHE SET ERROR:", err.message );
    }
};

/* ===================================================== */
/* =================== SURAHS =========================== */
/* ===================================================== */

const getSurahs = async ( req, res ) => {
    const key = "surahs";

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const surahs = await Ayah.aggregate( [
        { $sort: { ayaIndex: 1 } },
        {
            $group: {
                _id: "$suraIndex",
                surah_name: { $first: "$surah_name" }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                suraIndex: "$_id",
                surah_name: 1
            }
        }
    ] );

    await setCache( key, surahs );

    res.json( surahs );
};

/* ===================================================== */
/* ================= SURAH AYAH ========================= */
/* ===================================================== */

const getAyahsBySurah = async ( req, res ) => {
    const key = getCacheKey( "surah", req.params, req.query );

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const { suraIndex } = req.params;
    let { page = 1, limit = 16, mode = "normal" } = req.query;

    page = Number( page );
    limit = Number( limit );

    const skip = ( page - 1 ) * limit;

    const ayahs = await Ayah.find(
        { suraIndex: Number( suraIndex ) },
        {
            ayaIndex: 1,
            text: 1,
            textTajweed: 1,
            page_no: 1,
            para_no: 1
        }
    )
        .sort( { ayaIndex: 1 } )
        .skip( skip )
        .limit( limit )
        .lean();

    const data = ayahs.map( ( a ) => ( {
        ...a,
        text: mode === "tajweed" ? a.textTajweed : a.text
    } ) );

    const response = {
        suraIndex: Number( suraIndex ),
        page,
        ayahs: data
    };

    await setCache( key, response );

    res.json( response );
};

/* ===================================================== */
/* =================== PARAS ============================ */
/* ===================================================== */

const getParas = async ( req, res ) => {
    const key = "paras";

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const paras = await Ayah.aggregate( [
        { $sort: { globalIndex: 1 } },
        {
            $group: {
                _id: "$para_no",
                para_name: { $first: "$para_name" },
                ayahCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                para_no: "$_id",
                para_name: 1,
                ayahCount: 1
            }
        }
    ] );

    await setCache( key, paras );

    res.json( paras );
};

/* ===================================================== */
/* ================= PARA AYAH ========================== */
/* ===================================================== */

const getAyahsByPara = async ( req, res ) => {
    const key = getCacheKey( "para", req.params, req.query );

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const { paraNo } = req.params;
    let { page = 1, limit = 16, mode = "normal" } = req.query;

    page = Number( page );
    limit = Number( limit );

    const skip = ( page - 1 ) * limit;

    const ayahs = await Ayah.find(
        { para_no: Number( paraNo ) },
        {
            ayaIndex: 1,
            text: 1,
            textTajweed: 1,
            page_no: 1,
            suraIndex: 1
        }
    )
        .sort( { globalIndex: 1 } )
        .skip( skip )
        .limit( limit )
        .lean();

    const total = await Ayah.countDocuments( { para_no: Number( paraNo ) } );

    const data = ayahs.map( ( a ) => ( {
        ...a,
        text: mode === "tajweed" ? a.textTajweed : a.text
    } ) );

    const response = {
        paraNo: Number( paraNo ),
        page,
        totalPages: Math.ceil( total / limit ),
        ayahs: data
    };

    await setCache( key, response );

    res.json( response );
};

/* ===================================================== */
/* ================= PAGE APIs ========================== */
/* ===================================================== */

const getParaByPage = async ( req, res ) => {
    const key = getCacheKey( "paraPage", req.params, req.query );

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const { paraNo, page } = req.params;

    const ayahs = await Ayah.find( {
        para_no: Number( paraNo ),
        page_no: Number( page )
    } ).lean();

    const response = { paraNo: Number( paraNo ), page: Number( page ), ayahs };

    await setCache( key, response );

    res.json( response );
};

/* ===================================================== */

const getSurahByPage = async ( req, res ) => {
    const key = getCacheKey( "surahPage", req.params, req.query );

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const { surahNo, page } = req.params;

    const ayahs = await Ayah.find( {
        suraIndex: Number( surahNo ),
        page_no: Number( page )
    } ).lean();

    const response = { surahNo: Number( surahNo ), page: Number( page ), ayahs };

    await setCache( key, response );

    res.json( response );
};

/* ===================================================== */

const getSurahMeta = async ( req, res ) => {
    const key = `surahMeta:${req.params.suraIndex}`;

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const { suraIndex } = req.params;

    const firstAyah = await Ayah.findOne(
        { suraIndex: Number( suraIndex ) },
        { page_no: 1 }
    ).sort( { ayaIndex: 1 } ).lean();

    const response = {
        suraIndex: Number( suraIndex ),
        startPage: firstAyah?.page_no || 1
    };

    await setCache( key, response );

    res.json( response );
};

/* ===================================================== */

const getParaMeta = async ( req, res ) => {
    const key = `paraMeta:${req.params.para_no}`;

    const cached = await redis.get( key );
    const parsed = safeParse( cached );

    if ( parsed ) return res.json( parsed );

    const { para_no } = req.params;

    const firstAyah = await Ayah.findOne(
        { para_no: Number( para_no ) },
        { page_no: 1, para_name: 1 }
    ).sort( { globalIndex: 1 } ).lean();

    const response = {
        para_no: Number( para_no ),
        startPage: firstAyah?.page_no || 1,
        paraName: firstAyah?.para_name || ""
    };

    await setCache( key, response );

    res.json( response );
};

/* ===================================================== */

export {
    getSurahs,
    getAyahsBySurah,
    getParas,
    getAyahsByPara,
    getParaByPage,
    getSurahByPage,
    getSurahMeta,
    getParaMeta
};