import { MongoClient } from 'mongodb';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// Check Vercel Environment Variables
console.log('----------------------------------------------------');
console.log('📌 Vercel Backend Init Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined OK' : 'Missing (Using Cloud Fallback)');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Defined OK' : 'Missing (Using default vjqnrvyr)');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Defined OK' : 'Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Defined OK' : 'Missing');
console.log('----------------------------------------------------');

const MONGODB_URI = process.env.MONGODB_URI || '';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = async (): Promise<MongoClient | null> => {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    return null;
  }

  try {
    if (client) return client;
    if (!clientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 2000,
      } as any);
      clientPromise = client.connect();
    }
    const connectedClient = await clientPromise;
    console.log('✅ MongoDB Connection Status: Connected');
    return connectedClient;
  } catch (err: any) {
    console.error('❌ MongoDB Connection Failed:', err?.message || err);
    client = null;
    clientPromise = null;
    return null;
  }
};

export const getDatabase = async () => {
  try {
    const mongoClient = await getMongoClient();
    if (mongoClient) {
      return mongoClient.db('freshers_arena');
    }
  } catch (err) {
    console.error('❌ getDatabase Error:', err);
  }
  return null;
};

// ========================================================
// GLOBAL CLOUD METADATA STORE (Cloudinary + Backend REST DB)
// Shared database object for Freshers Arena cross-device sync
// ========================================================
const CLOUD_DB_OBJECT_ID = 'ff8081819f7e10ae019fc3ca196d641d';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${CLOUD_DB_OBJECT_ID}`;

export const fetchCloudItems = async (key: 'logos' | 'movies' | 'settings'): Promise<any> => {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json: any = await res.json();
      if (json && json.data && json.data[key] !== undefined) {
        return json.data[key];
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch cloud database items for ${key}:`, err);
  }
  return key === 'settings' ? null : [];
};

export const saveCloudItems = async (key: 'logos' | 'movies' | 'settings', items: any): Promise<boolean> => {
  try {
    let currentPayload: { logos: any[]; movies: any[]; settings: any } = {
      logos: [],
      movies: [],
      settings: { logoTimerDuration: 30, movieTimerDuration: 30, autoPlayVideo: true, soundEnabled: true },
    };
    try {
      const res = await fetch(CLOUD_DB_URL);
      if (res.ok) {
        const json: any = await res.json();
        if (json && json.data && typeof json.data === 'object') {
          currentPayload = {
            logos: Array.isArray(json.data.logos) ? json.data.logos : [],
            movies: Array.isArray(json.data.movies) ? json.data.movies : [],
            settings: json.data.settings || currentPayload.settings,
          };
        }
      }
    } catch {}

    currentPayload[key] = items;

    const putRes = await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'freshers_arena_database',
        data: currentPayload,
      }),
    });
    return putRes.ok;
  } catch (err) {
    console.warn(`Failed to save cloud database items for ${key}:`, err);
    return false;
  }
};
