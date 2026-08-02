import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = await getDatabase();
    const collection = db.collection('movies');

    // GET /api/movies - Fetch all movie items
    if (req.method === 'GET') {
      const movies = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
      const sanitized = movies.map(({ _id, ...rest }) => rest);
      return res.status(200).json(sanitized);
    }

    // POST /api/movies - Add or update a movie item
    if (req.method === 'POST') {
      const movie = req.body;
      if (!movie || !movie.id || !movie.videoData) {
        return res.status(400).json({ error: 'Invalid movie item data' });
      }

      await collection.updateOne(
        { id: movie.id },
        { $set: movie },
        { upsert: true }
      );
      return res.status(200).json({ success: true, movie });
    }

    // PUT /api/movies - Bulk update movie items (for reordering)
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected items array for reordering' });
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await collection.updateOne(
          { id: item.id },
          { $set: { ...item, order: i } },
          { upsert: true }
        );
      }
      return res.status(200).json({ success: true });
    }

    // DELETE /api/movies?id=XXX - Delete a movie item
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Movie ID required for deletion' });
      }
      await collection.deleteOne({ id });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('MongoDB API Error (movies):', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
