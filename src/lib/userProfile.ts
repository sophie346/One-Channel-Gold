import type { ApiCartItem } from '@/types/api';

const CART_KEY = 'cart';
const CART_DETAILS_KEY = 'cartdetails';
const GUEST_CART_ID_KEY = 'guestCartId';
const COUPON_KEY = 'coupouncode';

type CartDetails = { cartcount?: number; orderTotal?: number };

let memoryCart: ApiCartItem[] | null = null;
let memoryDetails: CartDetails | null = null;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const userProfile = {
  setCart(cart: ApiCartItem[] | null | undefined) {
    memoryCart = Array.isArray(cart) ? cart : [];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CART_KEY, JSON.stringify(memoryCart));
    }
  },

  getCart(): ApiCartItem[] {
    if (memoryCart && memoryCart.length) return memoryCart;
    const stored = readJson<ApiCartItem[]>(CART_KEY, []);
    memoryCart = Array.isArray(stored) ? stored : [];
    return memoryCart;
  },

  setcartDetails(details: CartDetails | null | undefined) {
    memoryDetails = details || {};
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CART_DETAILS_KEY, JSON.stringify(memoryDetails));
    }
  },

  getcartDetails(): CartDetails | null {
    if (memoryDetails) return memoryDetails;
    memoryDetails = readJson<CartDetails | null>(CART_DETAILS_KEY, null);
    return memoryDetails;
  },

  setGuestCartId(guestCartId?: string | null) {
    if (!guestCartId) {
      this.clearGuestCartId();
      return;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUEST_CART_ID_KEY, String(guestCartId));
    }
  },

  getGuestCartId(): string {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(GUEST_CART_ID_KEY) || '';
  },

  clearGuestCartId() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(GUEST_CART_ID_KEY);
    }
  },

  getCoupon(): string {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(COUPON_KEY) || '';
  },

  setCoupon(code: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COUPON_KEY, code || '');
    }
  },

  clearCartSession() {
    this.setCart([]);
    this.setcartDetails({});
    this.clearGuestCartId();
    this.setCoupon('');
  },
};
