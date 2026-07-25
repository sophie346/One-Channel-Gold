import { useState, useEffect } from 'react';
import { Menu, X, Search, TrendingUp } from 'lucide-react';

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
}: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-white/[0.06]'
            : 'bg-black'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between gap-4">
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
            {/* XAU/USD ticker */}
            <div className="hidden lg:flex flex-col items-end leading-none mr-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#9CA3AF] font-medium">XAU/USD</span>
                <span className="text-[15px] font-bold text-[#C5A059] tracking-tight">
                  $3,247.50
                </span>
                <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#4ADE80]">
                  <TrendingUp className="w-3 h-3" />
                  +0.38%
                </span>
              </div>
              <span className="text-[9px] text-[#6B7280] mt-1 tracking-wide">
                DEMO · Updated 2m ago
              </span>
            </div>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 text-[#D1D5DB] hover:text-white transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            {/* Sign In */}
            {userSession.isLoggedIn ? (
              <button
                onClick={() => handleNavClick('portal')}
                className="hidden sm:inline-flex text-[14px] font-medium text-white hover:text-[#C5A059] transition-colors cursor-pointer"
              >
                {userSession.name.split(' ')[0]}
              </button>
            ) : (
              <button
                onClick={() => openAuth('signin')}
                className="hidden sm:inline-flex text-[14px] font-medium text-white hover:text-[#C5A059] transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

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
                <p className="text-[11px] text-[#9CA3AF]">XAU/USD</p>
                <p className="text-[18px] font-bold text-[#C5A059]">$3,247.50</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#4ADE80]">
                <TrendingUp className="w-3.5 h-3.5" />
                +0.38%
              </span>
            </div>
            <p className="text-[10px] text-[#6B7280] mt-1">DEMO · Updated 2m ago</p>
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
