'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type AddressItem,
  type CreateAddressInput,
} from '@/lib/owuan/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const defaultForm: CreateAddressInput & { uid?: string } = {
  title: 'Adresim',
  address: '',
  city: '',
  state: '',
  zip: '06150',
  country: '792',
  addressType: 'shipping',
  isDefault: false,
};

export default function AddressesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAddressInput & { uid?: string }>(defaultForm);

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
      loadAddresses();
    }
  }, [mounted, user]);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const list = await getAddresses();
      setAddresses(list);
    } catch {
      setError('Failed to load addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (addr: AddressItem) => {
    setForm({
      uid: addr.uid,
      title: addr.title,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.uid);
    setShowForm(true);
    setError('');
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSave = async () => {
    if (!form.address || !form.city || !form.state) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await createAddress(form);
      }
      setShowForm(false);
      setEditingId(null);
      await loadAddresses();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(uid);
      await loadAddresses();
    } catch {
      setError('Failed to delete address.');
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

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Account
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          My Addresses
        </h1>
        <Button onClick={openCreateForm} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mt-6 rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {editingId ? 'Edit Address' : 'New Address'}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addrTitle">Address Title</Label>
              <Input
                id="addrTitle"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Home, Work, etc."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addrLine">Address *</Label>
              <Input
                id="addrLine"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, building, apartment number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addrCity">City *</Label>
              <Input
                id="addrCity"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addrState">District *</Label>
              <Input
                id="addrState"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="District"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addrZip">Postal Code</Label>
              <Input
                id="addrZip"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                placeholder="06150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addrCountry">Country</Label>
              <Input
                id="addrCountry"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="792"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addrType">Address Type</Label>
              <Select
                value={form.addressType || 'shipping'}
                onValueChange={(v) =>
                  setForm({ ...form, addressType: v as 'shipping' | 'billing' })
                }
              >
                <SelectTrigger id="addrType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="addrDefault"
                checked={form.isDefault || false}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
                className="h-4 w-4 rounded border-border accent-foreground"
              />
              <Label htmlFor="addrDefault" className="cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Update' : 'Save'}
            </Button>
            <Button variant="outline" onClick={cancelForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <MapPin className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No saved addresses
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an address for faster checkout.
          </p>
          <Button onClick={openCreateForm} className="mt-6">
            Add Address
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.uid}
              className="rounded-lg border border-border p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">{addr.title}</h3>
                  {addr.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.uid)}
                    className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                <p>{addr.address}</p>
                <p>
                  {addr.city}, {addr.state} {addr.zip}
                </p>
              </div>
              <Badge variant="outline" className="mt-3 text-xs">
                {addr.addressType === 'shipping' ? 'Shipping' : 'Billing'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
