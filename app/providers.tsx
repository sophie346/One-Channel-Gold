'use client';

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import AuthListener from '@/components/AuthListener';
import CartSync from '@/components/CartSync';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  // Avoid SSR mismatch with redux-persist localStorage
  if (!ready) {
    return (
      <Provider store={store}>
        <AuthListener />
        <CartSync />
        {children}
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthListener />
        <CartSync />
        {children}
      </PersistGate>
    </Provider>
  );
}
