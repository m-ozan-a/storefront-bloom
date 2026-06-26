'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Loader2,
  Check,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import {
  getProfile,
  updateProfile,
  type ProfileData,
} from '@/lib/owuan/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', lastName: '', phone: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/account/login');
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (mounted && user) {
      loadProfile();
    }
  }, [mounted, user]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getProfile();
      if (data) {
        setProfile(data);
        setForm({
          name: data.name || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        });
      }
    } catch {
      setError('Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateProfile({
        name: form.name || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
      });
      setProfile(updated);
      setSuccess('Profile updated successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!user) return null;

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Account
      </Link>

      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
        Profile
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-600">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="mt-8 max-w-lg">
        <div className="rounded-lg border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-foreground">
              <User className="h-7 w-7" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {profile?.fullName || user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.email || user.email}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profileEmail">E-posta</Label>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {profile?.email || user.email}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profileName">Ad</Label>
                <Input
                  id="profileName"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileLastName">Soyad</Label>
                <Input
                  id="profileLastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  placeholder="Soyad"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profilePhone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="5XX XXX XX XX"
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
