'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { changePassword, deleteAccount } from '@/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function SecurityPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/account/login');
    }
  }, [mounted, authLoading, user, router]);

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Şifreniz güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Şifre değiştirilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Hesabınız kalıcı olarak silinecek. Emin misiniz?')) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      await signOut();
      router.push('/');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Hesap silinemedi.');
      setIsDeleting(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="container mx-auto px-4 pt-8 pb-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Hesabıma Dön
      </Link>

      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">Hesap Güvenliği</h1>

      <div className="mt-8 max-w-lg space-y-8">
        {/* Şifre değiştirme */}
        <div className="rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground">Şifre Değiştir</h2>

          {passwordError && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              {passwordSuccess}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Şifreyi Güncelle
            </Button>
          </div>
        </div>

        {/* Hesap silme */}
        <div className="rounded-lg border border-destructive/50 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <ShieldAlert className="h-4 w-4" />
            Hesabı Sil
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hesabınız kalıcı olarak silinir ve bu işlem geri alınamaz.
          </p>

          {deleteError && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {deleteError}
            </div>
          )}

          <div className="mt-4 flex items-start gap-3">
            <Checkbox
              id="deleteConfirm"
              checked={deleteConfirmed}
              onCheckedChange={(v) => setDeleteConfirmed(v === true)}
            />
            <label htmlFor="deleteConfirm" className="cursor-pointer text-sm text-muted-foreground">
              Hesabımın kalıcı olarak silineceğini anladım ve onaylıyorum.
            </label>
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={!deleteConfirmed || isDeleting}
            className="mt-4 w-full"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hesabımı Kalıcı Olarak Sil
          </Button>
        </div>
      </div>
    </main>
  );
}
