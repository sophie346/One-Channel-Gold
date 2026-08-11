import {
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

let persistenceReady: Promise<void> | null = null;

export function ensurePersistence() {
  if (!persistenceReady) {
    persistenceReady = setPersistence(auth, browserLocalPersistence).catch(() => undefined);
  }
  return persistenceReady;
}

export async function firebaseSignIn(email: string, password: string) {
  await ensurePersistence();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseSignOut() {
  await signOut(auth);
}

export async function firebaseResetPassword(email: string) {
  const continueUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
  return sendPasswordResetEmail(
    auth,
    email,
    continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined
  );
}

export async function firebaseConfirmPasswordReset(oobCode: string, newPassword: string) {
  await verifyPasswordResetCode(auth, oobCode);
  return confirmPasswordReset(auth, oobCode, newPassword);
}

export async function firebaseVerifyPasswordResetCode(oobCode: string) {
  return verifyPasswordResetCode(auth, oobCode);
}

export function waitForAuthUser(timeoutMs = 8000): Promise<User | null> {
  return (async () => {
    await ensurePersistence();
    if (auth.currentUser) return auth.currentUser;

    return new Promise<User | null>((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        unsub();
        resolve(auth.currentUser);
      }, timeoutMs);

      const unsub = onAuthStateChanged(auth, (user) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        unsub();
        resolve(user);
      });
    });
  })();
}

export async function getFreshIdToken(): Promise<string | null> {
  const user = auth.currentUser || (await waitForAuthUser());
  if (!user) return null;
  return user.getIdToken(true);
}
