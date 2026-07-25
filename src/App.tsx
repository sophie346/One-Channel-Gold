import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, HandCoins, Calendar, Info, CheckCircle2, X, ShieldAlert, ShoppingCart
} from 'lucide-react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AuthModal from './components/AuthModal';
import GoldCalculator from './components/GoldCalculator';
import GoldPriceChart from './components/GoldPriceChart';
import ShopView from './components/ShopView';
import AuctionsView from './components/AuctionsView';
import ServicesView from './components/ServicesView';
import WorkflowsView from './components/WorkflowsView';
import WholesaleAndStorage from './components/WholesaleAndStorage';
import StaticPages from './components/StaticPages';
import PortalDashboard from './components/PortalDashboard';
import { INITIAL_PAWN_LOANS, DEMO_SPOT_PRICE_GRAM } from './data/mockData';
import { PawnLoan, SellGoldOffer } from './types';
import { pathToTab, tabToPath } from './routes';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { logoutUser, clearAuthError } from './store/authSlice';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentTab = pathToTab(location.pathname);

  const setCurrentTab = (tab: string) => {
    navigate(tabToPath(tab));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeWorkflow, setActiveWorkflow] = useState<'sell' | 'pawn' | 'appraisal' | null>(null);
  
  // Shopping Cart & Checkout states
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const { user, isLoggedIn } = useAppSelector((state) => state.auth);
  const userSession = {
    isLoggedIn,
    name: user?.name || '',
    email: user?.email || '',
    uid: user?.uid || '',
  };
  const [authModal, setAuthModal] = useState<'signin' | 'register' | null>(null);

  // Business Domain State lists
  const [pawnLoans, setPawnLoans] = useState<PawnLoan[]>(INITIAL_PAWN_LOANS);
  const [goldSales, setGoldSales] = useState<SellGoldOffer[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [bidsPlaced, setBidsPlaced] = useState<Record<string, number>>({});
  const [appraisalBookings, setAppraisalBookings] = useState<any[]>([]);

  // Global Notification Toast State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Action callbacks
  const handleAddToCart = (product: any) => {
    setCart(prev => [...prev, product]);
    setCartOpen(true);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const executeCheckout = () => {
    if (cart.length === 0) return;
    // Transfer cart items to orders
    setOrders(prev => [...prev, ...cart]);
    setCart([]);
    setCartOpen(false);
    setCurrentTab('portal');
    showNotification('Insured secure checkout successfully authorized! Your 1CA logistic routing dispatch has been scheduled.', 'success');
  };

  const handleWatchLot = (lotId: string) => {
    setWatchlist(prev => 
      prev.includes(lotId) ? prev.filter(id => id !== lotId) : [...prev, lotId]
    );
  };

  const handlePlaceBid = (lotId: string, value: number) => {
    setBidsPlaced(prev => ({ ...prev, [lotId]: value }));
  };

  const handleWorkflowSubmit = (formData: any) => {
    if (formData.type === 'sell') {
      const newSale: SellGoldOffer = {
        id: `SAL-${Math.floor(Math.random() * 9000 + 1000)}`,
        itemType: formData.itemName,
        statedKarat: formData.karat,
        estimatedWeight: formData.weight,
        estimatedRangeMin: formData.calcMinOffer,
        estimatedRangeMax: formData.calcMaxOffer,
        status: 'Submitted',
        method: formData.shippingMethod,
        dateCreated: new Date().toISOString().slice(0, 10),
        trackingNumber: `1CA-TRK-${Math.floor(Math.random() * 900000 + 100000)}`
      };
      setGoldSales(prev => [newSale, ...prev]);
    } else if (formData.type === 'pawn') {
      const newLoan: PawnLoan = {
        id: `LN-00${Math.floor(Math.random() * 9000 + 1000)}`,
        itemName: formData.itemName,
        principal: Math.round(formData.calcMinOffer * 0.75),
        loanAmount: Math.round(formData.calcMinOffer * 0.75),
        collateralValue: formData.calcMinOffer,
        apr: 24,
        dateIssued: new Date().toISOString().slice(0, 10),
        maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'Active',
        gracePeriodDays: 30,
        redemptionAmount: Math.round(formData.calcMinOffer * 0.75 * 1.06),
        financeCharge: Math.round(formData.calcMinOffer * 0.75 * 0.06),
      };
      setPawnLoans(prev => [newLoan, ...prev]);
    } else if (formData.type === 'appraisal') {
      setAppraisalBookings(prev => [formData, ...prev]);
    }
  };

  const executeAuthOpen = (type: 'signin' | 'register') => {
    dispatch(clearAuthError());
    setAuthModal(type);
  };

  const logOut = async () => {
    await dispatch(logoutUser());
    setCurrentTab('home');
    showNotification('Successfully logged out from OneGold.', 'info');
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-[#9CA3AF] selection:bg-[#C8A45D]/30 selection:text-[#E3C27A]">
      
      {/* Navigation Header bar */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuth={executeAuthOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userSession={userSession}
        logOut={logOut}
        cartCount={cart.length}
        openCart={() => setCartOpen(true)}
      />

      {/* Primary Layout Router Container */}
      <main className="pt-[72px]">
        
        {/* ==================== HOME VIEW ==================== */}
        {currentTab === 'home' && (
          <HomePage
            setCurrentTab={setCurrentTab}
            setActiveWorkflow={setActiveWorkflow}
            openAuth={executeAuthOpen}
          />
        )}

        {/* ==================== SHOP VIEW (BUY GOLD) ==================== */}
        {currentTab === 'buy' && (
          <ShopView
            onAddToCart={handleAddToCart}
            onBuyNow={(prod) => { handleAddToCart(prod); setCartOpen(true); }}
            wishlist={[]}
            toggleWishlist={() => {}}
            selectedProductId={null}
            setSelectedProductId={() => {}}
            searchQuery={searchQuery}
          />
        )}

        {/* ==================== SELL GOLD TAB ==================== */}
        {currentTab === 'sell' && (
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-black bg-[#C8A45D]/10 px-3 py-1 rounded">Melt &amp; Assay Refinery Portal</span>
              <h2 className="text-3xl font-black text-[#F7F4EC] uppercase">Sell Your Gold Directly to our Vaults</h2>
              <p className="text-xs text-[#AEB4C0] max-w-xl mx-auto leading-relaxed">
                We accept jewelry scrap, broken chains, bullion bars, and gold coins. Access our real-time spot index payout and schedule secure mail-in or lobby drop-offs.
              </p>
            </div>

            {/* Injected Calculator */}
            <div className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-xs font-black text-[#F7F4EC] uppercase tracking-widest mb-4">Payout Value Estimator</h3>
              <GoldCalculator />
            </div>

            {/* Direct call to action to trigger wizard */}
            <div className="text-center">
              <button
                onClick={() => setActiveWorkflow('sell')}
                className="px-8 py-4 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-xl"
              >
                Initiate Secure Gold selling Contract <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-[#AEB4C0] mt-2.5">Required fields: Identity scan verification compliance (AML)</p>
            </div>
          </div>
        )}

        {/* ==================== PAWN LOANS TAB ==================== */}
        {currentTab === 'pawn' && (
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-black bg-[#C8A45D]/10 px-3 py-1 rounded">Secured Collateral loans</span>
              <h2 className="text-3xl font-black text-[#F7F4EC] uppercase">Gold-Backed cash Liquidity</h2>
              <p className="text-xs text-[#AEB4C0] max-w-xl mx-auto leading-relaxed">
                Leverage physical gold assets without losing ownership. Our state-compliant pawn loans have fixed annual percentages with absolute insurance protection while stored in our vault bins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-xs text-[#AEB4C0]">
              <div className="p-5 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl space-y-2">
                <h4 className="font-bold text-[#F7F4EC] uppercase">No Impact on credit</h4>
                <p className="leading-relaxed">Pawn transactions are completely collateral-backed loans. Defaulting only causes asset liquidation at our auctions and will never affect credit ratings.</p>
              </div>

              <div className="p-5 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl space-y-2">
                <h4 className="font-bold text-[#F7F4EC] uppercase">Flexible Redemptions</h4>
                <p className="leading-relaxed">90-day structural maturities with standard 30-day grace margins. Pay off principal and accrued interest anytime to release physical assets.</p>
              </div>
            </div>

            {/* Trigger pawn wizard */}
            <div className="text-center">
              <button
                onClick={() => setActiveWorkflow('pawn')}
                className="px-8 py-4 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-xl"
              >
                Apply for Pawn Loan Assessment <HandCoins className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-[#AEB4C0] mt-2.5">Average preliminary approval timeline: under 3 minutes online.</p>
            </div>
          </div>
        )}

        {/* ==================== LIVE AUCTIONS VIEW ==================== */}
        {currentTab === 'auctions' && (
          <AuctionsView
            onPlaceBid={handlePlaceBid}
            watchlist={watchlist}
            toggleWatchlist={handleWatchLot}
            selectedLotId={null}
            setSelectedLotId={() => {}}
            userSession={userSession}
            onShowNotification={showNotification}
          />
        )}

        {/* ==================== APPRAISAL TAB ==================== */}
        {currentTab === 'appraisal' && (
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-black bg-[#C8A45D]/10 px-3 py-1 rounded">Certified Metallurgy Spectroscopy</span>
              <h2 className="text-3xl font-black text-[#F7F4EC] uppercase">XRF Laboratory Appraisals</h2>
              <p className="text-xs text-[#AEB4C0] max-w-xl mx-auto leading-relaxed">
                Schedule a direct physical reservation at one of our high-security vault facilities. Receive GIA, ISO, or LBMA certified pedigree appraisals for estate jewelry or bullion bars.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-xs text-[#AEB4C0]">
              {[
                { title: 'XRF Spectroscopy', desc: 'Non-destructive chemical analysis mapping element composition percentages.' },
                { title: 'Hydrostatic Density', desc: 'Checks internal metal cores for tungsten voids without scratching surfaces.' },
                { title: 'Pedigree Papers', desc: 'Full certification files backed by registered OneChannelAdmin hashes.' }
              ].map((tech, i) => (
                <div key={i} className="p-4 bg-[#171A21] border border-white/5 rounded-lg space-y-1">
                  <h4 className="font-bold text-[#F7F4EC] uppercase text-[10px]">{tech.title}</h4>
                  <p className="leading-relaxed opacity-85">{tech.desc}</p>
                </div>
              ))}
            </div>

            {/* Trigger appraisal wizard */}
            <div className="text-center">
              <button
                onClick={() => setActiveWorkflow('appraisal')}
                className="px-8 py-4 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-xl"
              >
                Schedule Appraisal reservation <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== MAINTENANCE SERVICES VIEW ==================== */}
        {currentTab === 'services' && (
          <ServicesView />
        )}

        {/* ==================== PRICE CHART DETAIL TAB ==================== */}
        {currentTab === 'prices' && (
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-bold block">1CA Price Desk</span>
              <h2 className="text-2xl font-black text-[#F7F4EC] uppercase">Precious Metals Spot Market</h2>
            </div>

            <div className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 space-y-6">
              <GoldPriceChart />
              
              <div className="grid grid-cols-3 gap-4 border-t border-[rgba(255,255,255,0.05)] pt-6 text-xs text-center">
                <div>
                  <span className="text-[#AEB4C0] uppercase text-[9px] block">24K Spot/g</span>
                  <p className="text-lg font-bold text-[#F7F4EC]">${DEMO_SPOT_PRICE_GRAM.toFixed(2)} USD</p>
                </div>
                <div>
                  <span className="text-[#AEB4C0] uppercase text-[9px] block">18K Spot/g</span>
                  <p className="text-lg font-bold text-[#F7F4EC]">${(DEMO_SPOT_PRICE_GRAM * 0.75).toFixed(2)} USD</p>
                </div>
                <div>
                  <span className="text-[#AEB4C0] uppercase text-[9px] block">14K Spot/g</span>
                  <p className="text-lg font-bold text-[#F7F4EC]">${(DEMO_SPOT_PRICE_GRAM * 0.583).toFixed(2)} USD</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== WHOLESALE TAB ==================== */}
        {currentTab === 'wholesale' && (
          <WholesaleAndStorage onShowNotification={showNotification} />
        )}

        {/* ==================== ABOUT & RESOURCES STATIC PAGES ==================== */}
        {(currentTab === 'about' || currentTab === 'resources') && (
          <StaticPages pageType={currentTab as any} />
        )}

        {/* ==================== CUSTOMER PORTAL TAB ==================== */}
        {currentTab === 'portal' && (
          <PortalDashboard
            userSession={userSession}
            cart={cart}
            orders={orders}
            goldSales={goldSales}
            pawnLoans={pawnLoans}
            setPawnLoans={setPawnLoans}
            watchlist={watchlist}
            bidsPlaced={bidsPlaced}
            appraisalBookings={appraisalBookings}
            onShowNotification={showNotification}
          />
        )}

      </main>

      {/* Global Regulatory Footer */}
      <Footer setCurrentTab={setCurrentTab} onShowNotification={showNotification} />

      {/* ==================== MULTI-STEP WIZARD MODAL ==================== */}
      {activeWorkflow && (
        <WorkflowsView
          type={activeWorkflow}
          onClose={() => setActiveWorkflow(null)}
          onSubmit={handleWorkflowSubmit}
          onShowNotification={showNotification}
        />
      )}

      {/* ==================== SHOPPING CART COMPREHENSIVE DRAWER ==================== */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div onClick={() => setCartOpen(false)} className="absolute inset-0 bg-[#080A0D]/80 backdrop-blur-sm transition-opacity"></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#171A21] border-l border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-2xl">
              
              {/* Header */}
              <div className="p-6 bg-[#11141A] border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#C8A45D]" />
                  <h3 className="text-sm font-black text-[#F7F4EC] uppercase tracking-wider">Secured Cart ({cart.length})</h3>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-1 text-[#AEB4C0] hover:text-[#F7F4EC] cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {/* Items List */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.04)] text-xs">
                      <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-[#F7F4EC]">{item.name}</p>
                        <p className="text-[10px] text-[#AEB4C0]/70">{item.weight}g • {item.karat} purity</p>
                        <p className="font-bold text-[#E3C27A]">${item.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleRemoveFromCart(idx)} className="p-1 hover:bg-white/5 rounded text-red-400 font-bold self-start cursor-pointer">Remove</button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-[#AEB4C0] space-y-2">
                    <p className="font-bold text-[#F7F4EC]">Your cart is currently empty.</p>
                    <p className="opacity-75">Add certified investment bullion bars or custom jewelry rings to execute insured checkout logistics.</p>
                  </div>
                )}
              </div>

              {/* Summary Checkout Footer */}
              <div className="p-6 bg-[#11141A] border-t border-[rgba(255,255,255,0.06)] space-y-4 shrink-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#AEB4C0] uppercase">Subtotal Price</span>
                  <span className="font-black text-lg text-[#F7F4EC]">
                    ${cart.reduce((acc, item) => acc + item.price, 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/15 text-[10px] text-[#2F9D70] leading-normal font-semibold">
                  Note: Includes 100% value insurance protection during logistics transport with armored shipping protocols.
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setCartOpen(false)} className="w-1/3 py-2.5 bg-white/5 rounded text-xs uppercase font-bold text-[#AEB4C0] cursor-pointer">Back</button>
                  <button
                    onClick={executeCheckout}
                    disabled={cart.length === 0}
                    className="flex-1 py-2.5 bg-[#C8A45D] hover:bg-[#E3C27A] disabled:opacity-30 rounded text-[#080A0D] text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Authorise Checkout
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== SIGN-IN / SIGN-UP MODAL ==================== */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => {
            dispatch(clearAuthError());
            setAuthModal(null);
          }}
          onSwitchMode={(mode) => {
            dispatch(clearAuthError());
            setAuthModal(mode);
          }}
          onSuccess={(message) => showNotification(message, 'success')}
        />
      )}

      {/* ==================== GLOBAL NOTIFICATION TOAST ==================== */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
          <div className={`p-4 rounded-sm border shadow-2xl flex items-start gap-3 backdrop-blur-md ${
            notification.type === 'success'
              ? 'bg-[#11141A]/95 border-[#2F9D70]/40 text-[#F7F4EC]'
              : notification.type === 'error'
              ? 'bg-[#11141A]/95 border-red-500/40 text-[#F7F4EC]'
              : 'bg-[#11141A]/95 border-[#C8A45D]/40 text-[#F7F4EC]'
          }`}>
            <div className="shrink-0 mt-0.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#2F9D70]" />
              ) : notification.type === 'error' ? (
                <ShieldAlert className="w-5 h-5 text-red-400" />
              ) : (
                <Info className="w-5 h-5 text-[#C8A45D]" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#AEB4C0]/70">
                {notification.type === 'success' ? 'Terminal Success' : notification.type === 'error' ? 'Security Notice' : 'System Information'}
              </p>
              <p className="text-xs font-medium leading-relaxed text-[#F7F4EC]/90">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/5 rounded-full text-[#AEB4C0] hover:text-[#F7F4EC]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
