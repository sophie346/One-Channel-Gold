'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';

/** Keeps Redux auth state in sync with Firebase session. */
export default function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name:
              firebaseUser.displayName ||
              firebaseUser.email?.split('@')[0] ||
              'Investor',
          })
        );
      } else {
        dispatch(setUser(null));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
}
