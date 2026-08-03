import type { LogoItem, MovieItem } from '../types';

// ========================================================
// GLOBAL MASTER CLOUD DATABASE & LOCAL DUAL SYNC
// Unsigned Cloud REST Storage (Master ID: ff8081819f7e10ae019fc89f08c66ad0)
// LocalStorage caching for 0ms instant loading & offline resilience.
// ========================================================
const CLOUD_DB_OBJECT_ID = 'ff8081819f7e10ae019fc89f08c66ad0';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${CLOUD_DB_OBJECT_ID}`;

const LOGOS_STORAGE_KEY = 'freshers_arena_logos_v3';
const MOVIES_STORAGE_KEY = 'freshers_arena_movies_v3';

// Local storage helpers
const getLocalLogos = (): LogoItem[] => {
  try {
    const raw = localStorage.getItem(LOGOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalLogos = (items: LogoItem[]) => {
  try {
    localStorage.setItem(LOGOS_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const getLocalMovies = (): MovieItem[] => {
  try {
    const raw = localStorage.getItem(MOVIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalMovies = (items: MovieItem[]) => {
  try {
    localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

// Compact object formatters (eliminates redundant duplicate field bloat)
const compactMovie = (m: MovieItem): MovieItem => ({
  id: m.id,
  title: (m.title || (m as any).movieTitle || 'Untitled Movie').trim(),
  dialogue: (m.dialogue || (m as any).dialogueText || 'Guess the movie from the clip!').trim(),
  videoUrl: (m.videoUrl || m.videoData || '').trim(),
  hint: m.hint ? m.hint.trim() : undefined,
  order: m.order ?? 0,
  createdAt: m.createdAt || Date.now(),
});

const compactLogo = (l: LogoItem): LogoItem => ({
  id: l.id,
  title: (l.title || l.name || 'Untitled Logo').trim(),
  imageUrl: (l.imageUrl || l.imageData || '').trim(),
  order: l.order ?? 0,
  createdAt: l.createdAt || Date.now(),
});

// ========================================================
// LOGO BACKEND DATABASE OPERATIONS
// ========================================================

export const getAllLogos = async (): Promise<LogoItem[]> => {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.logos)) {
        const cloudLogos: LogoItem[] = json.data.logos.map((l: any) => ({
          ...l,
          name: l.title || l.name || 'Untitled Logo',
          imageData: l.imageUrl || l.imageData,
        }));

        setLocalLogos(cloudLogos);
        return cloudLogos;
      }
    }
  } catch (err) {
    console.warn('Cloud fetch logos failed, using local fallback:', err);
  }

  const local = getLocalLogos();
  return local.map((l: any) => ({
    ...l,
    name: l.title || l.name || 'Untitled Logo',
    imageData: l.imageUrl || l.imageData,
  }));
};

export const saveLogo = async (logo: LogoItem): Promise<string> => {
  const clean = compactLogo(logo);

  // 1. Save to LocalStorage
  const local = getLocalLogos();
  const idx = local.findIndex((l) => l.id === clean.id);
  if (idx >= 0) {
    local[idx] = clean;
  } else {
    local.push(clean);
  }
  setLocalLogos(local);

  // 2. Save to Cloud REST API
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      const currentData = json.data || { logos: [], movies: [], settings: {} };
      const cloudLogos: LogoItem[] = Array.isArray(currentData.logos) ? currentData.logos : [];
      const cIdx = cloudLogos.findIndex((l) => l.id === clean.id);
      if (cIdx >= 0) {
        cloudLogos[cIdx] = clean;
      } else {
        cloudLogos.push(clean);
      }
      currentData.logos = cloudLogos;

      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'freshers_arena_master_db',
          data: currentData,
        }),
      });
    }
  } catch (err) {
    console.warn('Cloud save logo failed:', err);
  }

  return clean.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  const local = getLocalLogos().filter((l) => l.id !== id);
  setLocalLogos(local);

  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      const currentData = json.data || { logos: [], movies: [], settings: {} };
      currentData.logos = (currentData.logos || []).filter((l: any) => l.id !== id);
      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'freshers_arena_master_db',
          data: currentData,
        }),
      });
    }
  } catch (err) {
    console.warn('Cloud delete logo failed:', err);
  }
};

export const saveLogosOrder = async (logos: LogoItem[]): Promise<void> => {
  const ordered = logos.map((item, idx) => ({ ...compactLogo(item), order: idx }));
  setLocalLogos(ordered);

  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      const currentData = json.data || { logos: [], movies: [], settings: {} };
      currentData.logos = ordered;
      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'freshers_arena_master_db',
          data: currentData,
        }),
      });
    }
  } catch {}
};

// ========================================================
// MOVIE BACKEND DATABASE OPERATIONS
// ========================================================

export const getAllMovies = async (): Promise<MovieItem[]> => {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.movies)) {
        const cloudMovies: MovieItem[] = json.data.movies.map((m: any) => ({
          ...m,
          movieTitle: m.title || m.movieTitle,
          videoData: m.videoUrl || m.videoData,
          dialogueText: m.dialogue || m.dialogueText,
        }));

        setLocalMovies(cloudMovies);
        return cloudMovies;
      }
    }
  } catch (err) {
    console.warn('Cloud fetch movies failed, using local fallback:', err);
  }

  const local = getLocalMovies();
  return local.map((m: any) => ({
    ...m,
    movieTitle: m.title || m.movieTitle,
    videoData: m.videoUrl || m.videoData,
    dialogueText: m.dialogue || m.dialogueText,
  }));
};

export const saveMovie = async (movie: MovieItem): Promise<string> => {
  const clean = compactMovie(movie);

  // 1. Save to LocalStorage
  const local = getLocalMovies();
  const idx = local.findIndex((m) => m.id === clean.id);
  if (idx >= 0) {
    local[idx] = clean;
  } else {
    local.push(clean);
  }
  setLocalMovies(local);

  // 2. Save to Cloud REST API
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      const currentData = json.data || { logos: [], movies: [], settings: {} };
      const cloudMovies: MovieItem[] = Array.isArray(currentData.movies) ? currentData.movies : [];
      const cIdx = cloudMovies.findIndex((m) => m.id === clean.id);
      if (cIdx >= 0) {
        cloudMovies[cIdx] = clean;
      } else {
        cloudMovies.push(clean);
      }
      currentData.movies = cloudMovies;

      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'freshers_arena_master_db',
          data: currentData,
        }),
      });
    }
  } catch (err) {
    console.warn('Cloud save movie failed:', err);
  }

  return clean.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const local = getLocalMovies().filter((m) => m.id !== id);
  setLocalMovies(local);

  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      const currentData = json.data || { logos: [], movies: [], settings: {} };
      currentData.movies = (currentData.movies || []).filter((m: any) => m.id !== id);
      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'freshers_arena_master_db',
          data: currentData,
        }),
      });
    }
  } catch (err) {
    console.warn('Cloud delete movie failed:', err);
  }
};

export const saveMoviesOrder = async (movies: MovieItem[]): Promise<void> => {
  const ordered = movies.map((item, idx) => ({ ...compactMovie(item), order: idx }));
  setLocalMovies(ordered);

  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      const currentData = json.data || { logos: [], movies: [], settings: {} };
      currentData.movies = ordered;
      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'freshers_arena_master_db',
          data: currentData,
        }),
      });
    }
  } catch {}
};
