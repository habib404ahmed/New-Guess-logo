import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, getMemoryStore } from './db.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for global access across all devices
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();
    const memoryStore = getMemoryStore();

    // GET /api/movies - Fetch all movies for any device
    if (req.method === 'GET') {
      if (db) {
        const collection = db.collection('movies');
        const movies = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
        const sanitized = movies.map((doc: any) => {
          const { _id, ...rest } = doc;
          return rest;
        });
        return res.status(200).json(sanitized);
      } else {
        return res.status(200).json(memoryStore.movies);
      }
    }

    // POST /api/movies - Add or update a movie
    if (req.method === 'POST') {
      const movie = req.body;
      if (!movie || !movie.id || !movie.videoData) {
        return res.status(400).json({ error: 'Invalid movie item payload' });
      }

      if (db) {
        const collection = db.collection('movies');
        await collection.updateOne(
          { id: movie.id },
          { $set: movie },
          { upsert: true }
        );
      }

      // Update memory store
      const idx = memoryStore.movies.findIndex((m: any) => m.id === movie.id);
      if (idx >= 0) {
        memoryStore.movies[idx] = movie;
      } else {
        memoryStore.movies.push(movie);
      }

      return res.status(200).json({ success: true, movie });
    }

    // PUT /api/movies - Reorder movies
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected items array for reordering' });
      }

      if (db) {
        const collection = db.collection('movies');
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await collection.updateOne(
            { id: item.id },
            { $set: { ...item, order: i } },
            { upsert: true }
          );
        }
      }

      memoryStore.movies = items;
      return res.status(200).json({ success: true });
    }

    // DELETE /api/movies?id=XXX - Delete movie
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Movie ID required for deletion' });
      }

      if (db) {
        const collection = db.collection('movies');
        await collection.deleteOne({ id });
      }

      memoryStore.movies = memoryStore.movies.filter((m: any) => m.id !== id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error (movies):', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
