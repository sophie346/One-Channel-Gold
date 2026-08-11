'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, RefreshCw, Save } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { fetchUserDetails, getAccountProfile, updateUserProfile } from '@/services/authService';
import { useAppSelector } from '@/store/hooks';
import type { AccountProfile } from '@/types/api';

type FormState = {
  firstname: string;
  lastname: string;
  middlename: string;
  displayName: string;
  contactnumber: string;
  dob: string;
  email: string;
};

function profileToForm(profile: AccountProfile | null, fallbackEmail: string): FormState {
  return {
    firstname: String(profile?.firstname || ''),
    lastname: String(profile?.lastname || ''),
    middlename: String(profile?.middlename || ''),
    displayName: String(profile?.displayName || ''),
    contactnumber: String(profile?.contactnumber || profile?.phone || ''),
    dob: String(profile?.dob || ''),
    email: String(profile?.emailId || profile?.email || fallbackEmail || ''),
  };
}

export default function AccountInfoPage({
  onNotify,
}: {
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}) {
  const user = useAppSelector((s) => s.auth.user);
  const isB2b = useAppSelector((s) => s.auth.isB2b);
  const companies = useAppSelector((s) => s.auth.companies);
  const selectedCompanyId = useAppSelector((s) => s.auth.selectedCompanyId);

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [form, setForm] = useState<FormState>(profileToForm(null, user?.email || ''));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const load = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const details = await fetchUserDetails(user.token);
      if (details.error) {
        onNotify?.(details.message || 'Could not load account details', 'error');
        setProfile(null);
        setForm(profileToForm(null, user.email));
        return;
      }
      const acct = getAccountProfile(details);
      setProfile(acct);
      setForm(profileToForm(acct, user.email));
    } catch (e) {
      onNotify?.(e instanceof Error ? e.message : 'Could not load account details', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, onNotify]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'contactnumber') setPhoneError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    const uid = String(profile?.firebaseUid || user.userId || '').trim();
    if (!uid) {
      onNotify?.('Missing account id — profile cannot be saved until CRM is linked.', 'error');
      return;
    }
    const phoneDigits = form.contactnumber.replace(/\D/g, '');
    if (phoneDigits && phoneDigits.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits.');
      return;
    }
    setSaving(true);
    try {
      const email = form.email.trim() || user.email || user.emailId || '';
      const res = await updateUserProfile(
        {
          uid,
          email,
          emailId: email,
          firstname: form.firstname.trim() || undefined,
          lastname: form.lastname.trim() || undefined,
          middlename: form.middlename.trim() || undefined,
          displayName:
            form.displayName.trim() ||
            [form.firstname, form.lastname].filter(Boolean).join(' ') ||
            undefined,
          contactnumber: phoneDigits,
          dob: form.dob.trim() || undefined,
        },
        user.token
      );
      if (res?.error) {
        onNotify?.(res.message || 'Update failed', 'error');
        return;
      }
      onNotify?.(res.message || 'Account updated', 'success');
      await load();
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout title="Account Information" subtitle="Profile details from your OneGold account.">
      <div className="bg-[#171A21] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-[#F7F4EC]">Profile</h2>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#AEB4C0] hover:text-[#C8A45D] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#AEB4C0] text-sm">Loading account…</div>
        ) : (
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name" value={form.firstname} onChange={(v) => onChange('firstname', v)} />
              <Field label="Last name" value={form.lastname} onChange={(v) => onChange('lastname', v)} />
              <Field label="Middle name" value={form.middlename} onChange={(v) => onChange('middlename', v)} />
              <Field label="Display name" value={form.displayName} onChange={(v) => onChange('displayName', v)} />
              <Field label="Email" value={form.email} onChange={() => undefined} readOnly />
              <Field
                label="Phone"
                value={form.contactnumber}
                onChange={(v) => onChange('contactnumber', v.replace(/\D/g, '').slice(0, 10))}
                error={phoneError}
                hint="10-digit US phone number"
              />
              <Field label="Date of birth" value={form.dob} onChange={(v) => onChange('dob', v)} type="date" />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#C8A45D] text-black text-sm font-bold disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {(isB2b || companies.length > 0) && (
        <div className="mt-6 bg-[#171A21] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="font-bold text-[#F7F4EC]">Business accounts</h2>
          </div>
          <ul className="divide-y divide-white/5">
            {companies.map((c) => (
              <li key={c._id} className="px-5 py-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C8A45D] text-black flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F7F4EC]">
                    {c.company || c.companyName || c.name || c._id}
                    {c._id === selectedCompanyId && (
                      <span className="ml-2 text-[10px] uppercase text-[#C8A45D]">Selected</span>
                    )}
                  </p>
                  <p className="text-[12px] text-[#AEB4C0] mt-0.5">
                    Credit: ${Number(c.b2bData?.creditLeft ?? c.creditLeft ?? 0).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AccountLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  type = 'text',
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  type?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#AEB4C0] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none focus:border-[#C8A45D]/50 ${
          readOnly
            ? 'border-white/5 bg-[#11141A] text-[#AEB4C0]'
            : 'border-white/10 bg-[#11141A] text-white'
        }`}
      />
      {error ? <p className="mt-1.5 text-sm text-red-400">{error}</p> : hint ? <p className="mt-1.5 text-xs text-[#6B7280]">{hint}</p> : null}
    </div>
  );
}
