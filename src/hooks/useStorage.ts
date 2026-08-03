import { useState, useEffect } from 'react';
import { getAllLogos, getAllMovies } from '../storage/db';
import type { LogoItem, MovieItem } from '../types';

export const useStorage = () => {
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const loadedLogos = await getAllLogos();
      const loadedMovies = await getAllMovies();
      console.log('Logos loaded:', loadedLogos);
      console.log('Movies loaded:', loadedMovies);
      setLogos(loadedLogos);
      setMovies(loadedMovies);
    } catch (err) {
      console.error('Failed to load items from backend database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { logos, movies, loading, refresh };
};
