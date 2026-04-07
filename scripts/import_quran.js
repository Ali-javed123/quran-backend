// const mongoose = require( 'mongoose' );
// const connectDB = require( '../config/db' );
// const Ayah = require( '../models/Ayah' );
// const fs = require( 'fs' );
// const path = require( 'path' );
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Ayah from '../models/Ayah.js';
import fs from 'fs';
import { fileURLToPath } from 'url';

import path from 'path';
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const importData = async () => {

    try {
        await connectDB();
        const data = JSON.parse( fs.readFileSync( path.join( __dirname, '../data/simple-quran.json' ), 'utf-8' ) );
        await Ayah.deleteMany(); // clear old
        await Ayah.insertMany( data );
        console.log( `✅ Imported ${data.length} ayahs` );
        process.exit();
    } catch ( err ) {
        console.error( err );
        process.exit( 1 );
    }
};

importData();