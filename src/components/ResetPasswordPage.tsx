'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { confirmPasswordResetThunk } from '@/store/authSlice';
import { verifyResetPasswordCode } from '@/services/authService';

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const oobCode = params.get('oobCode') || params.get('oobcode') || '';

  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(Boolean(oobCode));
  const [codeError, setCodeError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode) {
      setVerifying(false);
      setCodeError('This reset link is missing or invalid. Request a new one.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const email = await verifyResetPasswordCode(oobCode);
        if (!cancelled) {
          setEmailHint(email);
          setVerifying(false);
        }
      } catch (e) {
        if (!cancelled) {
          setVerifying(false);
          setCodeError(
            e instanceof Error
              ? e.message
              : 'This reset link is invalid or has expired. Please request a new one.'
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const action = await dispatch(confirmPasswordResetThunk({ oobCode, newPassword: password }));
    setLoading(false);
    if (confirmPasswordResetThunk.fulfilled.match(action)) {
      router.replace('/login');
      return;
    }
    setFormError(String(action.payload || 'Could not reset password'));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#171A21] border border-white/10 rounded-2xl p-8 space-y-5">
        <div className="flex items-center gap-2 text-[#C8A45D]">
          <KeyRound className="w-5 h-5" />
          <h1 className="text-xl font-bold text-white">Set a new password</h1>
        </div>
        {verifying && (
          <p className="text-sm text-[#AEB4C0] inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying reset link…
          </p>
        )}
        {codeError && <p className="text-sm text-red-400">{codeError}</p>}
        {!verifying && !codeError && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {emailHint && <p className="text-sm text-[#AEB4C0]">Resetting password for {emailHint}</p>}
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-[#11141A] border border-white/10 rounded-lg px-3 py-3 text-white"
            />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-[#11141A] border border-white/10 rounded-lg px-3 py-3 text-white"
            />
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C8A45D] text-black font-bold rounded-lg cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
