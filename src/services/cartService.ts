import { getIsB2B } from '@/utils/constants';
import { userProfile } from '@/lib/userProfile';
import {
  applyCartResponseToProfile,
  buildGuestCartBody,
  getGuestCartHeaders,
} from '@/lib/guestCart';
import { bffRequest } from '@/services/bffClient';
import type { ApiCartItem, CartResponse } from '@/types/api';

function authHeaders(token?: string | null, isLoggedIn = false) {
  return {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...getGuestCartHeaders(isLoggedIn),
  };
}

export async function syncCart(token?: string | null): Promise<CartResponse> {
  const isLoggedIn = Boolean(token);
  const coupon = userProfile.getCoupon();
  const localCart = userProfile.getCart();
  const res = await bffRequest<CartResponse>(
    `cart?coupouncode=${encodeURIComponent(coupon)}&timestamp=${Date.now()}`,
    {
      body: {
        isB2B: getIsB2B(),
        ...buildGuestCartBody(isLoggedIn, localCart),
      },
      extraHeaders: authHeaders(token, isLoggedIn),
    }
  );
  applyCartResponseToProfile(res);
  return res;
}

export async function addToCartApi(
  osku: string,
  quantity: number,
  product?: { osku?: string; sku?: string; selectedAddOns?: Record<string, unknown> },
  token?: string | null
): Promise<CartResponse> {
  const isLoggedIn = Boolean(token);
  const coupon = userProfile.getCoupon();
  const localCart = userProfile.getCart();
  const res = await bffRequest<CartResponse>(
    `cart/add/${encodeURIComponent(osku)}/${quantity}${
      coupon ? `?coupouncode=${encodeURIComponent(coupon)}` : ''
    }`,
    {
      body: {
        isB2B: getIsB2B(),
        product: product || { osku },
        ...buildGuestCartBody(isLoggedIn, localCart),
      },
      extraHeaders: authHeaders(token, isLoggedIn),
    }
  );
  applyCartResponseToProfile(res);
  return res;
}

/** Resolve cart line key the same way Nexus does (`osku || sku`). */
function resolveCartOsku(item: ApiCartItem): string {
  return String(item?.osku || item?.sku || '').trim();
}

export async function updateCartItemQty(
  item: ApiCartItem,
  quantity: number,
  token?: string | null
) {
  const osku = resolveCartOsku(item);
  if (!osku) {
    return { error: true, message: 'Missing product SKU.' } as CartResponse;
  }
  return addToCartApi(osku, quantity, { osku, sku: item.sku || osku }, token);
}

export async function removeCartItem(item: ApiCartItem, token?: string | null) {
  const osku = resolveCartOsku(item);
  if (!osku) {
    return { error: true, message: 'Missing product SKU.' } as CartResponse;
  }
  return addToCartApi(osku, 0, { osku, sku: item.sku || osku }, token);
}
