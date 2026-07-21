'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { resetPassword } from '@/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setIsSaving(true);
    try {
      await resetPassword(token, password);
      router.push('/account/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre sıfırlanamadı.');
      setIsSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <KeyRound className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 text-xl font-serif font-bold text-foreground">
          Geçersiz bağlantı
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
        </p>
        <Button asChild className="mt-6">
          <Link href="/account/forgot-password">Yeni Bağlantı İste</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-serif font-bold text-foreground">Yeni Şifre Belirle</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Hesabınız için yeni bir şifre oluşturun.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rpPassword">Yeni Şifre</Label>
          <Input
            id="rpPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rpConfirm">Yeni Şifre (Tekrar)</Label>
          <Input
            id="rpConfirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isSaving || !password || !confirmPassword} className="w-full">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Şifreyi Sıfırla
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-32">
      <div className="w-full max-w-md">
        <Link
          href="/account/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Girişe Dön
        </Link>
        <div className="mt-6 rounded-lg border border-border p-8">
          <Suspense
            fallback={
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
