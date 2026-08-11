import { useState, useEffect, useCallback } from 'react';
import {
  Menu, X, Search, TrendingUp, TrendingDown, ShoppingBag, Heart, ChevronDown,
  User, Package, MapPin, FileText, Truck, KeyRound, Shield,
} from 'lucide-react';
import { DEMO_SPOT_PRICE_OUNCE } from '../data/mockData';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuth: (type: 'signin' | 'register' | 'forgot') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userSession: any;
  logOut: () => void;
  cartCount: number;
  openCart: () => void;
}

type SpotTicker = {
  price: number;
  changePercent: number | null;
  live: boolean;
  updatedAt: string;
};

function formatRelativeAge(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return 'just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1m ago';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? '1h ago' : `${hrs}h ago`;
}

export default function Navigation({
  currentTab,
  setCurrentTab,
  openAuth,
  searchQuery,
  setSearchQuery,
  userSession,
  logOut,
  cartCount,
  openCart,
}: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [spot, setSpot] = useState<SpotTicker>({
    price: DEMO_SPOT_PRICE_OUNCE,
    changePercent: null,
    live: false,
    updatedAt: new Date().toISOString(),
  });

  const loadSpot = useCallback(async () => {
    try {
      const res = await fetch('/api/gold-price', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data?.price === 'number' && data.price > 0) {
        setSpot({
          price: data.price,
          changePercent: typeof data.changePercent === 'number' ? data.changePercent : null,
          live: Boolean(data.live),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      }
    } catch {
      // keep last known / demo fallback
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadSpot();
    const id = window.setInterval(loadSpot, 60_000);
    return () => window.clearInterval(id);
  }, [loadSpot]);

  const change = spot.changePercent;
  const isUp = change == null || change >= 0;
  const changeLabel =
    change == null
      ? null
      : `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  const priceLabel = `$${spot.price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const statusLabel = `${spot.live ? 'LIVE' : 'DEMO'} · Updated ${formatRelativeAge(spot.updatedAt)}`;

  const navItems = [
    { label: 'Buy Gold', id: 'buy' },
    { label: 'Sell Gold', id: 'sell' },
    { label: 'Pawn Loans', id: 'pawn' },
    { label: 'Auctions', id: 'auctions' },
    { label: 'Gold Prices', id: 'prices' },
    { label: 'Portal', id: 'portal' },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setAccountOpen(false);
  };

  const accountLinks = userSession.isLoggedIn
    ? [
        { label: 'Account Information', id: 'account', icon: User },
        { label: 'Sign-in & Security', id: 'account-security', icon: Shield },
        { label: 'Order History', id: 'my-orders', icon: Package },
        { label: 'Invoices', id: 'invoices', icon: FileText },
        { label: 'Wishlist', id: 'wishlist', icon: Heart },
        { label: 'Addresses', id: 'addresses', icon: MapPin },
        { label: 'Returned Orders', id: 'orders-returns', icon: Package },
        { label: 'Cancelled Orders', id: 'orders-cancelled', icon: Package },
        { label: 'Vault Portal', id: 'portal', icon: User },
      ]
    : [
        { label: 'Track Order', id: 'track-order', icon: Truck },
        { label: 'Wishlist', id: 'wishlist', icon: Heart },
      ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-white/[0.06]'
            : 'bg-black'
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#C5A059]">
              <span className="block h-3 w-3 rotate-45 bg-black" />
            </span>
            <span className="font-serif text-[20px] font-semibold tracking-tight text-white">
              OneGold
            </span>
          </button>

          {/* Desktop Nav — matches screenshot menus */}
          <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  currentTab === item.id
                    ? 'text-white'
                    : 'text-[#D1D5DB] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: price ticker + search + Sign In + CTA */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {/* XAU/USD ticker — live spot */}
            <button
              type="button"
              onClick={() => handleNavClick('prices')}
              className="hidden lg:flex flex-col items-end leading-none mr-1 cursor-pointer hover:opacity-90 transition-opacity"
              title="View gold prices"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#9CA3AF] font-medium">XAU/USD</span>
                <span className="text-[15px] font-bold text-[#C5A059] tracking-tight tabular-nums">
                  {priceLabel}
                </span>
                {changeLabel && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${
                      isUp ? 'text-[#4ADE80]' : 'text-red-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {changeLabel}
                  </span>
                )}
              </div>
              <span className="text-[13px] text-[#6B7280] mt-1 tracking-wide">
                {statusLabel}
              </span>
            </button>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 text-[#D1D5DB] hover:text-white transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            <button
              onClick={() => handleNavClick('wishlist')}
              className="hidden sm:inline-flex p-1.5 text-[#D1D5DB] hover:text-white transition-colors cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-1.5 text-[#D1D5DB] hover:text-white transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#C5A059] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="relative hidden sm:block">
              {userSession.isLoggedIn ? (
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-[14px] font-medium text-white hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  {userSession.name?.split(' ')[0] || 'Account'}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-[14px] font-medium text-white hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Account
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#171A21] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  {accountLinks.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleNavClick(link.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-[#AEB4C0] hover:bg-white/5 hover:text-white cursor-pointer"
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t border-white/10 mt-1 pt-1">
                    {userSession.isLoggedIn ? (
                      <>
                        <button
                          type="button"
                          onClick={() => { setAccountOpen(false); openAuth('forgot'); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-[#AEB4C0] hover:bg-white/5 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Reset password
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAccountOpen(false); logOut(); }}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 cursor-pointer"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setAccountOpen(false); openAuth('signin'); }}
                        className="w-full px-4 py-2 text-left text-sm text-[#C8A45D] font-bold hover:bg-white/5 cursor-pointer"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sell Your Gold — pill button */}
            <button
              onClick={() => handleNavClick('sell')}
              className="hidden sm:inline-flex items-center px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF6A] text-black text-[13px] font-bold rounded-full transition-colors cursor-pointer whitespace-nowrap"
            >
              Sell Your Gold
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-[#D1D5DB] hover:text-white cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col pt-24 px-6">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[12px] uppercase tracking-widest text-[#C5A059] font-semibold">Search</span>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="p-2 text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <input
                autoFocus
                type="text"
                placeholder="Search gold, auctions, loans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl text-[16px] text-white px-4 py-3.5 pr-12 focus:outline-none focus:border-[#C5A059]/50 placeholder-[#6B7280]"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C5A059] w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/98 backdrop-blur-xl pt-20 px-5 xl:hidden overflow-y-auto">
          <div className="mb-5 p-4 bg-[#111] rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9CA3AF]">XAU/USD</p>
                <p className="text-[18px] font-bold text-[#C5A059] tabular-nums">{priceLabel}</p>
              </div>
              {changeLabel && (
                <span
                  className={`inline-flex items-center gap-1 text-[13px] font-semibold ${
                    isUp ? 'text-[#4ADE80]' : 'text-red-400'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {changeLabel}
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#6B7280] mt-1">{statusLabel}</p>
          </div>

          <nav className="flex flex-col gap-1 mb-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-3.5 px-4 text-left text-[15px] font-medium rounded-lg transition-colors cursor-pointer ${
                  currentTab === item.id
                    ? 'text-white bg-white/5'
                    : 'text-[#D1D5DB] hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-1 mb-6 border-t border-white/10 pt-4">
            <p className="px-4 pb-2 text-[11px] uppercase tracking-widest text-[#6B7280] font-bold">Account</p>
            {accountLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className="py-3 px-4 text-left text-[14px] text-[#D1D5DB] hover:text-white cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 pb-10">
            {userSession.isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNavClick('portal')}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-full text-[14px] text-white font-medium cursor-pointer"
                >
                  Open Portal
                </button>
                <button
                  onClick={() => { logOut(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-[13px] text-red-400 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuth('signin'); }}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-full text-[14px] text-white font-medium cursor-pointer"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => handleNavClick('sell')}
              className="w-full py-3.5 bg-[#C5A059] text-black text-[14px] font-bold rounded-full cursor-pointer"
            >
              Sell Your Gold
            </button>
          </div>
        </div>
      )}
    </>
  );
}
