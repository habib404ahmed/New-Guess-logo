import { MongoClient } from 'mongodb';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

console.log(process.env.MONGODB_URI ? 'Mongo URI OK' : 'Mongo URI Missing');
console.log(process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary Cloud Name OK' : 'Cloudinary Cloud Name Missing');
console.log(process.env.CLOUDINARY_API_KEY ? 'Cloudinary API Key OK' : 'Cloudinary API Key Missing');
console.log(process.env.CLOUDINARY_API_SECRET ? 'Cloudinary API Secret OK' : 'Cloudinary API Secret Missing');

const MONGODB_URI = process.env.MONGODB_URI || '';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = async (): Promise<MongoClient | null> => {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    console.log('Connection Failed (MONGODB_URI is empty)');
    return null;
  }

  try {
    if (client) {
      console.log('Connected (Reusing client)');
      return client;
    }
    if (!clientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 2000,
      } as any);
      clientPromise = client.connect();
    }
    const connectedClient = await clientPromise;
    console.log('Connected');
    return connectedClient;
  } catch (err: any) {
    console.error('Connection Failed:', err?.message || err);
    console.error('FULL ERROR:', err);
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
    console.error('FULL ERROR (getDatabase):', err);
  }
  return null;
};

// ========================================================
// GLOBAL CLOUD METADATA STORE (Cloudinary + Backend REST DB)
// Master database object for Freshers Arena cross-device sync
// ========================================================
const CLOUD_DB_OBJECT_ID = 'ff8081819f7e10ae019fc86b498a6a8f';
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
        name: 'freshers_arena_master_db',
        data: currentPayload,
      }),
    });
    return putRes.ok;
  } catch (err) {
    console.warn(`Failed to save cloud database items for ${key}:`, err);
    return false;
  }
};
