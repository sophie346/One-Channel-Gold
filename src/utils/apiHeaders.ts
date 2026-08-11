import { APP_LABEL, CLIENT_NAME, getIsB2B } from '@/utils/constants';

/** Required headers for every oneauto BFF request (catalog, cart, account). */
export function getOneautoApiHeaders(extra: Record<string, string> = {}) {
  const companyId =
    typeof window !== 'undefined' ? localStorage.getItem('selectedB2BCompany') || '' : '';
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    label: APP_LABEL,
    clientname: CLIENT_NAME,
    isB2B: String(getIsB2B()),
    ...(companyId ? { companyId } : {}),
    ...extra,
  };
}
