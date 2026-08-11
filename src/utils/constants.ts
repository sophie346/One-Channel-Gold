
export const PRODUCT_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_BASE_URL || 'https://backend.oneauto.us/';

export const CLIENT_NAME = 'b2l2np1msnlq6mb';

export const APP_LABEL = process.env.NEXT_PUBLIC_APP_LABEL || 'one-gold';

export const USE_GUEST_CART = true;

export let isB2B =
  typeof window !== 'undefined' && window.localStorage.getItem('isB2b') === 'true';

export const SetIsB2B = (boolvalue: boolean) => {
  isB2B = !!boolvalue;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('isB2b', isB2B ? 'true' : 'false');
  }
};

export function getIsB2B() {
  return typeof window !== 'undefined'
    ? window.localStorage.getItem('isB2b') === 'true'
    : isB2B;
}

export const STORE_PICKUP_ADDRESS = 'OneGold Vault, Dubai';
