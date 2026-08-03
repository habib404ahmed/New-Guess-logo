import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, fetchCloudItems, saveCloudItems } from './db.js';

const DEFAULT_SETTINGS = {
  logoTimerDuration: 30,
  movieTimerDuration: 30,
  autoPlayVideo: true,
  soundEnabled: true,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();

    // GET /api/settings
    if (req.method === 'GET') {
      let settings: any = null;

      if (db) {
        try {
          console.log('Using collection: settings');
          const collection = db.collection('settings');
          const doc = await collection.findOne({ id: 'game_settings' });
          if (doc) {
            const { _id, ...rest } = doc;
            settings = rest;
          }
        } catch (err) {
          console.warn('MongoDB GET settings failed:', err);
        }
      }

      if (!settings) {
        settings = await fetchCloudItems('settings');
      }

      return res.status(200).json(settings || DEFAULT_SETTINGS);
    }

    // POST /api/settings
    if (req.method === 'POST') {
      const payload = req.body;
      if (!payload) {
        return res.status(400).json({ error: 'Invalid settings payload' });
      }

      const updatedSettings = {
        id: 'game_settings',
        ...DEFAULT_SETTINGS,
        ...payload,
        updatedAt: Date.now(),
      };

      if (db) {
        try {
          console.log('Using collection: settings');
          const collection = db.collection('settings');
          await collection.updateOne(
            { id: 'game_settings' },
            { $set: updatedSettings },
            { upsert: true }
          );
        } catch (err) {
          console.warn('MongoDB POST settings failed:', err);
        }
      }

      await saveCloudItems('settings', updatedSettings);
      return res.status(201).json({ success: true, settings: updatedSettings });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('FULL ERROR (api/settings):', err);
    return res.status(500).json({
      success: false,
      error: String(err?.message || err),
      stack: err?.stack,
    });
  }
}
