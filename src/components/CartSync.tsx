'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshCart } from '@/store/cartSlice';
import { userProfile } from '@/lib/userProfile';
import type { ApiCartItem } from '@/types/api';

/** Seed guest cart from the old redux-persist cart once, then sync with BFF. */
function migrateLegacyPersistCart() {
  if (typeof window === 'undefined') return;
  if (userProfile.getGuestCartId()) return;
  if ((userProfile.getCart() || []).length) return;
  try {
    const raw = window.localStorage.getItem('persist:onegold');
    if (!raw) return;
    const root = JSON.parse(raw);
    const cartState = root?.cart ? JSON.parse(root.cart) : null;
    const items = Array.isArray(cartState?.items) ? cartState.items : [];
    if (!items.length) return;
    const apiItems: ApiCartItem[] = items.map((item: any) => ({
      osku: String(item.sku || item.osku || item.id),
      sku: String(item.sku || item.osku || item.id),
      title: item.name,
      name: item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      total: Number(item.price || 0) * Number(item.quantity || 1),
      image: item.image,
      slug: item.slug,
    }));
    userProfile.setCart(apiItems);
  } catch {
    // ignore malformed persist blob
  }
}

export default function CartSync() {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const token = useAppSelector((s) => s.auth.user?.token);
  const booted = useRef(false);

  useEffect(() => {
    if (!initialized) return;
    migrateLegacyPersistCart();
    dispatch(refreshCart());
    booted.current = true;
  }, [initialized, dispatch]);

  useEffect(() => {
    if (!booted.current) return;
    dispatch(refreshCart());
  }, [token, dispatch]);

  return null;
}
