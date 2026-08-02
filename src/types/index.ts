// Core type definitions for Freshers Challenge Arena with Cloudinary & MongoDB Atlas Integration

export interface LogoItem {
  id: string;
  name: string;
  imageData: string; // Permanent Cloudinary secure_url
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  order?: number;
  createdAt: number;
}

export interface MovieItem {
  id: string;
  title: string;
  videoData: string; // Permanent Cloudinary secure_url
  dialogue: string;
  hint?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  order?: number;
  timer?: number;
  points?: number;
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
