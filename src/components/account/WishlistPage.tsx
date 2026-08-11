'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addProductToCart } from '@/store/cartSlice';
import {
  fetchSaveForLater,
  removeFromSaveForLater,
  type SavedProduct,
} from '@/services/wishlistService';
import type { Product } from '@/types';

export default function WishlistPage({
  onNotify,
  openAuth,
}: {
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  openAuth?: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(Boolean(user?.token));

  useEffect(() => {
    if (!user?.token) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSaveForLater(user.token)
      .then((res) => {
        if (!cancelled) setItems(res.savedProducts || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  if (!user) {
    return (
      <div className="min-h-[50vh] py-16 px-4 flex justify-center">
        <div className="max-w-lg w-full bg-[#171A21] rounded-2xl border border-white/10 p-10 text-center">
          <Heart className="w-12 h-12 text-[#C8A45D] mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#F7F4EC] uppercase mb-2">Your Wishlist</h1>
          <p className="text-sm text-[#AEB4C0] mb-6">Sign in to save products and access them anytime.</p>
          <button
            type="button"
            onClick={openAuth}
            className="inline-flex items-center justify-center bg-[#C8A45D] text-black text-sm font-bold px-6 py-3 rounded-xl cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const handleRemove = async (osku: string) => {
    if (!user.token) return;
    await removeFromSaveForLater(osku, user.token);
    setItems((prev) => prev.filter((p) => String(p.osku || p.sku) !== osku));
    onNotify?.('Removed from wishlist', 'info');
  };

  const handleAddToCart = async (product: SavedProduct) => {
    const mapped: Product = {
      id: String(product.osku || product.sku),
      slug: String(product.slug || product.osku || product.sku),
      name: String(product.title || product.name || product.sku),
      category: 'bars',
      karat: '',
      weight: 0,
      purity: '',
      hallmark: '',
      price: Number(product.price || 0),
      image: typeof product.image === 'string' ? product.image : '',
      description: '',
      certificateStatus: 'None',
      availability: 'In Stock',
      metalColor: 'Yellow Gold',
      condition: 'Brand New',
      sku: String(product.sku || product.osku),
      osku: String(product.osku || product.sku),
    };
    await dispatch(addProductToCart({ product: mapped, quantity: 1 }));
    onNotify?.('Added to cart', 'success');
  };

  return (
    <AccountLayout title={items.length ? `Wishlist (${items.length})` : 'Wishlist'} subtitle="Saved products for quick reorder.">
      {loading ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-16 text-center text-[#AEB4C0]">Loading wishlist…</div>
      ) : items.length === 0 ? (
        <div className="bg-[#171A21] rounded-2xl border border-white/10 p-12 text-center">
          <Heart className="w-12 h-12 text-[#C8A45D] mx-auto mb-4" />
          <h2 className="font-bold text-xl text-[#F7F4EC] mb-2">Your wishlist is empty</h2>
          <button
            type="button"
            onClick={() => router.push('/buy')}
            className="mt-4 inline-flex bg-[#C8A45D] text-black text-sm font-bold px-6 py-3 rounded-xl cursor-pointer"
          >
            Shop gold
          </button>
        </div>
      ) : (
        <ul className="bg-[#171A21] rounded-2xl border border-white/10 divide-y divide-white/5">
          {items.map((product) => {
            const sku = String(product.osku || product.sku || '');
            const img = typeof product.image === 'string' ? product.image : product.images?.[0];
            const image = typeof img === 'string' ? img : img?.url || '';
            return (
              <li key={sku} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <img src={image} alt="" className="w-full sm:w-20 h-20 rounded-xl object-cover bg-black" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-[#AEB4C0]">{product.brand}</p>
                  <p className="font-bold text-[#F7F4EC] truncate">{product.title || product.name || sku}</p>
                  <p className="text-[#E3C27A] font-bold mt-1">${Number(product.price || 0).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#C8A45D] text-black text-xs font-bold cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(sku)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 text-red-400 text-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AccountLayout>
  );
}
