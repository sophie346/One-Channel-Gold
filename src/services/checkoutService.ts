import { getIsB2B } from '@/utils/constants';
import { userProfile } from '@/lib/userProfile';
import { appendGuestCartToCheckoutBody, getGuestCartHeaders } from '@/lib/guestCart';
import { bffRequest } from '@/services/bffClient';
import type {
  CheckoutPayload,
  ShippingAddress,
  TaxResponse,
} from '@/types/api';

function authHeaders(token?: string | null, isLoggedIn = false) {
  return {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...getGuestCartHeaders(isLoggedIn),
  };
}

export async function validateTax(
  address: ShippingAddress,
  extras: {
    shippingOptionSelected?: string;
    isB2B?: boolean;
    shipOption?: Record<string, unknown>;
  } = {},
  token?: string | null
): Promise<TaxResponse> {
  const cart = userProfile.getCart();
  const lines = (cart || []).map((item, index) => ({
    sku: item.sku || item.osku,
    price: item.price,
    shipping: item.shipping || 0,
    number: index,
    quantity: Number(item.quantity),
    amount: Number(item.total ?? Number(item.price) * Number(item.quantity || 1)),
  }));

  const res = await bffRequest<TaxResponse>('address/tax', {
    body: {
      taxDocument: {
        addresses: { SingleLocation: address },
        lines,
      },
      shippingOptionSelected: extras.shippingOptionSelected || 'shipping',
      isB2B: extras.isB2B ?? getIsB2B(),
      shipOption: extras.shipOption || {},
    },
    extraHeaders: authHeaders(token, Boolean(token)),
  });

  return res;
}

export async function placeOrder(payload: CheckoutPayload, token?: string | null) {
  const coupon = userProfile.getCoupon();
  const isLoggedIn = Boolean(token);
  const body = appendGuestCartToCheckoutBody(
    {
      ...payload,
      isB2B: payload.isB2B ?? getIsB2B(),
      cart: payload.cart?.length ? payload.cart : userProfile.getCart() || [],
    } as Record<string, unknown>,
    isLoggedIn
  );

  return bffRequest(`cart/checkout?coupouncode=${encodeURIComponent(coupon)}`, {
    body,
    extraHeaders: authHeaders(token, isLoggedIn),
  });
}

export async function getPaymentMethod(token?: string | null) {
  return bffRequest('payments/currentPaymentMethod', {
    method: 'GET',
    extraHeaders: authHeaders(token, Boolean(token)),
  });
}

export async function getSquareKeys(token?: string | null) {
  return bffRequest('payments/square_keys', {
    method: 'GET',
    extraHeaders: authHeaders(token, Boolean(token)),
  });
}

export function extractOrderId(res: any): string {
  return String(
    res?.orderId ||
      res?.orderid ||
      res?.transactionId ||
      res?.transactionid ||
      res?.id ||
      res?.data?.orderId ||
      `ORD-${Math.floor(Math.random() * 900000 + 100000)}`
  );
}
