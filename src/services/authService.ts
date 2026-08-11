import { jwtDecode } from 'jwt-decode';
import { bffRequest } from '@/services/bffClient';
import { syncCart } from '@/services/cartService';
import { userProfile } from '@/lib/userProfile';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { GetCompaniesData } from '@/adapters/loginfunctions';
import { SetIsB2B } from '@/utils/constants';
import {
  firebaseConfirmPasswordReset,
  firebaseResetPassword,
  firebaseSignIn,
  firebaseSignOut,
  firebaseVerifyPasswordResetCode,
  getFreshIdToken,
  waitForAuthUser,
} from '@/lib/firebaseAuth';
import type { AccountProfile, AuthUser, B2BCompany, UserDetailsResponse } from '@/types/api';

export function tokenToAuthUser(
  token: string,
  displayName?: string | null,
  fallbackEmail?: string
): AuthUser {
  const decoded = jwtDecode<Record<string, string>>(token);
  const email = decoded.email || fallbackEmail || '';
  const userId = decoded.sub || '';
  const name = displayName || email.split('@')[0] || 'Customer';
  return {
    email,
    emailId: email,
    token,
    accessToken: token,
    userId,
    userRole: decoded.role || 'customer',
    displayName: name,
    uid: userId,
    name,
  };
}

export function persistAuthUser(authUser: AuthUser) {
  storage.set(STORAGE_KEYS.authUser, authUser);
}

export function getStoredAuthUser(): AuthUser | null {
  return storage.get<AuthUser | null>(STORAGE_KEYS.authUser, null);
}

export function getStoredUserDetails(): UserDetailsResponse | null {
  return storage.get<UserDetailsResponse | null>(STORAGE_KEYS.userDetails, null);
}

export function getAccountProfile(
  details: UserDetailsResponse | null | undefined
): AccountProfile | null {
  if (!details?.accounts) return null;
  return details.accounts;
}

export async function fetchUserDetails(token: string): Promise<UserDetailsResponse> {
  return bffRequest<UserDetailsResponse>('account/userdetails', {
    method: 'GET',
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export function applyB2BFromUserDetails(details: UserDetailsResponse) {
  const companies = (details.accounts?.companies || []) as B2BCompany[];
  const isB2b = Boolean(details.isb2buser) || companies.length > 0;
  SetIsB2B(isB2b);
  if (typeof window !== 'undefined') {
    if (isB2b && companies.length) {
      localStorage.setItem('b2bUserDetails', JSON.stringify(companies));
    } else {
      localStorage.removeItem('b2bUserDetails');
      localStorage.removeItem('selectedB2BCompany');
    }
    storage.set(STORAGE_KEYS.userDetails, details);
    if (isB2b && companies.length === 1 && companies[0]?._id) {
      localStorage.setItem('selectedB2BCompany', companies[0]._id);
    }
  }
  return { isB2b, companies };
}

export async function mergeGuestCartOnLogin(token: string) {
  return syncCart(token);
}

export async function refreshUserDetailsFromApi(token?: string | null) {
  let authToken = token || getStoredAuthUser()?.token || '';
  if (!authToken) authToken = (await getFreshIdToken()) || '';
  if (!authToken) return null;
  const details = await fetchUserDetails(authToken);
  if (!details || details.error) return null;
  return { details, ...applyB2BFromUserDetails(details) };
}

export type UpdateProfilePayload = {
  uid: string;
  email?: string;
  emailId?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  dob?: string;
  contactnumber?: string;
  displayName?: string;
  password?: string;
};

export async function updateUserProfile(
  payload: UpdateProfilePayload,
  token: string
): Promise<{ error?: boolean; message?: string }> {
  return bffRequest('account/updateprofile', {
    body: payload,
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export async function signupAccount(emailId: string, password: string) {
  return bffRequest<{ error?: boolean; message?: string }>('account/signup', {
    body: { emailId, password },
  });
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await firebaseSignIn(email, password);
  const token = await cred.user.getIdToken(true);
  const authUser = tokenToAuthUser(token, cred.user.displayName, email || cred.user.email || undefined);
  persistAuthUser(authUser);

  let details: UserDetailsResponse = { error: false };
  try {
    details = await fetchUserDetails(token);
  } catch {
    details = { error: true };
  }

  if (details.error) {
    await mergeGuestCartOnLogin(token);
    return { authUser, details, isB2b: false, companies: [] as B2BCompany[] };
  }

  const b2b = applyB2BFromUserDetails(details);
  await mergeGuestCartOnLogin(token);
  return { authUser, details, ...b2b };
}

export async function registerWithEmail(email: string, password: string) {
  let signupRes: { error?: boolean; message?: string };
  try {
    signupRes = await signupAccount(email, password);
  } catch (e) {
    signupRes = { error: true, message: e instanceof Error ? e.message : 'Signup failed' };
  }

  if (signupRes?.error) {
    const msg = signupRes.message || 'Registration failed';
    const alreadyExists = /already|exist|EMAIL_EXISTS/i.test(msg);
    if (!alreadyExists) throw new Error(msg);
  }

  try {
    return await loginWithEmail(email, password);
  } catch (e) {
    if (!signupRes?.error) {
      throw new Error('Account created. Please sign in with your email and password.');
    }
    throw e instanceof Error ? e : new Error(signupRes.message || 'Registration failed');
  }
}

export async function logout() {
  await firebaseSignOut();
  userProfile.clearCartSession();
  SetIsB2B(false);
  storage.remove(STORAGE_KEYS.authUser);
  storage.remove(STORAGE_KEYS.userDetails);
  if (typeof window !== 'undefined') {
    localStorage.setItem('b2bUserDetails', '');
    localStorage.setItem('selectedB2BCompany', '');
  }
}

export async function refreshAuthFromFirebase() {
  const fbUser = await waitForAuthUser();
  if (!fbUser) {
    storage.remove(STORAGE_KEYS.authUser);
    storage.remove(STORAGE_KEYS.userDetails);
    return { authUser: null, isB2b: false, companies: [] as B2BCompany[] };
  }

  const token = await fbUser.getIdToken(true);
  const stored = getStoredAuthUser();
  const authUser = tokenToAuthUser(
    token,
    fbUser.displayName,
    fbUser.email || stored?.email || undefined
  );
  persistAuthUser(authUser);

  try {
    const details = await fetchUserDetails(token);
    if (details.error) {
      const cached = getStoredUserDetails();
      if (cached) return { authUser, ...applyB2BFromUserDetails(cached) };
      return { authUser, isB2b: false, companies: [] as B2BCompany[] };
    }
    return { authUser, ...applyB2BFromUserDetails(details) };
  } catch {
    const cached = getStoredUserDetails();
    if (cached) return { authUser, ...applyB2BFromUserDetails(cached) };
    return { authUser, isB2b: false, companies: [] as B2BCompany[] };
  }
}

export async function resetPassword(email: string) {
  return firebaseResetPassword(email);
}

export async function confirmResetPassword(oobCode: string, newPassword: string) {
  return firebaseConfirmPasswordReset(oobCode, newPassword);
}

export async function verifyResetPasswordCode(oobCode: string) {
  return firebaseVerifyPasswordResetCode(oobCode);
}

export function getSelectedCompanyId() {
  const { selectedB2BCompany } = GetCompaniesData();
  return selectedB2BCompany || '';
}

export function getStoredCompanies(): B2BCompany[] {
  const { AllB2bAllowedCompanies } = GetCompaniesData();
  return (AllB2bAllowedCompanies || []) as B2BCompany[];
}
