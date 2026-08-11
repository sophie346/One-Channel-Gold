'use client';

import { useRouter } from 'next/navigation';
import Checkout from '@/themes/redparts/NewTheme/Checkout/Checkout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCartRemote, refreshCart } from '@/store/cartSlice';
import { refreshUserDetails } from '@/store/authSlice';

interface CheckoutPageProps {
  onOrderComplete?: (orderItems: any[]) => void;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  requireAuth?: boolean;
  isLoggedIn?: boolean;
  openAuth?: () => void;
}

export default function CheckoutPage(_props: CheckoutPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const authUser = user
    ? {
        ...user,
        emailId: user.email,
        token: user.token,
        accessToken: user.token,
        userId: user.userId || user.uid,
      }
    : null;

  return (
    <Checkout
      authUser={authUser}
      onClose={() => router.push('/cart')}
      router={{
        replace: (path: string) => router.replace(path),
      }}
      setCurrentCartCount={(count: number) => {
        if (count === 0) {
          dispatch(clearCartRemote());
        } else {
          dispatch(refreshCart());
        }
      }}
      onOrderPlaced={async () => {
        await dispatch(refreshUserDetails());
        _props.onOrderComplete?.([]);
      }}
    />
  );
}
