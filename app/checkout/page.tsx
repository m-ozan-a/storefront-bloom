'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Lock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/lib/owuan/stores';
import { formatPrice } from '@/lib/owuan';
import { useAuth } from '@/components/auth';
import { guestCheckout, memberCheckout } from '@/lib/owuan/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'member'>('guest');
  const router = useRouter();

  // Guest form
  const [guestEmail, setGuestEmail] = useState('');
  const [guestFullName, setGuestFullName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestState, setGuestState] = useState('');
  const [guestZip, setGuestZip] = useState('06150');
  const [orderNote, setOrderNote] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) setCheckoutMode('member');
  }, [user]);

  if (!mounted) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
          <h1 className="mt-6 text-2xl font-serif font-bold text-foreground">
            Sepetiniz boş
          </h1>
          <p className="mt-2 text-muted-foreground">
            Alışverişe devam etmek için ürün ekleyin
          </p>
          <Button asChild className="mt-6">
            <Link href="/search">Alışverişe Başla</Link>
          </Button>
        </div>
      </main>
    );
  }

  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  const shipping = subtotal >= 1500 ? 0 : 49.99;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping;

  const handleGuestCheckout = async () => {
    setError('');
    if (!guestEmail || !guestFullName || !guestPhone || !guestAddress || !guestCity || !guestState) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await guestCheckout({
        email: guestEmail,
        fullName: guestFullName,
        phone: guestPhone,
        address: {
          title: 'Adresim',
          address: guestAddress,
          city: guestCity,
          state: guestState,
          zip: guestZip,
          country: '792',
        },
        note: orderNote || undefined,
      });
      clearCart();
      router.push(`/checkout/success?orderId=${result.orderNumber}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sipariş sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberCheckout = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await memberCheckout('', orderNote || undefined);
      clearCart();
      router.push(`/checkout/success?orderId=${result.orderNumber}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sipariş sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Alışverişe Devam Et
      </Link>

      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
        Ödeme
      </h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Sipariş Özeti ({cart.totalQuantity} ürün)
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {cart.lines.map((item) => (
              <li key={item.id} className="flex gap-4 py-6">
                <Link
                  href={`/product/${item.merchandise.product.handle}`}
                  className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-secondary"
                >
                {item.merchandise.product.featuredImage ? (
                  <Image
                    src={item.merchandise.product.featuredImage.url}
                    alt={item.merchandise.product.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <Link
                        href={`/product/${item.merchandise.product.handle}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {item.merchandise.product.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.merchandise.selectedOptions.map((o) => o.value).join(' / ')}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">
                      {formatPrice(item.cost.totalAmount.amount)}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                        aria-label="Azalt"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                        aria-label="Arttır"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      Kaldır
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Checkout Form */}
          <div className="border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Sipariş Bilgileri
            </h2>

            {!user && (
              <div className="mb-6 flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setCheckoutMode('guest')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    checkoutMode === 'guest'
                      ? 'bg-foreground text-background'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Üye Olmadan Devam Et
                </button>
                <button
                  onClick={() => setCheckoutMode('member')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    checkoutMode === 'member'
                      ? 'bg-foreground text-background'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Üye Olarak Devam Et
                </button>
              </div>
            )}

            {checkoutMode === 'guest' && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guestFullName">Ad Soyad</Label>
                    <Input
                      id="guestFullName"
                      value={guestFullName}
                      onChange={(e) => setGuestFullName(e.target.value)}
                      placeholder="Adınız soyadınız"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestEmail">E-posta</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Telefon</Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="5XX XXX XX XX"
                    required
                  />
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Teslimat Adresi</p>
                  <div className="space-y-3">
                    <Input
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      placeholder="Adres satırı"
                      required
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        value={guestCity}
                        onChange={(e) => setGuestCity(e.target.value)}
                        placeholder="Şehir"
                        required
                      />
                      <Input
                        value={guestState}
                        onChange={(e) => setGuestState(e.target.value)}
                        placeholder="İlçe"
                        required
                      />
                      <Input
                        value={guestZip}
                        onChange={(e) => setGuestZip(e.target.value)}
                        placeholder="Posta Kodu"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderNote">Sipariş Notu (İsteğe bağlı)</Label>
                  <Input
                    id="orderNote"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Siparişinizle ilgili notunuz..."
                  />
                </div>
              </div>
            )}

            {checkoutMode === 'member' && !user && (
              <div className="rounded-lg bg-secondary p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Üye siparişi vermek için giriş yapmanız gerekiyor.
                </p>
                <Button asChild>
                  <Link href="/account/login">Giriş Yap</Link>
                </Button>
              </div>
            )}

            {checkoutMode === 'member' && user && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>{user.name}</strong> olarak giriş yaptınız. ({user.email})
                </p>
                <div className="space-y-2">
                  <Label htmlFor="orderNote">Sipariş Notu (İsteğe bağlı)</Label>
                  <Input
                    id="orderNote"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Siparişinizle ilgili notunuz..."
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Sipariş Toplamı
            </h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span className="font-medium text-foreground">
                  {formatPrice(subtotal.toFixed(2))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kargo</span>
                <span className="font-medium text-foreground">
                  {shipping === 0 ? 'Ücretsiz' : formatPrice(shipping.toFixed(2))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">KDV (%20)</span>
                <span className="font-medium text-foreground">
                  {formatPrice(tax.toFixed(2))}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Toplam</span>
                  <span>{formatPrice(total.toFixed(2))}</span>
                </div>
              </div>
              {subtotal < 1500 && (
                <p className="text-xs text-muted-foreground">
                  1500 TL üzeri alışverişlerde kargo ücretsiz.
                </p>
              )}
            </div>

            <Button
              onClick={checkoutMode === 'guest' ? handleGuestCheckout : handleMemberCheckout}
              disabled={isSubmitting || (checkoutMode === 'member' && !user)}
              className="mt-6 w-full h-12 text-base"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Sipariş Veriliyor...' : 'Siparişi Tamamla'}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Siparişi tamamlayarak Kullanım Koşulları ve Gizlilik Politikasını kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
