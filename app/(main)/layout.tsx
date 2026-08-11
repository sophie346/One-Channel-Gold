'use client';

import { Suspense } from 'react';
import App from '@/App';

/** Persistent shell so cart/auth state survives route changes. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <App />
      </Suspense>
      {children}
    </>
  );
}
