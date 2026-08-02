import type { GameSettings } from '../types';

const SETTINGS_KEY = 'freshers_arena_settings';

export const DEFAULT_SETTINGS: GameSettings = {
  logoTimerDuration: 30,
  movieTimerDuration: 30,
  autoPlayVideo: true,
  soundEnabled: true,
};

export const getGameSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
};

export const saveGameSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};
