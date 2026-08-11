import { bffRequest } from '@/services/bffClient';

export interface SavedProduct {
  osku?: string;
  sku?: string;
  title?: string;
  name?: string;
  brand?: string;
  price?: number;
  image?: string;
  images?: Array<string | { url?: string }>;
  slug?: string;
  [key: string]: unknown;
}

export interface SaveForLaterResponse {
  error?: boolean;
  message?: string;
  savedProducts?: SavedProduct[];
}

export async function fetchSaveForLater(token: string) {
  return bffRequest<SaveForLaterResponse>('account/saveforlater', {
    method: 'GET',
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export async function addToSaveForLater(sku: string | string[], token: string) {
  return bffRequest<SaveForLaterResponse>('account/saveforlater', {
    body: { sku },
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export async function removeFromSaveForLater(osku: string, token: string) {
  return bffRequest<SaveForLaterResponse>('account/removesaveforlater', {
    body: { osku },
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}
