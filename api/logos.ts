import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = await getDatabase();
    const collection = db.collection('logos');

    // GET /api/logos - Fetch all logo items
    if (req.method === 'GET') {
      const logos = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
      const sanitized = logos.map(({ _id, ...rest }) => rest);
      return res.status(200).json(sanitized);
    }

    // POST /api/logos - Add or update a logo item
    if (req.method === 'POST') {
      const logo = req.body;
      if (!logo || !logo.id || !logo.imageData) {
        return res.status(400).json({ error: 'Invalid logo item data' });
      }

      await collection.updateOne(
        { id: logo.id },
        { $set: logo },
        { upsert: true }
      );
      return res.status(200).json({ success: true, logo });
    }

    // PUT /api/logos - Bulk update logo items (for reordering)
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

    // DELETE /api/logos?id=XXX - Delete a logo item
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Logo ID required for deletion' });
      }
      await collection.deleteOne({ id });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('MongoDB API Error (logos):', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
