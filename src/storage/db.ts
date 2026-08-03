import type { LogoItem, MovieItem } from '../types';

// ========================================================
// GLOBAL MASTER CLOUD DATABASE ENDPOINT
// Unsigned Cloud REST Storage (Master ID: ff8081819f7e10ae019fc89f08c66ad0)
// Works seamlessly across all client devices and serverless environments.
// ========================================================
const CLOUD_DB_OBJECT_ID = 'ff8081819f7e10ae019fc89f08c66ad0';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${CLOUD_DB_OBJECT_ID}`;

// Helper: Fetch cloud DB payload directly from REST endpoint
const fetchCloudPayload = async (): Promise<{ logos: LogoItem[]; movies: MovieItem[]; settings: any }> => {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && typeof json.data === 'object') {
        return {
          logos: Array.isArray(json.data.logos) ? json.data.logos : [],
          movies: Array.isArray(json.data.movies) ? json.data.movies : [],
          settings: json.data.settings || {},
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch cloud payload:', err);
  }
  return { logos: [], movies: [], settings: {} };
};

// Helper: Save cloud DB payload directly to REST endpoint
const saveCloudPayload = async (payload: { logos: LogoItem[]; movies: MovieItem[]; settings: any }): Promise<boolean> => {
  try {
    const putRes = await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'freshers_arena_master_db',
        data: payload,
      }),
    });
    return putRes.ok;
  } catch (err) {
    console.warn('Failed to save cloud payload:', err);
    return false;
  }
};

// ========================================================
// LOGO BACKEND DATABASE OPERATIONS
// ========================================================

export const getAllLogos = async (): Promise<LogoItem[]> => {
  // 1. Try serverless endpoint
  try {
    const res = await fetch('/api/logos');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
      if (Array.isArray(json) && json.length > 0) return json;
    }
  } catch {}

  // 2. Direct Cloud REST API fallback
  const payload = await fetchCloudPayload();
  return payload.logos.map((l: any) => ({
    ...l,
    title: l.title || l.name || 'Untitled Logo',
    name: l.title || l.name || 'Untitled Logo',
    imageUrl: l.imageUrl || l.imageData,
    imageData: l.imageUrl || l.imageData,
  }));
};

export const saveLogo = async (logo: LogoItem): Promise<string> => {
  const payload = await fetchCloudPayload();
  const idx = payload.logos.findIndex((l) => l.id === logo.id);
  if (idx >= 0) {
    payload.logos[idx] = logo;
  } else {
    payload.logos.push(logo);
  }
  await saveCloudPayload(payload);

  // Background sync with serverless endpoint
  try {
    fetch('/api/logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logo),
    }).catch(() => {});
  } catch {}

  return logo.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  const payload = await fetchCloudPayload();
  payload.logos = payload.logos.filter((l) => l.id !== id);
  await saveCloudPayload(payload);

  try {
    fetch(`/api/logos?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  } catch {}
};

export const saveLogosOrder = async (logos: LogoItem[]): Promise<void> => {
  const payload = await fetchCloudPayload();
  payload.logos = logos.map((item, idx) => ({ ...item, order: idx }));
  await saveCloudPayload(payload);
};

// ========================================================
// MOVIE BACKEND DATABASE OPERATIONS
// ========================================================

export const getAllMovies = async (): Promise<MovieItem[]> => {
  // 1. Try serverless endpoint
  try {
    const res = await fetch('/api/movies');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
      if (Array.isArray(json) && json.length > 0) return json;
    }
  } catch {}

  // 2. Direct Cloud REST API fallback
  const payload = await fetchCloudPayload();
  return payload.movies.map((m: any) => ({
    ...m,
    title: m.title || m.movieTitle || 'Untitled Movie',
    movieTitle: m.title || m.movieTitle || 'Untitled Movie',
    videoUrl: m.videoUrl || m.videoData,
    videoData: m.videoUrl || m.videoData,
    dialogue: m.dialogue || m.dialogueText || 'Guess the movie from the clip!',
    dialogueText: m.dialogue || m.dialogueText || 'Guess the movie from the clip!',
  }));
};

export const saveMovie = async (movie: MovieItem): Promise<string> => {
  const payload = await fetchCloudPayload();
  const idx = payload.movies.findIndex((m) => m.id === movie.id);
  if (idx >= 0) {
    payload.movies[idx] = movie;
  } else {
    payload.movies.push(movie);
  }
  await saveCloudPayload(payload);

  // Background sync with serverless endpoint
  try {
    fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    }).catch(() => {});
  } catch {}

  return movie.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const payload = await fetchCloudPayload();
  payload.movies = payload.movies.filter((m) => m.id !== id);
  await saveCloudPayload(payload);

  try {
    fetch(`/api/movies?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  } catch {}
};

export const saveMoviesOrder = async (movies: MovieItem[]): Promise<void> => {
  const payload = await fetchCloudPayload();
  payload.movies = movies.map((item, idx) => ({ ...item, order: idx }));
  await saveCloudPayload(payload);
};
