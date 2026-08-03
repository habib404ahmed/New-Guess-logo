import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, fetchCloudItems, saveCloudItems } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for multi-device cross-origin access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();

    // GET /api/movies - Fetch all movies for any device
    if (req.method === 'GET') {
      let items: any[] = [];

      if (db) {
        try {
          const collection = db.collection('movies');
          const movies = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
          items = movies.map((doc: any) => {
            const { _id, ...rest } = doc;
            return rest;
          });
        } catch (err) {
          console.warn('MongoDB GET movies failed, loading from cloud database:', err);
        }
      }

      if (!items || items.length === 0) {
        items = await fetchCloudItems('movies');
      }

      return res.status(200).json(items);
    }

    // POST /api/movies - Add or update a movie document
    if (req.method === 'POST') {
      const movie = req.body;
      if (!movie || !movie.id || !movie.videoData) {
        return res.status(400).json({ error: 'Invalid movie document payload' });
      }

      const now = Date.now();
      const document = {
        ...movie,
        createdAt: movie.createdAt || now,
        updatedAt: now,
      };

      if (db) {
        try {
          const collection = db.collection('movies');
          await collection.updateOne(
            { id: movie.id },
            { $set: document },
            { upsert: true }
          );
        } catch (err) {
          console.warn('MongoDB POST movie failed, saving to cloud database:', err);
        }
      }

      // Save to cloud database
      const cloudItems = await fetchCloudItems('movies');
      const idx = cloudItems.findIndex((m: any) => m.id === movie.id);
      if (idx >= 0) {
        cloudItems[idx] = document;
      } else {
        cloudItems.push(document);
      }
      await saveCloudItems('movies', cloudItems);

      return res.status(200).json({ success: true, movie: document });
    }

    // PUT /api/movies - Reorder or update movie document
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected items array for reordering' });
      }

      if (db) {
        try {
          const collection = db.collection('movies');
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await collection.updateOne(
              { id: item.id },
              { $set: { ...item, order: i, updatedAt: Date.now() } },
              { upsert: true }
            );
          }
        } catch (err) {
          console.warn('MongoDB PUT movies failed:', err);
        }
      }

      const reordered = items.map((item: any, idx: number) => ({
        ...item,
        order: idx,
        updatedAt: Date.now(),
      }));
      await saveCloudItems('movies', reordered);
      return res.status(200).json({ success: true });
    }

    // DELETE /api/movies?id=XXX - Delete movie document
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Movie ID required for deletion' });
      }

      if (db) {
        try {
          const collection = db.collection('movies');
          await collection.deleteOne({ id });
        } catch (err) {
          console.warn('MongoDB DELETE movie failed:', err);
        }
      }

      const cloudItems = await fetchCloudItems('movies');
      const filtered = cloudItems.filter((m: any) => m.id !== id);
      await saveCloudItems('movies', filtered);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error (movies):', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
