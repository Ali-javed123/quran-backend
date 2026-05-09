// // // server.js
// // import dotenv from 'dotenv';
// // dotenv.config();

// // import express from 'express';
// // import cors from 'cors';
// // import helmet from 'helmet';
// // import rateLimit from 'express-rate-limit';
// // import { createServer } from 'http';
// // import { Server } from 'socket.io';
// // import connectDB from './config/db.js';
// // import quranRoutes from './routes/quranRoutes.js';
// // import verifyRoutes from './routes/verifyRoutes.js';
// // import errorHandler from './middleware/errorHandler.js';
// // import { dbMiddleware } from './middleware/db.middleware.js';
// // import { setupRecitationSocket } from './socket/recitation.socket.js'; // ✅ fixed path

// // const app    = express();
// // const server = createServer(app);

// // // ── MongoDB ──────────────────────────────────────────────────
// // await connectDB();

// // console.log('✅ MongoDB connected');

// // // ── Socket.IO ────────────────────────────────────────────────
// // const io = new Server(server, {
// //   cors: {
// //     origin: [
// //       'http://localhost:3000',
// //       'http://localhost:3001',
// //       process.env.FRONTEND_URL || 'https://quran-frontend-app.vercel.app',
// //     ],
// //     methods: ['GET', 'POST'],
// //     credentials: true,
// //   },
// //   transports: ['websocket', 'polling'],
// //   // Increase limits for audio chunks
// //   maxHttpBufferSize: 10 * 1024 * 1024,  // 10MB per message
// // });

// // // ── Middleware ───────────────────────────────────────────────
// // // app.use(dbMiddleware);
// // app.use(helmet());
// // app.use(express.json({ limit: '15mb' }));

// // // CORS headers
// // app.use((req, res, next) => {
// //   res.header('Access-Control-Allow-Origin', '*');
// //   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
// //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// //   if (req.method === 'OPTIONS') return res.sendStatus(200);
// //   next();
// // });

// // // Rate limiting (only on verify routes)
// // const limiter = rateLimit({
// //   windowMs : 15 * 60 * 1000,
// //   max      : 100,
// //   message  : 'Too many requests',
// // });

// // // ── Routes ───────────────────────────────────────────────────
// // app.use('/api/verify', limiter);
// // app.use('/api/quran', quranRoutes);
// // app.use('/api', verifyRoutes);
// // app.get('/health', (_, res) => res.send('OK'));
// // app.get('/', (_, res) => res.send('Quran API with AI Recitation Checker'));
// // app.use(errorHandler);

// // // ── Socket Setup ─────────────────────────────────────────────
// // setupRecitationSocket(io);

// // // ── Start ─────────────────────────────────────────────────────
// // const PORT = process.env.PORT || 5000;
// // // const PORT = process.env.PORT || "https://quran-backend-pink.vercel.app";
// // server.listen(PORT, () => console.log(`🚀 Server runnings on port ${PORT}...`));

// // // export default app;
// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import { createServer } from 'http';
// import { Server } from 'socket.io';

// import connectDB from './config/db.js';
// import quranRoutes from './routes/quranRoutes.js';
// import verifyRoutes from './routes/verifyRoutes.js';
// import errorHandler from './middleware/errorHandler.js';
// import { setupRecitationSocket } from './socket/recitation.socket.js';

// const app = express();
// const server = createServer(app);

// // ── ENV CHECK ──
// const PORT = process.env.PORT || 5000;

// // ── DB CONNECT (SAFE) ──
// connectDB()
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB error:", err));

// // ── SOCKET (NON-BLOCKING) ──
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//   },
//   transports: ['websocket', 'polling'],
//   maxHttpBufferSize: 10 * 1024 * 1024,
// });

// setupRecitationSocket(io);

// // ── MIDDLEWARE ──
// app.use(helmet());
// app.use(express.json({ limit: '15mb' }));

// // CORS (clean)
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

// // RATE LIMIT
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
// });
// app.use('/api/verify', limiter);

// // ── ROUTES ──
// app.use('/api/quran', quranRoutes);
// app.use('/api', verifyRoutes);

// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: "ok",
//     time: new Date().toISOString()
//   });
// });

// app.get('/', (req, res) => {
//   res.send('Quran API running');
// });

// app.use(errorHandler);

// // ── START SERVER (IMPORTANT FOR RAILWAY) ──
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port.. ${PORT}`);
// });
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import quranRoutes from './routes/quranRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { setupRecitationSocket } from './socket/recitation.socket.js';

// ─────────────────────────────────────────
// 🔥 GLOBAL SAFETY (IMPORTANT)
// ─────────────────────────────────────────
mongoose.set("bufferCommands", false); // prevent buffering timeout

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

// ─────────────────────────────────────────
// 🚀 APP INIT
// ─────────────────────────────────────────
const app = express();
const server = createServer(app);

// ─────────────────────────────────────────
// 🔥 ENV CHECK
// ─────────────────────────────────────────
const PORT = process.env.PORT;

// if (!PORT) {
//   console.error("❌ PORT missing (Railway will fail)");
//   process.exit(1);
// }

console.log("🌍 PORTs:", PORT);
console.log("🔑 GROQ:", process.env.GROQ_API_KEY ? "OK" : "MISSING");
console.log("🛢️ MONGO:", process.env.MONGO_URI ? "OK" : "MISSING");

// ─────────────────────────────────────────
// 🔌 SOCKET (SAFE INIT)
// ─────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 10 * 1024 * 1024,
});

// comment this if debugging
setupRecitationSocket(io);

// ─────────────────────────────────────────
// 🧱 MIDDLEWARE
// ─────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '15mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use('/api/verify', limiter);

// ─────────────────────────────────────────
// 🛣️ ROUTES
// ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "Quran API running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? "ok" : "db_not_connected",
    dbState: mongoose.connection.readyState,
    time: new Date().toISOString()
  });
});

app.use('/api/quran', quranRoutes);
app.use('/api', verifyRoutes);

// Error handler LAST
app.use(errorHandler);

// ─────────────────────────────────────────y
// 🧠 START SERVER AFTER DB CONNECT
// ─────────────────────────────────────────
await connectDB(); // ⛔ WAIT HERE (main fix)
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on ports ${PORT}..`);
});
