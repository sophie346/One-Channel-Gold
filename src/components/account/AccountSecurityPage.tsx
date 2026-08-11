'use client';

import { useState } from 'react';
import { KeyRound, Shield } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { forgotPassword } from '@/store/authSlice';

export default function AccountSecurityPage({
  onNotify,
}: {
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [sending, setSending] = useState(false);

  const handleResetPassword = async () => {
    const email = user?.email || user?.emailId;
    if (!email) {
      onNotify?.('No email on this account.', 'error');
      return;
    }
    setSending(true);
    const action = await dispatch(forgotPassword(email));
    setSending(false);
    if (forgotPassword.fulfilled.match(action)) {
      onNotify?.("We've sent a password reset email. Check your inbox.", 'success');
    } else {
      onNotify?.(String(action.payload || 'Could not send reset email'), 'error');
    }
  };

  return (
    <AccountLayout
      title="Sign-in & Security"
      subtitle="Manage password reset for your OneGold account."
    >
      <div className="bg-[#171A21] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#C8A45D]" />
          <h2 className="font-bold text-[#F7F4EC]">Password</h2>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-sm text-[#AEB4C0] leading-relaxed">
            Send a reset link to <span className="text-white">{user?.email || user?.emailId}</span>.
            Use the email to set a new password.
          </p>
          <button
            type="button"
            disabled={sending}
            onClick={handleResetPassword}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#C8A45D] text-black text-sm font-bold disabled:opacity-50 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            {sending ? 'Sending…' : 'Send reset email'}
          </button>
        </div>
      </div>
    </AccountLayout>
  );
}
