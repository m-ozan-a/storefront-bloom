'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          {mode === 'signin' ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluştur'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'signin'
            ? 'Hesabınıza erişmek için giriş yapın'
            : 'Özel ayrıcalıklar için üye olun'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifreniz"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {mode === 'signin' && (
            <div className="text-right">
              <Link
                href="/account/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Şifremi Unuttum
              </Link>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'signin' ? 'Giriş Yap' : 'Hesap Oluştur'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === 'signin' ? (
          <p className="text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/account/register" className="font-medium text-foreground hover:underline">
              Üye Ol
            </Link>
          </p>
        ) : (
          <p className="text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link href="/account/login" className="font-medium text-foreground hover:underline">
              Giriş Yap
            </Link>
          </p>
        )}
      </div>

      {/* Auth Notice */}
      <div className="mt-8 rounded-lg bg-secondary p-4 text-center">
        <p className="text-xs text-muted-foreground">
          <strong>Hesabınız:</strong> Siparişlerinizi takip etmek, favorilerinizi kaydetmek ve daha hızlı ödeme yapmak için giriş yapın.
        </p>
      </div>
    </div>
  );
}
