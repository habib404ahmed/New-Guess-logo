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

      setLogos((prev) => {
        if (!loadedLogos || loadedLogos.length === 0) return prev;
        const map = new Map<string, LogoItem>();
        prev.forEach((item) => map.set(item.id, item));
        loadedLogos.forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });

      setMovies((prev) => {
        if (!loadedMovies || loadedMovies.length === 0) return prev;
        const map = new Map<string, MovieItem>();
        prev.forEach((item) => map.set(item.id, item));
        loadedMovies.forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });
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
