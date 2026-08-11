import { PRODUCT_BASE_URL } from '@/utils/constants';
import { userProfile } from '@/lib/userProfile';
import { bffRequest } from '@/services/bffClient';

function bearer(token?: any) {
  const value = token?.token || token?.accessToken || token;
  return value ? { authorization: `Bearer ${value}` } : {};
}

export async function taxValidation(address: any, extras: any = {}, token?: any) {
  const cart = userProfile.getCart();
  const lines = cart?.map((item: any, index: number) => ({
    sku: item.sku,
    price: item.price,
    shipping: item.shipping,
    number: index,
    quantity: Number(item.quantity),
    amount: Number(item.total ?? Number(item.price) * Number(item.quantity || 1)),
  }));

  try {
    const res = await bffRequest('address/tax', {
      body: {
        taxDocument: {
          addresses: { SingleLocation: address },
          lines,
        },
        ...extras,
      },
      extraHeaders: bearer(token),
    });
    if (res?.error) return { error: true, message: res?.message };
    if (res?.data) return res;
    return { data: res };
  } catch (err: any) {
    return { error: true, message: err?.message || 'Tax failed' };
  }
}

export async function addressValidate(address: any, token?: any) {
  try {
    return await bffRequest('address/validate', { body: address, extraHeaders: bearer(token) });
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export async function AddAddress(data: any, token?: any) {
  try {
    return await bffRequest('address/add', { body: data, extraHeaders: bearer(token) });
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export async function UpdateAddress(data: any, token?: any) {
  try {
    return await bffRequest('address/update', { body: data, extraHeaders: bearer(token) });
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export async function DeleteAddress(data: any, token?: any) {
  try {
    return await bffRequest('address/delete', { body: data, extraHeaders: bearer(token) });
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export async function GetAddresses(data: any, token?: any) {
  try {
    return await bffRequest('address/', { body: data, extraHeaders: bearer(token) });
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export async function getAffirmDeatils(token?: any) {
  try {
    return await bffRequest('account/getSettings?apiName=affirmapidetails', {
      method: 'GET',
      extraHeaders: bearer(token),
    });
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export async function getAcimaDetails(token?: any) {
  try {
    return await bffRequest('account/getSettings?apiName=acimaapidetails', {
      method: 'GET',
      extraHeaders: bearer(token),
    });
  } catch (err: any) {
    return { error: true, message: err?.message };
  }
}

export const useLoadAffirmScript = (shouldLoad: boolean, pubicKey?: string, scriptUrl?: string) => {
  if (!shouldLoad || typeof window === 'undefined') return;
  if ((window as any).affirm) return;
  (window as any)._affirm_config = {
    public_api_key: pubicKey,
    script: scriptUrl || 'https://cdn1-sandbox.affirm.com/js/v2/affirm.js',
  };
  const script = document.createElement('script');
  script.src = (window as any)._affirm_config.script;
  script.async = true;
  document.head.appendChild(script);
};

export const useLoadAcimaScript = (shouldLoad: boolean, scriptUrl?: string) => {
  if (typeof window === 'undefined' || !shouldLoad) return;
  if ((window as any).Acima || (window as any).acima) return;
  const src = scriptUrl || 'https://ecom.sandbox.acimacredit.com/js/acima.min.js';
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
};

export const ensureAcimaLoaded = (scriptUrl?: string) => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if ((window as any).Acima?.Client) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const src = scriptUrl || 'https://ecom.sandbox.acimacredit.com/js/acima.min.js';
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      const check = () => {
        if ((window as any).Acima?.Client) resolve();
        else setTimeout(check, 50);
      };
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      let attempts = 0;
      const check = () => {
        if ((window as any).Acima?.Client) resolve();
        else if (attempts++ < 100) setTimeout(check, 50);
        else reject(new Error('Acima script loaded but Acima.Client not found'));
      };
      check();
    };
    script.onerror = () => reject(new Error('Failed to load Acima script'));
    document.head.appendChild(script);
  });
};

export const addExtraPercentAmount = (amount: number, percent: number) => {
  const result = parseFloat(String(amount)) * (1 + percent);
  return parseFloat(result.toFixed(2));
};

export { PRODUCT_BASE_URL };
