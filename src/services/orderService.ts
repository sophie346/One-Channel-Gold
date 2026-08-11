import { bffRequest } from '@/services/bffClient';

export type StoreOrderItem = {
  title?: string;
  name?: string;
  sku?: string;
  osku?: string;
  price?: number;
  quantity?: number;
  total?: number;
  status?: string;
  images?: Array<string | { url?: string }>;
  image?: string;
  itemPosition?: number | string;
  canCancel?: boolean;
  canReturn?: boolean;
  b2bCreditInvoiceId?: string | null;
  paymentDetails?: {
    paymentMethod?: string;
    paymentGateway?: string;
    [key: string]: unknown;
  };
  tracking?: Array<{
    trackingNumber?: string;
    trackingCompany?: string;
    serviceType?: string;
  }>;
  [key: string]: unknown;
};

export type StoreOrderAddress = {
  name?: string;
  Name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
};

export type StoreOrder = {
  orderId?: string;
  created?: string;
  status?: string;
  email?: string;
  orderTotal?: number;
  totalOrderShipping?: number;
  totalTax?: number;
  items?: StoreOrderItem[];
  billingAddress?: StoreOrderAddress;
  shippingAddress?: StoreOrderAddress;
  paymentMethod?: string;
  paymentDetails?: StoreOrderItem['paymentDetails'];
  [key: string]: unknown;
};

export type ModifyOrderPayload = {
  orderId: string;
  status: string;
  emailId?: string;
  itemPosition?: number | string;
  cancelDetails?: {
    cancelReason?: string;
    customReason?: string;
    creationDate?: string;
  };
  returnDetails?: {
    returnReason?: string;
    customReason?: string;
    creationDate?: string;
  };
};

export type OrdersResponse = {
  error?: boolean;
  message?: string;
  orders?: StoreOrder[];
};

export type TrackOrderResponse = OrdersResponse & {
  order?: StoreOrder;
};

export const ORDER_FILTERS = {
  all: '',
  returns: 'attributes.status=refunded,refundinitialized,partialrefunded',
  cancelled: 'orderHistory.status=cancelled',
} as const;

export async function fetchOrders(
  token: string,
  orderId?: string | null,
  filters?: string | null
): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  if (orderId) params.set('orderId', orderId);
  if (filters) {
    const extra = new URLSearchParams(filters);
    extra.forEach((v, k) => params.set(k, v));
  }
  const qs = params.toString();
  const path = qs ? `account/orders?${qs}` : 'account/orders';
  return bffRequest<OrdersResponse>(path, {
    method: 'GET',
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export async function fetchOrderById(token: string, orderId: string) {
  const res = await fetchOrders(token, orderId);
  return { ...res, order: res.orders?.[0] || null };
}

export async function modifyOrder(payload: ModifyOrderPayload, token: string) {
  return bffRequest<{ error?: boolean; message?: string }>('cart/modifyorder', {
    body: payload,
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export function getReorderableItems(items?: StoreOrderItem[] | null): StoreOrderItem[] {
  return (items || []).filter((item) => {
    const id = item.osku || item.sku;
    if (!id) return false;
    const status = String(item.status || '').toLowerCase();
    if (status.includes('cancel')) return false;
    const qty = Number(item.quantity);
    return !Number.isFinite(qty) || qty > 0;
  });
}

export function getOrderPaymentRaw(order?: StoreOrder | null): string {
  if (!order) return '';
  const fromLine = order.items?.[0]?.paymentDetails;
  return String(
    order.paymentMethod ||
      order.paymentDetails?.paymentMethod ||
      fromLine?.paymentMethod ||
      order.paymentDetails?.paymentGateway ||
      fromLine?.paymentGateway ||
      ''
  ).trim();
}

export function formatOrderPaymentMethod(order?: StoreOrder | null): string {
  const raw = getOrderPaymentRaw(order).toLowerCase().replace(/[\s_-]+/g, '');
  if (!raw) return '—';
  if (raw.includes('b2bcredit') || raw === 'b2bcredits' || raw === 'net30') return 'B2B Credits';
  if (raw.includes('affirm')) return 'Affirm';
  if (raw.includes('acima')) return 'Acima';
  if (raw.includes('google')) return 'Google Pay';
  if (
    raw.includes('card') ||
    raw === 'paynow' ||
    raw === 'paybycard' ||
    raw.includes('square') ||
    raw.includes('stripe')
  ) {
    return 'Card';
  }
  return raw;
}

export function isB2bCreditsPayment(order?: StoreOrder | null) {
  return formatOrderPaymentMethod(order) === 'B2B Credits';
}

export function getOrderB2bCreditInvoiceId(order?: StoreOrder | null) {
  return String(order?.items?.[0]?.b2bCreditInvoiceId || '').trim();
}

export function formatB2bCreditInvoiceId(id?: string | null) {
  const raw = String(id || '').trim();
  if (!raw) return '';
  return raw.length > 8 ? raw.slice(-8).toUpperCase() : raw.toUpperCase();
}

export async function trackOrder(email: string, orderId: string): Promise<TrackOrderResponse> {
  const params = new URLSearchParams({
    email: email.trim(),
    id: orderId.trim(),
  });
  try {
    return await bffRequest<TrackOrderResponse>(`account/trackorder?${params.toString()}`, {
      method: 'GET',
    });
  } catch (err) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Order not found',
    };
  }
}

export function flattenOrderItems(orders: StoreOrder[] = []) {
  return orders.flatMap((order) =>
    (order.items || []).map((item) => {
      const img = item.image || item.images?.[0];
      const image = typeof img === 'string' ? img : img?.url || '';
      return {
        name: String(item.title || item.name || item.sku || 'Gold item'),
        image,
        price: Number(item.price || 0),
        weight: '',
        karat: '',
        orderId: order.orderId,
        status: order.status,
      };
    })
  );
}
