import { APP_LABEL, CLIENT_NAME } from '@/utils/constants';

/** Required headers for every oneauto BFF request (catalog, etc.). */
export function getOneautoApiHeaders(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    label: APP_LABEL,
    clientname: CLIENT_NAME,
    ...extra,
  };
}
