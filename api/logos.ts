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

    // GET /api/logos - Fetch all logos (Merged MongoDB + Cloud Object Store)
    if (req.method === 'GET') {
      let mongoItems: any[] = [];
      if (db) {
        try {
          const collection = db.collection('logos');
          mongoItems = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
        } catch (err) {
          console.error('MongoDB GET logos error:', err);
        }
      }

      const cloudItems = await fetchCloudItems('logos');

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

      const mergedItems = Array.from(itemMap.values()).map((l: any) => {
        const imageUrl = l.imageUrl || l.imageData;
        const title = l.title || l.name || 'Untitled Logo';
        return {
          ...l,
          title,
          name: title,
          imageUrl,
          imageData: imageUrl,
        };
      });

      console.log('GET /api/logos returning merged items count:', mergedItems.length);
      return res.status(200).json({ success: true, data: mergedItems });
    }

    // POST /api/logos - Add or update a logo document
    if (req.method === 'POST') {
      const logo = req.body;
      const imageUrl = logo?.imageUrl || logo?.imageData;
      const title = logo?.title || logo?.name || 'Untitled Logo';

      if (!logo || !logo.id || !imageUrl) {
        console.error('❌ POST /api/logos Error: Invalid logo payload:', logo);
        return res.status(400).json({ success: false, error: 'Invalid logo document payload. id and imageUrl/imageData are required.' });
      }

      const now = Date.now();
      const document = {
        ...logo,
        title,
        name: title,
        imageUrl,
        imageData: imageUrl,
        createdAt: logo.createdAt || now,
        updatedAt: now,
      };

      if (db) {
        try {
          const collection = db.collection('logos');
          await collection.updateOne(
            { id: logo.id },
            { $set: document },
            { upsert: true }
          );
        } catch (err) {
          console.error('MongoDB POST logo error:', err);
        }
      }

      // Save to cloud database
      const cloudItems = await fetchCloudItems('logos');
      const idx = cloudItems.findIndex((l: any) => l.id === logo.id);
      if (idx >= 0) {
        cloudItems[idx] = document;
      } else {
        cloudItems.push(document);
      }
      await saveCloudItems('logos', cloudItems);

      return res.status(201).json({ success: true, data: document });
    }

    // DELETE /api/logos?id=123 - Delete a logo document
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Logo ID parameter is required for deletion.' });
      }

      if (db) {
        try {
          const collection = db.collection('logos');
          await collection.deleteOne({ id });
        } catch (err) {
          console.error('MongoDB DELETE logo error:', err);
        }
      }

      const cloudItems = await fetchCloudItems('logos');
      const filtered = cloudItems.filter((l: any) => l.id !== id);
      await saveCloudItems('logos', filtered);

      return res.status(200).json({ success: true, message: `Logo ${id} deleted successfully.` });
    }

    // PUT /api/logos - Save complete reordered list
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Items array is required for reordering.' });
      }

      if (db) {
        try {
          const collection = db.collection('logos');
          for (let i = 0; i < items.length; i++) {
            const l = items[i];
            await collection.updateOne(
              { id: l.id },
              { $set: { ...l, order: i, updatedAt: Date.now() } },
              { upsert: true }
            );
          }
        } catch (err) {
          console.error('MongoDB PUT logos order error:', err);
        }
      }

      await saveCloudItems('logos', items);
      return res.status(200).json({ success: true, data: items });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('FULL SERVER ERROR (/api/logos):', err);
    return res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
  }
}
