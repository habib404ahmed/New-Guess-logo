import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, fetchCloudItems, saveCloudItems } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();

    // GET /api/movies - Fetch all movies (Merged MongoDB + Cloud Object Store)
    if (req.method === 'GET') {
      let mongoItems: any[] = [];
      if (db) {
        try {
          const collection = db.collection('movies');
          mongoItems = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
        } catch (err) {
          console.error('MongoDB GET movies error:', err);
        }
      }

      const cloudItems = await fetchCloudItems('movies');

      // Merge both sources deduplicated by item.id
      const itemMap = new Map<string, any>();

      (cloudItems || []).forEach((item: any) => {
        if (item && item.id) itemMap.set(item.id, item);
      });

      (mongoItems || []).forEach((item: any) => {
        if (item && item.id) {
          const { _id, ...rest } = item;
          itemMap.set(item.id, rest);
        }
      });

      const mergedItems = Array.from(itemMap.values()).map((m: any) => {
        const videoUrl = m.videoUrl || m.videoData;
        const title = m.title || m.movieTitle || 'Untitled Movie';
        const dialogue = m.dialogue || m.dialogueText || 'Guess the movie from the clip!';
        return {
          ...m,
          title,
          movieTitle: title,
          videoUrl,
          videoData: videoUrl,
          dialogue,
          dialogueText: dialogue,
        };
      });

      console.log('GET /api/movies returning merged items count:', mergedItems.length);
      return res.status(200).json({ success: true, data: mergedItems });
    }

    // POST /api/movies - Add or update a movie document
    if (req.method === 'POST') {
      const movie = req.body;
      const videoUrl = movie?.videoUrl || movie?.videoData;
      const title = movie?.title || movie?.movieTitle || 'Untitled Movie';
      const dialogue = movie?.dialogue || movie?.dialogueText || 'Guess the movie from the clip!';

      if (!movie || !movie.id || !videoUrl) {
        console.error('❌ POST /api/movies Error: Invalid movie payload:', movie);
        return res.status(400).json({ success: false, error: 'Invalid movie document payload. id and videoUrl/videoData are required.' });
      }

      const now = Date.now();
      const document = {
        ...movie,
        title,
        movieTitle: title,
        videoUrl,
        videoData: videoUrl,
        dialogue,
        dialogueText: dialogue,
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
          console.error('MongoDB POST movie error:', err);
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

      return res.status(201).json({ success: true, data: document });
    }

    // DELETE /api/movies?id=123 - Delete a movie document
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Movie ID parameter is required for deletion.' });
      }

      if (db) {
        try {
          const collection = db.collection('movies');
          await collection.deleteOne({ id });
        } catch (err) {
          console.error('MongoDB DELETE movie error:', err);
        }
      }

      const cloudItems = await fetchCloudItems('movies');
      const filtered = cloudItems.filter((m: any) => m.id !== id);
      await saveCloudItems('movies', filtered);

      return res.status(200).json({ success: true, message: `Movie ${id} deleted successfully.` });
    }

    // PUT /api/movies - Save complete reordered list
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Items array is required for reordering.' });
      }

      if (db) {
        try {
          const collection = db.collection('movies');
          for (let i = 0; i < items.length; i++) {
            const m = items[i];
            await collection.updateOne(
              { id: m.id },
              { $set: { ...m, order: i, updatedAt: Date.now() } },
              { upsert: true }
            );
          }
        } catch (err) {
          console.error('MongoDB PUT movies order error:', err);
        }
      }

      await saveCloudItems('movies', items);
      return res.status(200).json({ success: true, data: items });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('FULL SERVER ERROR (/api/movies):', err);
    return res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
  }
}
