"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nwacuho-favorite-sessions";

export function useFavoriteSessions() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setFavorites(new Set(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(favorites))
      );
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return { favorites, toggleFavorite };
}
