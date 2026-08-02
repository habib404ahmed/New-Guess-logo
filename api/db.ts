import { MongoClient } from 'mongodb';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// Optional MongoDB Atlas Connection URI
const MONGODB_URI = process.env.MONGODB_URI || '';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = async (): Promise<MongoClient | null> => {
  if (!MONGODB_URI || MONGODB_URI.includes('cluster0.mongodb.net')) {
    return null;
  }

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
// ZERO-CONFIG GLOBAL CLOUD METADATA STORE (Cloudinary + Cloud DB)
// Permanent database object ID for Freshers Arena
// ========================================================
const CLOUD_DB_OBJECT_ID = 'ff8081819f7e10ae019fc3ca196d641d';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${CLOUD_DB_OBJECT_ID}`;

export const fetchCloudItems = async (key: 'logos' | 'movies'): Promise<any[]> => {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json: any = await res.json();
      if (json && json.data && Array.isArray(json.data[key])) {
        return json.data[key];
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch cloud items for ${key}:`, err);
  }
  return [];
};

export const saveCloudItems = async (key: 'logos' | 'movies', items: any[]): Promise<boolean> => {
  try {
    // 1. Fetch current global store payload
    let currentPayload: { logos: any[]; movies: any[] } = { logos: [], movies: [] };
    try {
      const res = await fetch(CLOUD_DB_URL);
      if (res.ok) {
        const json: any = await res.json();
        if (json && json.data && typeof json.data === 'object') {
          currentPayload = {
            logos: Array.isArray(json.data.logos) ? json.data.logos : [],
            movies: Array.isArray(json.data.movies) ? json.data.movies : [],
          };
        }
      }
    } catch {}

    // 2. Update specific key
    currentPayload[key] = items as any;

    // 3. PUT updated payload to cloud store
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
    console.warn(`Failed to save cloud items for ${key}:`, err);
    return false;
  }
};
