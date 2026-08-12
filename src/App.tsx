'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight, HandCoins, Calendar, Info, CheckCircle2, X, ShieldAlert, Loader2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomePage from '@/components/HomePage';
import AuthModal from '@/components/AuthModal';
import GoldCalculator from '@/components/GoldCalculator';
import GoldPriceChart from '@/components/GoldPriceChart';
import ShopView from '@/components/ShopView';
import ProductDetailsPage from '@/components/ProductDetailsPage';
import CartPage from '@/components/CartPage';
import CheckoutPage from '@/components/CheckoutPage';
import OrderSuccessPage from '@/components/OrderSuccessPage';
import ResetPasswordPage from '@/components/ResetPasswordPage';
import AuctionsView from '@/components/AuctionsView';
import ServicesView from '@/components/ServicesView';
import WorkflowsView, { type SellEstimatePrefill } from '@/components/WorkflowsView';
import WholesaleAndStorage from '@/components/WholesaleAndStorage';
import StaticPages from '@/components/StaticPages';
import PortalDashboard from '@/components/PortalDashboard';
import AccountInfoPage from '@/components/account/AccountInfoPage';
import AccountSecurityPage from '@/components/account/AccountSecurityPage';
import AddressesPage from '@/components/account/AddressesPage';
import { OrderDetailPage, OrdersListPage } from '@/components/account/OrdersPages';
import TrackOrderPage from '@/components/account/TrackOrderPage';
import WishlistPage from '@/components/account/WishlistPage';
import InvoicesListPage from '@/components/account/InvoicesListPage';
import { INITIAL_PAWN_LOANS } from '@/data/mockData';
import { PawnLoan, SellGoldOffer } from '@/types';
import { AUTH_REQUIRED_TABS, getOrderId, getProductSlug, pathToTab, tabToPath } from '@/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser, clearAuthError } from '@/store/authSlice';
import { selectCartCount, selectCartItems } from '@/store/cartSlice';

function PageLoader() {
  return (
    <div className="py-20 flex flex-col items-center gap-3 text-[#AEB4C0]">
      <Loader2 className="w-8 h-8 animate-spin text-[#C8A45D]" />
      <p className="text-sm">Loading…</p>
    </div>
  );
}

export default function App() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentTab = pathToTab(pathname || '/');
  const productSlug = getProductSlug(pathname || '/');
  const orderId = getOrderId(pathname || '/');
  const cartCount = useAppSelector(selectCartCount);
  const cartItems = useAppSelector(selectCartItems);

  const setCurrentTab = (tab: string) => {
    router.push(tabToPath(tab));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeWorkflow, setActiveWorkflow] = useState<'sell' | 'pawn' | 'appraisal' | null>(null);
  const [sellEstimate, setSellEstimate] = useState<SellEstimatePrefill | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const { user, isLoggedIn, initialized } = useAppSelector((state) => state.auth);
  const userSession = {
    isLoggedIn,
    name: user?.name || user?.displayName || '',
    email: user?.email || user?.emailId || '',
    uid: user?.uid || user?.userId || '',
  };
  const [authModal, setAuthModal] = useState<'signin' | 'register' | 'forgot' | null>(null);

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

  useEffect(() => {
    const mode = searchParams?.get('mode');
    const oobCode = searchParams?.get('oobCode') || searchParams?.get('oobcode');
    if (mode === 'resetPassword' && oobCode && pathname !== '/reset-password') {
      router.replace(`/reset-password?oobCode=${encodeURIComponent(oobCode)}`);
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (currentTab === 'login') {
      if (isLoggedIn) {
        router.replace('/');
        return;
      }
      setAuthModal('signin');
      return;
    }
    if (currentTab === 'forgot-password') {
      setAuthModal('forgot');
      return;
    }
    if (AUTH_REQUIRED_TABS.has(currentTab) && initialized && !isLoggedIn) {
      setAuthModal('signin');
    }
  }, [currentTab, isLoggedIn, initialized, router]);

  const executeAuthOpen = (type: 'signin' | 'register' | 'forgot') => {
    dispatch(clearAuthError());
    setAuthModal(type);
  };

  const logOut = async () => {
    await dispatch(logoutUser());
    setCurrentTab('home');
    showNotification('Successfully logged out from OneGold.', 'info');
  };

  if (currentTab === 'checkout') {
    return (
      <CheckoutPage
        isLoggedIn={isLoggedIn}
        openAuth={() => executeAuthOpen('signin')}
        onShowNotification={showNotification}
        onOrderComplete={(orderItems) => {
          setOrders((prev) => [...prev, ...orderItems]);
        }}
      />
    );
  }

  if (currentTab === 'order-success') {
    return <OrderSuccessPage />;
  }

  if (currentTab === 'reset-password') {
    return (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage />
      </Suspense>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-[#9CA3AF] selection:bg-[#C8A45D]/30 selection:text-[#E3C27A]">
      
      {/* Navigation Header bar */}
      <Navigation
        currentTab={currentTab === 'product' ? 'buy' : currentTab}
        setCurrentTab={setCurrentTab}
        openAuth={executeAuthOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userSession={userSession}
        logOut={logOut}
        cartCount={cartCount}
        openCart={() => router.push('/cart')}
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

        {/* ==================== PRODUCT DETAILS (Nexus-style dynamic slug) ==================== */}
        {currentTab === 'product' && productSlug && (
          <Suspense fallback={<PageLoader />}>
            <ProductDetailsPage
              slug={productSlug}
              onShowNotification={showNotification}
            />
          </Suspense>
        )}

        {/* ==================== SHOP VIEW (BUY GOLD) ==================== */}
        {currentTab === 'buy' && (
          <Suspense fallback={<PageLoader />}>
            <ShopView
              wishlist={watchlist}
              toggleWishlist={handleWatchLot}
              searchQuery={searchQuery}
              onShowNotification={showNotification}
            />
          </Suspense>
        )}

        {/* ==================== CART ==================== */}
        {currentTab === 'cart' && (
          <Suspense fallback={<PageLoader />}>
            <CartPage />
          </Suspense>
        )}

        {/* ==================== SELL GOLD TAB ==================== */}
        {currentTab === 'sell' && (
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-10 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-black bg-[#C8A45D]/10 px-3 py-1 rounded">Melt &amp; Assay Refinery Portal</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#F7F4EC] uppercase">Sell Your Gold Directly to our Vaults</h2>
              <p className="text-base text-[#AEB4C0] max-w-2xl mx-auto leading-relaxed">
                We accept jewelry scrap, broken chains, bullion bars, and gold coins. Access our real-time spot index payout and schedule secure mail-in or lobby drop-offs.
              </p>
            </div>

            {/* Injected Calculator */}
            <div className="w-full">
              <h3 className="text-base font-black text-[#F7F4EC] uppercase tracking-widest mb-5">Payout Value Estimator</h3>
              <GoldCalculator
                onEstimateAction={(estimate) => {
                  setSellEstimate(estimate);
                  setActiveWorkflow('sell');
                }}
              />
            </div>

            {/* Direct call to action to trigger wizard */}
            <div className="text-center">
              <button
                onClick={() => setActiveWorkflow('sell')}
                className="px-8 py-4 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-sm font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-xl"
              >
                Initiate Secure Gold selling Contract <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[13px] text-[#AEB4C0] mt-2.5">Required fields: Identity scan verification compliance (AML)</p>
            </div>
          </div>
        )}

        {/* ==================== PAWN LOANS TAB ==================== */}
        {currentTab === 'pawn' && (
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-black bg-[#C8A45D]/10 px-3 py-1 rounded">Secured Collateral loans</span>
              <h2 className="text-3xl font-black text-[#F7F4EC] uppercase">Gold-Backed cash Liquidity</h2>
              <p className="text-sm text-[#AEB4C0] max-w-xl mx-auto leading-relaxed">
                Leverage physical gold assets without losing ownership. Our state-compliant pawn loans have fixed annual percentages with absolute insurance protection while stored in our vault bins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-sm text-[#AEB4C0]">
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
                className="px-8 py-4 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-sm font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-xl"
              >
                Apply for Pawn Loan Assessment <HandCoins className="w-4 h-4" />
              </button>
              <p className="text-[13px] text-[#AEB4C0] mt-2.5">Average preliminary approval timeline: under 3 minutes online.</p>
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
              <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-black bg-[#C8A45D]/10 px-3 py-1 rounded">Certified Metallurgy Spectroscopy</span>
              <h2 className="text-3xl font-black text-[#F7F4EC] uppercase">XRF Laboratory Appraisals</h2>
              <p className="text-sm text-[#AEB4C0] max-w-xl mx-auto leading-relaxed">
                Schedule a direct physical reservation at one of our high-security vault facilities. Receive GIA, ISO, or LBMA certified pedigree appraisals for estate jewelry or bullion bars.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-sm text-[#AEB4C0]">
              {[
                { title: 'XRF Spectroscopy', desc: 'Non-destructive chemical analysis mapping element composition percentages.' },
                { title: 'Hydrostatic Density', desc: 'Checks internal metal cores for tungsten voids without scratching surfaces.' },
                { title: 'Pedigree Papers', desc: 'Full certification files backed by registered OneChannelAdmin hashes.' }
              ].map((tech, i) => (
                <div key={i} className="p-4 bg-[#171A21] border border-white/5 rounded-lg space-y-1">
                  <h4 className="font-bold text-[#F7F4EC] uppercase text-[13px]">{tech.title}</h4>
                  <p className="leading-relaxed opacity-85">{tech.desc}</p>
                </div>
              ))}
            </div>

            {/* Trigger appraisal wizard */}
            <div className="text-center">
              <button
                onClick={() => setActiveWorkflow('appraisal')}
                className="px-8 py-4 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-sm font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-xl"
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
              <span className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-bold block">1CA Price Desk</span>
              <h2 className="text-2xl font-black text-[#F7F4EC] uppercase">Precious Metals Spot Market</h2>
            </div>

            <div className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 space-y-6">
              <GoldPriceChart />
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

        {currentTab === 'account' && isLoggedIn && (
          <AccountInfoPage onNotify={showNotification} />
        )}
        {currentTab === 'account-security' && isLoggedIn && (
          <AccountSecurityPage onNotify={showNotification} />
        )}
        {currentTab === 'addresses' && isLoggedIn && (
          <AddressesPage onNotify={showNotification} />
        )}
        {currentTab === 'my-orders' && isLoggedIn && (
          <OrdersListPage variant="all" onNotify={showNotification} />
        )}
        {currentTab === 'orders-returns' && isLoggedIn && (
          <OrdersListPage variant="returns" onNotify={showNotification} />
        )}
        {currentTab === 'orders-cancelled' && isLoggedIn && (
          <OrdersListPage variant="cancelled" onNotify={showNotification} />
        )}
        {currentTab === 'order-detail' && isLoggedIn && orderId && (
          <OrderDetailPage orderId={orderId} onNotify={showNotification} />
        )}
        {currentTab === 'track-order' && <TrackOrderPage />}
        {currentTab === 'wishlist' && (
          <WishlistPage onNotify={showNotification} openAuth={() => executeAuthOpen('signin')} />
        )}
        {currentTab === 'invoices' && isLoggedIn && <InvoicesListPage />}

        {AUTH_REQUIRED_TABS.has(currentTab) && initialized && !isLoggedIn && currentTab !== 'portal' && (
          <div className="max-w-lg mx-auto px-5 py-20 text-center space-y-4">
            <h2 className="text-2xl font-black text-[#F7F4EC] uppercase">Sign in required</h2>
            <p className="text-sm text-[#AEB4C0]">Log in to view this page.</p>
            <button
              type="button"
              onClick={() => executeAuthOpen('signin')}
              className="px-6 py-3 bg-[#C8A45D] text-black font-bold rounded-lg cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* ==================== CUSTOMER PORTAL TAB ==================== */}
        {currentTab === 'portal' && isLoggedIn && (
          <PortalDashboard
            userSession={userSession}
            cart={cartItems}
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
        {currentTab === 'portal' && initialized && !isLoggedIn && (
          <div className="max-w-lg mx-auto px-5 py-20 text-center space-y-4">
            <h2 className="text-2xl font-black text-[#F7F4EC] uppercase">Sign in required</h2>
            <p className="text-sm text-[#AEB4C0]">Log in to view your vault portal, orders, and account details.</p>
            <button
              type="button"
              onClick={() => executeAuthOpen('signin')}
              className="px-6 py-3 bg-[#C8A45D] text-black font-bold rounded-lg cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

      </main>

      {/* Global Regulatory Footer */}
      <Footer setCurrentTab={setCurrentTab} onShowNotification={showNotification} />

      {/* ==================== MULTI-STEP WIZARD MODAL ==================== */}
      {activeWorkflow && (
        <WorkflowsView
          type={activeWorkflow}
          onClose={() => {
            setActiveWorkflow(null);
            setSellEstimate(null);
          }}
          onSubmit={handleWorkflowSubmit}
          onShowNotification={showNotification}
          initialEstimate={activeWorkflow === 'sell' ? sellEstimate : null}
        />
      )}

      {/* ==================== SIGN-IN / SIGN-UP MODAL ==================== */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => {
            dispatch(clearAuthError());
            setAuthModal(null);
            if (currentTab === 'login' || currentTab === 'forgot-password') {
              router.replace('/');
            }
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
              <p className="text-[13px] uppercase tracking-widest font-extrabold text-[#AEB4C0]/70">
                {notification.type === 'success' ? 'Terminal Success' : notification.type === 'error' ? 'Security Notice' : 'System Information'}
              </p>
              <p className="text-sm font-medium leading-relaxed text-[#F7F4EC]/90">{notification.message}</p>
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
