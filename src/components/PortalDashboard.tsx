import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchOrders, flattenOrderItems } from '@/services/orderService';
import {
  LayoutDashboard, ShoppingCart, TrendingUp, HandCoins, Gavel, Calendar, Hammer, RefreshCw, Lock,
  Receipt, FileText, Bell, Settings, UserCheck, ShieldAlert, CheckCircle2, ChevronRight, X, ArrowUpRight, DollarSign
} from 'lucide-react';
import {
  INITIAL_PAWN_LOANS, INITIAL_SELL_OFFERS, INITIAL_SERVICE_ORDERS,
  INITIAL_DOCUMENTS, INITIAL_STORAGE, DEMO_SPOT_PRICE_OUNCE
} from '../data/mockData';
import { PawnLoan, SellGoldOffer, ServiceOrder, DocumentRecord, StorageRecord } from '../types';

interface PortalDashboardProps {
  userSession: any;
  cart: any[];
  orders: any[];
  goldSales: SellGoldOffer[];
  pawnLoans: PawnLoan[];
  setPawnLoans: React.Dispatch<React.SetStateAction<PawnLoan[]>>;
  watchlist: string[];
  bidsPlaced: Record<string, number>;
  appraisalBookings: any[];
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function PortalDashboard({
  userSession,
  cart,
  orders,
  goldSales,
  pawnLoans,
  setPawnLoans,
  watchlist,
  bidsPlaced,
  appraisalBookings,
  onShowNotification
}: PortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [signedDocs, setSignedDocs] = useState<Record<string, boolean>>({});
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTargetLoan, setPaymentTargetLoan] = useState<PawnLoan | null>(null);
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const token = useAppSelector((s) => s.auth.user?.token);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchOrders(token);
        if (!cancelled && !res?.error) {
          setApiOrders(flattenOrderItems(res.orders || []));
        }
      } catch {
        if (!cancelled) setApiOrders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const displayOrders = apiOrders.length ? apiOrders : orders;

  // local active state records
  const [storageItems] = useState<StorageRecord[]>(INITIAL_STORAGE);
  const [localGoldSales] = useState<SellGoldOffer[]>(INITIAL_SELL_OFFERS);

  // Sign a legal contract inside portal
  const signDocument = (docId: string) => {
    setSignedDocs(prev => ({ ...prev, [docId]: true }));
    if (onShowNotification) {
      onShowNotification(`E-signature registered in OneChannelAdmin vault for Document ID: ${docId}. Stamp hash verified.`, 'success');
    } else {
      alert(`E-signature registered in OneChannelAdmin vault for Document ID: ${docId}. Stamp hash verified.`);
    }
  };

  // Perform Pawn Loan Redemption Repayment
  const triggerRepayment = (loan: PawnLoan) => {
    setPaymentTargetLoan(loan);
    setPaymentModalOpen(true);
  };

  const executeRepayment = () => {
    if (!paymentTargetLoan) return;
    setPawnLoans(prev => prev.map(l => {
      if (l.id === paymentTargetLoan.id) {
        return { ...l, status: 'Redeemed', redemptionAmount: 0 };
      }
      return l;
    }));
    setPaymentModalOpen(false);
    if (onShowNotification) {
      onShowNotification(`Repayment validated successfully for Pawn Loan ${paymentTargetLoan.id}. Physical collateral released to secure Lobby Pick-up slot.`, 'success');
    } else {
      alert(`Repayment validated successfully for Pawn Loan ${paymentTargetLoan.id}. Physical collateral released to secure Lobby Pick-up slot.`);
    }
  };

  const sidebarItems = [
    { label: 'Overview', id: 'overview', icon: LayoutDashboard },
    { label: 'Orders', id: 'orders', icon: ShoppingCart },
    { label: 'Gold Sales', id: 'sales', icon: TrendingUp },
    { label: 'Pawn Loans', id: 'pawn', icon: HandCoins },
    { label: 'Auctions Watch', id: 'auctions', icon: Gavel },
    { label: 'Appraisals', id: 'appraisals', icon: Calendar },
    { label: 'Services Logs', id: 'services', icon: Hammer },
    { label: 'Secure Storage', id: 'storage', icon: Lock },
    { label: 'Payments History', id: 'payments', icon: Receipt },
    { label: 'Documents Vault', id: 'documents', icon: FileText },
    { label: 'Notifications', id: 'notifications', icon: Bell, badge: 2 },
    { label: 'Account Settings', id: 'settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 min-h-[640px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-3 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden shrink-0">
          <div className="p-5 bg-[#11141A] border-b border-[rgba(255,255,255,0.04)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C8A45D] text-[#080A0D] flex items-center justify-center font-black">
              {userSession.name ? userSession.name[0] : 'U'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F7F4EC]">{userSession.name}</h4>
              <p className="text-[13px] text-[#2F9D70] font-bold uppercase flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3 h-3" /> AML Verified
              </p>
            </div>
          </div>

          <nav className="p-2 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left py-2.5 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all duration-150 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#C8A45D]/10 text-[#E3C27A] font-bold'
                      : 'text-[#AEB4C0] hover:bg-white/5 hover:text-[#F7F4EC]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#C8A45D]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#C85A5A] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Display Panel Right */}
        <div className="lg:col-span-9 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 min-h-[500px]">
          
          {/* ==================== 1. OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.06)]">
                <div>
                  <h3 className="text-base font-bold text-[#F7F4EC] uppercase">Unified Account Overview</h3>
                  <p className="text-[13px] text-[#AEB4C0]">Real-time summaries synced with OneChannelAdmin</p>
                </div>
                <span className="text-[13px] uppercase font-bold tracking-wider bg-white/5 px-2.5 py-1 rounded text-[#AEB4C0]">
                  Client ID: 1CA-US-90114
                </span>
              </div>

              {/* KPI cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#11141A] p-4 rounded border border-white/5 space-y-1">
                  <span className="text-xs uppercase tracking-wider text-[#AEB4C0] font-bold block">Pawn Collateral Pledged</span>
                  <p className="text-lg font-black text-[#F7F4EC]">${pawnLoans.reduce((acc, l) => l.status === 'Active' ? acc + l.collateralValue : acc, 0).toLocaleString()}</p>
                </div>
                <div className="bg-[#11141A] p-4 rounded border border-white/5 space-y-1">
                  <span className="text-xs uppercase tracking-wider text-[#AEB4C0] font-bold block">Secure Custody Storage</span>
                  <p className="text-lg font-black text-[#F7F4EC]">${storageItems.reduce((acc, l) => acc + l.insuranceValue, 0).toLocaleString()}</p>
                </div>
                <div className="bg-[#11141A] p-4 rounded border border-white/5 space-y-1">
                  <span className="text-xs uppercase tracking-wider text-[#AEB4C0] font-bold block">Active Gold Quotes</span>
                  <p className="text-lg font-black text-[#E3C27A]">{goldSales.length + localGoldSales.length} Active</p>
                </div>
                <div className="bg-[#11141A] p-4 rounded border border-white/5 space-y-1">
                  <span className="text-xs uppercase tracking-wider text-[#AEB4C0] font-bold block">Placed bids value</span>
                  <p className="text-lg font-black text-[#F7F4EC]">${Object.values(bidsPlaced).reduce((acc, v) => acc + v, 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Split layout: Recent Activity & Documents Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Active pawn loan teaser */}
                <div className="p-4 bg-[#11141A] rounded-lg border border-white/5 space-y-3">
                  <h4 className="text-[13px] text-[#C8A45D] uppercase tracking-wider font-bold">Active Pawn Loans Collateral</h4>
                  {pawnLoans.filter(l => l.status === 'Active').length > 0 ? (
                    pawnLoans.filter(l => l.status === 'Active').map((loan) => (
                      <div key={loan.id} className="text-xs space-y-1.5">
                        <p className="font-bold text-[#F7F4EC]">{loan.itemName}</p>
                        <div className="flex justify-between text-sm text-[#AEB4C0]">
                          <span>Repayment Liability:</span>
                          <span className="font-bold text-[#E3C27A]">${loan.redemptionAmount.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => triggerRepayment(loan)}
                          className="w-full mt-2.5 py-1.5 bg-[#C8A45D] text-[#080A0D] text-[13px] uppercase tracking-wider font-bold rounded cursor-pointer"
                        >
                          Trigger Collateral Redemption
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#AEB4C0]">No outstanding physical asset liabilities.</p>
                  )}
                </div>

                {/* Docs require signature */}
                <div className="p-4 bg-[#11141A] rounded-lg border border-white/5 space-y-3">
                  <h4 className="text-[13px] text-[#C8A45D] uppercase tracking-wider font-bold">Required Signatures</h4>
                  <div className="space-y-2">
                    {INITIAL_DOCUMENTS.map((doc) => {
                      const isSigned = signedDocs[doc.id] || doc.signed;
                      return (
                        <div key={doc.id} className="text-xs flex justify-between items-center py-1 border-b border-white/5 last:border-0 pb-2">
                          <div>
                            <p className="font-bold text-[#F7F4EC] line-clamp-1">{doc.title}</p>
                            <span className="text-xs text-[#AEB4C0]/60">{doc.category}</span>
                          </div>
                          {isSigned ? (
                            <span className="text-[13px] text-[#2F9D70] font-bold">Signed</span>
                          ) : (
                            <button
                              onClick={() => signDocument(doc.id)}
                              className="px-2.5 py-1 bg-[#C8A45D]/10 hover:bg-[#C8A45D] hover:text-[#080A0D] rounded text-[13px] uppercase font-bold text-[#E3C27A] transition-all cursor-pointer"
                            >
                              Sign
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 2. ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Your Purchased Bullion &amp; Jewelry</h3>
              {displayOrders.length > 0 ? (
                <div className="space-y-3">
                  {displayOrders.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#11141A] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                      <div className="flex gap-3 items-center">
                        <img src={item.image} alt="product" referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="font-bold text-[#F7F4EC]">{item.name}</p>
                          <span className="text-[13px] text-[#AEB4C0]/60">Mass: {item.weight}g • Purity: {item.karat}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#E3C27A]">${Number(item.price || 0).toLocaleString()}</p>
                        <span className="text-xs uppercase bg-[#2F9D70]/10 text-[#2F9D70] font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                          Insured Transit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#AEB4C0] py-6 text-center">No purchased gold assets in this catalog. Visit the Buy Gold store.</p>
              )}
            </div>
          )}

          {/* ==================== 3. GOLD SALES ==================== */}
          {activeTab === 'sales' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Submitted Gold Sales &amp; Quotes</h3>
              <div className="space-y-3">
                {[...goldSales, ...localGoldSales].map((sale, idx) => (
                  <div key={idx} className="p-4 bg-[#11141A] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#F7F4EC]">{sale.itemType}</p>
                      <p className="text-[13px] text-[#AEB4C0]/70 mt-1">Stated: {sale.statedKarat} • Est Weight: {sale.estimatedWeight}g • Intake Method: {sale.method}</p>
                      {sale.trackingNumber && <p className="text-xs font-mono text-[#E3C27A] mt-1">Tracking ID: {sale.trackingNumber}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#E3C27A]">${sale.estimatedRangeMin.toLocaleString()} – ${sale.estimatedRangeMax.toLocaleString()}</p>
                      <span className="text-xs uppercase bg-white/5 text-[#C8A45D] font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 4. PAWN LOANS ==================== */}
          {activeTab === 'pawn' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Active Pawn Loans &amp; Collateral Contracts</h3>
              <div className="space-y-3">
                {pawnLoans.map((loan) => (
                  <div key={loan.id} className="p-4 bg-[#11141A] border border-white/5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#E3C27A]">{loan.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          loan.status === 'Active' ? 'bg-[#2F9D70]/10 text-[#2F9D70]' : loan.status === 'Redeemed' ? 'bg-white/10 text-[#AEB4C0]' : 'bg-[#C85A5A]/10 text-[#C85A5A]'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                      <p className="font-bold text-[#F7F4EC]">{loan.itemName}</p>
                      <p className="text-[13px] text-[#AEB4C0]/70">Pledge Date: {loan.dateIssued} • Principal: ${loan.principal.toLocaleString()} • APR: {loan.apr}%</p>
                    </div>
                    
                    <div className="text-right w-full sm:w-auto flex justify-between sm:flex-col items-baseline sm:items-end gap-2">
                      {loan.status === 'Active' || loan.status === 'In Grace Period' ? (
                        <>
                          <div>
                            <span className="text-xs text-[#AEB4C0] uppercase block">Redemption Amount</span>
                            <p className="font-black text-[#E3C27A] text-lg">${loan.redemptionAmount.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => triggerRepayment(loan)}
                            className="px-3 py-1.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] rounded font-bold uppercase text-[13px] tracking-wider cursor-pointer"
                          >
                            Redeem
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-[#AEB4C0]/50 font-bold uppercase">Settled / Closed</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 5. AUCTIONS WATCHLIST ==================== */}
          {activeTab === 'auctions' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Auctions Watchlist &amp; Active Bidding Status</h3>
              {watchlist.length > 0 || Object.keys(bidsPlaced).length > 0 ? (
                <div className="space-y-3">
                  {watchlist.map((id) => (
                    <div key={id} className="p-3 bg-[#11141A] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="text-xs text-[#C8A45D] uppercase block">Watching lot</span>
                        <p className="font-bold text-[#F7F4EC]">{id}</p>
                      </div>
                      <span className="text-[13px] uppercase bg-white/5 px-2 py-0.5 rounded text-[#AEB4C0]">In Progress</span>
                    </div>
                  ))}
                  {Object.keys(bidsPlaced).map((id) => (
                    <div key={id} className="p-3 bg-[#11141A] border border-[#2F9D70]/40 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="text-xs text-[#2F9D70] uppercase font-bold block">Bid Active</span>
                        <p className="font-bold text-[#F7F4EC]">{id}</p>
                      </div>
                      <p className="font-black text-[#E3C27A]">${bidsPlaced[id].toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#AEB4C0] py-6 text-center">No watched lots or active bids registered in current session.</p>
              )}
            </div>
          )}

          {/* ==================== 6. APPRAISALS ==================== */}
          {activeTab === 'appraisals' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Laboratory Appraisal Reservations</h3>
              {appraisalBookings.length > 0 ? (
                <div className="space-y-3">
                  {appraisalBookings.map((b, idx) => (
                    <div key={idx} className="p-4 bg-[#11141A] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[#F7F4EC]">{b.itemName || 'Assay Testing Target'}</p>
                        <p className="text-[13px] text-[#AEB4C0]/70 mt-1">Laboratory: {b.location} • Type: {b.appraisalService}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#C8A45D]">{b.bookingDate}</p>
                        <p className="text-[13px] text-[#AEB4C0]/50">{b.bookingTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#AEB4C0] py-6 text-center">No upcoming reservations lodged. Visit the Appraisal page.</p>
              )}
            </div>
          )}

          {/* ==================== 7. SERVICES ==================== */}
          {activeTab === 'services' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Active Jewelry Service Logs</h3>
              <div className="space-y-4">
                {INITIAL_SERVICE_ORDERS.map((order) => (
                  <div key={order.id} className="p-4 bg-[#11141A] border border-white/5 rounded-lg text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-[#E3C27A]">{order.id}</span>
                        <h4 className="font-bold text-[#F7F4EC] mt-0.5">{order.itemName}</h4>
                      </div>
                      <span className="text-[13px] uppercase tracking-wider bg-[#C8A45D]/10 text-[#C8A45D] font-bold px-2 py-0.5 rounded">
                        {order.status}
                      </span>
                    </div>
                    
                    <p className="text-[13px] text-[#AEB4C0]">{order.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 8. STORAGE ==================== */}
          {activeTab === 'storage' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Secure Custody Storage Registry</h3>
              <div className="space-y-3">
                {storageItems.map((item) => (
                  <div key={item.id} className="p-4 bg-[#11141A] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-mono font-bold text-[#E3C27A]">{item.id}</p>
                      <p className="font-bold text-[#F7F4EC] mt-0.5">{item.itemName}</p>
                      <p className="text-[13px] text-[#AEB4C0]/60">Vault: {item.vaultLocation} • Bin: {item.binNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#F7F4EC]">${item.insuranceValue.toLocaleString()}</p>
                      <span className="text-xs uppercase tracking-wider text-[#2F9D70] font-bold mt-1 inline-block">
                        100% INSURED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 9. PAYMENTS ==================== */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Historic Transaction Receipts Ledger</h3>
              <div className="space-y-3">
                {[
                  { date: '2026-07-15', desc: 'Secure Vault storage Fee - STR-0029', amount: -150.00, status: 'Settled' },
                  { date: '2026-06-15', desc: 'Pawn Loan Disbursement LN-004921', amount: 3200.00, status: 'Completed' },
                  { date: '2026-06-01', desc: 'Imperial Gold Signet Ring purchase', amount: -1650.00, status: 'Settled' }
                ].map((p, idx) => (
                  <div key={idx} className="p-3 bg-[#11141A] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-[#F7F4EC]">{p.desc}</p>
                      <p className="text-xs text-[#AEB4C0]/50 mt-0.5">{p.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${p.amount > 0 ? 'text-[#2F9D70]' : 'text-[#AEB4C0]'}`}>
                        {p.amount > 0 ? `+$${p.amount.toLocaleString()}` : `-$${Math.abs(p.amount).toLocaleString()}`}
                      </p>
                      <span className="text-xs text-[#AEB4C0]/60 uppercase font-semibold">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 10. DOCUMENTS ==================== */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Documents &amp; Certificates Vault</h3>
              <div className="space-y-3">
                {INITIAL_DOCUMENTS.map((doc) => {
                  const isSigned = signedDocs[doc.id] || doc.signed;
                  return (
                    <div key={doc.id} className="p-4 bg-[#11141A] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                      <div className="flex gap-3 items-center">
                        <FileText className="w-5 h-5 text-[#C8A45D]" />
                        <div>
                          <p className="font-bold text-[#F7F4EC]">{doc.title}</p>
                          <span className="text-[13px] text-[#AEB4C0]/60">{doc.category} • {doc.date}</span>
                        </div>
                      </div>
                      
                      {isSigned ? (
                        <span className="text-xs text-[#2F9D70] font-bold">Signed / Valid</span>
                      ) : (
                        <button
                          onClick={() => signDocument(doc.id)}
                          className="px-3.5 py-1.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] rounded font-bold uppercase tracking-wider text-[13px] cursor-pointer"
                        >
                          Sign PDF
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 11. NOTIFICATIONS ==================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Client Inbox Alerts</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { title: 'Outbid Notification: Lot #4092', text: 'Another institutional bidder placed $3,450.00 on GIA Diamond Ring. Trigger proxy bid to secure leader status.', date: '3 mins ago', alert: true },
                  { title: 'Pawn Grace Period Trigger', text: 'Loan LN-003841 is currently in grace status. Repay principal to avoid structural auction liquidation steps.', date: '1 day ago', alert: true },
                  { title: 'Assay Certificate Ready', text: 'XRF Metallurgical report DOC-1120 is fully computed and signed inside the OneChannelAdmin folder.', date: '1 week ago', alert: false }
                ].map((n, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border text-xs space-y-1 ${n.alert ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-[#F7F4EC]">{n.title}</h4>
                      <span className="text-xs text-[#AEB4C0]/60 font-semibold">{n.date}</span>
                    </div>
                    <p className="text-[13px] text-[#AEB4C0] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 12. SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in text-xs text-[#AEB4C0]">
              <h3 className="text-sm font-bold text-[#F7F4EC] uppercase pb-2 border-b border-white/5">Profile Credentials</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold">Primary Owner Name</span>
                  <p className="p-2.5 bg-[#11141A] rounded border border-white/5 font-bold text-[#F7F4EC]">{userSession.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold font-bold">Registered Email ID</span>
                  <p className="p-2.5 bg-[#11141A] rounded border border-white/5 font-bold text-[#F7F4EC]">{userSession.email}</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded border border-white/5 space-y-3">
                <h4 className="font-bold text-[#F7F4EC] uppercase text-[13px]">Security Compliance &amp; 2FA Status</h4>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F9D70]"></span>
                  <span className="font-semibold text-[#F7F4EC]">Multi-Factor Authentication Active (1CA Auth)</span>
                </div>
                <p className="text-[13px] leading-relaxed">
                  Your identity documents are securely locked in cold storage inside 1CA folder partitions. Any transaction over $5,000 mandates automated biometrics or SMS hardware token verification.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* LOAN REPAYMENT MODAL */}
      {paymentModalOpen && paymentTargetLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A0D]/85 backdrop-blur-md">
          <div className="bg-[#171A21] border border-[#C8A45D] w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#11141A] border-b border-white/5 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-[#F7F4EC] uppercase">Repay Pawn Loan Collateral</h4>
                <p className="text-[13px] text-[#C8A45D] font-mono">{paymentTargetLoan.id}</p>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full text-[#AEB4C0]"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-5 text-xs text-[#AEB4C0]">
              <div className="p-4 bg-[#11141A] rounded border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span>Outstanding Principal:</span>
                  <span className="font-bold text-[#F7F4EC]">${paymentTargetLoan.principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Finance Fee Charges:</span>
                  <span className="font-bold text-[#F7F4EC]">${paymentTargetLoan.financeCharge}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/5 font-bold text-[#E3C27A] text-sm">
                  <span>Total Due Today:</span>
                  <span>${paymentTargetLoan.redemptionAmount.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded border border-white/5 leading-relaxed text-[13px]">
                By clicking confirm, the dues will be debited from your registered cash account and the physical asset (<strong>{paymentTargetLoan.itemName}</strong>) will be scheduled for safe dispatch or secure lobby retrieval.
              </div>
            </div>

            <div className="p-5 bg-[#11141A] border-t border-white/5 flex gap-3">
              <button onClick={() => setPaymentModalOpen(false)} className="w-1/3 py-2 bg-white/5 rounded text-xs uppercase font-bold text-[#AEB4C0]">Cancel</button>
              <button onClick={executeRepayment} className="flex-1 py-2 bg-[#C8A45D] hover:bg-[#E3C27A] rounded text-[#080A0D] text-xs font-bold uppercase">Confirm Repayment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
