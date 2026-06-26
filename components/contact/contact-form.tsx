'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = `İletişim formu — ${name}`;
    const body = `Ad Soyad: ${name}\nE-posta: ${from}\nTelefon: ${phone}\n\n${message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">Ad Soyad</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-phone">Telefon</Label>
          <Input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-email">E-posta</Label>
        <Input id="c-email" type="email" value={from} onChange={(e) => setFrom(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-msg">Mesajınız</Label>
        <Textarea id="c-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      <Button type="submit" className="gap-2" disabled={!name || !from || !message}>
        <Send className="h-4 w-4" />
        Gönder
      </Button>
    </form>
  );
}
