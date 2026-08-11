'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-[600px] w-full bg-white rounded-[16px] shadow-xl p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="size-10 text-green-600" />
        </div>
        <h1 className="text-[32px] font-bold text-black mb-3">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <button
          type="button"
          onClick={() => router.push('/buy')}
          className="h-[48px] px-8 bg-[#C8A45D] hover:bg-[#E3C27A] text-black font-bold rounded-[8px] transition-colors cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
