'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Star, Loader2, Check, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { getReviews, submitReview, type ReviewsData } from '@/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i <= Math.round(value) ? 'fill-primary text-primary' : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productUid }: { productUid: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getReviews(productUid).then(setData).catch(() => {});
  }, [productUid]);

  // Yıldız dağılımı (5→1) — yüklü onaylı yorumlardan hesaplanır
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of data?.reviews ?? []) {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      counts[idx] += 1;
    }
    return counts;
  }, [data]);
  const maxCount = Math.max(1, ...distribution);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Lütfen bir puan seçin.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await submitReview(productUid, {
        rating,
        title: title || undefined,
        body: body || undefined,
      });
      setSuccess('Yorumunuz alındı. Onaylandıktan sonra yayınlanacak.');
      setRating(0);
      setTitle('');
      setBody('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yorum gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasReviews = !!data && data.totalCount > 0 && data.reviews.length > 0;

  return (
    <section className="mt-5 border-t border-border pt-5">
      <h2 className="text-xl font-semibold text-foreground">Değerlendirmeler</h2>

      <div className="mt-4 grid items-start gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          {/* Özet: büyük ortalama + yıldız dağılım çubukları */}
          {hasReviews && (
            <div className="grid gap-5 rounded-lg border border-border/60 bg-card p-5 sm:grid-cols-2">
              <div className="flex flex-col justify-center gap-1">
                <p className="text-4xl font-bold leading-none text-foreground">
                  {data.averageRating.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/5</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.totalCount} değerlendirmeye göre
                </p>
                <Stars value={data.averageRating} className="mt-1" />
              </div>
              <div className="flex flex-col justify-center gap-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star - 1];
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-3 text-right text-xs tabular-nums text-muted-foreground">
                        {star}
                      </span>
                      <Star className="size-3 shrink-0 fill-primary text-primary" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Yorum kartları */}
          {!hasReviews ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Bu ürün için henüz değerlendirme yapılmamış. İlk yorumu siz yazın.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.reviews.map((review) => (
                <li key={review.id} className="rounded-lg bg-muted/40 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium leading-snug text-foreground">
                      {review.title || 'Değerlendirme'}
                    </p>
                    <Stars value={review.rating} />
                  </div>
                  {review.body && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {review.body}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{review.userName}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Doğrulanmış Alışveriş
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Yorum formu */}
        <div className="h-fit rounded-lg border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Değerlendirme Yap</h3>
          {!user ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Değerlendirme yapmak için{' '}
              <Link href="/account/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
                giriş yapın
              </Link>
              .
            </p>
          ) : success ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-600">
              <Check className="h-4 w-4 shrink-0" />
              {success}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Puanınız</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${i} yıldız`}
                    >
                      <Star
                        className={cn(
                          'h-6 w-6 transition-colors',
                          i <= (hoverRating || rating)
                            ? 'fill-primary text-primary'
                            : 'fill-muted text-muted'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewTitle">Başlık</Label>
                <Input
                  id="reviewTitle"
                  value={title}
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kısa bir başlık"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewBody">Yorumunuz</Label>
                <Textarea
                  id="reviewBody"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Ürün hakkındaki deneyiminiz"
                  rows={4}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gönder
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
