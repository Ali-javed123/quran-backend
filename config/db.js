import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

// config/db.js - Timeout badhayein
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("⚡ MongoDB already connected");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 50000,    // 30 se 50
      socketTimeoutMS: 60000,             // 45 se 60
      connectTimeoutMS: 50000,            // 30 se 50
      maxPoolSize: 10,                   // Connection pool limit
      minPoolSize: 2,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;