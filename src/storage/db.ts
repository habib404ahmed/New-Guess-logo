import type { LogoItem, MovieItem } from '../types';

const LOGOS_STORAGE_KEY = 'freshers_arena_cloud_logos';
const MOVIES_STORAGE_KEY = 'freshers_arena_cloud_movies';

// Helper: Local Storage JSON caching
const getCachedLogos = (): LogoItem[] => {
  try {
    const raw = localStorage.getItem(LOGOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setCachedLogos = (logos: LogoItem[]) => {
  try {
    localStorage.setItem(LOGOS_STORAGE_KEY, JSON.stringify(logos));
  } catch (err) {
    console.warn('Failed to cache logos in localStorage:', err);
  }
};

const getCachedMovies = (): MovieItem[] => {
  try {
    const raw = localStorage.getItem(MOVIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setCachedMovies = (movies: MovieItem[]) => {
  try {
    localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies));
  } catch (err) {
    console.warn('Failed to cache movies in localStorage:', err);
  }
};

// ==========================================
// LOGO STORAGE OPERATIONS (CLOUD & DATABASE)
// ==========================================

export const getAllLogos = async (): Promise<LogoItem[]> => {
  try {
    const res = await fetch('/api/logos');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setCachedLogos(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch logos from backend API:', err);
  }
  return getCachedLogos();
};

export const saveLogo = async (logo: LogoItem): Promise<string> => {
  // Save to backend API
  const res = await fetch('/api/logos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logo),
  });

  if (!res.ok) {
    throw new Error(`Failed to save logo to database (HTTP ${res.status})`);
  }

  // Update local cache
  const current = getCachedLogos();
  const existingIdx = current.findIndex((item) => item.id === logo.id);
  let updated: LogoItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = logo;
  } else {
    updated = [...current, logo];
  }
  setCachedLogos(updated);

  return logo.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  const res = await fetch(`/api/logos?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete logo from database (HTTP ${res.status})`);
  }

  const current = getCachedLogos().filter((l) => l.id !== id);
  setCachedLogos(current);
};

export const saveLogosOrder = async (logos: LogoItem[]): Promise<void> => {
  const ordered = logos.map((item, idx) => ({ ...item, order: idx }));
  const res = await fetch('/api/logos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: ordered }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save logo order to database (HTTP ${res.status})`);
  }

  setCachedLogos(ordered);
};

// ==========================================
// MOVIE STORAGE OPERATIONS (CLOUD & DATABASE)
// ==========================================

export const getAllMovies = async (): Promise<MovieItem[]> => {
  try {
    const res = await fetch('/api/movies');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setCachedMovies(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch movies from backend API:', err);
  }
  return getCachedMovies();
};

export const saveMovie = async (movie: MovieItem): Promise<string> => {
  const res = await fetch('/api/movies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });

  if (!res.ok) {
    throw new Error(`Failed to save movie to database (HTTP ${res.status})`);
  }

  const current = getCachedMovies();
  const existingIdx = current.findIndex((item) => item.id === movie.id);
  let updated: MovieItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = movie;
  } else {
    updated = [...current, movie];
  }
  setCachedMovies(updated);

  return movie.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const res = await fetch(`/api/movies?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete movie from database (HTTP ${res.status})`);
  }

  const current = getCachedMovies().filter((m) => m.id !== id);
  setCachedMovies(current);
};

export const saveMoviesOrder = async (movies: MovieItem[]): Promise<void> => {
  const ordered = movies.map((item, idx) => ({ ...item, order: idx }));
  const res = await fetch('/api/movies', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: ordered }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save movie order to database (HTTP ${res.status})`);
  }

  setCachedMovies(ordered);
};
