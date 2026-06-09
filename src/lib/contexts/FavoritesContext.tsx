'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getFavorites,
  setFavorites,
  toggleFavorite as toggleFavoriteStorage,
} from '@/lib/utils/storage';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavoritesState] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return getFavorites();
  });

  useEffect(() => {
    // Listen for cross-tab changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:favorites') {
        setFavoritesState(getFavorites());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = useCallback((toolId: string) => {
    toggleFavoriteStorage(toolId);
    setFavoritesState(getFavorites());
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    setFavoritesState([]);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
    }),
    [favorites, toggleFavorite, isFavorite, clearFavorites]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
