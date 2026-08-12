'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Loader2, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  removeFromCart,
  setCartItemQuantity,
  applyCoupon,
  selectCartItems,
  selectCartSubtotal,
  selectCartStatus,
  selectCartTotals,
} from '@/store/cartSlice';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const status = useAppSelector(selectCartStatus);
  const totals = useAppSelector(selectCartTotals);
  const [couponInput, setCouponInput] = useState(totals.coupon || '');
  const [couponMessage, setCouponMessage] = useState('');
  const busy = status === 'loading';
  const cartError = totals.error;

  const shipping = totals.shipping;
  const tax = totals.tax;
  const discount = totals.discount;
  const total = totals.orderTotal || subtotal + shipping + tax - discount;

  const lineId = (item: (typeof items)[number]) =>
    String(item.osku || item.sku || item.id || '').trim();

  const handleCoupon = async () => {
    setCouponMessage('');
    const result = await dispatch(applyCoupon(couponInput));
    if (applyCoupon.fulfilled.match(result)) {
      setCouponMessage(result.payload ? 'Coupon applied.' : 'Coupon cleared.');
    } else {
      setCouponMessage(String(result.payload || 'Invalid coupon code'));
    }
  };

  const handleRemove = (item: (typeof items)[number]) => {
    const id = lineId(item);
    if (!id || busy) return;
    dispatch(removeFromCart(id));
  };

  const handleQty = (item: (typeof items)[number], quantity: number) => {
    const id = lineId(item);
    if (!id || busy) return;
    dispatch(setCartItemQuantity({ productId: id, quantity }));
  };

  if (items.length === 0 && !busy) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-[#C8A45D]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
        <p className="text-base text-[#9CA3AF]">Add certified gold from the market to continue.</p>
        <button
          onClick={() => router.push('/buy')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A45D] hover:bg-[#E3C27A] text-black text-sm font-semibold rounded-lg cursor-pointer"
        >
          Browse Market <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-2">Cart</p>
          <h1 className="font-serif text-3xl md:text-4xl text-white font-medium">Secured Shopping Cart</h1>
          <p className="text-sm text-[#9CA3AF] mt-2">
            {items.length} item{items.length === 1 ? '' : 's'} ready for insured checkout
          </p>
        </div>
        {busy && <Loader2 className="w-5 h-5 animate-spin text-[#C8A45D]" />}
      </div>

      {cartError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {cartError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={lineId(item) || item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-[#111111] border border-white/[0.08] rounded-2xl"
            >
              <button
                type="button"
                onClick={() => router.push(`/buy/${item.slug}${item.sku ? `?sku=${encodeURIComponent(item.sku)}` : ''}`)}
                className="w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-[#0A0A0A] cursor-pointer"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-xs">Gold</div>
                )}
              </button>

              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-[13px] uppercase tracking-wider text-[#C8A45D] font-semibold">
                      {item.sku || item.category}
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(`/buy/${item.slug}${item.sku ? `?sku=${encodeURIComponent(item.sku)}` : ''}`)}
                      className="text-[15px] font-semibold text-white hover:text-[#E3C27A] text-left cursor-pointer"
                    >
                      {item.name}
                    </button>
                    {item.discountLabels?.length ? (
                      <p className="text-[12px] text-[#2F9D70] mt-1">{item.discountLabels.join(', ')}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={busy}
                    className="p-2 text-[#9CA3AF] hover:text-red-400 cursor-pointer h-fit disabled:opacity-50"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleQty(item, item.quantity - 1)}
                      disabled={busy}
                      className="p-1.5 text-[#9CA3AF] hover:text-white cursor-pointer disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQty(item, item.quantity + 1)}
                      disabled={busy}
                      className="p-1.5 text-[#9CA3AF] hover:text-white cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    {item.originalLineTotal != null && item.originalLineTotal > (item.lineTotal || 0) && (
                      <p className="text-xs text-[#9CA3AF] line-through">
                        ${item.originalLineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    <p className="text-lg font-bold text-[#E3C27A]">
                      ${(item.lineTotal ?? item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-[#111111] border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <h2 className="text-[15px] font-semibold text-white">Order Summary</h2>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Subtotal</span>
                <span className="text-white">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#2F9D70]">
                  <span>Discount</span>
                  <span>-${discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Shipping</span>
                  <span className="text-white">${shipping.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/10 text-[15px] font-semibold">
                <span className="text-white">Total</span>
                <span className="text-[#E3C27A]">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] uppercase tracking-wider text-[#9CA3AF] font-semibold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Coupon
              </label>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8A45D]/50"
                />
                <button
                  type="button"
                  onClick={handleCoupon}
                  disabled={busy}
                  className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase text-white hover:border-[#C8A45D]/50 cursor-pointer disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`text-xs ${couponMessage.includes('Invalid') ? 'text-red-400' : 'text-[#2F9D70]'}`}>
                  {couponMessage}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#2F9D70]/10 border border-[#2F9D70]/20 text-sm text-[#2F9D70]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              Cart is saved to your vault session — guests and signed-in buyers.
            </div>

            <button
              onClick={() => router.push('/checkout')}
              disabled={busy || items.length === 0}
              className="w-full py-3.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-black text-sm font-bold rounded-lg cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/buy')}
              className="w-full py-2.5 text-[13px] text-[#9CA3AF] hover:text-white cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
