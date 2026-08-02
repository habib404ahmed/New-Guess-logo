// Core type definitions for Freshers Challenge Arena

export interface LogoItem {
  id: string;
  name: string;
  imageData: string; // Base64 data URL for offline storage
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: number;
}

export interface MovieItem {
  id: string;
  title: string;
  videoData: string; // Base64 or Blob URL for offline storage
  dialogue: string;
  hint?: string;
  createdAt: number;
}

export interface GameSettings {
  logoTimerDuration: number; // in seconds
  movieTimerDuration: number; // in seconds
  autoPlayVideo: boolean;
  soundEnabled: boolean;
}

export interface GameStats {
  totalLogos: number;
  totalMovies: number;
  lastUpdated: number;
}
