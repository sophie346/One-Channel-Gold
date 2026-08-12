'use client';

import { forwardRef } from 'react';
import { dyanamicLabel } from '@/adapters/Constants';
import {
  formatOrderPaymentMethod,
  type StoreOrder,
  type StoreOrderAddress,
} from '@/services/orderService';

function money(n?: number) {
  return `$${(Number(n) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function addressBlock(addr?: StoreOrderAddress | null) {
  if (!addr) return null;
  const lines = [
    addr.name || addr.Name,
    addr.line1,
    addr.line2,
    [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', '),
    addr.country,
    addr.phone,
    addr.email,
  ].filter(Boolean) as string[];
  return lines.length ? lines : null;
}

export const OrderInvoiceDocument = forwardRef<HTMLDivElement, { order: StoreOrder | null | undefined }>(
  function OrderInvoiceDocument({ order }, ref) {
    if (!order?.orderId) return null;
    const items = order.items || [];
    const ship = addressBlock(order.shippingAddress);
    const bill = addressBlock(order.billingAddress) || ship;
    const payment = formatOrderPaymentMethod(order);
    const status = String(order.status || items[0]?.status || 'processing').replace(/_/g, ' ').toUpperCase();

    return (
      <div ref={ref} className="bg-white text-slate-900 p-7 max-w-[800px] mx-auto font-sans">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div>
            <div className="text-[11px] tracking-wider text-slate-500 uppercase">{dyanamicLabel || 'OneGold'}</div>
            <h1 className="text-2xl font-black mt-1 m-0">INVOICE</h1>
          </div>
          <div className="text-right">
            <div className="font-bold text-base">#{order.orderId}</div>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              {status}
            </span>
          </div>
        </div>
        <hr className="border-0 border-t border-slate-200 mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">BILL TO</div>
            {bill ? bill.map((line, i) => <div key={`bill-${i}`} className={i === 0 ? 'font-bold text-[15px]' : 'text-slate-600'}>{line}</div>) : <div className="text-slate-400">—</div>}
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">SHIP TO</div>
            {ship ? ship.map((line, i) => <div key={`ship-${i}`} className={i === 0 ? 'font-bold text-[15px]' : 'text-slate-600'}>{line}</div>) : <div className="text-slate-400">—</div>}
          </div>
        </div>
        <div className="space-y-1.5 mb-6 text-sm max-w-sm ml-auto">
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Order date</span>
            <span className="font-semibold">{fmtDate(order.created)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Payment</span>
            <span className="font-semibold">{payment}</span>
          </div>
          {order.email ? (
            <div className="flex justify-between gap-6">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold break-all text-right">{order.email}</span>
            </div>
          ) : null}
        </div>
        <table className="w-full text-sm border-collapse mb-5">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="p-2.5 border-b border-slate-200">Item</th>
              <th className="p-2.5 border-b border-slate-200">SKU</th>
              <th className="p-2.5 border-b border-slate-200 text-right">Qty</th>
              <th className="p-2.5 border-b border-slate-200 text-right">Price</th>
              <th className="p-2.5 border-b border-slate-200 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((item, i) => {
              const qty = Number(item.quantity) || 1;
              const price = Number(item.price) || 0;
              const lineTotal = item.total != null ? Number(item.total) : price * qty;
              return (
                <tr key={`${item.sku || item.osku || i}`}>
                  <td className="p-2 border-b border-slate-100 font-semibold">{item.title || item.name || item.sku || 'Item'}</td>
                  <td className="p-2 border-b border-slate-100 text-slate-600">{item.sku || item.osku || '—'}</td>
                  <td className="p-2 border-b border-slate-100 text-right">{qty}</td>
                  <td className="p-2 border-b border-slate-100 text-right">{money(price)}</td>
                  <td className="p-2 border-b border-slate-100 text-right">{money(lineTotal)}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan={5} className="p-3 text-center text-slate-400">No line items</td></tr>
            )}
          </tbody>
        </table>
        <div className="ml-auto max-w-xs text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-semibold">{money(order.totalOrderShipping)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-semibold">{money(order.totalTax)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
            <span className="font-bold">Order total</span>
            <span className="font-black">{money(order.orderTotal)}</span>
          </div>
        </div>
        <p className="mt-7 text-[11px] text-slate-400 text-center">Thank you for your order. Use Print / Save PDF to download this invoice.</p>
      </div>
    );
  }
);

export function printHtmlDocument(el: HTMLElement | null, title: string) {
  if (!el || typeof window === 'undefined') return;
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
      th { background: #f8fafc; }
      img { max-width: 100%; height: auto; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>${el.innerHTML}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

export function printOrderInvoice(el: HTMLElement | null, orderId?: string) {
  printHtmlDocument(el, `Invoice-${orderId || 'order'}`);
}
