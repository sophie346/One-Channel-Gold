import { useAppSelector } from '@/store/hooks';
import { selectCartCount } from '@/store/cartSlice';

export function useCurrentCart() {
  const currentCartCount = useAppSelector(selectCartCount);
  return { currentCartCount };
}
