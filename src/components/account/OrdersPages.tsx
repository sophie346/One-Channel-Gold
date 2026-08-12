'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Download, Eye, FileBadge, Loader2, Package, RotateCcw, X, ArrowLeft } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { OrderInvoiceDocument, printOrderInvoice } from '@/components/account/OrderInvoiceDocument';
import { OrderCertificateDocument, printOrderCertificate } from '@/components/account/OrderCertificateDocument';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reorderOrderToCart } from '@/store/cartSlice';
import { refreshUserDetails } from '@/store/authSlice';
import {
  fetchOrderById,
  fetchOrders,
  formatB2bCreditInvoiceId,
  formatOrderPaymentMethod,
  getOrderB2bCreditInvoiceId,
  getReorderableItems,
  isB2bCreditsPayment,
  modifyOrder,
  ORDER_FILTERS,
  type StoreOrder,
  type StoreOrderItem,
} from '@/services/orderService';

const TABS = [
  { to: '/my-orders', label: 'Orders' },
  { to: '/orders-returns', label: 'Returns' },
  { to: '/orders-cancelled', label: 'Cancelled' },
] as const;

export type OrdersListVariant = 'all' | 'returns' | 'cancelled';

const VARIANT_META: Record<OrdersListVariant, { title: string; empty: string; filter: string }> = {
  all: { title: 'Order History', empty: "You haven't placed any orders yet.", filter: ORDER_FILTERS.all },
  returns: { title: 'Returned Orders', empty: 'No returned orders found.', filter: ORDER_FILTERS.returns },
  cancelled: { title: 'Cancelled Orders', empty: 'No cancelled orders found.', filter: ORDER_FILTERS.cancelled },
};

function money(value?: number) {
  return `$${(Number(value) || 0).toFixed(2)}`;
}

function formatDate(value?: string, withTime = false) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

function statusLabel(status?: string) {
  return (status || 'unknown').replace(/_/g, ' ').toUpperCase();
}

function itemImage(item: StoreOrderItem) {
  const img = item.image || item.images?.[0];
  return typeof img === 'string' ? img : img?.url || '';
}

function groupItemStatuses(items?: StoreOrder['items']) {
  const counts = new Map<string, number>();
  for (const item of items || []) {
    const label = statusLabel(item.status);
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

function PaymentBadge({ order }: { order: StoreOrder }) {
  const label = formatOrderPaymentMethod(order);
  if (label === '—') return <span className="text-sm text-[#6B7280]">—</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
      isB2bCreditsPayment(order) ? 'bg-[#C8A45D]/15 text-[#E3C27A] border border-[#C8A45D]/30' : 'bg-white/5 text-[#AEB4C0]'
    }`}>
      {label}
    </span>
  );
}

function InvoiceModal({
  order,
  onClose,
}: {
  order: StoreOrder;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#171A21] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="font-bold text-white">Invoice #{order.orderId}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printOrderInvoice(printRef.current, order.orderId)}
              className="h-9 px-3 rounded-full bg-[#C8A45D] text-black text-xs font-bold uppercase cursor-pointer"
            >
              Print / Save PDF
            </button>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-[#AEB4C0] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-auto bg-slate-100 p-3">
          <OrderInvoiceDocument ref={printRef} order={order} />
        </div>
      </div>
    </div>
  );
}

function CertificateModal({
  order,
  onClose,
}: {
  order: StoreOrder;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#171A21] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="font-bold text-white">E-Certificate #{order.orderId}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printOrderCertificate(printRef.current, order.orderId)}
              className="h-9 px-3 rounded-full bg-[#C8A45D] text-black text-xs font-bold uppercase cursor-pointer"
            >
              Print / Save PDF
            </button>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-[#AEB4C0] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-auto bg-slate-100 p-3">
          <OrderCertificateDocument ref={printRef} order={order} />
        </div>
      </div>
    </div>
  );
}

export function OrdersListPage({
  variant,
  onNotify,
}: {
  variant: OrdersListVariant;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const meta = VARIANT_META[variant];
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<StoreOrder | null>(null);
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);
  const [certificateOrder, setCertificateOrder] = useState<StoreOrder | null>(null);
  const [certificateLoadingId, setCertificateLoadingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;
    setLoading(true);
    fetchOrders(user.token, null, meta.filter || null)
      .then((res) => {
        if (cancelled) return;
        if (res.error) {
          setError(res.message || 'Failed to load orders');
          setOrders([]);
          return;
        }
        setOrders(res.orders || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load orders');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token, meta.filter]);

  const openInvoice = async (order: StoreOrder) => {
    const id = order.orderId;
    if (!id || !user?.token) return;
    setInvoiceLoadingId(id);
    try {
      const res = await fetchOrderById(user.token, id);
      if (res.error || !res.order) {
        onNotify?.(res.message || 'Could not load invoice', 'error');
        return;
      }
      setInvoiceOrder(res.order);
    } catch (e) {
      onNotify?.(e instanceof Error ? e.message : 'Could not load invoice', 'error');
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  const openCertificate = async (order: StoreOrder) => {
    const id = order.orderId;
    if (!id || !user?.token) return;
    setCertificateLoadingId(id);
    try {
      const res = await fetchOrderById(user.token, id);
      if (res.error || !res.order) {
        onNotify?.(res.message || 'Could not load e-certificate', 'error');
        return;
      }
      setCertificateOrder(res.order);
    } catch (e) {
      onNotify?.(e instanceof Error ? e.message : 'Could not load e-certificate', 'error');
    } finally {
      setCertificateLoadingId(null);
    }
  };

  const handleReorder = async (order: StoreOrder) => {
    if (!order.orderId || reorderingId) return;
    if (!getReorderableItems(order.items).length) {
      onNotify?.('No items available to reorder', 'info');
      return;
    }
    setReorderingId(order.orderId);
    try {
      const action = await dispatch(reorderOrderToCart(order.items || []));
      if (reorderOrderToCart.fulfilled.match(action)) {
        onNotify?.('Items added to your cart', 'success');
        router.push('/cart');
      } else {
        onNotify?.(typeof action.payload === 'string' ? action.payload : 'Could not reorder', 'error');
      }
    } finally {
      setReorderingId(null);
    }
  };

  const actions = (order: StoreOrder) => {
    const canReorder = getReorderableItems(order.items).length > 0;
    const busyReorder = reorderingId === order.orderId;
    const creditInvoiceId = getOrderB2bCreditInvoiceId(order);
    return (
      <div className="inline-flex items-center justify-end gap-1">
        <button
          type="button"
          disabled={invoiceLoadingId === order.orderId}
          onClick={() => openInvoice(order)}
          title="Download invoice"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#AEB4C0] hover:text-white hover:bg-white/5 disabled:opacity-50 cursor-pointer"
        >
          {invoiceLoadingId === order.orderId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        </button>
        <button
          type="button"
          disabled={certificateLoadingId === order.orderId}
          onClick={() => openCertificate(order)}
          title="Download E-certificate"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#AEB4C0] hover:text-white hover:bg-white/5 disabled:opacity-50 cursor-pointer"
        >
          {certificateLoadingId === order.orderId ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileBadge className="w-4 h-4" />}
        </button>
        {creditInvoiceId ? (
          <button
            type="button"
            onClick={() => router.push(`/invoices`)}
            className="text-[#C8A45D] font-semibold text-sm px-1 cursor-pointer"
          >
            Pay
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => router.push(`/orders/${encodeURIComponent(String(order.orderId || ''))}`)}
          title="View order"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#AEB4C0] hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>
        {canReorder && (
          <button
            type="button"
            disabled={!!reorderingId}
            onClick={() => handleReorder(order)}
            title={busyReorder ? 'Adding…' : 'Reorder'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#C8A45D] hover:bg-[#C8A45D]/10 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${busyReorder ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  return (
    <AccountLayout
      title={meta.title}
      subtitle={`Signed in as ${user?.email || user?.emailId || '—'}`}
      headerRight={
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.to}
              type="button"
              onClick={() => router.push(tab.to)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                (variant === 'all' && tab.to === '/my-orders') ||
                (variant === 'returns' && tab.to === '/orders-returns') ||
                (variant === 'cancelled' && tab.to === '/orders-cancelled')
                  ? 'bg-[#C8A45D] text-black'
                  : 'bg-white/5 text-[#AEB4C0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="bg-[#171A21] rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#AEB4C0]">Loading orders…</div>
        ) : error ? (
          <div className="p-8 text-red-400 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-[#C8A45D] mx-auto mb-3" />
            <p className="text-[#AEB4C0]">{meta.empty}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Order', 'Date', 'Status', 'Payment', 'Invoice', 'Total', 'Actions'].map((h) => (
                      <th key={h} className={`px-3 py-3 text-sm font-semibold text-[#AEB4C0] whitespace-nowrap ${h === 'Total' || h === 'Actions' ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const itemCount = order.items?.length || 0;
                    const canExpand = itemCount > 1;
                    const expanded = Boolean(expandedIds[order.orderId || '']);
                    const creditInvoiceLabel = formatB2bCreditInvoiceId(getOrderB2bCreditInvoiceId(order));
                    return (
                      <React.Fragment key={order.orderId}>
                        <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {canExpand ? (
                                <button
                                  type="button"
                                  onClick={() => setExpandedIds((p) => ({ ...p, [order.orderId || '']: !p[order.orderId || ''] }))}
                                  className="w-6 h-6 inline-flex items-center justify-center text-[#AEB4C0] cursor-pointer"
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                </button>
                              ) : (
                                <span className="w-6" />
                              )}
                              <button
                                type="button"
                                onClick={() => router.push(`/orders/${encodeURIComponent(String(order.orderId || ''))}`)}
                                className="text-[#C8A45D] font-medium text-sm cursor-pointer"
                              >
                                #{order.orderId}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-[#AEB4C0] whitespace-nowrap">{formatDate(order.created)}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {groupItemStatuses(order.items).map(({ label, count }) => (
                                <span key={label} className="inline-flex px-2 py-0.5 rounded-full text-xs bg-white/5 text-[#AEB4C0]">
                                  {label}{count > 1 ? ` (${count})` : ''}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap"><PaymentBadge order={order} /></td>
                          <td className="px-3 py-3 text-sm text-[#AEB4C0] whitespace-nowrap">{creditInvoiceLabel || '—'}</td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="text-sm font-semibold text-[#F7F4EC]">{money(order.orderTotal)}</div>
                            <div className="text-xs text-[#6B7280]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">{actions(order)}</td>
                        </tr>
                        {expanded && canExpand && (
                          <tr className="bg-black/20">
                            <td colSpan={7} className="px-3 py-3 pl-11">
                              <ul className="divide-y divide-white/5">
                                {(order.items || []).map((item, idx) => (
                                  <li key={idx} className="flex gap-3 py-2 items-center">
                                    {itemImage(item) ? <img src={itemImage(item)} alt="" className="w-10 h-10 rounded object-cover" /> : <Package className="w-5 h-5 text-[#C8A45D]" />}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-[#F7F4EC] truncate">{item.title || item.name || item.sku}</p>
                                      <p className="text-xs text-[#6B7280]">SKU: {item.sku || item.osku} · Qty {item.quantity || 1}</p>
                                    </div>
                                    <p className="text-sm text-[#E3C27A]">{money(Number(item.total ?? Number(item.price || 0) * Number(item.quantity || 1)))}</p>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between gap-3 mb-2">
                    <button type="button" onClick={() => router.push(`/orders/${encodeURIComponent(String(order.orderId || ''))}`)} className="text-[#C8A45D] font-semibold cursor-pointer">
                      #{order.orderId}
                    </button>
                    <p className="font-bold text-[#E3C27A]">{money(order.orderTotal)}</p>
                  </div>
                  <p className="text-sm text-[#AEB4C0] mb-2">{formatDate(order.created)}</p>
                  <PaymentBadge order={order} />
                  <div className="mt-3 flex justify-end">{actions(order)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {invoiceOrder ? <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} /> : null}
      {certificateOrder ? <CertificateModal order={certificateOrder} onClose={() => setCertificateOrder(null)} /> : null}
    </AccountLayout>
  );
}

export function OrderDetailPage({
  orderId,
  onNotify,
}: {
  orderId: string;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionItem, setActionItem] = useState<{ item: StoreOrderItem; type: 'cancelled' | 'returninitialized' } | null>(null);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const load = useCallback(async () => {
    if (!user?.token || !orderId) return;
    setLoading(true);
    try {
      const res = await fetchOrderById(user.token, orderId);
      if (res.error || !res.order) {
        setError(res.message || 'Order not found');
        setOrder(null);
        return;
      }
      setOrder(res.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Order not found');
    } finally {
      setLoading(false);
    }
  }, [user?.token, orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReorder = async () => {
    if (!order?.items?.length || reordering) return;
    if (!getReorderableItems(order.items).length) {
      onNotify?.('No items available to reorder', 'info');
      return;
    }
    setReordering(true);
    try {
      const action = await dispatch(reorderOrderToCart(order.items));
      if (reorderOrderToCart.fulfilled.match(action)) {
        onNotify?.('Items added to your cart', 'success');
        router.push('/cart');
      } else {
        onNotify?.(typeof action.payload === 'string' ? action.payload : 'Could not reorder', 'error');
      }
    } finally {
      setReordering(false);
    }
  };

  const submitModify = async () => {
    if (!order || !actionItem || !user?.token) return;
    if (!reason.trim()) {
      onNotify?.('Please select a reason', 'error');
      return;
    }
    setBusy(true);
    const detailsKey = actionItem.type === 'cancelled' ? 'cancelDetails' : 'returnDetails';
    const reasonKey = actionItem.type === 'cancelled' ? 'cancelReason' : 'returnReason';
    try {
      const res = await modifyOrder(
        {
          orderId: String(order.orderId),
          status: actionItem.type,
          emailId: order.email || user.email,
          itemPosition: actionItem.item.itemPosition,
          [detailsKey]: {
            [reasonKey]: reason,
            customReason: customReason || undefined,
            creationDate: new Date().toISOString(),
          },
        },
        user.token
      );
      if (res.error) {
        onNotify?.(res.message || 'Could not update order', 'error');
      } else {
        onNotify?.('Order updated successfully', 'success');
        setActionItem(null);
        setReason('');
        setCustomReason('');
        await load();
        if (actionItem.type === 'cancelled') await dispatch(refreshUserDetails());
      }
    } catch (e) {
      onNotify?.(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const addressLines = (addr?: StoreOrder['shippingAddress']) => {
    if (!addr) return [];
    return [
      addr.name || addr.Name,
      addr.line1,
      addr.line2,
      [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', '),
      addr.country,
      addr.phone,
      addr.email,
    ].filter(Boolean) as string[];
  };

  const canReorder = getReorderableItems(order?.items).length > 0;

  return (
    <AccountLayout
      title={order?.orderId ? `Order #${order.orderId}` : 'Order detail'}
      subtitle={order?.created ? `Placed ${formatDate(order.created, true)}` : undefined}
      headerRight={
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => router.push('/my-orders')} className="inline-flex items-center gap-1 text-sm text-[#AEB4C0] cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> All orders
          </button>
          {order && (
            <button type="button" onClick={() => setInvoiceOpen(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 text-[#F7F4EC] text-xs font-bold uppercase cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Invoice
            </button>
          )}
          {order && (
            <button type="button" onClick={() => setCertificateOpen(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 text-[#F7F4EC] text-xs font-bold uppercase cursor-pointer">
              <FileBadge className="w-3.5 h-3.5" /> E-certificate
            </button>
          )}
          {canReorder && (
            <button type="button" disabled={reordering} onClick={handleReorder} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#C8A45D] text-black text-xs font-bold uppercase cursor-pointer disabled:opacity-50">
              <RotateCcw className={`w-3.5 h-3.5 ${reordering ? 'animate-spin' : ''}`} />
              {reordering ? 'Adding…' : 'Reorder'}
            </button>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-16 text-center text-[#AEB4C0]">Loading…</div>
      ) : error || !order ? (
        <div className="bg-[#171A21] rounded-2xl border border-red-500/20 p-8 text-red-400 text-sm">{error || 'Order not found'}</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#171A21] rounded-2xl border border-white/10 overflow-hidden">
            <ul className="divide-y divide-white/5">
              {(order.items || []).map((item, idx) => (
                <li key={idx} className="p-5 flex gap-4">
                  {itemImage(item) ? <img src={itemImage(item)} alt="" className="w-16 h-16 rounded-xl object-cover" /> : <Package className="w-8 h-8 text-[#C8A45D]" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#F7F4EC] truncate">{item.title || item.name || item.sku}</p>
                    <p className="text-xs text-[#AEB4C0] mt-0.5">SKU: {item.sku || item.osku || '—'} · Qty {item.quantity || 1}</p>
                    <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/5 text-[#AEB4C0]">{statusLabel(item.status)}</span>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {item.canCancel && (
                        <button type="button" onClick={() => setActionItem({ item, type: 'cancelled' })} className="text-xs font-bold text-red-400 cursor-pointer">Cancel item</button>
                      )}
                      {item.canReturn && (
                        <button type="button" onClick={() => setActionItem({ item, type: 'returninitialized' })} className="text-xs font-bold text-[#AEB4C0] cursor-pointer">Return item</button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#E3C27A] shrink-0">{money(Number(item.total ?? Number(item.price || 0) * Number(item.quantity || 1)))}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="bg-[#171A21] rounded-2xl border border-white/10 p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-[#AEB4C0]">Payment</dt><dd><PaymentBadge order={order} /></dd></div>
                <div className="flex justify-between"><dt className="text-[#AEB4C0]">Shipping</dt><dd className="text-[#F7F4EC]">{money(order.totalOrderShipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#AEB4C0]">Tax</dt><dd className="text-[#F7F4EC]">{money(order.totalTax)}</dd></div>
                <div className="flex justify-between border-t border-white/10 pt-2"><dt className="font-bold text-white">Order total</dt><dd className="font-black text-[#E3C27A]">{money(order.orderTotal)}</dd></div>
              </dl>
            </div>
            <div className="bg-[#171A21] rounded-2xl border border-white/10 p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">Shipping address</h2>
              <div className="text-sm text-[#AEB4C0] space-y-0.5">
                {addressLines(order.shippingAddress).map((line, i) => <div key={`ship-${i}`}>{line}</div>)}
                {!addressLines(order.shippingAddress).length && <div>Not available</div>}
              </div>
            </div>
            <div className="bg-[#171A21] rounded-2xl border border-white/10 p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">Billing address</h2>
              <div className="text-sm text-[#AEB4C0] space-y-0.5">
                {addressLines(order.billingAddress).map((line, i) => <div key={`bill-${i}`}>{line}</div>)}
                {!addressLines(order.billingAddress).length && <div>Not available</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {actionItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#171A21] rounded-2xl max-w-md w-full p-6 border border-white/10">
            <h3 className="text-lg font-black text-white mb-1">{actionItem.type === 'cancelled' ? 'Cancel item' : 'Return item'}</h3>
            <p className="text-xs text-[#AEB4C0] mb-4 truncate">{actionItem.item.title || actionItem.item.sku}</p>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-11 rounded-xl border border-white/10 bg-[#11141A] text-white px-3 text-sm mb-3">
              <option value="">Select reason</option>
              <option value="Wrong item">Wrong item</option>
              <option value="Damaged">Damaged</option>
              <option value="Changed mind">Changed mind</option>
              <option value="Other">Other</option>
            </select>
            <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} rows={3} placeholder="Additional details" className="w-full rounded-xl border border-white/10 bg-[#11141A] text-white px-3 py-2 text-sm mb-4 resize-none" />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setActionItem(null); setReason(''); setCustomReason(''); }} className="flex-1 h-11 rounded-xl border border-white/10 text-sm font-bold text-[#AEB4C0] cursor-pointer">Close</button>
              <button type="button" disabled={busy} onClick={submitModify} className="flex-1 h-11 rounded-xl bg-[#C8A45D] text-black text-sm font-bold cursor-pointer disabled:opacity-50">{busy ? 'Saving…' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      {invoiceOpen && order ? <InvoiceModal order={order} onClose={() => setInvoiceOpen(false)} /> : null}
      {certificateOpen && order ? <CertificateModal order={order} onClose={() => setCertificateOpen(false)} /> : null}
    </AccountLayout>
  );
}
