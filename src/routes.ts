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
};

export const VALID_TABS = new Set(Object.keys(TAB_PATHS));

export function pathToTab(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, '') || '/';
  if (cleaned === '/') return 'home';

  const segment = cleaned.replace(/^\//, '').split('/')[0];
  return VALID_TABS.has(segment) ? segment : 'home';
}

export function tabToPath(tab: string): string {
  return TAB_PATHS[tab] ?? '/';
}
