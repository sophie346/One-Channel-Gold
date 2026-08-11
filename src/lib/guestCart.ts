import { USE_GUEST_CART } from '@/utils/constants';
import { userProfile } from '@/lib/userProfile';
import type { ApiCartItem, CartResponse } from '@/types/api';

export function persistGuestCartIdFromResponse(res?: CartResponse | null) {
  if (res?.guestCartId) userProfile.setGuestCartId(res.guestCartId);
}

export function getGuestCartHeaders(isLoggedIn = false): Record<string, string> {
  if (!USE_GUEST_CART) return {};
  const id = userProfile.getGuestCartId();
  if (isLoggedIn) {
    return id ? { useguestcart: 'true', guestcartid: id } : {};
  }
  return {
    useguestcart: 'true',
    ...(id ? { guestcartid: id } : {}),
  };
}

export function buildGuestCartBody(isLoggedIn: boolean, localCartArray: ApiCartItem[] = []) {
  if (!USE_GUEST_CART) {
    return { cart: isLoggedIn ? [] : localCartArray || [] };
  }

  const guestCartId = userProfile.getGuestCartId();
  if (isLoggedIn) {
    return {
      useGuestCart: true,
      cart: [],
      ...(guestCartId ? { guestCartId } : {}),
    };
  }

  return {
    useGuestCart: true,
    ...(guestCartId ? { guestCartId, cart: [] } : { cart: localCartArray || [] }),
  };
}

export function appendGuestCartToCheckoutBody<T extends Record<string, unknown>>(
  body: T,
  isLoggedIn: boolean
): T & { useGuestCart?: boolean; guestCartId?: string; cart?: unknown } {
  if (!USE_GUEST_CART || isLoggedIn) return body;
  const guestCartId = userProfile.getGuestCartId();
  return {
    ...body,
    useGuestCart: true,
    ...(guestCartId
      ? { guestCartId, cart: Array.isArray(body.cart) && body.cart.length ? body.cart : [] }
      : {}),
  };
}

export function applyCartResponseToProfile(res?: CartResponse | null) {
  if (!res || res.error) return false;
  userProfile.setCart(res.cart || []);
  persistGuestCartIdFromResponse(res);
  userProfile.setcartDetails({
    cartcount: res.cartcount,
    orderTotal: res.ordertotal ?? res.orderTotal,
  });
  return true;
}
