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
  // Update local cache immediately for instant UI responsiveness
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

  try {
    const res = await fetch('/api/logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logo),
    });
    if (!res.ok) {
      console.warn(`Failed to persist logo to cloud database (HTTP ${res.status})`);
    }
  } catch (err) {
    console.warn('Network error saving logo to cloud database:', err);
  }

  return logo.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  // Update local cache immediately for instant UI deletion
  const current = getCachedLogos().filter((l) => l.id !== id);
  setCachedLogos(current);

  try {
    const res = await fetch(`/api/logos?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      console.warn(`Backend delete logo returned HTTP status ${res.status}`);
    }
  } catch (err) {
    console.warn('Network error deleting logo from backend database:', err);
  }
};

export const saveLogosOrder = async (logos: LogoItem[]): Promise<void> => {
  const ordered = logos.map((item, idx) => ({ ...item, order: idx }));
  setCachedLogos(ordered);

  try {
    const res = await fetch('/api/logos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ordered }),
    });
    if (!res.ok) {
      console.warn(`Failed to save logo order to database (HTTP ${res.status})`);
    }
  } catch (err) {
    console.warn('Network error saving logo order to database:', err);
  }
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
  // Update local cache immediately for instant UI responsiveness
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

  try {
    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    if (!res.ok) {
      console.warn(`Failed to persist movie to cloud database (HTTP ${res.status})`);
    }
  } catch (err) {
    console.warn('Network error saving movie to cloud database:', err);
  }

  return movie.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  // Update local cache immediately for instant UI deletion
  const current = getCachedMovies().filter((m) => m.id !== id);
  setCachedMovies(current);

  try {
    const res = await fetch(`/api/movies?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      console.warn(`Backend delete movie returned HTTP status ${res.status}`);
    }
  } catch (err) {
    console.warn('Network error deleting movie from backend database:', err);
  }
};

export const saveMoviesOrder = async (movies: MovieItem[]): Promise<void> => {
  const ordered = movies.map((item, idx) => ({ ...item, order: idx }));
  setCachedMovies(ordered);

  try {
    const res = await fetch('/api/movies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ordered }),
    });
    if (!res.ok) {
      console.warn(`Failed to save movie order to database (HTTP ${res.status})`);
    }
  } catch (err) {
    console.warn('Network error saving movie order to database:', err);
  }
};
