'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ShoppingCart, ShieldCheck, Truck, BadgeCheck, Check
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/data/mockData';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/cartSlice';

interface ProductDetailsPageProps {
  slug: string;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function ProductDetailsPage({ slug, onShowNotification }: ProductDetailsPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Product not found</h1>
        <p className="text-[#9CA3AF] text-sm">This item may have been sold or the link is invalid.</p>
        <button
          onClick={() => router.push('/buy')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8A45D] text-black text-sm font-semibold rounded-lg cursor-pointer"
        >
          Back to Market
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    onShowNotification?.(`${product.name} added to cart.`, 'success');
  };

  const handleBuyNow = () => {
    dispatch(addToCart(product));
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <button
        onClick={() => router.push('/buy')}
        className="flex items-center gap-2 text-xs font-bold text-[#AEB4C0] hover:text-[#C8A45D] uppercase tracking-widest mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#11141A] border border-white/10 rounded-xl p-6 md:p-10">
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-[#080A0D] rounded-sm overflow-hidden border border-white/10 relative group">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute top-4 left-4 text-[9px] uppercase bg-[#C8A45D] text-black font-black px-2.5 py-1 rounded-sm tracking-widest">
              {product.karat} Pure
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-square bg-[#080A0D] border-2 border-[#C8A45D] rounded overflow-hidden">
              <img src={product.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square bg-[#080A0D]/60 border border-white/10 rounded flex items-center justify-center text-[10px] text-[#AEB4C0]">20x Macro</div>
            <div className="aspect-square bg-[#080A0D]/60 border border-white/10 rounded flex items-center justify-center text-[10px] text-[#AEB4C0]">Purity Label</div>
            <div className="aspect-square bg-[#080A0D]/60 border border-white/10 rounded flex items-center justify-center text-[10px] text-[#AEB4C0]">Assay Card</div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] tracking-widest text-[#C8A45D] uppercase font-bold">{product.category}</span>
              <span className="text-white/20">•</span>
              <span className="text-[10px] uppercase tracking-wider text-[#AEB4C0]">{product.metalColor}</span>
              <span className="text-white/20">•</span>
              <span className="text-[10px] uppercase bg-white/5 text-[#AEB4C0] px-2 py-0.5 rounded font-semibold">{product.condition}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#F7F4EC] tracking-tight">{product.name}</h1>
            <p className="text-sm text-[#AEB4C0] leading-relaxed">{product.description}</p>

            <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-lg p-5">
              <h4 className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-black mb-3">Metallurgical Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Stated Purity</span>
                  <p className="text-sm font-bold text-[#F7F4EC]">{product.karat} / {product.purity}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Net Metal Weight</span>
                  <p className="text-sm font-bold text-[#F7F4EC]">{product.weight} grams</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Hallmark</span>
                  <p className="text-sm font-bold text-[#F7F4EC]">{product.hallmark}</p>
                </div>
                {product.size && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Size</span>
                    <p className="text-sm font-bold text-[#F7F4EC]">{product.size}</p>
                  </div>
                )}
                {product.certificateNumber && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Certificate</span>
                    <p className="text-sm font-mono text-[#E3C27A] font-bold">{product.certificateNumber}</p>
                  </div>
                )}
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Availability</span>
                  <p className="text-sm font-bold text-[#2F9D70]">{product.availability}</p>
                </div>
              </div>
            </div>

            <ul className="space-y-2 text-[13px] text-[#9CA3AF]">
              {[
                'Fully insured armored shipping',
                'LBMA-aligned assay documentation',
                'OneChannelAdmin custody ledger entry',
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C8A45D] shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-[10px] text-[#AEB4C0] uppercase tracking-wider">Melt Price Index</span>
              <p className="text-4xl font-black text-[#E3C27A] mt-1">
                ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-sm font-bold uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold uppercase tracking-wider rounded-lg cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-[#9CA3AF]">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#C8A45D]" /> Insured</span>
              <span className="inline-flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#C8A45D]" /> Secure Shipping</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-[#C8A45D]" /> Verified Assay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
