'use client';

import { useState, type FormEvent } from 'react';
import { Send, Loader2, Check } from 'lucide-react';
import { submitContact } from '@/actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function ContactForm({ email: _email }: { email: string }) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    try {
      await submitContact({
        name,
        email: from,
        phone: phone || undefined,
        message,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mesaj gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm text-emerald-600">
        <Check className="h-4 w-4 shrink-0" />
        Mesajınız alındı. En kısa sürede size dönüş yapacağız.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">Ad Soyad</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-phone">Telefon</Label>
          <Input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={50} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-email">E-posta</Label>
        <Input id="c-email" type="email" value={from} onChange={(e) => setFrom(e.target.value)} required maxLength={200} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-msg">Mesajınız</Label>
        <Textarea id="c-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="gap-2" disabled={!name || !from || !message || isSending}>
        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Gönder
      </Button>
    </form>
  );
}
