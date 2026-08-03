import type { GameSettings } from '../types';

export const DEFAULT_SETTINGS: GameSettings = {
  logoTimerDuration: 30,
  movieTimerDuration: 30,
  autoPlayVideo: true,
  soundEnabled: true,
};

let inMemorySettings: GameSettings = { ...DEFAULT_SETTINGS };

export const getGameSettingsAsync = async (): Promise<GameSettings> => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        inMemorySettings = { ...DEFAULT_SETTINGS, ...data };
        return inMemorySettings;
      }
    }
  } catch (err) {
    console.error('Failed to fetch settings from API:', err);
  }
  return inMemorySettings;
};

export const getGameSettings = (): GameSettings => {
  return inMemorySettings;
};

export const saveGameSettings = async (settings: GameSettings): Promise<void> => {
  inMemorySettings = { ...DEFAULT_SETTINGS, ...settings };
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  } catch (err) {
    console.error('Failed to save settings to API:', err);
  }
};
