import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, ArrowUpRight, ShieldCheck, Scale, Compass, Award, LifeBuoy } from 'lucide-react';
import { DEMO_SPOT_PRICE_OUNCE, DEMO_SPOT_PRICE_GRAM } from '../data/mockData';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuth: (type: 'signin' | 'register') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userSession: any;
  logOut: () => void;
  cartCount: number;
  openCart: () => void;
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
  openCart
}: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [priceFlash, setPriceFlash] = useState(false);
  const [livePrice, setLivePrice] = useState(DEMO_SPOT_PRICE_OUNCE);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    // Minor random price fluctuations for a dynamic, live feel
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.48) * 0.4; // slight upward drift
        setPriceFlash(true);
        setTimeout(() => setPriceFlash(false), 800);
        return parseFloat((prev + delta).toFixed(2));
      });
    }, 12000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { label: 'Buy Gold', id: 'buy' },
    { label: 'Sell Gold', id: 'sell' },
    { label: 'Pawn Loans', id: 'pawn' },
    { label: 'Auctions', id: 'auctions' },
    { label: 'Appraisal', id: 'appraisal' },
    { label: 'Services', id: 'services' },
    { label: 'Gold Prices', id: 'prices' },
    { label: 'Wholesale', id: 'wholesale' },
    { label: 'About', id: 'about' },
    { label: 'Resources', id: 'resources' },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const predictiveResults = searchQuery
    ? [
        { title: 'Valcambi 50 Gram Gold Bar', cat: 'Buy Gold', tab: 'buy' },
        { title: 'Gold-Backed Loan Calculator', cat: 'Pawn Loans', tab: 'pawn' },
        { title: 'Lot #4092: 18K Diamond Ring', cat: 'Auctions', tab: 'auctions' },
        { title: 'XRF Metallurgical Testing', cat: 'Appraisals', tab: 'appraisal' },
        { title: 'Wholesale Volume Rates', cat: 'B2B Wholesale', tab: 'wholesale' }
      ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.cat.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
      {/* Ticker Bar */}
      <div id="ticker-bar" className="bg-[#080A0D] border-b border-[rgba(255,255,255,0.08)] text-[11px] uppercase tracking-widest text-[#AEB4C0] py-1.5 px-4 sticky top-0 z-50 flex justify-between items-center text-center sm:text-left h-[28px] overflow-hidden">
        <div className="flex items-center gap-4 mx-auto sm:mx-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F9D70] animate-pulse"></span>
            <span>Spot Gold:</span>
            <span className={`font-semibold text-[#F7F4EC] transition-all duration-500 ${priceFlash ? 'text-[#E3C27A] scale-105' : ''}`}>
              ${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz
            </span>
            <span className="text-[#2F9D70] font-medium">(+$14.40)</span>
          </div>
          <span className="hidden md:inline text-[rgba(255,255,255,0.2)]">|</span>
          <div className="hidden md:flex items-center gap-1.5">
            <span>Silver Spot:</span>
            <span className="font-semibold text-[#F7F4EC]">$28.92/oz</span>
            <span className="text-[#C85A5A]">(-$0.12)</span>
          </div>
          <span className="hidden lg:inline text-[rgba(255,255,255,0.2)]">|</span>
          <div className="hidden lg:flex items-center gap-1.5">
            <span>Platinum Spot:</span>
            <span className="font-semibold text-[#F7F4EC]">$944.50/oz</span>
            <span className="text-[#2F9D70] font-medium">(+$3.80)</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-[#2F9D70]">
            <ShieldCheck className="w-3.5 h-3.5" /> 1CA SECURED GATEWAY
          </span>
          <span className="text-[rgba(255,255,255,0.3)]">|</span>
          <span>Updated 3 mins ago</span>
        </div>
      </div>

      {/* Main Header */}
      <header
        id="main-header"
        className={`fixed top-[28px] left-0 w-full z-40 transition-all duration-300 ${
          scrolled ? 'bg-[#080A0D]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="text-2xl font-bold tracking-tight text-[#C8A45D] uppercase">
              OneGold<span className="text-white opacity-30">.</span>
            </div>
            <span className="hidden md:inline-block text-[8px] tracking-[0.2em] text-[#AEB4C0]/60 uppercase ml-2 border-l border-white/10 pl-2">
              1CA Platform
            </span>
          </div>

          {/* Desktop Navigation Menu */}
          <nav id="desktop-nav" className="hidden xl:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-widest font-semibold transition-all duration-200 hover:text-[#C8A45D] ${
                  currentTab === item.id ? 'text-[#C8A45D] font-bold' : 'text-[#AEB4C0]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div id="header-actions" className="flex items-center gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 text-[#AEB4C0] hover:text-[#C8A45D] transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={openCart}
              className="p-1.5 text-[#AEB4C0] hover:text-[#C8A45D] relative transition-colors duration-200"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8A45D] text-black text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account / User Portal Button */}
            {userSession.isLoggedIn ? (
              <button
                onClick={() => handleNavClick('portal')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#11141A] border border-white/10 rounded-sm hover:bg-[#C8A45D]/10 hover:border-[#C8A45D] text-[#F7F4EC] transition-all duration-200"
              >
                <div className="w-4.5 h-4.5 rounded-sm bg-[#C8A45D] text-black flex items-center justify-center text-[10px] font-bold">
                  {userSession.name[0]}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider max-w-[80px] truncate">{userSession.name}</span>
              </button>
            ) : (
              <button
                onClick={() => openAuth('signin')}
                className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-[#AEB4C0] hover:text-[#C8A45D] uppercase tracking-widest py-1.5 px-2 transition-all duration-200"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {/* Primary Action Call to Action */}
            <button
              onClick={() => handleNavClick('sell')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8A45D] text-black text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#E3C27A] transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Sell Your Gold
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-[#AEB4C0] hover:text-[#C8A45D] transition-colors duration-200"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Global Predictive Search Overlay */}
      {searchOpen && (
        <div id="search-overlay" className="fixed inset-0 z-50 bg-[#080A0D]/98 backdrop-blur-xl flex flex-col pt-24 px-6">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase tracking-widest text-[#C8A45D] font-bold">1CA Unified Global Search</span>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="p-2 text-[#AEB4C0] hover:text-[#F7F4EC] rounded-full hover:bg-white/5 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative mb-6">
              <input
                autoFocus
                type="text"
                placeholder="Search gold jewelry, auction lots, appraisals, wholesale contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11141A] border-b-2 border-[#C8A45D] text-xl text-[#F7F4EC] px-4 py-4 focus:outline-none focus:ring-0 placeholder-[#AEB4C0]/40 font-light"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C8A45D] w-5 h-5" />
            </div>

            {searchQuery ? (
              <div className="bg-[#11141A] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <h4 className="text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-3">Matching Results ({predictiveResults.length})</h4>
                {predictiveResults.length > 0 ? (
                  <div className="space-y-2">
                    {predictiveResults.map((res, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          handleNavClick(res.tab);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex justify-between items-center p-3 rounded-md hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/5 transition-all duration-200"
                      >
                        <span className="text-sm text-[#F7F4EC] font-medium">{res.title}</span>
                        <span className="text-[10px] uppercase bg-[#C8A45D]/10 text-[#C8A45D] px-2 py-0.5 rounded tracking-wider">{res.cat}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#AEB4C0] py-4">No results found for &ldquo;{searchQuery}&rdquo;. Try &ldquo;bar&rdquo; or &ldquo;loan&rdquo;.</p>
                )}
              </div>
            ) : (
              <div>
                <h4 className="text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-3">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {['Gold Bar', 'Melt Value Calculator', 'Gold Loans', 'Rolex President', 'Auctions', 'Wholesale Form'].map((term, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(term)}
                      className="px-3.5 py-1.5 bg-[#171A21] hover:bg-[#C8A45D]/10 hover:text-[#C8A45D] text-xs text-[#AEB4C0] rounded-full border border-[rgba(255,255,255,0.06)] hover:border-[#C8A45D] transition-all duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-drawer" className="fixed inset-0 z-45 bg-[#080A0D]/98 backdrop-blur-xl flex flex-col pt-24 px-6 xl:hidden overflow-y-auto">
          {/* Mobile spot bar indicator */}
          <div className="mb-6 p-4 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.05)] flex justify-between items-center">
            <div>
              <p className="text-[10px] text-[#AEB4C0] uppercase tracking-widest font-semibold">Gold Spot / Gram</p>
              <p className="text-lg font-bold text-[#F7F4EC]">${DEMO_SPOT_PRICE_GRAM.toFixed(2)} USD</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-[#080A0D] bg-[#C8A45D] rounded uppercase tracking-wider">
                1CA API LIVE
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-2.5 mb-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-3 px-4 text-left text-sm font-bold tracking-wider uppercase rounded-lg transition-all duration-200 border ${
                  currentTab === item.id
                    ? 'text-[#E3C27A] bg-white/5 border-[rgba(255,255,255,0.1)]'
                    : 'text-[#AEB4C0] border-transparent hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-auto pb-8">
            {userSession.isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('portal')}
                  className="w-full py-3 bg-[#171A21] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#F7F4EC] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-[#C8A45D]" />
                  User Portal: {userSession.name}
                </button>
                <button
                  onClick={logOut}
                  className="w-full py-2.5 text-xs text-[#C85A5A] hover:bg-red-500/10 rounded-lg tracking-wider uppercase font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuth('signin'); }}
                className="w-full py-3 bg-[#171A21] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#F7F4EC] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#C8A45D]" />
                Sign In / Sign Up
              </button>
            )}

            <button
              onClick={() => handleNavClick('sell')}
              className="w-full py-3.5 bg-[#C8A45D] text-[#080A0D] text-sm font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
              Sell Your Gold
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
