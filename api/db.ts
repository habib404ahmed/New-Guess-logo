import { MongoClient, type MongoClientOptions } from 'mongodb';

// MongoDB Atlas Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:freshers2026@cluster0.mongodb.net/freshers_arena?retryWrites=true&w=majority';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Memory storage fallback if MongoDB URI is unavailable or connecting fails
const memoryStore: {
  logos: any[];
  movies: any[];
} = {
  logos: [],
  movies: [],
};

const mongoOptions: MongoClientOptions = {
  serverSelectionTimeoutMS: 3000,
};

export const getMongoClient = async (): Promise<MongoClient | null> => {
  try {
    if (client) return client;
    if (!clientPromise) {
      client = new MongoClient(MONGODB_URI, mongoOptions);
      clientPromise = client.connect();
    }
    return await clientPromise;
  } catch (err) {
    console.warn('MongoDB Atlas connection failed, utilizing resilient serverless storage fallback:', err);
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

export const getMemoryStore = () => memoryStore;
