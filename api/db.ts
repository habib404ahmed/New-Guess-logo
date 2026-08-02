import { MongoClient } from 'mongodb';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// MongoDB Atlas Connection URI from Vercel Environment Variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:freshers2026@cluster0.mongodb.net/freshers_arena?retryWrites=true&w=majority';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = async (): Promise<MongoClient | null> => {
  if (!MONGODB_URI || MONGODB_URI.includes('cluster0.mongodb.net')) {
    console.warn('⚠️ MONGODB_URI is unconfigured or using placeholder URL. Set MONGODB_URI in Vercel Project Settings.');
    return null;
  }

  try {
    if (client) return client;
    if (!clientPromise) {
      client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
      } as any);
      clientPromise = client.connect();
    }
    return await clientPromise;
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err);
    client = null;
    clientPromise = null;
    return null;
  }
};

export const getDatabase = async () => {
  const mongoClient = await getMongoClient();
  if (mongoClient) {
    return mongoClient.db('freshers_arena');
  }
  return null;
};
