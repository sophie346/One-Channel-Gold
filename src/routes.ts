export const TAB_PATHS: Record<string, string> = {
  home: '/',
  buy: '/buy',
  sell: '/sell',
  pawn: '/pawn',
  auctions: '/auctions',
  appraisal: '/appraisal',
  services: '/services',
  prices: '/prices',
  wholesale: '/wholesale',
  about: '/about',
  resources: '/resources',
  portal: '/portal',
  cart: '/cart',
  checkout: '/checkout',
  'order-success': '/order-success',
  login: '/login',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  account: '/account',
  'account-security': '/account/security',
  addresses: '/addresses',
  'my-orders': '/my-orders',
  'orders-returns': '/orders-returns',
  'orders-cancelled': '/orders-cancelled',
  'track-order': '/track-order',
  wishlist: '/wishlist',
  invoices: '/invoices',
};

export const VALID_TABS = new Set(Object.keys(TAB_PATHS));

export const AUTH_REQUIRED_TABS = new Set([
  'account',
  'account-security',
  'addresses',
  'my-orders',
  'orders-returns',
  'orders-cancelled',
  'order-detail',
  'invoices',
  'portal',
]);

export function pathToTab(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, '') || '/';
  if (cleaned === '/') return 'home';
  if (cleaned.startsWith('/buy/')) return 'product';
  if (cleaned === '/profile') return 'account';
  if (cleaned === '/account/security') return 'account-security';
  if (cleaned === '/saveforlater') return 'wishlist';
  if (cleaned.startsWith('/orders/') && !cleaned.startsWith('/orders-')) return 'order-detail';

  const segment = cleaned.replace(/^\//, '').split('/')[0];
  if (cleaned === '/cart') return 'cart';
  if (cleaned === '/checkout') return 'checkout';
  if (cleaned === '/order-success') return 'order-success';
  if (cleaned === '/login') return 'login';
  if (cleaned === '/forgot-password') return 'forgot-password';
  if (cleaned === '/reset-password') return 'reset-password';
  if (cleaned === '/account') return 'account';
  if (cleaned === '/addresses') return 'addresses';
  if (cleaned === '/my-orders') return 'my-orders';
  if (cleaned === '/orders-returns') return 'orders-returns';
  if (cleaned === '/orders-cancelled') return 'orders-cancelled';
  if (cleaned === '/track-order') return 'track-order';
  if (cleaned === '/wishlist') return 'wishlist';
  if (cleaned === '/invoices') return 'invoices';

  return VALID_TABS.has(segment) ? segment : 'home';
}

export function tabToPath(tab: string): string {
  return TAB_PATHS[tab] ?? '/';
}

export function getProductSlug(pathname: string): string | null {
  const match = pathname.match(/^\/buy\/([^/]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getOrderId(pathname: string): string | null {
  const match = pathname.match(/^\/orders\/([^/]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
