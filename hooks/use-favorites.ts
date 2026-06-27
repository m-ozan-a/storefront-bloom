'use client';

import { useCallback, useEffect, useState } from 'react';
import { getFavorites, addFavorite, removeFavorite, type FavoriteItem } from '@/lib/owuan/client';

function hasToken(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem('owuan-auth-token');
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const enabled = hasToken();

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getFavorites();
    setFavorites(data);
    setIds(new Set(data.map((f) => f.product?.id).filter(Boolean) as string[]));
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorited = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!enabled) return;
      const wasFav = ids.has(productId);
      setIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        if (wasFav) {
          await removeFavorite(productId);
          setFavorites((prev) => prev.filter((f) => f.product?.id !== productId));
        } else {
          await addFavorite(productId);
          await refresh();
        }
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasFav) next.add(productId);
          else next.delete(productId);
          return next;
        });
      }
    },
    [enabled, ids, refresh]
  );

  return { favorites, loading, enabled, isFavorited, toggleFavorite, refresh };
}
