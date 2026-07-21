'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/use-favorites';

export function FavoriteButton({ productId, className }: { productId: string; className?: string }) {
  const { enabled, isFavorited, toggleFavorite } = useFavorites();
  if (!enabled) return null;
  const active = isFavorited(productId);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      aria-label={active ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-(--radius) bg-background/80 backdrop-blur-sm transition-all hover:bg-background',
        active && 'text-destructive',
        className
      )}
    >
      <Heart className={cn('h-5 w-5', active && 'fill-current')} />
    </button>
  );
}
