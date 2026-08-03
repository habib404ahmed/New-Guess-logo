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

    // GET /api/logos - Fetch all logos for any device (UNLIMITED)
    if (req.method === 'GET') {
      let items: any[] = [];

      if (db) {
        try {
          console.log('Using collection: logos');
          const collection = db.collection('logos');
          const count = await collection.countDocuments({});
          console.log(`Document count in logos collection: ${count}`);
          const logos = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
          items = logos.map((doc: any) => {
            const { _id, ...rest } = doc;
            const title = rest.title || rest.name || 'Untitled Logo';
            const imageUrl = rest.imageUrl || rest.imageData;
            return {
              ...rest,
              title,
              name: title,
              imageUrl,
              imageData: imageUrl,
            };
          });
        } catch (err) {
          console.error('FULL ERROR (GET /api/logos mongo):', err);
          console.warn('MongoDB GET logos failed, loading from cloud database:', err);
        }
      }

      if (!items || items.length === 0) {
        const rawItems = await fetchCloudItems('logos');
        items = (rawItems || []).map((l: any) => {
          const title = l.title || l.name || 'Untitled Logo';
          const imageUrl = l.imageUrl || l.imageData;
          return {
            ...l,
            title,
            name: title,
            imageUrl,
            imageData: imageUrl,
          };
        });
      }

      console.log('GET /api/logos returning items count:', items.length);
      return res.status(200).json({ success: true, data: items });
    }

    // POST /api/logos - Add or update a logo document
    if (req.method === 'POST') {
      const logo = req.body;
      const imageUrl = logo?.imageUrl || logo?.imageData;
      const title = logo?.title || logo?.name || 'Untitled Logo';

      if (!logo || !logo.id || !imageUrl) {
        console.error('❌ POST /api/logos Error: Invalid logo payload:', logo);
        return res.status(400).json({ success: false, error: 'Invalid logo document payload' });
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

      console.log('Saving logo payload to database:', document);

      if (db) {
        try {
          console.log('Using collection: logos');
          const collection = db.collection('logos');
          const result = await collection.updateOne(
            { id: logo.id },
            { $set: document },
            { upsert: true }
          );
          console.log('MongoDB Insert/Update Result:', result);
          const count = await collection.countDocuments({});
          console.log(`Document count after insert: ${count}`);
        } catch (err) {
          console.error('FULL ERROR (POST /api/logos mongo):', err);
          console.warn('MongoDB POST logo failed, saving to cloud database:', err);
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
      console.log('Saved to cloud database. Total items:', cloudItems.length);

      return res.status(201).json({ success: true, data: document });
    }

    // PUT /api/logos - Reorder or update logo documents
    if (req.method === 'PUT') {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Expected items array for reordering' });
      }

      if (db) {
        try {
          console.log('Using collection: logos');
          const collection = db.collection('logos');
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await collection.updateOne(
              { id: item.id },
              { $set: { ...item, order: i, updatedAt: Date.now() } },
              { upsert: true }
            );
          }
        } catch (err) {
          console.error('FULL ERROR (PUT /api/logos mongo):', err);
        }
      }

      const reordered = items.map((item: any, idx: number) => ({
        ...item,
        order: idx,
        updatedAt: Date.now(),
      }));
      await saveCloudItems('logos', reordered);
      return res.status(200).json({ success: true, data: reordered });
    }

    // DELETE /api/logos?id=XXX - Delete logo document
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Logo ID required for deletion' });
      }

      if (db) {
        try {
          console.log('Using collection: logos');
          const collection = db.collection('logos');
          await collection.deleteOne({ id });
        } catch (err) {
          console.error('FULL ERROR (DELETE /api/logos mongo):', err);
        }
      }

      const cloudItems = await fetchCloudItems('logos');
      const filtered = cloudItems.filter((l: any) => l.id !== id);
      await saveCloudItems('logos', filtered);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err: any) {
    console.error('FULL ERROR:', err);
    return res.status(500).json({
      success: false,
      error: String(err?.message || err),
      stack: err?.stack,
    });
  }
}
