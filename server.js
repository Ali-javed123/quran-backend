// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import quranRoutes from "./routes/quran.js";

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json()); 

// app.use("/api/quran", quranRoutes);

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log("MongoDB Connected"))
//     .catch(err => console.log(err));

// app.listen(8484, () => console.log("Server running on port 8484"));

// require( 'dotenv' ).config();
import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import quranRoutes from './routes/quranRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import errorHandler from './middleware/errorHandler.js';
// const express = require( 'express' );
// const cors = require( 'cors' );
// const helmet = require( 'helmet' );
// const rateLimit = require( 'express-rate-limit' );
// const connectDB = require( './config/db' );
// const quranRoutes = require( './routes/quranRoutes' );
// const verifyRoutes = require( './routes/verifyRoutes' );
// const errorHandler = require( './middleware/errorHandler' );

const app = express();

// Connect to MongoDB
// connectDB();
let isConnected = false;
const initDB = async () => {
  if ( !isConnected ) {
    await connectDB();
    isConnected = true;
  }
};


// Security & middleware
app.use( helmet() );
app.use( cors() );
app.use( express.json( { limit: '10mb' } ) );

// Rate limiting (prevent abuse)
const limiter = rateLimit( {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
} );
app.use( async ( req, res, next ) => {
  await initDB();
  next();
} );

app.use( '/api/verify', limiter );

// Routes
app.use( '/api/quran', quranRoutes );
app.use( '/api', verifyRoutes );

// Health check
app.get( '/health', ( req, res ) => res.send( 'OK' ) );

// Error handler (last)
app.use( errorHandler );
app.get( '/', ( req, res ) => {
  res.send( 'Welcome to the Quran API!' );
} );
// const PORT = process.env.PORT || 5000;
// app.listen( PORT, () => console.log( `🚀 Server running on port ${PORT}` ) );
export default app;