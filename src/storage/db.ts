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
// LOGO STORAGE OPERATIONS (MONGODB ATLAS)
// ==========================================

export const getAllLogos = async (): Promise<LogoItem[]> => {
  try {
    const res = await fetch('/api/logos');
    if (res.ok) {
      const data: LogoItem[] = await res.json();
      setCachedLogos(data);
      return data;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using cached MongoDB metadata:', err);
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
    const res = await fetch('/api/logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logo),
    });
    if (!res.ok) {
      console.warn('Failed to persist logo to MongoDB Atlas API');
    }
  } catch (err) {
    console.warn('Network error saving logo to MongoDB Atlas:', err);
  }
  return logo.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  const current = getCachedLogos().filter((l) => l.id !== id);
  setCachedLogos(current);

  try {
    await fetch(`/api/logos?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Network error deleting logo from MongoDB Atlas:', err);
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
    console.warn('Network error saving logos order to MongoDB Atlas:', err);
  }
};

// ==========================================
// MOVIE STORAGE OPERATIONS (MONGODB ATLAS)
// ==========================================

export const getAllMovies = async (): Promise<MovieItem[]> => {
  try {
    const res = await fetch('/api/movies');
    if (res.ok) {
      const data: MovieItem[] = await res.json();
      setCachedMovies(data);
      return data;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using cached MongoDB metadata:', err);
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
    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    if (!res.ok) {
      console.warn('Failed to persist movie to MongoDB Atlas API');
    }
  } catch (err) {
    console.warn('Network error saving movie to MongoDB Atlas:', err);
  }
  return movie.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const current = getCachedMovies().filter((m) => m.id !== id);
  setCachedMovies(current);

  try {
    await fetch(`/api/movies?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Network error deleting movie from MongoDB Atlas:', err);
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
    console.warn('Network error saving movies order to MongoDB Atlas:', err);
  }
};
