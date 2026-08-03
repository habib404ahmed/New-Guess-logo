import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, fetchCloudItems, saveCloudItems } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for multi-device cross-origin access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`📌 API Invocation: ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);

  try {
    const db = await getDatabase();

    // GET /api/movies - Fetch all movies for any device
    if (req.method === 'GET') {
      let items: any[] = [];

      if (db) {
        try {
          console.log('Using collection: movies');
          const collection = db.collection('movies');
          const count = await collection.countDocuments({});
          console.log(`Document count in movies collection: ${count}`);
          const movies = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
          items = movies.map((doc: any) => {
            const { _id, ...rest } = doc;
            const videoUrl = rest.videoData || rest.videoUrl;
            const title = rest.title || rest.movieTitle;
            const dialogue = rest.dialogue || rest.dialogueText;
            return {
              ...rest,
              title,
              videoData: videoUrl,
              videoUrl: videoUrl,
              dialogue,
            };
          });
        } catch (err) {
          console.error('FULL ERROR (GET /api/movies mongo):', err);
          console.warn('MongoDB GET movies failed, loading from cloud database:', err);
        }
      }

      if (!items || items.length === 0) {
        const rawItems = await fetchCloudItems('movies');
        items = (rawItems || []).map((m: any) => {
          const videoUrl = m.videoData || m.videoUrl;
          const title = m.title || m.movieTitle;
          const dialogue = m.dialogue || m.dialogueText;
          return {
            ...m,
            title,
            videoData: videoUrl,
            videoUrl: videoUrl,
            dialogue,
          };
        });
      }

      console.log('GET /api/movies returning items count:', items.length);
      console.log('GET /api/movies payload:', items);
      return res.status(200).json(items);
    }

    // POST /api/movies - Add or update a movie document
    if (req.method === 'POST') {
      const movie = req.body;
      const videoUrl = movie?.videoData || movie?.videoUrl;
      const title = movie?.title || movie?.movieTitle;
      const dialogue = movie?.dialogue || movie?.dialogueText || 'Guess the movie from the clip!';

      if (!movie || !movie.id || !videoUrl) {
        console.error('❌ POST /api/movies Error: Invalid movie payload:', movie);
        return res.status(400).json({ error: 'Invalid movie document payload. id and videoUrl/videoData are required.' });
      }

      const now = Date.now();
      const document = {
        ...movie,
        title: title,
        movieTitle: title,
        videoData: videoUrl,
        videoUrl: videoUrl,
        dialogue: dialogue,
        dialogueText: dialogue,
        createdAt: movie.createdAt || now,
        updatedAt: now,
      };

      console.log('Saving movie payload to database:', document);

      if (db) {
        try {
          console.log('Using collection: movies');
          const collection = db.collection('movies');
          const result = await collection.updateOne(
            { id: movie.id },
            { $set: document },
            { upsert: true }
          );
          console.log('MongoDB Insert/Update Result:', result);
          const count = await collection.countDocuments({});
          console.log(`Document count after insert: ${count}`);
        } catch (err) {
          console.error('FULL ERROR (POST /api/movies mongo):', err);
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
      console.log('Saved to cloud database. Total items:', cloudItems.length);

      return res.status(201).json({ success: true, movie: document });
    }

    // PUT /api/movies - Reorder or update movie document
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected items array for reordering' });
      }

      if (db) {
        try {
          console.log('Using collection: movies');
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
          console.error('FULL ERROR (PUT /api/movies mongo):', err);
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
          console.log('Using collection: movies');
          const collection = db.collection('movies');
          await collection.deleteOne({ id });
        } catch (err) {
          console.error('FULL ERROR (DELETE /api/movies mongo):', err);
        }
      }

      const cloudItems = await fetchCloudItems('movies');
      const filtered = cloudItems.filter((m: any) => m.id !== id);
      await saveCloudItems('movies', filtered);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('FULL ERROR:', err);
    return res.status(500).json({
      success: false,
      error: String(err?.message || err),
      stack: err?.stack,
    });
  }
}
