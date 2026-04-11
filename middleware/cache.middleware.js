import { redis } from "../config/redis.js";

export const cache = ( prefix, ttl = 3600 ) => async ( req, res, next ) => {
    try {
        // 🔥 UNIQUE KEY (IMPORTANT)
        const key = `${prefix}:${req.originalUrl}`;

        const cachedData = await redis.get( key );

        if ( cachedData ) {
            return res.json( JSON.parse( cachedData ) );
        }

        const originalJson = res.json.bind( res );

        res.json = async ( data ) => {
            await redis.set( key, JSON.stringify( data ), "EX", ttl );
            return originalJson( data );
        };

        next();
    } catch ( err ) {
        console.log( "Redis Error:", err.message );
        next();
    }
};