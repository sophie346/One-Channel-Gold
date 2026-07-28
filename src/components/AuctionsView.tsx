import { useState, useEffect, useMemo } from 'react';
import { Gavel, Heart, Clock, ShieldCheck, HelpCircle, BadgeCheck, Trophy, AlertTriangle, Play, CheckCircle2, ArrowLeft, ArrowUpRight, X } from 'lucide-react';
import { AuctionLot } from '../types';
import { INITIAL_LOTS } from '../data/mockData';

interface AuctionsViewProps {
  onPlaceBid: (lotId: string, amount: number) => void;
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  selectedLotId: string | null;
  setSelectedLotId: (id: string | null) => void;
  userSession: any;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AuctionsView({
  onPlaceBid,
  watchlist,
  toggleWatchlist,
  selectedLotId,
  setSelectedLotId,
  userSession,
  onShowNotification
}: AuctionsViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [bidsState, setBidsState] = useState<Record<string, AuctionLot>>(() => {
    // Index lots by id for active session manipulation
    const mapping: Record<string, AuctionLot> = {};
    INITIAL_LOTS.forEach(l => {
      mapping[l.id] = { ...l };
    });
    return mapping;
  });

  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [targetLotId, setTargetLotId] = useState<string | null>(null);
  const [bidAmountInput, setBidAmountInput] = useState<number>(0);
  const [proxyBid, setProxyBid] = useState<boolean>(false);
  const [maxProxyAmount, setMaxProxyAmount] = useState<number>(0);
  const [bidStatus, setBidStatus] = useState<'idle' | 'success' | 'outbid' | 'error'>('idle');

  // Timers countdown mapping
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimers = () => {
      const remaining: Record<string, string> = {};
      Object.keys(bidsState).forEach(id => {
        const lot = bidsState[id];
        const distance = new Date(lot.endsAt).getTime() - new Date().getTime();
        if (distance < 0) {
          remaining[id] = 'Ended';
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          remaining[id] = `${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setTimeRemaining(remaining);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [bidsState]);

  // Target lot for detail view or bid modal
  const selectedLot = useMemo(() => {
    if (!selectedLotId) return null;
    return bidsState[selectedLotId] || null;
  }, [selectedLotId, bidsState]);

  const targetLot = useMemo(() => {
    if (!targetLotId) return null;
    return bidsState[targetLotId] || null;
  }, [targetLotId, bidsState]);

  // Calculate bid premiums
  const buyerPremiumRate = 0.15; // 15% standard premium
  const estTaxRate = 0.0825; // 8.25% NY state digital gold sales tax

  const premiumAmount = (bidAmountInput || 0) * buyerPremiumRate;
  const shippingAmount = targetLot ? targetLot.shippingCost : 0;
  const taxAmount = ((bidAmountInput || 0) + premiumAmount) * estTaxRate;
  const totalEstimate = (bidAmountInput || 0) + premiumAmount + shippingAmount + taxAmount;

  const categories = [
    { label: 'All Lots', value: 'all' },
    { label: 'Fine Jewelry', value: 'fine-jewelry' },
    { label: 'Gold Bullion', value: 'bars' },
    { label: 'Estate Coins', value: 'coins' },
    { label: 'Luxury Timepieces', value: 'watches' },
    { label: 'Raw Gold Nuggets', value: 'raw-gold' }
  ];

  const filteredLots = useMemo(() => {
    return (Object.values(bidsState) as AuctionLot[]).filter(lot => {
      if (activeCategory !== 'all') {
        if (activeCategory === 'bars' && lot.category !== 'bars') return false;
        if (activeCategory === 'fine-jewelry' && lot.category !== 'fine-jewelry') return false;
        if (activeCategory === 'coins' && lot.category !== 'coins') return false;
        if (activeCategory === 'watches' && lot.category !== 'watches') return false;
        if (activeCategory === 'raw-gold' && lot.category !== 'raw-gold') return false;
      }
      return true;
    });
  }, [activeCategory, bidsState]);

  // Open Bid Dialog
  const openBidModal = (lotId: string) => {
    if (!userSession.isLoggedIn) {
      if (onShowNotification) {
        onShowNotification('Authentication required: Please sign in or register to log physical asset bids in 1CA ledger.', 'error');
      } else {
        alert('Authentication required: Please sign in or register to log physical asset bids in 1CA ledger.');
      }
      return;
    }
    const lot = bidsState[lotId];
    setTargetLotId(lotId);
    const minBid = Math.ceil(lot.currentBid * 1.05); // 5% minimum increment
    setBidAmountInput(minBid);
    setMaxProxyAmount(minBid * 1.25);
    setBidStatus('idle');
    setBidModalOpen(true);
  };

  // Confirm Bid inside State
  const submitBid = () => {
    if (!targetLotId) return;
    const lot = bidsState[targetLotId];
    const minBid = Math.ceil(lot.currentBid * 1.05);

    if (bidAmountInput < minBid) {
      setBidStatus('error');
      return;
    }

    // Mutate state with custom placed bid
    setBidsState(prev => {
      const copy = { ...prev };
      const currentLot = { ...copy[targetLotId] };
      const newBidder = userSession.name || 'Individual_Client';
      const updatedBids = [
        { bidder: newBidder, amount: bidAmountInput, time: new Date().toISOString() },
        ...currentLot.bidsHistory
      ];

      currentLot.currentBid = bidAmountInput;
      currentLot.bidsCount += 1;
      currentLot.bidsHistory = updatedBids;
      currentLot.reserveStatus = bidAmountInput >= (currentLot.startingBid * 1.3) ? 'Met' : 'Not Met';

      copy[targetLotId] = currentLot;
      return copy;
    });

    onPlaceBid(targetLotId, bidAmountInput);
    setBidStatus('success');

    // Reset after some time
    setTimeout(() => {
      setBidModalOpen(false);
      setBidStatus('idle');
      setTargetLotId(null);
    }, 2200);
  };

  return (
    <div className="py-8">
      {selectedLot ? (
        /* Detailed Lot view */
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <button
            onClick={() => setSelectedLotId(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#AEB4C0] hover:text-[#C8A45D] uppercase tracking-wider mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Auction Hall
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#171A21] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 md:p-10">
            {/* Image layout left */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-[4/3] bg-[#080A0D] rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)] relative">
                <img
                  src={selectedLot.image}
                  alt={selectedLot.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#080A0D]/80 backdrop-blur-sm px-3 py-1.5 rounded border border-white/5 flex items-center gap-1.5 text-xs font-bold">
                  <Clock className="w-4 h-4 text-[#C8A45D]" />
                  <span className="text-[#E3C27A]">{timeRemaining[selectedLot.id] || 'Loading...'}</span>
                </div>
              </div>

              {/* Bidding logs ledger */}
              <div className="bg-[#11141A] border border-[rgba(255,255,255,0.04)] rounded-lg p-5">
                <h4 className="text-[13px] text-[#C8A45D] uppercase tracking-widest font-black mb-4">1CA Live Bid Log history</h4>
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-2">
                  {selectedLot.bidsHistory.map((bid, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                      <span className="font-semibold text-[#F7F4EC]">{bid.bidder}</span>
                      <div className="text-right">
                        <p className="font-bold text-[#E3C27A]">${bid.amount.toLocaleString()}</p>
                        <p className="text-xs text-[#AEB4C0]/60">Assay Log Verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Auction controls right */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] tracking-widest text-[#C8A45D] uppercase font-bold">{selectedLot.lotNumber}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[13px] uppercase tracking-wider bg-white/5 text-[#AEB4C0] px-2 py-0.5 rounded font-semibold">{selectedLot.category}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[13px] uppercase text-[#AEB4C0] font-semibold">{selectedLot.appraisalStatus} Appraisal</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-[#F7F4EC] tracking-tight">{selectedLot.title}</h1>
                <p className="text-sm text-[#AEB4C0] leading-relaxed">{selectedLot.description}</p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#11141A] p-3 rounded border border-white/5 text-center">
                    <span className="text-xs text-[#AEB4C0] uppercase tracking-wider block">Tested Karatage</span>
                    <span className="text-sm font-bold text-[#F7F4EC]">{selectedLot.karat} pure</span>
                  </div>
                  <div className="bg-[#11141A] p-3 rounded border border-white/5 text-center">
                    <span className="text-xs text-[#AEB4C0] uppercase tracking-wider block">Total Mass (Gross)</span>
                    <span className="text-sm font-bold text-[#F7F4EC]">{selectedLot.weight} grams</span>
                  </div>
                </div>
              </div>

              {/* Action and Pricing block */}
              <div className="p-5 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.06)] space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[13px] text-[#AEB4C0] uppercase">Current High Bid</span>
                    <p className="text-3xl font-black text-[#E3C27A] mt-1">${selectedLot.currentBid.toLocaleString()}</p>
                    <p className="text-xs text-[#2F9D70] font-bold mt-1">Reserve Status: {selectedLot.reserveStatus}</p>
                  </div>
                  <div className="text-right border-l border-[rgba(255,255,255,0.06)] pl-4">
                    <span className="text-[13px] text-[#AEB4C0] uppercase">Total Bids Placed</span>
                    <p className="text-2xl font-black text-[#F7F4EC] mt-1">{selectedLot.bidsCount}</p>
                    <p className="text-xs text-[#AEB4C0] mt-1">Starting Bid: ${selectedLot.startingBid.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex gap-3">
                  <button
                    onClick={() => openBidModal(selectedLot.id)}
                    className="flex-1 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] py-3 text-xs font-bold uppercase tracking-widest rounded-md flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer"
                  >
                    <Gavel className="w-4 h-4" /> Place Bid Now
                  </button>
                  <button
                    onClick={() => toggleWatchlist(selectedLot.id)}
                    className="px-4 bg-[#171A21] border border-[rgba(255,255,255,0.08)] rounded hover:border-[#C8A45D] text-[#AEB4C0] hover:text-[#F7F4EC] flex items-center justify-center transition-all"
                  >
                    <Heart className={`w-4 h-4 ${watchlist.includes(selectedLot.id) ? 'fill-[#C85A5A] stroke-[#C85A5A]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grid list */
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <span className="text-[13px] uppercase tracking-widest text-[#C8A45D] font-extrabold block mb-1">OneGold Live Bidding</span>
              <h2 className="text-3xl font-black text-[#F7F4EC] tracking-tight">Bid on Verified Gold and Jewelry</h2>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.value
                      ? 'bg-[#C8A45D]/10 border-[#C8A45D] text-[#E3C27A] font-bold'
                      : 'bg-[#171A21] border-[rgba(255,255,255,0.06)] text-[#AEB4C0] hover:border-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredLots.map((lot) => {
              const isWatched = watchlist.includes(lot.id);
              return (
                <div
                  key={lot.id}
                  className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden flex flex-col justify-between group hover:border-[#C8A45D]/40 transition-all duration-300"
                >
                  {/* Photo with absolute countdown */}
                  <div className="aspect-[4/3] bg-[#080A0D] overflow-hidden relative">
                    <img
                      src={lot.image}
                      alt={lot.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      <span className="text-xs uppercase bg-[#C8A45D] text-[#080A0D] font-extrabold px-2 py-0.5 rounded tracking-wider">
                        Lot {lot.lotNumber.split('#')[1]}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 bg-[#080A0D]/85 backdrop-blur-sm p-1.5 rounded border border-white/5 flex justify-between items-center text-[13px]">
                      <span className="flex items-center gap-1 text-[#AEB4C0]">
                        <Clock className="w-3 h-3 text-[#C8A45D]" /> {timeRemaining[lot.id] || 'Loading'}
                      </span>
                      <span className="font-bold text-[#E3C27A] uppercase text-xs bg-[#C8A45D]/10 px-1.5 py-0.5 rounded">
                        {lot.reserveStatus === 'Met' ? 'Reserve Met' : 'Reserve Active'}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleWatchlist(lot.id)}
                      className="absolute top-2 right-2 p-1.5 bg-[#080A0D]/75 backdrop-blur-sm rounded-full border border-[rgba(255,255,255,0.08)] hover:bg-[#C8A45D]/10 hover:border-[#C8A45D]"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWatched ? 'fill-[#C85A5A] stroke-[#C85A5A]' : 'text-[#AEB4C0]'}`} />
                    </button>
                  </div>

                  {/* text bodies */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs text-[#AEB4C0] font-semibold">
                        <span>{lot.karat} Gold • {lot.weight}g</span>
                        <span className="uppercase text-[#2F9D70]">{lot.appraisalStatus}</span>
                      </div>
                      <h3
                        onClick={() => setSelectedLotId(lot.id)}
                        className="text-xs font-bold text-[#F7F4EC] hover:text-[#E3C27A] tracking-tight transition-colors line-clamp-1 cursor-pointer"
                      >
                        {lot.title}
                      </h3>
                      <p className="text-[13px] text-[#AEB4C0]/70 line-clamp-2 leading-relaxed">{lot.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                      <div>
                        <span className="text-xs text-[#AEB4C0] uppercase">High bid ({lot.bidsCount})</span>
                        <p className="text-base font-black text-[#E3C27A]">${lot.currentBid.toLocaleString()}</p>
                      </div>

                      <button
                        onClick={() => openBidModal(lot.id)}
                        className="px-3.5 py-1.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-[13px] font-extrabold uppercase tracking-widest rounded transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Gavel className="w-3 h-3" /> Bid
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BID DIALOG MODAL */}
      {bidModalOpen && targetLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A0D]/85 backdrop-blur-md">
          <div className="bg-[#171A21] border border-[#C8A45D] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 bg-[#11141A] border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#F7F4EC] uppercase tracking-wider">Confirm Digital Auction Bid</h3>
                <p className="text-[13px] text-[#C8A45D] font-mono">{targetLot.lotNumber}</p>
              </div>
              <button
                onClick={() => setBidModalOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-full text-[#AEB4C0] hover:text-[#F7F4EC] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success state overlay */}
            {bidStatus === 'success' && (
              <div className="absolute inset-0 bg-[#171A21]/95 z-10 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-[#2F9D70]" />
                <div>
                  <h4 className="text-lg font-black text-[#F7F4EC] uppercase">Bid Recorded Successfully</h4>
                  <p className="text-xs text-[#AEB4C0] max-w-sm mx-auto mt-1">Your bid of <strong>${bidAmountInput.toLocaleString()}</strong> has been timestamped and locked in the 1CA secure escrow ledger.</p>
                </div>
                <div className="text-[13px] bg-white/5 text-[#E3C27A] font-mono px-3 py-1 border border-white/5 rounded uppercase">
                  Hash Locked: 1CA-BID-{targetLot.id}-{Date.now().toString().slice(-4)}
                </div>
              </div>
            )}

            {/* Form body */}
            <div className="p-5 space-y-5">
              <div className="flex gap-4 items-center bg-[#11141A] p-3 rounded border border-white/5">
                <img src={targetLot.image} alt="Lot" referrerPolicy="no-referrer" className="w-14 h-14 object-cover rounded" />
                <div>
                  <h4 className="text-xs font-bold text-[#F7F4EC] line-clamp-1">{targetLot.title}</h4>
                  <p className="text-[13px] text-[#AEB4C0]">{targetLot.karat} Gold • {targetLot.weight}g • Certified Purity</p>
                </div>
              </div>

              {/* Bidding selection slider / buttons */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#AEB4C0] uppercase font-bold">Current Bid</span>
                  <span className="text-sm font-bold text-[#F7F4EC]">${targetLot.currentBid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.06)]">
                  <span className="text-[13px] text-[#C8A45D] uppercase font-bold">Minimum Next Bid (5%)</span>
                  <span className="text-sm font-bold text-[#C8A45D]">${Math.ceil(targetLot.currentBid * 1.05).toLocaleString()}</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[13px] uppercase text-[#AEB4C0] font-bold">Your Custom Bid (USD)</label>
                  <input
                    type="number"
                    min={Math.ceil(targetLot.currentBid * 1.05)}
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#080A0D] border border-[rgba(255,255,255,0.1)] focus:border-[#C8A45D] focus:outline-none p-3 rounded font-black text-lg text-[#E3C27A]"
                  />
                  {bidAmountInput < Math.ceil(targetLot.currentBid * 1.05) && (
                    <p className="text-[13px] text-[#C85A5A] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Bid is below minimum threshold requirement.
                    </p>
                  )}
                </div>

                {/* Proxy checkbox toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="proxy-toggle"
                    type="checkbox"
                    checked={proxyBid}
                    onChange={(e) => setProxyBid(e.target.checked)}
                    className="accent-[#C8A45D]"
                  />
                  <label htmlFor="proxy-toggle" className="text-[13px] text-[#AEB4C0] uppercase font-bold cursor-pointer select-none">
                    Enable Automatic Proxy Bid (1CA Proxy-Bot)
                  </label>
                </div>

                {proxyBid && (
                  <div className="p-3 bg-[#080A0D] rounded border border-white/5 space-y-2 animate-fade-in">
                    <label className="block text-xs text-[#AEB4C0] uppercase font-bold">Maximum Bid Limit</label>
                    <input
                      type="number"
                      value={maxProxyAmount}
                      onChange={(e) => setMaxProxyAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.06)] focus:border-[#C8A45D] focus:outline-none p-2 rounded text-sm text-[#F7F4EC] font-bold"
                    />
                    <p className="text-xs text-[#AEB4C0]/70 leading-relaxed">
                      Our secure proxy algorithm will bid on your behalf in $50 increments up to your maximum limit to maintain your leading position.
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing breakdown ledger */}
              <div className="bg-[#11141A] p-4 rounded-lg border border-[rgba(255,255,255,0.04)] text-xs space-y-2 text-[#AEB4C0]">
                <h5 className="text-xs text-[#F7F4EC] uppercase tracking-wider font-bold mb-1">Financial Breakdown Ledger</h5>
                <div className="flex justify-between">
                  <span>Gross Placed Bid:</span>
                  <span className="font-bold text-[#F7F4EC]">${bidAmountInput.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Buyer Premium (15%):</span>
                  <span>${premiumAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Shipping Fee:</span>
                  <span>${shippingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est Sales Tax (8.25%):</span>
                  <span>${taxAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.06)] font-bold text-sm text-[#E3C27A]">
                  <span>Total Liability Estimate:</span>
                  <span>${totalEstimate.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="p-3 bg-red-500/5 rounded border border-red-500/10 text-xs text-[#AEB4C0] leading-relaxed">
                Legally Binding Contract Notice: By placing this digital signature, you verify identity and agree that your bid constitutes a binding purchase agreement if the lot meets reserve limits or ends.
              </div>
            </div>

            {/* Submit */}
            <div className="p-5 bg-[#11141A] border-t border-[rgba(255,255,255,0.06)] flex gap-3">
              <button
                onClick={() => setBidModalOpen(false)}
                className="w-1/3 py-2.5 bg-white/5 hover:bg-white/10 rounded text-xs text-[#AEB4C0] uppercase font-bold tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitBid}
                disabled={bidAmountInput < Math.ceil(targetLot.currentBid * 1.05)}
                className="flex-1 py-2.5 bg-[#C8A45D] hover:bg-[#E3C27A] disabled:opacity-50 text-[#080A0D] rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
              >
                <Gavel className="w-3.5 h-3.5" /> Place Verified Bid
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
