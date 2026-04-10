import { redis } from "../config/redis.js";

/* ===================================================== */
/* 🔥 SAFE PARSER */
/* ===================================================== */
const safeParse = ( value ) => {
    try {
        if ( !value ) return null;
        if ( typeof value === "object" ) return value;

        return JSON.parse( value );
    } catch ( err ) {
        console.log( "❌ JSON PARSE ERROR:", err.message );
        return null;
    }
};

/* ===================================================== */
/* 🚀 CACHE MIDDLEWARE (FIXED FOR UPSTASH) */
/* ===================================================== */
export const cache = ( prefix ) => async ( req, res, next ) => {
    try {
        const key = `${prefix}:${req.originalUrl.split( "?" )[ 0 ]}`;

        console.log( "🔑 Cache Key:", key );

        const cachedData = await redis.get( key );

        /* ========================= */
        /* ⚡ CACHE HIT */
        /* ========================= */
        if ( cachedData ) {
            console.log( "⚡ CACHE HIT:", key );

            return res.json( {
                source: "cache",
                data: safeParse( cachedData ),
            } );
        }

        console.log( "❌ CACHE MISS:", key );

        const originalJson = res.json.bind( res );

        /* ========================= */
        /* 💾 SAVE TO CACHE (FIXED) */
        /* ========================= */
        res.json = async ( data ) => {
            try {
                const stringData = JSON.stringify( data );

                /* 🔥 FIX: Upstash SAFE SET (NO OPTIONS OBJECT) */
                await redis.set( key, stringData );
                await redis.expire( key, 3600 ); // 1 hour TTL

                console.log( "💾 SAVED TO CACHE:", key );
            } catch ( err ) {
                console.log( "❌ REDIS SET ERROR:", err.message );
            }

            return originalJson( {
                source: "db",
                data,
            } );
        };

        next();
    } catch ( err ) {
        console.log( "❌ CACHE ERROR:", err.message );
        next();
    }
};