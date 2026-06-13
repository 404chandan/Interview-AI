import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  
  if (!mongoURI) {
    console.warn('⚠️ MONGO_URI is not set in the .env file. The application will run using temporary in-memory mock storage.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️ Falling back to local in-memory mock storage.');
    return false;
  }
};
