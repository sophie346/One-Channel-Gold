import { bffRequest } from '@/services/bffClient';

export interface B2bInvoice {
  _id?: string;
  invoiceId?: string;
  status?: string;
  amount?: number;
  amountPaid?: number;
  amountDue?: number;
  created?: string;
  company?: string;
  [key: string]: unknown;
}

export function invoiceAmountDue(invoice?: {
  amountDue?: number;
  amount?: number;
  amountPaid?: number;
} | null) {
  if (!invoice) return 0;
  if (invoice.amountDue != null) return Math.max(0, Number(invoice.amountDue) || 0);
  return Math.max(0, (Number(invoice.amount) || 0) - (Number(invoice.amountPaid) || 0));
}

export function isInvoicePaid(invoice?: { status?: string; amountDue?: number } | null) {
  if (!invoice) return false;
  if (String(invoice.status || '').toLowerCase() === 'paid') return true;
  return invoiceAmountDue(invoice) <= 0;
}

export async function fetchB2bInvoices(
  token: string,
  params: { companyId: string; status?: string; skip?: number; limit?: number }
) {
  const qs = new URLSearchParams();
  qs.set('companyId', params.companyId);
  if (params.status) qs.set('status', params.status);
  if (params.skip != null) qs.set('skip', String(params.skip));
  if (params.limit != null) qs.set('limit', String(params.limit));
  return bffRequest<{
    error?: boolean;
    message?: string;
    items?: B2bInvoice[];
    creditLeft?: number;
    company?: string;
  }>(`account/b2b-invoices?${qs.toString()}`, {
    method: 'GET',
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export async function fetchB2bInvoice(invoiceId: string, token?: string | null) {
  const qs = new URLSearchParams({ invoiceId });
  return bffRequest<{ error?: boolean; message?: string; invoice?: B2bInvoice }>(
    `account/b2b-invoice?${qs.toString()}`,
    {
      method: 'GET',
      extraHeaders: token ? { authorization: `Bearer ${token}` } : {},
    }
  );
}
