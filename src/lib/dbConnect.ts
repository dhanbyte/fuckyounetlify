import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Return null if no MongoDB URI is provided
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not found, skipping database connection');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((e) => {
      console.error('❌ MongoDB connection failed:', e);
      cached.promise = null;
      return null;
    });
  }

  try {
    const conn = await cached.promise;
    cached.conn = conn;
    return conn;
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e);
    cached.promise = null;
    return null;
  }
}

export default dbConnect;
