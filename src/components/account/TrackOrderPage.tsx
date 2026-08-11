'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Package, Search } from 'lucide-react';
import { trackOrder, type StoreOrder } from '@/services/orderService';

export default function TrackOrderPage() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<StoreOrder | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    const res = await trackOrder(email, orderId);
    setLoading(false);
    if (res.error || !(res.order || res.orders?.[0])) {
      setError(res.message || 'Order not found. Check the email and order ID.');
      return;
    }
    setOrder(res.order || res.orders?.[0] || null);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-black">Order lookup</span>
        <h1 className="text-3xl font-black text-[#F7F4EC] uppercase">Track your order</h1>
        <p className="text-sm text-[#AEB4C0]">Enter the email used at checkout and your order ID.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#171A21] border border-white/10 rounded-2xl p-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Order email"
          className="w-full h-11 px-3 rounded-xl border border-white/10 bg-[#11141A] text-white"
        />
        <input
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID"
          className="w-full h-11 px-3 rounded-xl border border-white/10 bg-[#11141A] text-white"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#C8A45D] text-black font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Track order
        </button>
      </form>

      {order && (
        <div className="bg-[#171A21] border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#C8A45D]">
            <Package className="w-5 h-5" />
            <h2 className="font-bold text-white">Order {order.orderId}</h2>
          </div>
          <p className="text-sm text-[#AEB4C0]">Status: {order.status || 'processing'}</p>
          <p className="text-sm font-bold text-[#E3C27A]">
            Total: ${Number(order.orderTotal || 0).toFixed(2)}
          </p>
          <ul className="space-y-2 pt-2">
            {(order.items || []).map((item, idx) => (
              <li key={idx} className="text-sm text-[#AEB4C0]">
                {item.title || item.name || item.sku} × {item.quantity || 1}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
