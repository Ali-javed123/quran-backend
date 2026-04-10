
import dotenv from "dotenv";
dotenv.config();
console.log( "ENV CHECK:", process.env.GROQ_API_KEY );
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import quranRoutes from './routes/quranRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { dbMiddleware } from "./middleware/db.middleware.js";
// const express = require( 'express' );
// const cors = require( 'cors' );
// const helmet = require( 'helmet' );
// const rateLimit = require( 'express-rate-limit' );
// const connectDB = require( './config/db' );
// const quranRoutes = require( './routes/quranRoutes' );
// const verifyRoutes = require( './routes/verifyRoutes' );
// const errorHandler = require( './middleware/errorHandler' );

const app = express();
app.use( dbMiddleware );
// connectDB();

// Connect to MongoDB
// connectDB();


// Security & middleware
app.use( helmet() );
// app.use( cors() );
// app.use( cors( {
//   origin: [
//     "http://localhost:3000",
//     "https://quran-frontend-app.vercel.app"
//   ],
//   methods: [ "GET", "POST", "PUT", "DELETE" ],
//   credentials: true
// } ) );

app.use( express.json( { limit: '10mb' } ) );
app.use( ( req, res, next ) => {
  res.header( "Access-Control-Allow-Origin", "*" );
  next();
} );
// Rate limiting (prevent abuse)
const limiter = rateLimit( {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
} );

app.use( ( req, res, next ) => {
  res.header( "Access-Control-Allow-Origin", "*" );
  res.header( "Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS" );
  res.header( "Access-Control-Allow-Headers", "Content-Type, Authorization" );

  if ( req.method === "OPTIONS" ) {
    return res.sendStatus( 200 );
  }

  next();
} );
app.use( '/api/verify', limiter );

// Routes
app.use( '/api/quran', quranRoutes );
app.use( '/api', verifyRoutes );

// Health check
app.get( '/health', ( req, res ) => res.send( 'OK' ) );

// Error handler (last)
app.get( '/', ( req, res ) => {
  res.send( 'Welcome to the Quran API!..' );
} );
app.use( errorHandler );
// const PORT = process.env.PORT || 5000;
// app.listen( PORT, () => console.log( `🚀 Server running on port ${PORT}` ) );
export default app;