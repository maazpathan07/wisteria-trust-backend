import mongoose from "mongoose";

/**
 * Connect to MongoDB database
 * Supports both MONGO_URI and MONGODB_URI environment variables
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ MongoDB connection failed: Neither MONGO_URI nor MONGODB_URI is set in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: "wisteria_trust"
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
