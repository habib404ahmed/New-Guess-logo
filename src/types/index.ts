// Unified Data Models for Freshers Challenge Arena with Cloudinary & Backend REST DB

export interface LogoItem {
  id: string;
  title?: string;
  name?: string;
  answer?: string;
  hint?: string;
  imageUrl?: string;
  imageData?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  points?: number;
  order?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface MovieItem {
  id: string;
  title?: string;
  movieTitle?: string;
  dialogue?: string;
  dialogueText?: string;
  videoUrl?: string;
  videoData?: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  points?: number;
  order?: number;
  timer?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface GameSettings {
  logoTimerDuration: number;
  movieTimerDuration: number;
  autoPlayVideo: boolean;
  soundEnabled: boolean;
}

export interface GameStats {
  totalLogos: number;
  totalMovies: number;
  lastUpdated: number;
}
