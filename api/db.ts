import { MongoClient } from 'mongodb';

// Failsafe declaration for Vercel Node runtime process env
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// MongoDB Atlas Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:freshers2026@cluster0.mongodb.net/freshers_arena?retryWrites=true&w=majority';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = async (): Promise<MongoClient | null> => {
  try {
    if (client) return client;
    if (!clientPromise) {
      client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 2000,
      } as any);
      clientPromise = client.connect();
    }
    return await clientPromise;
  } catch (err) {
    console.warn('MongoDB Atlas connection failed, utilizing resilient global cloud storage fallback:', err);
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

// ========================================================
// GLOBAL PERSISTENT CLOUD STORAGE ENGINE (REST API)
// Guarantee cross-device global persistence across all lambdas & devices
// ========================================================
const KVDB_BASE = 'https://kvdb.io/freshers_arena_v1_prod_key';

export const fetchCloudItems = async (key: 'logos' | 'movies'): Promise<any[]> => {
  try {
    const res = await fetch(`${KVDB_BASE}/${key}`);
    if (res.ok) {
      const text = await res.text();
      if (text) {
        const data = JSON.parse(text);
        if (Array.isArray(data)) return data;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch cloud items for ${key}:`, err);
  }
  return [];
};

export const saveCloudItems = async (key: 'logos' | 'movies', items: any[]): Promise<boolean> => {
  try {
    const res = await fetch(`${KVDB_BASE}/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return res.ok;
  } catch (err) {
    console.warn(`Failed to save cloud items for ${key}:`, err);
    return false;
  }
};
