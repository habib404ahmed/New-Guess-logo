import type { LogoItem, MovieItem } from '../types';

// ========================================================
// LOGO BACKEND DATABASE OPERATIONS
// Backend REST API is the EXCLUSIVE single source of truth.
// ZERO browser localStorage, ZERO IndexedDB, ZERO local fallbacks.
// ========================================================

export const getAllLogos = async (): Promise<LogoItem[]> => {
  try {
    const res = await fetch('/api/logos');
    if (res.ok) {
      const json = await res.json();
      console.log('RAW API RESPONSE (logos):', json);
      if (Array.isArray(json)) {
        return json;
      }
      if (json && Array.isArray(json.data)) {
        return json.data;
      }
      if (json && Array.isArray(json.logos)) {
        return json.logos;
      }
      if (json && Array.isArray(json.items)) {
        return json.items;
      }
    }
  } catch (err) {
    console.error('API error fetching logos:', err);
  }
  return [];
};

export const saveLogo = async (logo: LogoItem): Promise<string> => {
  const res = await fetch('/api/logos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logo),
  });

  const responseBody = await res.json();
  console.log('POST logo response:', responseBody);

  if (!res.ok) {
    const errMessage = responseBody.error || `Failed to save logo to database (HTTP ${res.status})`;
    throw new Error(errMessage);
  }

  return logo.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  const res = await fetch(`/api/logos?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    let errMessage = `Failed to delete logo (HTTP ${res.status})`;
    try {
      const body = await res.json();
      if (body.error) errMessage = body.error;
    } catch {}
    throw new Error(errMessage);
  }
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
};

// ========================================================
// MOVIE BACKEND DATABASE OPERATIONS
// Backend REST API is the EXCLUSIVE single source of truth.
// ZERO browser localStorage, ZERO IndexedDB, ZERO local fallbacks.
// ========================================================

export const getAllMovies = async (): Promise<MovieItem[]> => {
  try {
    const res = await fetch('/api/movies');
    if (res.ok) {
      const json = await res.json();
      console.log('RAW API RESPONSE (movies):', json);
      if (Array.isArray(json)) {
        return json;
      }
      if (json && Array.isArray(json.data)) {
        return json.data;
      }
      if (json && Array.isArray(json.movies)) {
        return json.movies;
      }
      if (json && Array.isArray(json.items)) {
        return json.items;
      }
    }
  } catch (err) {
    console.error('API error fetching movies:', err);
  }
  return [];
};

export const saveMovie = async (movie: MovieItem): Promise<string> => {
  const res = await fetch('/api/movies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });

  const responseBody = await res.json();
  console.log('POST response:', responseBody);

  if (!res.ok) {
    const errMessage = responseBody.error || `Failed to save movie to database (HTTP ${res.status})`;
    throw new Error(errMessage);
  }

  return movie.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const res = await fetch(`/api/movies?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    let errMessage = `Failed to delete movie (HTTP ${res.status})`;
    try {
      const body = await res.json();
      if (body.error) errMessage = body.error;
    } catch {}
    throw new Error(errMessage);
  }
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
};
