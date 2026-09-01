import mongoose from "mongoose";

const URI = process.env.MONGODB_URI!;

if (!URI) throw new Error("MONGODB_URI is not defined in .env.local");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(URI, { bufferCommands: false });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
