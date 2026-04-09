// import mongoose from 'mongoose';
// import dotenv from "dotenv";

// dotenv.config(); // 🔥 IMPORTANT

// const connectDB = async () => {
//     try {
//         await mongoose.connect( process.env.MONGO_URI );
//         console.log( '✅ MongoDB connected' );
//     } catch ( err ) {
//         console.error( '❌ MongoDB error:', err );
//         process.exit( 1 );
//     }
// };

// export default connectDB;
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if ( !MONGO_URI ) {
    throw new Error( "MONGO_URI not found in env" );
}

// global cache (VERY IMPORTANT for Vercel)
let cached = global.mongoose;

if ( !cached ) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if ( cached.conn ) return cached.conn;

    if ( !cached.promise ) {
        cached.promise = mongoose.connect( MONGO_URI ).then( ( mongoose ) => {
            return mongoose;
        } );
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

export default connectDB;