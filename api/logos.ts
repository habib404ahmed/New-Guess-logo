import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, getMemoryStore } from './db';

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

    // GET /api/logos - Fetch all logos for any device
    if (req.method === 'GET') {
      if (db) {
        const collection = db.collection('logos');
        const logos = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
        const sanitized = logos.map((doc: any) => {
          const { _id, ...rest } = doc;
          return rest;
        });
        return res.status(200).json(sanitized);
      } else {
        return res.status(200).json(memoryStore.logos);
      }
    }

    // POST /api/logos - Add or update a logo
    if (req.method === 'POST') {
      const logo = req.body;
      if (!logo || !logo.id || !logo.imageData) {
        return res.status(400).json({ error: 'Invalid logo item payload' });
      }

      if (db) {
        const collection = db.collection('logos');
        await collection.updateOne(
          { id: logo.id },
          { $set: logo },
          { upsert: true }
        );
      }

      // Update memory store
      const idx = memoryStore.logos.findIndex((l: any) => l.id === logo.id);
      if (idx >= 0) {
        memoryStore.logos[idx] = logo;
      } else {
        memoryStore.logos.push(logo);
      }

      return res.status(200).json({ success: true, logo });
    }

    // PUT /api/logos - Reorder logos
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected items array for reordering' });
      }

      if (db) {
        const collection = db.collection('logos');
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await collection.updateOne(
            { id: item.id },
            { $set: { ...item, order: i } },
            { upsert: true }
          );
        }
      }

      memoryStore.logos = items;
      return res.status(200).json({ success: true });
    }

    // DELETE /api/logos?id=XXX - Delete logo
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Logo ID required for deletion' });
      }

      if (db) {
        const collection = db.collection('logos');
        await collection.deleteOne({ id });
      }

      memoryStore.logos = memoryStore.logos.filter((l: any) => l.id !== id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error (logos):', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
