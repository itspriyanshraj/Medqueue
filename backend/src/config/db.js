
import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!connectionPromise) {
    const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : undefined;
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, options)
      .then(() => {
        console.log(`MongoDB connected: ${mongoose.connection.host}`);
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  const pendingConnection = connectionPromise;
  try {
    return await pendingConnection;
  } finally {
    if (connectionPromise === pendingConnection) connectionPromise = undefined;
  }
};

export default connectDB;

