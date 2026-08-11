'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAppSelector } from '@/store/hooks';
import { stateOptions } from '@/adapters/Constants';
import {
  addAddress,
  addressFromSaved,
  deleteAddress,
  emptyAddressForm,
  extractAddresses,
  listAddresses,
  updateAddress,
  validateAddress,
  type AddressFormData,
  type SavedAddress,
} from '@/services/addressService';

type FormErrors = Partial<Record<keyof AddressFormData, string>>;

function validateForm(form: AddressFormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullname.trim()) errors.fullname = 'Full name is required';
  if (form.phone.replace(/\D/g, '').length !== 10) errors.phone = 'Enter a 10-digit phone number';
  if (!form.line1.trim()) errors.line1 = 'Street address is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.region.trim()) errors.region = 'State is required';
  if (!/^\d{5}$/.test(form.postalCode.trim())) errors.postalCode = 'Enter a 5-digit ZIP code';
  return errors;
}

export default function AddressesPage({
  onNotify,
}: {
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}) {
  const user = useAppSelector((s) => s.auth.user);
  const selectedCompanyId = useAppSelector((s) => s.auth.selectedCompanyId);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editId, setEditId] = useState('');
  const [form, setForm] = useState<AddressFormData>(emptyAddressForm());
  const [errors, setErrors] = useState<FormErrors>({});

  const token = user?.token || user?.accessToken || '';

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await listAddresses(user, selectedCompanyId || undefined);
      setAddresses(extractAddresses(res));
    } catch (e) {
      onNotify?.(e instanceof Error ? e.message : 'Failed to load addresses', 'error');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedCompanyId, onNotify]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openAdd = () => {
    setIsNew(true);
    setEditIndex(null);
    setEditId('');
    setForm(emptyAddressForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (address: SavedAddress, index: number) => {
    if (address.isCompany) {
      onNotify?.('Company addresses cannot be edited', 'info');
      return;
    }
    setIsNew(false);
    setEditIndex(typeof address.addressIndex === 'number' ? address.addressIndex : index);
    setEditId(String(address.id || address._id || ''));
    setForm(addressFromSaved(address));
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload: Record<string, unknown> = {
      uid: user.userId,
      fullname: form.fullname.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      postalCode: form.postalCode.trim(),
      region: form.region,
      country: 'USA',
      isDefault: false,
      emailId: user.emailId || user.email,
      addressIndex: editIndex ?? undefined,
    };
    if (!isNew && editId) payload.id = editId;
    else if (!isNew && editIndex != null) payload.id = editIndex;

    setSaving(true);
    try {
      const validated = await validateAddress(payload, token);
      const messages = validated?.data?.messages || validated?.messages;
      if (Array.isArray(messages) && messages.length) {
        onNotify?.(messages.map((m: any) => m.summary).filter(Boolean).join(' ') || 'Validation failed', 'error');
        return;
      }
      const res = isNew ? await addAddress(payload, token) : await updateAddress(payload, token);
      if (res?.error) {
        onNotify?.(res.message || 'Could not save address', 'error');
        return;
      }
      onNotify?.('Address saved', 'success');
      setModalOpen(false);
      await refresh();
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Could not save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (address: SavedAddress, index: number) => {
    if (!user || !token || address.isCompany) return;
    const id = address.addressIndex ?? address.id ?? address._id ?? index;
    try {
      const res = await deleteAddress({ id, emailId: user.emailId || user.email }, token);
      if (res?.error) {
        onNotify?.(res.message || 'Could not delete address', 'error');
        return;
      }
      onNotify?.('Address deleted', 'success');
      await refresh();
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Could not delete address', 'error');
    }
  };

  return (
    <AccountLayout
      title="Addresses"
      subtitle="Saved shipping addresses for checkout."
      headerRight={
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#C8A45D] text-black text-sm font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add address
        </button>
      }
    >
      {loading ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-16 text-center text-[#AEB4C0]">
          Loading addresses…
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-12 text-center">
          <MapPin className="w-10 h-10 text-[#C8A45D] mx-auto mb-3" />
          <p className="text-[#AEB4C0]">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address, index) => (
            <div key={address._id || address.id || index} className="bg-[#171A21] rounded-2xl border border-white/10 p-5">
              <p className="font-bold text-[#F7F4EC]">{address.fullname}</p>
              <p className="text-sm text-[#AEB4C0] mt-2 leading-relaxed">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
                <br />
                {[address.city, address.region, address.postalCode].filter(Boolean).join(', ')}
                {address.phone ? (
                  <>
                    <br />
                    {address.phone}
                  </>
                ) : null}
              </p>
              {!address.isCompany && (
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => openEdit(address, index)} className="text-xs text-[#C8A45D] cursor-pointer inline-flex items-center gap-1">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(address, index)} className="text-xs text-red-400 cursor-pointer inline-flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="w-full max-w-lg bg-[#171A21] border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white">{isNew ? 'Add address' : 'Edit address'}</h3>
              <button type="button" onClick={() => !saving && setModalOpen(false)} className="text-[#AEB4C0] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {([
              ['fullname', 'Full name'],
              ['phone', 'Phone'],
              ['line1', 'Street'],
              ['line2', 'Apt / suite'],
              ['city', 'City'],
              ['postalCode', 'ZIP'],
            ] as Array<[keyof AddressFormData, string]>).map(([key, label]) => (
              <div key={key}>
                <input
                  value={form[key]}
                  onChange={(e) => {
                    let next = e.target.value;
                    if (key === 'phone') next = next.replace(/\D/g, '').slice(0, 10);
                    if (key === 'postalCode') next = next.replace(/\D/g, '').slice(0, 5);
                    setForm((prev) => ({ ...prev, [key]: next }));
                    setErrors((prev) => ({ ...prev, [key]: undefined }));
                  }}
                  placeholder={label}
                  className="w-full h-11 px-3 rounded-xl border border-white/10 bg-[#11141A] text-white text-sm"
                />
                {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
              </div>
            ))}
            <select
              value={form.region}
              onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl border border-white/10 bg-[#11141A] text-white text-sm"
            >
              <option value="">Select state</option>
              {stateOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {errors.region && <p className="text-xs text-red-400">{errors.region}</p>}
            <button type="submit" disabled={saving} className="w-full h-11 rounded-xl bg-[#C8A45D] text-black font-bold cursor-pointer disabled:opacity-50">
              {saving ? 'Saving…' : 'Save address'}
            </button>
          </form>
        </div>
      )}
    </AccountLayout>
  );
}
