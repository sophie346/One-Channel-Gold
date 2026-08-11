'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { hydrateAuthFromStorage, initAuth } from '../store/authSlice';

/** Hydrate cached session, then restore Firebase + BFF userdetails (One Gold initAuth). */
export default function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateAuthFromStorage());
    dispatch(initAuth());
  }, [dispatch]);

  return null;
}
