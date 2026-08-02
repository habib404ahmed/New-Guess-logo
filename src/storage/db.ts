import type { LogoItem, MovieItem } from '../types';

const LOGOS_STORAGE_KEY = 'freshers_arena_cloud_logos';
const MOVIES_STORAGE_KEY = 'freshers_arena_cloud_movies';
const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019fc3ca196d641d';

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

// Fallback direct cloud fetch for static environments
const fetchDirectCloud = async (key: 'logos' | 'movies'): Promise<any[]> => {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data[key])) {
        return json.data[key];
      }
    }
  } catch (err) {
    console.warn(`Direct cloud fetch failed for ${key}:`, err);
  }
  return [];
};

// ==========================================
// LOGO STORAGE OPERATIONS (CLOUD & DATABASE)
// ==========================================

export const getAllLogos = async (): Promise<LogoItem[]> => {
  try {
    const res = await fetch('/api/logos');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCachedLogos(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch logos from backend API, checking direct cloud store:', err);
  }

  // Check zero-config cloud metadata store
  const cloudItems = await fetchDirectCloud('logos');
  if (cloudItems && cloudItems.length > 0) {
    setCachedLogos(cloudItems);
    return cloudItems;
  }

  return getCachedLogos();
};

export const saveLogo = async (logo: LogoItem): Promise<string> => {
  // Update local cache immediately for instant UI update
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
    await fetch('/api/logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logo),
    });
  } catch (err) {
    console.warn('Network error saving logo via backend API:', err);
  }

  return logo.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  const current = getCachedLogos().filter((l) => l.id !== id);
  setCachedLogos(current);

  try {
    await fetch(`/api/logos?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Network error deleting logo via backend API:', err);
  }
};

export const saveLogosOrder = async (logos: LogoItem[]): Promise<void> => {
  const ordered = logos.map((item, idx) => ({ ...item, order: idx }));
  setCachedLogos(ordered);

  try {
    await fetch('/api/logos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ordered }),
    });
  } catch (err) {
    console.warn('Network error saving logo order:', err);
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
      if (Array.isArray(data) && data.length > 0) {
        setCachedMovies(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch movies from backend API, checking direct cloud store:', err);
  }

  const cloudItems = await fetchDirectCloud('movies');
  if (cloudItems && cloudItems.length > 0) {
    setCachedMovies(cloudItems);
    return cloudItems;
  }

  return getCachedMovies();
};

export const saveMovie = async (movie: MovieItem): Promise<string> => {
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
    await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
  } catch (err) {
    console.warn('Network error saving movie via backend API:', err);
  }

  return movie.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const current = getCachedMovies().filter((m) => m.id !== id);
  setCachedMovies(current);

  try {
    await fetch(`/api/movies?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Network error deleting movie via backend API:', err);
  }
};

export const saveMoviesOrder = async (movies: MovieItem[]): Promise<void> => {
  const ordered = movies.map((item, idx) => ({ ...item, order: idx }));
  setCachedMovies(ordered);

  try {
    await fetch('/api/movies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ordered }),
    });
  } catch (err) {
    console.warn('Network error saving movie order:', err);
  }
};
