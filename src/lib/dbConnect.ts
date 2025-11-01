import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopwave';

// Allow deployment without MongoDB for now
if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ MONGODB_URI not found, using fallback');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    const conn = await cached.promise;
    cached.conn = conn;
    return conn;
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e);
    cached.promise = null;
    // Don't throw error in production, just log it
    if (process.env.NODE_ENV !== 'production') {
      throw e;
    }
    return null;
  }
}

export default dbConnect;
