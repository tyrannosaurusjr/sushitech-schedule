'use client';

import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sushitech-favorites');
    if (stored) {
      try {
        const favs = JSON.parse(stored);
        setFavorites(new Set(favs));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sushitech-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFavorite = (sessionId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(sessionId)) {
        newFavorites.delete(sessionId);
      } else {
        newFavorites.add(sessionId);
      }
      return newFavorites;
    });
  };

  const isFavorite = (sessionId: number) => favorites.has(sessionId);

  return {
    favorites: Array.from(favorites),
    toggleFavorite,
    isFavorite
  };
}