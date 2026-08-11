import { bffRequest } from '@/services/bffClient';

export async function CurrentPaymentGateway() {
  try {
    const res = await bffRequest('payments/currentPaymentMethod', { method: 'GET' });
    return res;
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export async function CurrentPublishablekeySquare() {
  try {
    const res = await bffRequest('payments/square_keys', { method: 'GET' });
    return res;
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}
