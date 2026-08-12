import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Product } from '@/types';
import type { ApiCartItem, CartResponse } from '@/types/api';
import {
  addToCartApi,
  removeCartItem,
  syncCart,
  updateCartItemQty,
} from '@/services/cartService';
import { getReorderableItems, type StoreOrderItem } from '@/services/orderService';
import { userProfile } from '@/lib/userProfile';
import type { RootState } from './index';

export interface CartItem extends Product {
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  originalUnitPrice?: number;
  originalLineTotal?: number;
  discountApplied?: number | boolean;
  discountLabels?: string[];
}

interface CartState {
  items: CartItem[];
  apiItems: ApiCartItem[];
  cartCount: number;
  orderTotal: number;
  subTotal: number;
  totalTax: number;
  shipping: number;
  originalOrderTotal: number;
  discountTotal: number;
  coupon: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

function firstImage(item: ApiCartItem): string {
  if (typeof item.image === 'string' && item.image) return item.image;
  const first = Array.isArray(item.images) ? item.images[0] : undefined;
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') return first.url || '';
  return '';
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function mapApiCartItemToCartItem(item: ApiCartItem): CartItem {
  const unitPrice = Number(item.price ?? 0);
  const quantity = Number(item.quantity || 1);
  const lineTotal = item.total != null ? Number(item.total) : unitPrice * quantity;
  const originalUnitPrice =
    item.original__Price != null ? Number(item.original__Price) : undefined;
  const originalLineTotal =
    item.original__Total != null ? Number(item.original__Total) : undefined;
  const osku = String(item.osku || '').trim();
  const sku = String(item.sku || '').trim();
  const id = osku || sku;
  const name = String(item.title || item.name || id || 'Gold item');
  const discountLabels = Array.isArray(item.discountsFounds)
    ? item.discountsFounds.map((d) => String(d?.name || d?.code || '').trim()).filter(Boolean)
    : [];

  return {
    id,
    slug: String(item.slug || slugify(id || name)),
    name,
    category: 'bars',
    karat: '',
    weight: 0,
    purity: '',
    hallmark: '',
    price: unitPrice,
    image: firstImage(item),
    description: '',
    certificateStatus: 'None',
    availability: 'In Stock',
    metalColor: 'Yellow Gold',
    condition: 'Brand New',
    sku: sku || osku,
    osku: osku || sku,
    quantity,
    unitPrice,
    lineTotal,
    originalUnitPrice,
    originalLineTotal,
    discountApplied: item.discount__applied,
    discountLabels,
  };
}

function findApiCartItem(apiItems: ApiCartItem[], productId: string) {
  const id = String(productId || '').trim();
  if (!id) return undefined;
  return apiItems.find(
    (i) => String(i.osku || '').trim() === id || String(i.sku || '').trim() === id
  );
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (value == null || value === '') continue;
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function cartHasCouponDiscount(res: CartResponse, code: string): boolean {
  if (!code) return true;
  if (res.discount__applied) return true;
  const orderTotal = pickNumber(res.ordertotal, res.orderTotal);
  const originalOrderTotal = pickNumber(res.original__OrderTotal, res.originalOrderTotal);
  if (originalOrderTotal > 0 && orderTotal >= 0 && originalOrderTotal > orderTotal + 0.001) {
    return true;
  }
  return (res.cart || []).some((item) => {
    if (item.discount__applied) return true;
    if (Array.isArray(item.discountsFounds) && item.discountsFounds.length > 0) return true;
    const originalTotal = pickNumber(item.original__Total);
    const total = pickNumber(item.total, Number(item.price) * Number(item.quantity || 1));
    if (originalTotal > 0 && originalTotal > total + 0.001) return true;
    const originalPrice = pickNumber(item.original__Price);
    const price = pickNumber(item.price);
    return originalPrice > 0 && originalPrice > price + 0.001;
  });
}

function calcDiscountTotal(
  cart: ApiCartItem[] | undefined,
  originalOrderTotal: number,
  orderTotal: number
): number {
  const fromLines = (cart || []).reduce((sum, item) => {
    const original = pickNumber(item.original__Total);
    const current = pickNumber(item.total, Number(item.price) * Number(item.quantity || 1));
    if (original > current) return sum + (original - current);
    const applied = item.discount__applied;
    if (typeof applied === 'number' && applied > 0) return sum + applied;
    return sum;
  }, 0);
  if (fromLines > 0) return fromLines;
  if (originalOrderTotal > orderTotal) return originalOrderTotal - orderTotal;
  return 0;
}

const initialState: CartState = {
  items: [],
  apiItems: [],
  cartCount: 0,
  orderTotal: 0,
  subTotal: 0,
  totalTax: 0,
  shipping: 0,
  originalOrderTotal: 0,
  discountTotal: 0,
  coupon: '',
  status: 'idle',
  error: null,
};

function applyCartResponse(state: CartState, res: CartResponse) {
  if (res.error) {
    state.status = 'failed';
    state.error = res.message || 'Cart update failed';
    return;
  }
  state.apiItems = res.cart || [];
  state.items = state.apiItems.map(mapApiCartItemToCartItem);
  state.cartCount = res.cartcount ?? state.items.reduce((n, i) => n + i.quantity, 0);
  state.orderTotal = pickNumber(res.ordertotal, res.orderTotal);
  state.subTotal = pickNumber(res.subTotal, res.subtotal);
  state.totalTax = pickNumber(res.totalTax);
  state.shipping = pickNumber(res.totalOrderShipping);
  state.originalOrderTotal = pickNumber(res.original__OrderTotal, res.originalOrderTotal);
  state.discountTotal = calcDiscountTotal(state.apiItems, state.originalOrderTotal, state.orderTotal);
  if (state.discountTotal <= 0 && state.originalOrderTotal > state.orderTotal) {
    state.discountTotal = state.originalOrderTotal - state.orderTotal;
  }
  if (state.subTotal <= 0) {
    state.subTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  if (state.orderTotal <= 0) {
    state.orderTotal = state.subTotal + state.shipping + state.totalTax - state.discountTotal;
  }
  state.status = 'succeeded';
  state.error = null;
}

function selectToken(state: RootState) {
  return state.auth.user?.token || null;
}

export const refreshCart = createAsyncThunk('cart/refresh', async (_, { getState, rejectWithValue }) => {
  try {
    return await syncCart(selectToken(getState() as RootState));
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to sync cart');
  }
});

export const addProductToCart = createAsyncThunk(
  'cart/addProduct',
  async (
    { product, quantity = 1 }: { product: Product; quantity?: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const osku = String(product.sku || product.osku || product.id || '').trim();
      const existing = findApiCartItem(state.cart.apiItems, osku);
      const desiredQty = (Number(existing?.quantity) || 0) + Math.max(1, quantity);
      const res = await addToCartApi(
        osku,
        desiredQty,
        { osku, sku: osku },
        selectToken(state)
      );
      if (res?.error) return rejectWithValue(res.message || 'Failed to add to cart');
      return res;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to add to cart');
    }
  }
);

export const setCartItemQuantity = createAsyncThunk(
  'cart/setQuantity',
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const apiItem = findApiCartItem(state.cart.apiItems, productId);
      if (!apiItem) throw new Error('Cart item not found');
      const res =
        quantity <= 0
          ? await removeCartItem(apiItem, selectToken(state))
          : await updateCartItemQty(apiItem, quantity, selectToken(state));
      if (res?.error) {
        return rejectWithValue(res.message || 'Failed to update quantity');
      }
      return res;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to update quantity');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const apiItem = findApiCartItem(state.cart.apiItems, productId);
      if (!apiItem) throw new Error('Cart item not found');
      const res = await removeCartItem(apiItem, selectToken(state));
      if (res?.error) {
        return rejectWithValue(res.message || 'Failed to remove item');
      }
      return res;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to remove item');
    }
  }
);

export const clearCartRemote = createAsyncThunk('cart/clear', async (_, { getState }) => {
  const state = getState() as RootState;
  const token = selectToken(state);
  for (const item of state.cart.apiItems) {
    await removeCartItem(item, token);
  }
  userProfile.setCoupon('');
  return syncCart(token);
});

export const reorderOrderToCart = createAsyncThunk(
  'cart/reorderOrder',
  async (items: StoreOrderItem[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = selectToken(state);
      const lines = getReorderableItems(items);
      if (!lines.length) return rejectWithValue('No items available to reorder');

      let apiItems = state.cart.apiItems;
      let lastRes = null as Awaited<ReturnType<typeof addToCartApi>> | null;

      for (const item of lines) {
        const osku = String(item.osku || item.sku || '');
        const addQty = Math.max(1, Number(item.quantity) || 1);
        const existing = apiItems.find((c) => c.osku === osku || c.sku === osku);
        const desiredQty = (Number(existing?.quantity) || 0) + addQty;
        lastRes = await addToCartApi(osku, desiredQty, { osku, sku: item.sku || osku }, token);
        if (lastRes.error) return rejectWithValue(lastRes.message || 'Could not reorder this order');
        apiItems = lastRes.cart || apiItems;
      }

      return lastRes!;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Could not reorder this order');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { dispatch, rejectWithValue }) => {
    const trimmed = String(code || '').trim();
    userProfile.setCoupon(trimmed);
    const res = await dispatch(refreshCart()).unwrap();
    if (!trimmed) return '';
    if (!cartHasCouponDiscount(res as CartResponse, trimmed)) {
      userProfile.setCoupon('');
      await dispatch(refreshCart());
      return rejectWithValue('Invalid coupon code');
    }
    return trimmed;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartLocal(state) {
      state.items = [];
      state.apiItems = [];
      state.cartCount = 0;
      state.orderTotal = 0;
      state.subTotal = 0;
      state.totalTax = 0;
      state.shipping = 0;
      state.originalOrderTotal = 0;
      state.discountTotal = 0;
      state.coupon = '';
    },
  },
  extraReducers: (builder) => {
    const pending = (state: CartState) => {
      state.status = 'loading';
      state.error = null;
    };
    const rejected = (state: CartState, action: { payload?: unknown }) => {
      state.status = 'failed';
      state.error = String(action.payload || 'Cart error');
    };

    builder
      .addCase(refreshCart.pending, pending)
      .addCase(refreshCart.fulfilled, (state, action) => applyCartResponse(state, action.payload))
      .addCase(refreshCart.rejected, rejected)
      .addCase(addProductToCart.pending, pending)
      .addCase(addProductToCart.fulfilled, (state, action) => applyCartResponse(state, action.payload))
      .addCase(addProductToCart.rejected, rejected)
      .addCase(setCartItemQuantity.pending, pending)
      .addCase(setCartItemQuantity.fulfilled, (state, action) => applyCartResponse(state, action.payload))
      .addCase(setCartItemQuantity.rejected, rejected)
      .addCase(removeFromCart.pending, pending)
      .addCase(removeFromCart.fulfilled, (state, action) => applyCartResponse(state, action.payload))
      .addCase(removeFromCart.rejected, rejected)
      .addCase(clearCartRemote.fulfilled, (state, action) => applyCartResponse(state, action.payload))
      .addCase(reorderOrderToCart.pending, pending)
      .addCase(reorderOrderToCart.fulfilled, (state, action) => applyCartResponse(state, action.payload))
      .addCase(reorderOrderToCart.rejected, rejected)
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.coupon = action.payload;
        state.error = null;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.coupon = '';
        state.error = String(action.payload || 'Invalid coupon code');
      });
  },
});

export const { resetCartLocal } = cartSlice.actions;

/** Back-compat aliases for older local-only cart calls */
export const addToCart = (product: Product) => addProductToCart({ product, quantity: 1 });
export const updateQuantity = (payload: { id: string; quantity: number }) =>
  setCartItemQuantity({ productId: payload.id, quantity: payload.quantity });
export const clearCart = () => clearCartRemote();

type CartRoot = { cart?: CartState | null };

export const selectCartItems = (state: CartRoot) => state.cart?.items ?? [];
export const selectCartCount = (state: CartRoot) =>
  state.cart?.cartCount ?? (state.cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state: CartRoot) => {
  if (state.cart?.subTotal) return state.cart.subTotal;
  return (state.cart?.items ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0);
};
export const selectCartStatus = (state: CartRoot) => state.cart?.status ?? 'idle';
export const selectCartTotals = (state: CartRoot) => ({
  subTotal: state.cart?.subTotal ?? 0,
  shipping: state.cart?.shipping ?? 0,
  tax: state.cart?.totalTax ?? 0,
  discount: state.cart?.discountTotal ?? 0,
  orderTotal: state.cart?.orderTotal ?? 0,
  coupon: state.cart?.coupon ?? '',
  error: state.cart?.error ?? null,
});

export default cartSlice.reducer;
