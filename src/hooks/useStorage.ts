import { useState, useEffect, useCallback } from 'react';
import { getAllLogos, getAllMovies } from '../storage/db';
import type { LogoItem, MovieItem } from '../types';

export const useStorage = () => {
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const loadedLogos = await getAllLogos();
      const loadedMovies = await getAllMovies();

      setLogos(loadedLogos || []);
      setMovies(loadedMovies || []);
    } catch (err) {
      console.error('Failed to load items from backend database:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { logos, movies, loading, refresh, setLogos, setMovies };
};
