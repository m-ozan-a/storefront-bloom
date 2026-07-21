'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { forgotPassword } from '@/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İstek gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  };

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
          {sent ? (
            <div className="text-center">
              <MailCheck className="mx-auto h-12 w-12 text-emerald-600" />
              <h1 className="mt-4 text-xl font-serif font-bold text-foreground">
                E-postanızı kontrol edin
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.
                Bağlantı 1 saat geçerlidir.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-serif font-bold text-foreground">Şifremi Unuttum</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fpEmail">E-posta</Label>
                  <Input
                    id="fpEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={isSending || !email} className="w-full">
                  {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sıfırlama Bağlantısı Gönder
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
