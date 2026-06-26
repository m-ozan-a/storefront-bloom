'use client';

import { Product } from '@/lib/owuan/types';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: Product[];
  columns?: 1 | 2 | 3 | 4;
  cardStyle?: "classic" | "modern" | "minimal";
}

export function ProductGrid({ products, columns = 4, cardStyle }: ProductGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-foreground">Ürün bulunamadı</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or filter to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          priority={index < 4}
          cardStyle={cardStyle}
        />
      ))}
    </div>
  );
}
