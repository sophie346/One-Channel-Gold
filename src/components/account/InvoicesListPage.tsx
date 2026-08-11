'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAppSelector } from '@/store/hooks';
import {
  fetchB2bInvoices,
  invoiceAmountDue,
  isInvoicePaid,
  type B2bInvoice,
} from '@/services/invoiceService';

function money(value?: number) {
  return `$${(Number(value) || 0).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function InvoicesListPage() {
  const user = useAppSelector((s) => s.auth.user);
  const companyId = useAppSelector((s) => s.auth.selectedCompanyId);
  const isB2b = useAppSelector((s) => s.auth.isB2b);
  const [invoices, setInvoices] = useState<B2bInvoice[]>([]);
  const [creditLeft, setCreditLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token || !companyId) {
      setLoading(false);
      if (user?.token && !companyId) setError('Select a company to view invoices.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchB2bInvoices(user.token, { companyId, limit: 100 })
      .then((res) => {
        if (cancelled) return;
        if (res.error) {
          setError(res.message || 'Failed to load invoices');
          setInvoices([]);
          return;
        }
        setInvoices(res.items || []);
        setCreditLeft(res.creditLeft != null ? Number(res.creditLeft) : null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load invoices');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token, companyId]);

  return (
    <AccountLayout title="Invoices" subtitle="B2B credit settlement invoices for your company.">
      {!isB2b ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-12 text-center">
          <FileText className="w-10 h-10 text-[#C8A45D] mx-auto mb-3" />
          <p className="text-[#AEB4C0]">Invoices are available for B2B accounts only.</p>
        </div>
      ) : loading ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-16 text-center text-[#AEB4C0]">Loading invoices…</div>
      ) : error ? (
        <div className="bg-[#171A21] rounded-2xl border border-red-500/20 p-8 text-red-400 text-sm">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-12 text-center text-[#AEB4C0]">
          No invoices found.
        </div>
      ) : (
        <div className="space-y-3">
          {creditLeft != null && (
            <p className="text-sm text-[#AEB4C0]">
              Credit left: <span className="text-[#E3C27A] font-bold">{money(creditLeft)}</span>
            </p>
          )}
          {invoices.map((invoice) => {
            const id = String(invoice.invoiceId || invoice._id);
            const paid = isInvoicePaid(invoice);
            return (
              <div key={id} className="bg-[#171A21] rounded-2xl border border-white/10 p-5 flex justify-between gap-4">
                <div>
                  <p className="font-bold text-[#F7F4EC]">{id}</p>
                  <p className="text-xs text-[#AEB4C0] mt-1">{formatDate(invoice.created)}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#E3C27A]">{money(invoiceAmountDue(invoice))}</p>
                  <p className={`text-[11px] uppercase mt-1 ${paid ? 'text-[#2F9D70]' : 'text-[#C8A45D]'}`}>
                    {invoice.status || (paid ? 'paid' : 'due')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
