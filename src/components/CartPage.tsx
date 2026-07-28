'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  removeFromCart,
  updateQuantity,
  selectCartItems,
  selectCartSubtotal,
} from '@/store/cartSlice';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = items.length > 0 ? 35 : 0;
  const insurance = items.length > 0 ? Math.round(subtotal * 0.005) : 0;
  const total = subtotal + shipping + insurance;

  if (items.length === 0) {
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
      <div className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-2">Cart</p>
        <h1 className="font-serif text-3xl md:text-4xl text-white font-medium">Secured Shopping Cart</h1>
        <p className="text-sm text-[#9CA3AF] mt-2">{items.length} item{items.length === 1 ? '' : 's'} ready for insured checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-[#111111] border border-white/[0.08] rounded-2xl"
            >
              <button
                onClick={() => router.push(`/buy/${item.slug}`)}
                className="w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-[#0A0A0A] cursor-pointer"
              >
                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>

              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-[13px] uppercase tracking-wider text-[#C8A45D] font-semibold">{item.category}</p>
                    <button
                      onClick={() => router.push(`/buy/${item.slug}`)}
                      className="text-[15px] font-semibold text-white hover:text-[#E3C27A] text-left cursor-pointer"
                    >
                      {item.name}
                    </button>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">
                      {item.weight}g · {item.karat} · {item.metalColor}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="p-2 text-[#9CA3AF] hover:text-red-400 cursor-pointer h-fit"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-lg p-1">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="p-1.5 text-[#9CA3AF] hover:text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="p-1.5 text-[#9CA3AF] hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-[#E3C27A]">
                    ${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
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
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Insured Shipping</span>
                <span className="text-white">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Transit Insurance</span>
                <span className="text-white">${insurance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10 text-[15px] font-semibold">
                <span className="text-white">Total</span>
                <span className="text-[#E3C27A]">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#2F9D70]/10 border border-[#2F9D70]/20 text-sm text-[#2F9D70]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              Full-value insurance included for armored logistics.
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-black text-sm font-bold rounded-lg cursor-pointer inline-flex items-center justify-center gap-2"
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
