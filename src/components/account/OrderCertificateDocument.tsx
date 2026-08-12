'use client';

import { forwardRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { dyanamicLabel } from '@/adapters/Constants';
import { printHtmlDocument } from '@/components/account/OrderInvoiceDocument';
import type { StoreOrder, StoreOrderAddress } from '@/services/orderService';

function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function ownerName(order: StoreOrder) {
  const addr = order.shippingAddress || order.billingAddress;
  return String(addr?.name || addr?.Name || order.email || 'Valued Client');
}

function addressLine(addr?: StoreOrderAddress | null) {
  if (!addr) return '';
  return [addr.line1, addr.city, addr.region, addr.postalCode, addr.country].filter(Boolean).join(', ');
}

function certificateVerifyUrl(orderId: string, certId: string) {
  if (typeof window === 'undefined') return certId;
  return `${window.location.origin}/orders/${encodeURIComponent(orderId)}?cert=${encodeURIComponent(certId)}`;
}

function CertificateQr({ value }: { value: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: 148,
      margin: 1,
      color: { dark: '#1a1408', light: '#fbf8f1' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc('');
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) {
    return <div className="w-[132px] h-[132px] bg-white border border-[#C8A45D]/40" />;
  }

  return <img src={src} alt="Certificate QR code" width={132} height={132} style={{ width: 132, height: 132 }} />;
}

export const OrderCertificateDocument = forwardRef<HTMLDivElement, { order: StoreOrder | null | undefined }>(
  function OrderCertificateDocument({ order }, ref) {
    if (!order?.orderId) return null;
    const items = order.items || [];
    const certId = `OG-CERT-${order.orderId}`;
    const owner = ownerName(order);
    const loc = addressLine(order.shippingAddress || order.billingAddress);
    const qrValue = certificateVerifyUrl(String(order.orderId), certId);

    return (
      <div ref={ref} className="bg-[#fbf8f1] text-slate-900 p-8 max-w-[800px] mx-auto font-serif border-[10px] border-[#C8A45D]">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="text-left flex-1">
            <div className="text-[11px] tracking-[0.28em] text-[#8a7340] uppercase font-sans font-bold">
              {dyanamicLabel || 'OneGold'}
            </div>
            <h1 className="text-3xl font-black mt-2 mb-1 tracking-wide">E-CERTIFICATE</h1>
            <p className="text-sm uppercase tracking-[0.18em] text-[#8a7340] m-0">Certificate of Authenticity</p>
          </div>
          <div className="text-center shrink-0">
            <CertificateQr value={qrValue} />
            <div className="text-[9px] uppercase tracking-wider text-[#8a7340] font-sans font-bold mt-1">Scan to verify</div>
          </div>
        </div>
        <hr className="border-0 border-t-2 border-[#C8A45D] mb-6" />
        <p className="text-sm leading-relaxed text-center mb-6">
          This certifies that the gold asset(s) listed below were purchased through {dyanamicLabel || 'OneGold'}
          and are recorded against order <strong>#{order.orderId}</strong>.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <div className="text-[11px] font-bold text-[#8a7340] uppercase tracking-wide mb-1 font-sans">Certificate ID</div>
            <div className="font-bold font-mono">{certId}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#8a7340] uppercase tracking-wide mb-1 font-sans">Issue date</div>
            <div className="font-semibold">{fmtDate(order.created)}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#8a7340] uppercase tracking-wide mb-1 font-sans">Registered owner</div>
            <div className="font-bold">{owner}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#8a7340] uppercase tracking-wide mb-1 font-sans">Order reference</div>
            <div className="font-semibold">#{order.orderId}</div>
          </div>
        </div>
        {loc ? <p className="text-xs text-slate-600 mb-5">{loc}</p> : null}
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="bg-[#f3ead4] text-left">
              <th className="p-2.5 border-b border-[#C8A45D]/40">Asset</th>
              <th className="p-2.5 border-b border-[#C8A45D]/40">SKU</th>
              <th className="p-2.5 border-b border-[#C8A45D]/40 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((item, i) => (
              <tr key={`${item.sku || item.osku || i}`}>
                <td className="p-2 border-b border-slate-200 font-semibold">{item.title || item.name || item.sku || 'Gold asset'}</td>
                <td className="p-2 border-b border-slate-200 text-slate-600">{item.sku || item.osku || '—'}</td>
                <td className="p-2 border-b border-slate-200 text-right">{Number(item.quantity) || 1}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="p-3 text-center text-slate-400">No assets listed</td></tr>
            )}
          </tbody>
        </table>
        <p className="text-[11px] text-slate-500 text-center leading-relaxed m-0">
          This electronic certificate is issued for the recorded purchase and does not replace independent assay documentation.
          Use Print / Save PDF to download.
        </p>
      </div>
    );
  }
);

export function printOrderCertificate(el: HTMLElement | null, orderId?: string) {
  printHtmlDocument(el, `E-Certificate-${orderId || 'order'}`);
}
