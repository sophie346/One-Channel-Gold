import { PRODUCT_BASE_URL } from '@/utils/constants';
import { getOneautoApiHeaders } from '@/utils/apiHeaders';

export async function bffRequest<T = any>(
  path: string,
  {
    method = 'POST',
    body,
    extraHeaders = {},
  }: {
    method?: 'GET' | 'POST';
    body?: unknown;
    extraHeaders?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = `${PRODUCT_BASE_URL}${path.replace(/^\//, '')}`;
  const res = await fetch(url, {
    method,
    headers: getOneautoApiHeaders(extraHeaders),
    body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    cache: 'no-store',
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || `Request failed (${res.status})`);
  }

  if (!res.ok && json?.error !== false) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }

  return (json ?? {}) as T;
}
