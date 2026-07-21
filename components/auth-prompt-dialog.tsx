'use client';

import Link from 'next/link';
import { create } from 'zustand';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface AuthPromptState {
  open: boolean;
  openPrompt: () => void;
  close: () => void;
}

export const useAuthPrompt = create<AuthPromptState>((set) => ({
  open: false,
  openPrompt: () => set({ open: true }),
  close: () => set({ open: false }),
}));

export function AuthPromptDialog() {
  const { open, close } = useAuthPrompt();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Heart className="h-6 w-6" />
          </div>
          <DialogTitle>Favorilere eklemek için üye olun</DialogTitle>
          <DialogDescription>
            Beğendiğiniz ürünleri kaydetmek için giriş yapmanız gerekiyor.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full" onClick={close}>
            <Link href="/account/register">Üye Ol</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" onClick={close}>
            <Link href="/account/login">Giriş Yap</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
