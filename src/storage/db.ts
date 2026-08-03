import type { LogoItem, MovieItem } from '../types';

// ========================================================
// UNLIMITED MASTER CLOUD METADATA STORE (Cloudinary CDN)
// Cloud Name: vjqnrvyr
// Upload Preset: freshers_upload
// Public ID: freshers_master_db_json.json
// ========================================================
const CLOUDINARY_RAW_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/vjqnrvyr/raw/upload';
const CLOUDINARY_RAW_FETCH_URL = 'https://res.cloudinary.com/vjqnrvyr/raw/upload/freshers_master_db_json.json';

const LOGOS_STORAGE_KEY = 'freshers_arena_logos_v4';
const MOVIES_STORAGE_KEY = 'freshers_arena_movies_v4';

const ALL_MOVIE_KEYS = [
  'freshers_arena_movies',
  'freshers_arena_movies_v1',
  'freshers_arena_movies_v2',
  'freshers_arena_movies_v3',
  'freshers_arena_movies_v4',
];

// Clear all legacy storage keys
const clearLegacyMovieKeys = () => {
  ALL_MOVIE_KEYS.forEach((key) => {
    if (key !== MOVIES_STORAGE_KEY) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  });
};

// LocalStorage helpers
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
  clearLegacyMovieKeys();
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

// Compact object formatters (keeps JSON payload lightweight)
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

// Helper: Fetch cloud DB payload from Cloudinary CDN
const fetchCloudPayload = async (): Promise<{ logos: LogoItem[]; movies: MovieItem[]; settings: any }> => {
  try {
    const res = await fetch(`${CLOUDINARY_RAW_FETCH_URL}?t=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      if (json && typeof json === 'object') {
        return {
          logos: Array.isArray(json.logos) ? json.logos : [],
          movies: Array.isArray(json.movies) ? json.movies : [],
          settings: json.settings || {},
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch Cloudinary raw payload:', err);
  }
  return { logos: getLocalLogos(), movies: getLocalMovies(), settings: {} };
};

// Helper: Save cloud DB payload to Cloudinary CDN
const saveCloudPayload = async (payload: { logos: LogoItem[]; movies: MovieItem[]; settings: any }): Promise<boolean> => {
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'freshers_master_db.json');
    formData.append('upload_preset', 'freshers_upload');
    formData.append('public_id', 'freshers_master_db_json');

    const res = await fetch(CLOUDINARY_RAW_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save Cloudinary raw payload:', err);
    return false;
  }
};

// ========================================================
// LOGO BACKEND DATABASE OPERATIONS
// ========================================================

export const getAllLogos = async (): Promise<LogoItem[]> => {
  const payload = await fetchCloudPayload();
  const cloudLogos: LogoItem[] = payload.logos.map((l: any) => ({
    ...l,
    name: l.title || l.name || 'Untitled Logo',
    imageData: l.imageUrl || l.imageData,
  }));

  setLocalLogos(cloudLogos);
  return cloudLogos;
};

export const saveLogo = async (logo: LogoItem): Promise<string> => {
  const clean = compactLogo(logo);

  const local = getLocalLogos();
  const idx = local.findIndex((l) => l.id === clean.id);
  if (idx >= 0) {
    local[idx] = clean;
  } else {
    local.push(clean);
  }
  setLocalLogos(local);

  const payload = await fetchCloudPayload();
  const cIdx = payload.logos.findIndex((l) => l.id === clean.id);
  if (cIdx >= 0) {
    payload.logos[cIdx] = clean;
  } else {
    payload.logos.push(clean);
  }
  await saveCloudPayload(payload);

  return clean.id;
};

export const deleteLogo = async (id: string): Promise<void> => {
  const local = getLocalLogos().filter((l) => l.id !== id);
  setLocalLogos(local);

  const payload = await fetchCloudPayload();
  payload.logos = payload.logos.filter((l: any) => l.id !== id);
  await saveCloudPayload(payload);
};

export const saveLogosOrder = async (logos: LogoItem[]): Promise<void> => {
  const ordered = logos.map((item, idx) => ({ ...compactLogo(item), order: idx }));
  setLocalLogos(ordered);

  const payload = await fetchCloudPayload();
  payload.logos = ordered;
  await saveCloudPayload(payload);
};

// ========================================================
// MOVIE BACKEND DATABASE OPERATIONS
// ========================================================

export const getAllMovies = async (): Promise<MovieItem[]> => {
  const payload = await fetchCloudPayload();
  const cloudMovies: MovieItem[] = payload.movies.map((m: any) => ({
    ...m,
    movieTitle: m.title || m.movieTitle,
    videoData: m.videoUrl || m.videoData,
    dialogueText: m.dialogue || m.dialogueText,
  }));

  setLocalMovies(cloudMovies);
  return cloudMovies;
};

export const saveMovie = async (movie: MovieItem): Promise<string> => {
  const clean = compactMovie(movie);

  const local = getLocalMovies();
  const idx = local.findIndex((m) => m.id === clean.id);
  if (idx >= 0) {
    local[idx] = clean;
  } else {
    local.push(clean);
  }
  setLocalMovies(local);

  const payload = await fetchCloudPayload();
  const cIdx = payload.movies.findIndex((m) => m.id === clean.id);
  if (cIdx >= 0) {
    payload.movies[cIdx] = clean;
  } else {
    payload.movies.push(clean);
  }
  await saveCloudPayload(payload);

  return clean.id;
};

export const deleteMovie = async (id: string): Promise<void> => {
  ALL_MOVIE_KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((m: any) => m.id !== id);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      }
    } catch {}
  });

  const payload = await fetchCloudPayload();
  payload.movies = payload.movies.filter((m: any) => m.id !== id);
  await saveCloudPayload(payload);
};

export const saveMoviesOrder = async (movies: MovieItem[]): Promise<void> => {
  const ordered = movies.map((item, idx) => ({ ...compactMovie(item), order: idx }));
  setLocalMovies(ordered);

  const payload = await fetchCloudPayload();
  payload.movies = ordered;
  await saveCloudPayload(payload);
};
