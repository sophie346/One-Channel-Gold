import { bffRequest } from '@/services/bffClient';
import type { AuthUser } from '@/types/api';

export interface SavedAddress {
  id?: string;
  _id?: string;
  uid?: string;
  fullname: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  phone?: string;
  country?: string;
  emailId?: string;
  isDefault?: boolean;
  isCompany?: boolean;
  addressIndex?: number;
  [key: string]: unknown;
}

export interface AddressFormData {
  fullname: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface AddressesListResponse {
  error?: boolean;
  message?: string;
  data?: { addresses?: SavedAddress[] } | SavedAddress[];
  addresses?: SavedAddress[];
}

function authHeader(token: string) {
  return { authorization: `Bearer ${token}` };
}

export async function listAddresses(user: AuthUser, companyId?: string | null) {
  return bffRequest<AddressesListResponse>('address/', {
    body: {
      uid: user.userId,
      emailId: user.emailId || user.email,
      company: companyId || undefined,
    },
    extraHeaders: authHeader(user.token || user.accessToken),
  });
}

export async function validateAddress(data: Record<string, unknown>, token: string) {
  return bffRequest('address/validate', {
    body: data,
    extraHeaders: authHeader(token),
  });
}

export async function addAddress(data: Record<string, unknown>, token: string) {
  return bffRequest('address/add', { body: data, extraHeaders: authHeader(token) });
}

export async function updateAddress(data: Record<string, unknown>, token: string) {
  return bffRequest('address/update', { body: data, extraHeaders: authHeader(token) });
}

export async function deleteAddress(
  data: { id: number | string; emailId: string },
  token: string
) {
  return bffRequest('address/delete', { body: data, extraHeaders: authHeader(token) });
}

export function emptyAddressForm(): AddressFormData {
  return {
    fullname: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
  };
}

export function addressFromSaved(address: SavedAddress): AddressFormData {
  return {
    fullname: String(address.fullname || ''),
    phone: String(address.phone || ''),
    line1: String(address.line1 || ''),
    line2: String(address.line2 || ''),
    city: String(address.city || ''),
    region: String(address.region || ''),
    postalCode: String(address.postalCode || ''),
  };
}

export function extractAddresses(res: AddressesListResponse | null | undefined): SavedAddress[] {
  const list =
    res?.data && !Array.isArray(res.data)
      ? res.data.addresses
      : Array.isArray(res?.data)
        ? res.data
        : res?.addresses;
  return Array.isArray(list) ? list : [];
}
