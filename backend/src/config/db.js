import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ecommerce',
    });
    console.log(`[mongo] connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('[mongo] connection error:', err.message);
    process.exit(1);
  }
};
