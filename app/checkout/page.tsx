'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, Lock, Loader2, CreditCard, Truck, Shield, Gift, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/owuan/stores';
import { useAuth } from '@/components/auth';
import { formatPrice, guestCheckout, memberCheckout, initPayment, getManifest, getCart, getAddresses, getCarrierRates, type ServerCart, type AddressItem } from '@/actions';
import type { ManifestPaymentGateway, ManifestCarrierGateway, ManifestStore } from '@/lib/owuan/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const STEPS = ['İletişim', 'Teslimat', 'Ödeme'] as const;

export default function CheckoutPage() {
  const { cart, removeItem, updateQuantity, clearCart, fetchCart, isLoading: cartLoading } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'member'>('guest');

  const [paymentGateways, setPaymentGateways] = useState<ManifestPaymentGateway[]>([]);
  const [carrierGateways, setCarrierGateways] = useState<ManifestCarrierGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [store, setStore] = useState<ManifestStore | null>(null);
  const [serverCart, setServerCart] = useState<ServerCart | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [calculatedRates, setCalculatedRates] = useState<Record<string, number | null>>({});

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
    if (user) setCheckoutMode('member');
  }, [user]);

  // Üye: kayıtlı adresleri yükle, varsayılanı seç (schema addressId'yi zorunlu tutar)
  useEffect(() => {
    if (!user) return;
    getAddresses().then((list) => {
      setAddresses(list);
      const preferred = list.find((a) => a.isDefault) ?? list[0];
      if (preferred) setSelectedAddressId((cur) => cur || preferred.uid);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (mounted) fetchCart();
  }, [mounted, fetchCart]);

  useEffect(() => {
    getManifest().then((m) => {
      setPaymentGateways(m.paymentGateways || []);
      setCarrierGateways(m.carrierGateways || []);
      setStore(m.store || null);
      // Mağaza misafir alışverişi kapattıysa misafir modu kullanılamaz
      if (m.store && m.store.allowGuestCheckout === false) setCheckoutMode('member');
    }).catch(() => {});
    getCart().then((c) => { if (c) setServerCart(c); }).catch(() => {});
  }, []);

  const guestAllowed = store?.allowGuestCheckout !== false;

  const cartItems = cart.lines.map((l) => ({
    variantId: l.merchandise.id || l.merchandise.product.id,
    quantity: l.quantity,
  }));

  // "calculated" fiyatlı kargo seçilince anlık fiyat sorgula (bir kez, gateway başına)
  useEffect(() => {
    if (!selectedCarrier) return;
    const gw = carrierGateways.find((g) => g.uid === selectedCarrier);
    if (!gw || gw.pricingType !== 'calculated' || selectedCarrier in calculatedRates) return;
    const price = serverCart?.total ?? parseFloat(cart.cost.totalAmount.amount);
    getCarrierRates({ gatewayUid: selectedCarrier, items: cartItems, price })
      .then((rate) => setCalculatedRates((prev) => ({ ...prev, [selectedCarrier]: rate })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCarrier, carrierGateways]);

  if (!mounted) {
    return (
      <main className="w-full px-5 py-5">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <main className="w-full px-5 py-5">
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
          <h1 className="mt-6 text-2xl font-serif font-bold text-foreground">Sepetiniz boş</h1>
          <p className="mt-2 text-muted-foreground">Alışverişe devam etmek için ürün ekleyin</p>
          <Button asChild className="mt-6">
            <Link href="/search">Alışverişe Başla</Link>
          </Button>
        </div>
      </main>
    );
  }

  const paymentOptions = [...paymentGateways].sort((a, b) => a.sortOrder - b.sortOrder);
  const carrierOptions = [...carrierGateways].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const selectedPayment = paymentOptions.find((g) => g.uid === selectedGateway) || null;
  const selectedCarrierGw = carrierOptions.find((g) => g.uid === selectedCarrier) || null;
  const isInternalPayment = selectedPayment?.method === 'internal';
  const isBankTransfer = isInternalPayment && !!store?.ibanDetails;

  const carrierPrice = (g: ManifestCarrierGateway): number => Math.max(0, (g.basePrice ?? 0) - (g.campaignDiscount ?? 0));

  // Tüm tutarlar owuan API'den (getCart) gelir; UI hesap yapmaz.
  const subtotal = serverCart ? serverCart.total - serverCart.taxTotal - serverCart.shippingTotal + serverCart.discountTotal : parseFloat(cart.cost.subtotalAmount.amount);
  const tax = serverCart?.taxTotal ?? 0;
  const shipping = serverCart?.shippingTotal ?? 0;
  const total = serverCart?.total ?? parseFloat(cart.cost.totalAmount.amount);

  // Adım geçiş doğrulaması (eksik bilgiyle ilerleme yok → checkout patlamaz)
  const step1Valid = checkoutMode === 'member' ? !!user : !!(guestFullName && guestEmail && guestPhone);
  const step2Valid = checkoutMode === 'member' ? !!selectedAddressId : !!(guestAddress && guestCity && guestState);

  const canContinue = step === 1 ? step1Valid : step === 2 ? step2Valid : true;

  const handleCheckout = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const result = checkoutMode === 'guest'
        ? await guestCheckout({
            email: guestEmail, fullName: guestFullName, phone: guestPhone,
            address: { title: 'Adresim', address: guestAddress, city: guestCity, state: guestState, zip: guestZip, country: '792' },
            items: cartItems,
            note: orderNote || undefined,
            paymentProvider: selectedGateway || undefined,
            deliveryOptionId: selectedCarrier || undefined,
          })
        : await memberCheckout(selectedAddressId, orderNote || undefined, selectedGateway || undefined, selectedCarrier || undefined);

      if (selectedGateway && !isInternalPayment) {
        const payResult = await initPayment({
          gatewayUid: selectedGateway,
          orderId: result.orderId,
          amount: total.toFixed(2),
          currency: 'TRY',
          returnUrl: `${window.location.origin}/checkout/success?orderId=${result.orderNumber}&uid=${result.orderId}`,
          failUrl: `${window.location.origin}/checkout?error=payment_failed`,
          customer: checkoutMode === 'guest'
            ? { name: guestFullName, email: guestEmail, phone: guestPhone, address: guestAddress }
            : undefined,
        });
        if (payResult.success && payResult.redirectUrl) {
          clearCart();
          window.location.href = payResult.redirectUrl;
          return;
        }
        // Online ödeme başlatılamadı → sepeti KORU, hata göster (yanlışlıkla "başarılı" deme)
        setError(payResult.error || 'Ödeme başlatılamadı, lütfen tekrar deneyin.');
        return;
      }

      clearCart();
      router.push(`/checkout/success?orderId=${result.orderNumber}&uid=${result.orderId}${isBankTransfer ? '&method=bank_transfer' : ''}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sipariş sırasında bir hata oluştu.');
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full px-5 py-5">
      <Link href="/sepet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Sepete Dön
      </Link>

      <div className="mt-4 mb-5 text-center">
        <h1 className="mb-1 text-2xl font-serif font-bold">Güvenli Ödeme</h1>
        <p className="text-sm text-muted-foreground">Siparişinizi birkaç adımda tamamlayın</p>
      </div>

      {/* Adım göstergesi — satırda sadece daire + çizgi var (hepsi 40px yüksek),
          etiketler absolute; böylece çizgiler daire merkeziyle tam hizalı. */}
      <div className="mb-10 flex justify-center">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const n = i + 1;
            return (
              <div key={label} className="flex items-center">
                <div className="relative flex flex-col items-center">
                  <div className={cn(
                    'flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    n <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {n}
                  </div>
                  <span className={cn(
                    'absolute top-full mt-1.5 whitespace-nowrap text-xs transition-colors',
                    n <= step ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </div>
                {n < STEPS.length ? (
                  <div className={cn('mx-2 h-0.5 w-10 rounded-full transition-colors sm:mx-3 sm:w-16', n < step ? 'bg-primary' : 'bg-muted')} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'İletişim Bilgileri'}
                {step === 2 && 'Teslimat Adresi'}
                {step === 3 && 'Ödeme & Kargo'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Sipariş güncellemelerini buraya göndereceğiz'}
                {step === 2 && 'Siparişinizi nereye teslim edelim?'}
                {step === 3 && 'Ödeme bilgileriniz güvenli sağlayıcıya yönlendirilir'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Adım 1: İletişim */}
              {step === 1 ? (
                <div className="flex flex-col gap-4">
                  {!user && guestAllowed ? (
                    <div className="flex overflow-hidden rounded-lg border border-border">
                      <button
                        onClick={() => setCheckoutMode('guest')}
                        className={cn('flex-1 py-3 text-sm font-medium transition-colors', checkoutMode === 'guest' ? 'bg-foreground text-background' : 'bg-background text-muted-foreground hover:text-foreground')}
                      >
                        Üye Olmadan
                      </button>
                      <button
                        onClick={() => setCheckoutMode('member')}
                        className={cn('flex-1 py-3 text-sm font-medium transition-colors', checkoutMode === 'member' ? 'bg-foreground text-background' : 'bg-background text-muted-foreground hover:text-foreground')}
                      >
                        Üye Olarak
                      </button>
                    </div>
                  ) : null}

                  {checkoutMode === 'member' && !user ? (
                    <div className="rounded-lg bg-secondary p-6 text-center">
                      <p className="mb-4 text-muted-foreground">Üye siparişi için giriş yapın.</p>
                      <Button asChild><Link href="/account/login">Giriş Yap</Link></Button>
                    </div>
                  ) : checkoutMode === 'member' && user ? (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">{user.name}</strong> olarak giriş yaptınız ({user.email}).
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="guestEmail">E-posta</Label>
                        <Input id="guestEmail" type="email" placeholder="ornek@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="guestFullName">Ad Soyad</Label>
                          <Input id="guestFullName" placeholder="Adınız soyadınız" value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="guestPhone">Telefon</Label>
                          <Input id="guestPhone" type="tel" placeholder="5XX XXX XX XX" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {/* Adım 2: Teslimat */}
              {step === 2 ? (
                <div className="flex flex-col gap-4">
                  {checkoutMode === 'member' ? (
                    addresses.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {addresses.map((a) => (
                          <label key={a.uid} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors', selectedAddressId === a.uid ? 'border-foreground bg-foreground/5' : 'border-border hover:border-muted-foreground')}>
                            <input type="radio" name="memberAddress" value={a.uid} checked={selectedAddressId === a.uid} onChange={() => setSelectedAddressId(a.uid)} className="mt-1 size-4 accent-foreground" />
                            <div className="flex-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{a.title || 'Adres'}</span>
                                {a.isDefault ? <Badge variant="secondary" className="text-xs">Varsayılan</Badge> : null}
                              </div>
                              <p className="mt-1 text-muted-foreground">{a.address}, {a.state} / {a.city}</p>
                            </div>
                          </label>
                        ))}
                        <Link href="/account/addresses" className="text-sm text-muted-foreground underline hover:text-foreground">Yeni adres ekle</Link>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-secondary p-6 text-center">
                        <p className="mb-4 text-sm text-muted-foreground">Kayıtlı adresiniz yok. Sipariş için önce bir teslimat adresi ekleyin.</p>
                        <Button asChild variant="outline"><Link href="/account/addresses">Adres Ekle</Link></Button>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="guestAddress">Adres</Label>
                        <Input id="guestAddress" placeholder="Mahalle, cadde, kapı no" value={guestAddress} onChange={(e) => setGuestAddress(e.target.value)} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="guestCity">Şehir</Label>
                          <Input id="guestCity" placeholder="İstanbul" value={guestCity} onChange={(e) => setGuestCity(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="guestState">İlçe</Label>
                          <Input id="guestState" placeholder="Kadıköy" value={guestState} onChange={(e) => setGuestState(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="guestZip">Posta Kodu</Label>
                          <Input id="guestZip" placeholder="34000" value={guestZip} onChange={(e) => setGuestZip(e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="orderNote">Sipariş Notu (isteğe bağlı)</Label>
                    <Input id="orderNote" placeholder="Siparişinizle ilgili notunuz..." value={orderNote} onChange={(e) => setOrderNote(e.target.value)} />
                  </div>
                </div>
              ) : null}

              {/* Adım 3: Ödeme & Kargo */}
              {step === 3 ? (
                <div className="flex flex-col gap-6">
                  {paymentOptions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <CreditCard className="size-4" /> Ödeme Yöntemi
                      </Label>
                      {paymentOptions.map((gw) => (
                        <label key={gw.uid} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors', selectedGateway === gw.uid ? 'border-foreground bg-foreground/5' : 'border-border hover:border-muted-foreground')}>
                          <input type="radio" name="paymentGateway" value={gw.uid} checked={selectedGateway === gw.uid} onChange={() => setSelectedGateway(gw.uid)} className="size-4 accent-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{gw.name}</span>
                              {gw.isPrimary ? <Badge variant="secondary" className="text-xs">Önerilen</Badge> : null}
                              {gw.isTestMode ? <Badge variant="outline" className="text-xs">Test</Badge> : null}
                            </div>
                            {gw.method === 'internal' ? (
                              <span className="text-xs text-muted-foreground">Havale / EFT ile ödeme</span>
                            ) : gw.installments && gw.installments.filter((i) => i > 1).length > 0 ? (
                              <span className="text-xs text-muted-foreground">{Math.max(...gw.installments)} taksite kadar</span>
                            ) : null}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {carrierOptions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Truck className="size-4" /> Kargo Seçimi
                      </Label>
                      {carrierOptions.map((gw) => (
                        <label key={gw.uid} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors', selectedCarrier === gw.uid ? 'border-foreground bg-foreground/5' : 'border-border hover:border-muted-foreground')}>
                          <input type="radio" name="carrierGateway" value={gw.uid} checked={selectedCarrier === gw.uid} onChange={() => setSelectedCarrier(gw.uid)} className="size-4 accent-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{gw.name}</span>
                              {gw.isPrimary ? <Badge variant="secondary" className="text-xs">Önerilen</Badge> : null}
                            </div>
                            {gw.campaignLabel ? <span className="text-xs font-medium text-primary">{gw.campaignLabel}</span> : null}
                          </div>
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            {gw.campaignDiscount && gw.campaignDiscount > 0 && gw.basePrice ? (
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(gw.basePrice.toFixed(2))}</span>
                            ) : null}
                            {gw.pricingType === 'calculated'
                              ? (selectedCarrier === gw.uid && !(gw.uid in calculatedRates)
                                  ? 'Hesaplanıyor…'
                                  : typeof calculatedRates[gw.uid] === 'number'
                                    ? formatPrice((calculatedRates[gw.uid] as number).toFixed(2))
                                    : gw.uid in calculatedRates
                                      ? 'Fiyat alınamadı'
                                      : 'Seçince hesaplanır')
                              : carrierPrice(gw) === 0 ? 'Ücretsiz' : formatPrice(carrierPrice(gw).toFixed(2))}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {paymentOptions.length === 0 && carrierOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ödeme ve kargo seçenekleri yükleniyor; siparişi tamamlayabilirsiniz.</p>
                  ) : null}

                  {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
                </div>
              ) : null}

              {/* Navigasyon */}
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="gap-2">
                  <ArrowLeft className="size-4" /> Geri
                </Button>
                {step < 3 ? (
                  <Button onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={!canContinue}>Devam Et</Button>
                ) : (
                  <Button onClick={handleCheckout} disabled={isSubmitting || (checkoutMode === 'member' && !user)} className="gap-2">
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                    {isSubmitting ? 'Sipariş Veriliyor...' : 'Siparişi Tamamla'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sipariş Özeti */}
        <div className="lg:col-span-1">
          <Card className="sticky top-5">
            <CardHeader>
              <CardTitle>Sipariş Özeti ({cart.totalQuantity} ürün)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {cart.lines.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Rozet overflow-hidden'lı Link'in DIŞINDA — kırpılmadan tam daire görünür */}
                    <div className="relative flex-shrink-0">
                      <Link href={`/urun/${item.merchandise.product.handle}`} className="relative block size-16 overflow-hidden rounded-lg bg-secondary">
                        {item.merchandise.product.featuredImage ? (
                          <Image src={item.merchandise.product.featuredImage.url} alt={item.merchandise.product.title} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-6 w-6 text-muted-foreground/30" /></div>
                        )}
                      </Link>
                      <Badge className="absolute -end-1.5 -top-1.5 size-5 justify-center rounded-full border-2 border-card p-0 text-[10px] leading-none">
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/urun/${item.merchandise.product.handle}`} className="block truncate text-sm font-medium hover:underline">
                        {item.merchandise.product.title}
                      </Link>
                      {item.merchandise.selectedOptions.length > 0 ? (
                        <p className="truncate text-xs text-muted-foreground">{item.merchandise.selectedOptions.map((o) => o.value).join(' / ')}</p>
                      ) : null}
                      <p className="mt-1 text-sm font-medium">{formatPrice(item.cost.totalAmount.amount)}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center rounded-md border border-border">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={cartLoading} className="flex size-7 items-center justify-center hover:bg-secondary disabled:opacity-50" aria-label="Azalt"><Minus className="h-3 w-3" /></button>
                          <span className="flex h-7 w-7 items-center justify-center text-xs font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={cartLoading} className="flex size-7 items-center justify-center hover:bg-secondary disabled:opacity-50" aria-label="Arttır"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} disabled={cartLoading} className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50" aria-label="Kaldır"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>{formatPrice(subtotal.toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground"><Truck className="size-3" /> Kargo</span>
                  <span>{shipping === 0 ? 'Ücretsiz' : formatPrice(shipping.toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KDV</span>
                  <span>{formatPrice(tax.toFixed(2))}</span>
                </div>
                {serverCart && serverCart.discountTotal > 0 ? (
                  <div className="flex justify-between text-sm font-medium text-primary">
                    <span>İndirimler</span>
                    <span>-{formatPrice(serverCart.discountTotal.toFixed(2))}</span>
                  </div>
                ) : null}
                {serverCart?.appliedCampaigns?.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs text-muted-foreground">
                    <span className="truncate">{c.description}</span>
                    <span>-{formatPrice(c.discountApplied.toFixed(2))}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Toplam</span>
                <span>{formatPrice(total.toFixed(2))}</span>
              </div>
              <Separator />

              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="size-4 text-primary" /> SSL ile güvenli ödeme</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gift className="size-4 text-primary" /> Kolay iade</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
