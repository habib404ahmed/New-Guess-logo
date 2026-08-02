import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:freshers2026@cluster0.mongodb.net/freshers_arena?retryWrites=true&w=majority';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) return client;
  if (!clientPromise) {
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
  return clientPromise;
};

export const getDatabase = async () => {
  const mongoClient = await getMongoClient();
  return mongoClient.db('freshers_arena');
};
