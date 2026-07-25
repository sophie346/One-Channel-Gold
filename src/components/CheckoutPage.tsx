'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart, selectCartItems, selectCartSubtotal } from '@/store/cartSlice';

interface CheckoutPageProps {
  onOrderComplete?: (orderItems: any[]) => void;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  requireAuth?: boolean;
  isLoggedIn?: boolean;
  openAuth?: () => void;
}

export default function CheckoutPage({
  onOrderComplete,
  onShowNotification,
  isLoggedIn,
  openAuth,
}: CheckoutPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = items.length > 0 ? 35 : 0;
  const insurance = items.length > 0 ? Math.round(subtotal * 0.005) : 0;
  const total = subtotal + shipping + insurance;

  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  if (items.length === 0 && !placed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Nothing to checkout</h1>
        <p className="text-sm text-[#9CA3AF]">Your cart is empty. Add gold from the market first.</p>
        <button
          onClick={() => router.push('/buy')}
          className="px-6 py-3 bg-[#C8A45D] text-black text-sm font-semibold rounded-lg cursor-pointer"
        >
          Go to Market
        </button>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#2F9D70]/15 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2F9D70]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Order Confirmed</h1>
        <p className="text-sm text-[#9CA3AF]">
          Your insured order <span className="text-[#E3C27A] font-mono font-semibold">{orderId}</span> has been placed.
          Armored logistics will be scheduled shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => router.push('/portal')}
            className="px-6 py-3 bg-[#C8A45D] text-black text-sm font-semibold rounded-lg cursor-pointer"
          >
            View Portal
          </button>
          <button
            onClick={() => router.push('/buy')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuth?.();
      onShowNotification?.('Please sign in to complete checkout.', 'info');
      return;
    }

    const id = `ORD-${Math.floor(Math.random() * 900000 + 100000)}`;
    setOrderId(id);
    onOrderComplete?.(items);
    dispatch(clearCart());
    setPlaced(true);
    onShowNotification?.('Checkout authorized. Order placed successfully.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <button
        onClick={() => router.push('/cart')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#AEB4C0] hover:text-[#C8A45D] uppercase tracking-widest mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <div className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-2">Checkout</p>
        <h1 className="font-serif text-3xl md:text-4xl text-white font-medium">Secure Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C8A45D]" /> Shipping Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'fullName', label: 'Full Name', span: 2 },
                { key: 'email', label: 'Email', span: 1, type: 'email' },
                { key: 'phone', label: 'Phone', span: 1, type: 'tel' },
                { key: 'address', label: 'Street Address', span: 2 },
                { key: 'city', label: 'City', span: 1 },
                { key: 'state', label: 'State', span: 1 },
                { key: 'zip', label: 'ZIP / Postal', span: 1 },
                { key: 'country', label: 'Country', span: 1 },
              ].map((field) => (
                <div key={field.key} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                  <label className="block text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  <input
                    required
                    type={field.type || 'text'}
                    value={(form as any)[field.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8A45D]/50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-white">Payment</h2>
            <p className="text-[13px] text-[#9CA3AF]">
              Demo checkout — no real payment is processed. Click place order to simulate an insured settlement.
            </p>
            <div className="flex items-center gap-2 text-[12px] text-[#2F9D70]">
              <ShieldCheck className="w-4 h-4" />
              256-bit encrypted demo gateway
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-[#111111] border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <h2 className="text-[15px] font-semibold text-white">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-[13px]">
                  <img src={item.image} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-[#9CA3AF]">Qty {item.quantity}</p>
                  </div>
                  <p className="text-[#E3C27A] font-semibold shrink-0">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Subtotal</span>
                <span className="text-white">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Shipping + Insurance</span>
                <span className="text-white">${(shipping + insurance).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-[16px] font-semibold">
                <span className="text-white">Total</span>
                <span className="text-[#E3C27A]">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-black text-sm font-bold rounded-lg cursor-pointer"
            >
              Place Order · ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
