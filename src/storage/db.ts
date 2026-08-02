import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { LogoItem, MovieItem } from '../types';

const DB_NAME = 'FreshersArenaDB';
const DB_VERSION = 1;

interface FreshersDB extends DBSchema {
  logos: {
    key: string;
    value: LogoItem;
    indexes: { 'by-created': number };
  };
  movies: {
    key: string;
    value: MovieItem;
    indexes: { 'by-created': number };
  };
}

let dbPromise: Promise<IDBPDatabase<FreshersDB>> | null = null;

export const getDB = (): Promise<IDBPDatabase<FreshersDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<FreshersDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('logos')) {
          const logoStore = db.createObjectStore('logos', { keyPath: 'id' });
          logoStore.createIndex('by-created', 'createdAt');
        }
        if (!db.objectStoreNames.contains('movies')) {
          const movieStore = db.createObjectStore('movies', { keyPath: 'id' });
          movieStore.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
};

// Storage helper placeholders
export const getAllLogos = async (): Promise<LogoItem[]> => {
  const db = await getDB();
  return db.getAllFromIndex('logos', 'by-created');
};

export const saveLogo = async (logo: LogoItem): Promise<string> => {
  const db = await getDB();
  return db.put('logos', logo);
};

export const deleteLogo = async (id: string): Promise<void> => {
  const db = await getDB();
  return db.delete('logos', id);
};

export const getAllMovies = async (): Promise<MovieItem[]> => {
  const db = await getDB();
  return db.getAllFromIndex('movies', 'by-created');
};

export const saveMovie = async (movie: MovieItem): Promise<string> => {
  const db = await getDB();
  return db.put('movies', movie);
};

export const deleteMovie = async (id: string): Promise<void> => {
  const db = await getDB();
  return db.delete('movies', id);
};
