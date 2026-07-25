import { useState } from 'react';
import {
  ArrowRight, Play, Check, X, Shield, Lock, Fingerprint, Server,
  Eye, FileCheck, Gavel, HandCoins, Warehouse,
  Truck, Scale, Sparkles, ChevronRight, CircleDollarSign,
  BadgeCheck, Clock, ShieldCheck
} from 'lucide-react';
import { DEMO_SPOT_PRICE_OUNCE, DEMO_SPOT_PRICE_GRAM, INITIAL_LOTS, IMAGES, GOLD_PRICE_HISTORY_30D } from '../data/mockData';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  setActiveWorkflow: (type: 'sell' | 'pawn' | 'appraisal' | null) => void;
  openAuth: (type: 'signin' | 'register') => void;
}

export default function HomePage({ setCurrentTab, setActiveWorkflow, openAuth }: HomePageProps) {
  const [timeframe, setTimeframe] = useState('1M');
  const [buyAmount, setBuyAmount] = useState('1');
  const [loanGrams, setLoanGrams] = useState(50);
  const [loanMonths, setLoanMonths] = useState(6);

  const spot = DEMO_SPOT_PRICE_OUNCE;
  const buyTotal = parseFloat(buyAmount || '0') * spot;
  const loanPrincipal = Math.round(loanGrams * DEMO_SPOT_PRICE_GRAM * 0.7);
  const monthlyPayment = Math.round((loanPrincipal * (1 + 0.024 * loanMonths)) / loanMonths);

  const chartData = GOLD_PRICE_HISTORY_30D;
  const prices = chartData.map((d) => d.price);
  const minP = Math.min(...prices) * 0.997;
  const maxP = Math.max(...prices) * 1.003;
  const chartW = 560;
  const chartH = 200;
  const pad = 8;
  const coords = chartData.map((d, i) => {
    const x = pad + (i / (chartData.length - 1)) * (chartW - pad * 2);
    const y = pad + (1 - (d.price - minP) / (maxP - minP)) * (chartH - pad * 2);
    return { x, y };
  });
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${chartH} L ${coords[0].x} ${chartH} Z`;

  const features = [
    { icon: CircleDollarSign, title: 'Instant Liquidity', desc: 'Convert physical gold to cash in hours with live spot-linked offers and insured settlement.' },
    { icon: Warehouse, title: 'Safe Storage', desc: 'Bank-grade vault custody with full insurance coverage and real-time inventory visibility.' },
    { icon: Truck, title: 'Global Shipping', desc: 'Armored, insured logistics for bullion and jewelry with tracked end-to-end delivery.' },
    { icon: Gavel, title: 'Live Auctions', desc: 'Bid on certified lots — estate jewelry, watches, and investment-grade gold bars.' },
    { icon: HandCoins, title: 'Gold-Backed Loans', desc: 'Unlock capital against your gold without selling. Keep ownership while your asset is secured.' },
    { icon: Scale, title: 'Transparent Pricing', desc: 'See melt value, fees, and final payout before you commit — no hidden deductions.' },
    { icon: BadgeCheck, title: 'Verified Assaying', desc: 'XRF spectroscopy and certified metallurgy labs confirm purity before every payout.' },
    { icon: Sparkles, title: 'Custom Jewelry', desc: 'Design, restore, or remake heirlooms with CAD modeling and matching-purity craftsmanship.' },
    { icon: FileCheck, title: 'Full Compliance', desc: 'AML-ready identity checks and audit trails on every transaction through OneChannelAdmin.' },
  ];

  const auctions = INITIAL_LOTS.slice(0, 3);

  const trustRows = [
    { feature: 'Fully Insured Transit', traditional: false, online: 'partial', onegold: true },
    { feature: 'Live Spot Pricing', traditional: false, online: true, onegold: true },
    { feature: 'Transparent Fee Breakdown', traditional: false, online: false, onegold: true },
    { feature: 'Certified Lab Assay', traditional: 'partial', online: false, onegold: true },
    { feature: 'Gold-Backed Loans', traditional: true, online: false, onegold: true },
    { feature: 'Live Auctions', traditional: false, online: 'partial', onegold: true },
    { feature: 'Instant Settlement Options', traditional: false, online: 'partial', onegold: true },
    { feature: 'Vault Custody', traditional: false, online: false, onegold: true },
  ];

  const securityItems = [
    { icon: Shield, title: 'End-to-End Encryption', desc: 'All sessions and payment data are encrypted in transit and at rest.' },
    { icon: Server, title: 'Cold Storage Vaults', desc: 'Physical assets held in segregated, multi-site high-security facilities.' },
    { icon: Fingerprint, title: 'Identity Verification', desc: 'KYC and biometric checks protect every high-value transaction.' },
    { icon: Lock, title: 'Multi-Factor Auth', desc: 'Hardware keys and MFA required for withdrawals and loan releases.' },
    { icon: Eye, title: 'Real-Time Monitoring', desc: 'Continuous fraud detection across bids, payouts, and transfers.' },
    { icon: ShieldCheck, title: 'Lloyd\'s Insured', desc: 'Transit and vault coverage underwritten for full declared value.' },
  ];

  const StatusCell = ({ value }: { value: boolean | string }) => {
    if (value === true) return <Check className="w-4 h-4 text-[#C8A45D] mx-auto" />;
    if (value === 'partial') return <span className="text-[11px] text-[#9CA3AF]">Partial</span>;
    return <X className="w-4 h-4 text-[#4B5563] mx-auto" />;
  };

  return (
    <div className="animate-fade-in">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#C8A45D]/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#C8A45D]/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-7">
              <h1 className="font-serif text-[40px] sm:text-[52px] lg:text-[58px] leading-[1.08] tracking-tight text-white font-medium">
                Buy, Sell, Pawn, and Auction{' '}
                <span className="text-[#C8A45D]">Gold.</span>{' '}
                <span className="text-[#C8A45D]">One Platform.</span>
              </h1>
              <p className="text-[16px] leading-relaxed text-[#9CA3AF] max-w-lg">
                Trade physical gold with live market pricing, certified assaying, insured custody,
                and gold-backed loans — all orchestrated through OneChannelAdmin.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => openAuth('register')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#0A0A0A] text-[14px] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-[14px] font-medium text-white hover:text-[#E3C27A] transition-colors cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </span>
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative flex items-center justify-center min-h-[340px] lg:min-h-[420px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-full bg-gradient-to-br from-[#1a1814] to-[#0A0A0A] border border-[#C8A45D]/20 shadow-[0_0_80px_rgba(200,164,93,0.15)] overflow-hidden">
                  <img
                    src={IMAGES.heroBar}
                    alt="Gold bullion"
                    className="w-full h-full object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Floating labels */}
              <div className="absolute top-[12%] left-[4%] md:left-[8%] bg-[#141414]/90 backdrop-blur border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl animate-float">
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Purity</p>
                <p className="text-[14px] font-semibold text-[#E3C27A]">99.99%</p>
              </div>
              <div className="absolute top-[28%] right-[2%] md:right-[6%] bg-[#141414]/90 backdrop-blur border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl animate-float-delayed">
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Weight</p>
                <p className="text-[14px] font-semibold text-white">1 oz</p>
              </div>
              <div className="absolute bottom-[22%] left-[6%] bg-[#141414]/90 backdrop-blur border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl animate-float">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#C8A45D]" />
                  <p className="text-[13px] font-medium text-white">Verified</p>
                </div>
              </div>
              <div className="absolute bottom-[10%] right-[10%] bg-[#141414]/90 backdrop-blur border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl animate-float-delayed">
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Location</p>
                <p className="text-[14px] font-semibold text-white">Zurich Vault</p>
              </div>
            </div>
          </div>

          {/* Partner strip */}
          <div className="mt-16 md:mt-20 pt-10 border-t border-white/[0.06]">
            <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#6B7280] mb-6">
              Trusted by industry leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-40">
              {['Bloomberg', 'Reuters', 'Forbes', 'LBMA', 'Kitco', 'WSJ'].map((name) => (
                <span key={name} className="text-[15px] md:text-[17px] font-semibold tracking-wide text-white">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== GOLD PRICES ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 space-y-10">
          <div className="max-w-2xl">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-3">Live Market</p>
            <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
              Gold Prices You Can See and Understand.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart */}
            <div className="lg:col-span-8 bg-[#111111] border border-white/[0.08] rounded-2xl p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-[12px] text-[#9CA3AF] mb-1">XAU / USD Spot</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[32px] font-semibold text-white tracking-tight">
                      ${spot.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[14px] font-medium text-[#2F9D70]">+$14.40 (0.59%)</span>
                  </div>
                </div>
                <div className="flex gap-1 p-1 bg-[#0A0A0A] rounded-lg border border-white/[0.06]">
                  {['1D', '1W', '1M', '1Y', 'ALL'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                        timeframe === t
                          ? 'bg-[#C8A45D]/15 text-[#E3C27A]'
                          : 'text-[#6B7280] hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[200px]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8A45D" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#C8A45D" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={fillD} fill="url(#goldFill)" />
                <path d={pathD} fill="none" stroke="#C8A45D" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                {[
                  { label: 'Open', value: '$2,428.45' },
                  { label: 'High', value: '$2,451.20' },
                  { label: 'Low', value: '$2,419.80' },
                  { label: 'Volume', value: '1.2M oz' },
                ].map((s) => (
                  <div key={s.label} className="bg-[#0A0A0A] rounded-xl px-3.5 py-3 border border-white/[0.04]">
                    <p className="text-[11px] text-[#6B7280] mb-0.5">{s.label}</p>
                    <p className="text-[14px] font-semibold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy / Sell widget */}
            <div className="lg:col-span-4 bg-[#111111] border border-white/[0.08] rounded-2xl p-5 md:p-6 flex flex-col">
              <div className="flex gap-1 p-1 bg-[#0A0A0A] rounded-lg border border-white/[0.06] mb-5">
                <button className="flex-1 py-2 text-[12px] font-semibold rounded-md bg-[#C8A45D]/15 text-[#E3C27A] cursor-pointer">
                  Buy Gold
                </button>
                <button
                  onClick={() => setCurrentTab('sell')}
                  className="flex-1 py-2 text-[12px] font-semibold rounded-md text-[#6B7280] hover:text-white cursor-pointer"
                >
                  Sell Gold
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Amount (oz)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-3.5 py-3 text-[15px] text-white focus:outline-none focus:border-[#C8A45D]/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Price / oz</label>
                  <div className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-3.5 py-3 text-[15px] text-white">
                    ${spot.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#9CA3AF]">Subtotal</span>
                    <span className="text-white">${buyTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#9CA3AF]">Fee (0.5%)</span>
                    <span className="text-white">${(buyTotal * 0.005).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-semibold pt-1">
                    <span className="text-white">Total Value</span>
                    <span className="text-[#E3C27A]">${(buyTotal * 1.005).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('buy')}
                className="mt-5 w-full py-3.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#0A0A0A] text-[14px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Buy Gold
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold">Platform</p>
            <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
              Every Gold Transaction. One Platform.
            </h2>
            <p className="text-[15px] text-[#9CA3AF]">
              From bullion to jewelry, loans to auctions — everything runs on a single secure ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-[#111111] border border-white/[0.08] hover:border-[#C8A45D]/30 rounded-2xl p-6 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C8A45D]/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[#C8A45D]" />
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#9CA3AF] mb-4">{f.desc}</p>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[#C8A45D] group-hover:gap-2 transition-all cursor-pointer"
                >
                  Learn more <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AUCTIONS ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-3">Auctions</p>
              <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
                Bid on Verified Gold and Jewelry.
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('auctions')}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#C8A45D] hover:text-[#E3C27A] cursor-pointer"
            >
              View all auctions <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {auctions.map((lot) => (
              <div
                key={lot.id}
                className="bg-[#111111] border border-white/[0.08] rounded-2xl overflow-hidden group hover:border-[#C8A45D]/25 transition-colors"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#0A0A0A]">
                  <img
                    src={lot.image}
                    alt={lot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C8A45D] bg-[#C8A45D]/10 px-2 py-0.5 rounded">
                      Live
                    </span>
                    <span className="text-[11px] text-[#6B7280]">{lot.lotNumber}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2">{lot.title}</h3>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
                    <Clock className="w-3.5 h-3.5" />
                    Ends soon · {lot.bidsCount} bids
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">Current Bid</p>
                      <p className="text-[18px] font-semibold text-[#E3C27A]">
                        ${lot.currentBid.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('auctions')}
                      className="px-4 py-2 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#0A0A0A] text-[12px] font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Bid Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SELL TRANSPARENCY ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold">Sell Gold</p>
              <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
                Sell Your Gold with Complete Transparency.
              </h2>
              <p className="text-[15px] leading-relaxed text-[#9CA3AF]">
                Know exactly what you will receive before you ship. Live spot rates, clear fees,
                and certified assay results — no surprises at payout.
              </p>
              <ul className="space-y-4">
                {[
                  { title: 'Fair Market Value', desc: 'Offers tied directly to live LBMA spot pricing.' },
                  { title: 'No Hidden Fees', desc: 'See refining, shipping, and service costs upfront.' },
                  { title: 'Insured Shipping', desc: 'Free insured kits and armored pickup options.' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C8A45D]/15">
                      <Check className="w-3.5 h-3.5 text-[#C8A45D]" />
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-white">{item.title}</p>
                      <p className="text-[13px] text-[#9CA3AF]">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setActiveWorkflow('sell')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#0A0A0A] text-[14px] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Get a Quote
                </button>
                <button
                  onClick={() => setCurrentTab('sell')}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-[14px] font-medium text-[#9CA3AF] hover:text-white cursor-pointer"
                >
                  How it works <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Valuation receipt */}
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-semibold text-white">Valuation Receipt</h3>
                <span className="text-[11px] text-[#2F9D70] font-medium bg-[#2F9D70]/10 px-2.5 py-1 rounded-full">
                  Live Estimate
                </span>
              </div>
              <div className="space-y-3.5 text-[13px]">
                {[
                  { label: 'Item', value: '18K Gold Chain' },
                  { label: 'Weight', value: '42.5 g' },
                  { label: 'Purity', value: '75.0% (18K)' },
                  { label: 'Fine Gold', value: '31.88 g' },
                  { label: 'Spot Rate', value: `$${DEMO_SPOT_PRICE_GRAM.toFixed(2)}/g` },
                  { label: 'Gross Melt Value', value: '$2,503.66' },
                  { label: 'Assay & Refining', value: '−$87.63' },
                  { label: 'Insured Shipping', value: 'Included' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#9CA3AF]">{row.label}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl bg-[#C8A45D]/10 border border-[#C8A45D]/20 flex justify-between items-center">
                <span className="text-[13px] font-medium text-[#E3C27A]">Final Payout</span>
                <span className="text-[24px] font-semibold text-[#E3C27A]">$2,416.03</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LOANS / PAWN ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Loan calculator */}
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 md:p-7 order-2 lg:order-1">
              <h3 className="text-[15px] font-semibold text-white mb-5">Loan Calculator</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[12px] text-[#9CA3AF]">Gold Collateral (grams)</label>
                    <span className="text-[13px] font-semibold text-white">{loanGrams}g</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    value={loanGrams}
                    onChange={(e) => setLoanGrams(Number(e.target.value))}
                    className="w-full accent-[#C8A45D] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[12px] text-[#9CA3AF]">Duration (months)</label>
                    <span className="text-[13px] font-semibold text-white">{loanMonths} mo</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={loanMonths}
                    onChange={(e) => setLoanMonths(Number(e.target.value))}
                    className="w-full accent-[#C8A45D] cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#0A0A0A] rounded-xl p-3.5 border border-white/[0.04]">
                    <p className="text-[11px] text-[#6B7280] mb-1">Loan Amount (70% LTV)</p>
                    <p className="text-[18px] font-semibold text-white">${loanPrincipal.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-3.5 border border-white/[0.04]">
                    <p className="text-[11px] text-[#6B7280] mb-1">Interest Rate</p>
                    <p className="text-[18px] font-semibold text-white">2.4% / mo</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#C8A45D]/10 border border-[#C8A45D]/20 flex justify-between items-center">
                  <span className="text-[13px] text-[#E3C27A]">Est. Monthly Payment</span>
                  <span className="text-[22px] font-semibold text-[#E3C27A]">${monthlyPayment.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setActiveWorkflow('pawn')}
                  className="w-full py-3.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#0A0A0A] text-[14px] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Start Application
                </button>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold">Gold Loans</p>
              <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
                Use Your Gold, Keep Ownership.
              </h2>
              <p className="text-[15px] leading-relaxed text-[#9CA3AF]">
                Access liquidity against your gold without selling. Your collateral is vaulted,
                insured, and returned when you repay — no credit score required.
              </p>
              <div className="flex flex-wrap gap-2">
                {['No Credit Check', 'Up to 70% LTV', 'Flexible Terms', 'Fully Insured', 'Instant Funding'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-[12px] font-medium text-[#9CA3AF] border border-white/10 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setCurrentTab('pawn')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#0A0A0A] text-[14px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Get a Loan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INFRASTRUCTURE ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold">Infrastructure</p>
            <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
              The Gold Ecommerce Infrastructure Behind Every Transaction.
            </h2>
            <p className="text-[15px] text-[#9CA3AF]">
              OneChannelAdmin powers pricing, custody, compliance, and settlement as a unified stack.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              {[
                { title: 'API Integration', desc: 'REST and webhook endpoints for inventory, pricing, and settlement.' },
                { title: 'Smart Contracts', desc: 'Programmable escrow for auctions, loans, and multi-party deals.' },
                { title: 'Real-time Audits', desc: 'Immutable ledgers for every assay, bid, and vault movement.' },
                { title: 'Compliance Rails', desc: 'Built-in AML, KYC, and jurisdictional reporting workflows.' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={`p-5 rounded-xl border transition-colors ${
                    i === 0
                      ? 'bg-[#C8A45D]/10 border-[#C8A45D]/30'
                      : 'bg-[#111111] border-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <h4 className={`text-[15px] font-semibold mb-1 ${i === 0 ? 'text-[#E3C27A]' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[13px] text-[#9CA3AF]">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-2xl p-5 font-mono text-[12px] overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C85A5A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8A45D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F9D70]" />
                <span className="ml-2 text-[#6B7280]">transaction.json</span>
              </div>
              <pre className="text-[#9CA3AF] leading-relaxed overflow-x-auto">
{`{
  "id": "txn_8f2a91",
  "type": "sell_gold",
  "asset": {
    "metal": "Au",
    "weight_g": 42.5,
    "purity": 0.750
  },
  "spot_usd": ${DEMO_SPOT_PRICE_GRAM},
  "payout_usd": 2416.03,
  "vault": "ZH-01",
  "status": "settled",
  "insured": true,
  "ledger": "1CA"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST COMPARISON ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold">Trust</p>
            <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
              Built for Trust at Every Step.
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="bg-[#141414] border-b border-white/[0.08]">
                  <th className="px-5 py-4 text-[12px] uppercase tracking-wider text-[#6B7280] font-semibold">Feature</th>
                  <th className="px-5 py-4 text-[12px] uppercase tracking-wider text-[#6B7280] font-semibold text-center">Traditional Pawn</th>
                  <th className="px-5 py-4 text-[12px] uppercase tracking-wider text-[#6B7280] font-semibold text-center">Online Buyers</th>
                  <th className="px-5 py-4 text-[12px] uppercase tracking-wider text-[#C8A45D] font-semibold text-center bg-[#C8A45D]/5">OneGold</th>
                </tr>
              </thead>
              <tbody>
                {trustRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-[#111111]' : 'bg-[#0D0D0D]'}>
                    <td className="px-5 py-3.5 text-[13px] text-white font-medium">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><StatusCell value={row.traditional} /></td>
                    <td className="px-5 py-3.5 text-center"><StatusCell value={row.online} /></td>
                    <td className="px-5 py-3.5 text-center bg-[#C8A45D]/[0.03]"><StatusCell value={row.onegold} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-3">Security</p>
              <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium max-w-xl">
                Security is Built into Every Transaction.
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('about')}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#C8A45D] hover:text-[#E3C27A] cursor-pointer"
            >
              Advanced Security <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityItems.map((item) => (
              <div key={item.title} className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5">
                <div className="w-9 h-9 rounded-lg bg-[#C8A45D]/10 flex items-center justify-center mb-3">
                  <item.icon className="w-4.5 h-4.5 text-[#C8A45D]" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#9CA3AF]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="py-16 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-3">Portal</p>
              <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-white font-medium">
                Manage Everything in One Place.
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('portal')}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#C8A45D] hover:text-[#E3C27A] cursor-pointer"
            >
              View All Features <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row min-h-[380px]">
              {/* Sidebar mock */}
              <div className="hidden md:flex w-[200px] shrink-0 flex-col gap-1 p-4 border-r border-white/[0.06] bg-[#0D0D0D]">
                <div className="flex items-center gap-2 px-2 py-3 mb-2">
                  <span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#E3C27A] to-[#8F6A32]" />
                  <span className="text-[13px] font-semibold text-white">OneGold</span>
                </div>
                {['Overview', 'Portfolio', 'Auctions', 'Loans', 'Orders', 'Settings'].map((item, i) => (
                  <div
                    key={item}
                    className={`px-3 py-2 rounded-lg text-[13px] ${
                      i === 0 ? 'bg-[#C8A45D]/15 text-[#E3C27A]' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main mock */}
              <div className="flex-1 p-5 md:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-white">Your Portfolio</h3>
                  <button
                    onClick={() => setCurrentTab('portal')}
                    className="px-3 py-1.5 text-[12px] font-semibold bg-[#C8A45D] text-[#0A0A0A] rounded-lg cursor-pointer"
                  >
                    Open Portal
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Portfolio Value', value: '$86,420', color: 'text-white' },
                    { label: '24h Change', value: '+$1,240', color: 'text-[#2F9D70]' },
                    { label: 'Active Loans', value: '2', color: 'text-white' },
                    { label: 'Open Bids', value: '5', color: 'text-white' },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[11px] text-[#6B7280] mb-1">{s.label}</p>
                      <p className={`text-[18px] font-semibold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-[13px] font-semibold text-white">Recent Activity</p>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {[
                      { action: 'Sold 18K Chain', amount: '+$2,416.03', status: 'Settled', ok: true },
                      { action: 'Bid on LOT #4092', amount: '$3,400.00', status: 'Active', ok: true },
                      { action: 'Pawn Loan LN-0042', amount: '−$8,200.00', status: 'Funded', ok: true },
                      { action: 'Buy 1oz Bar', amount: '−$2,442.85', status: 'Shipped', ok: true },
                    ].map((row) => (
                      <div key={row.action} className="flex items-center justify-between px-4 py-3 text-[13px]">
                        <span className="text-white font-medium">{row.action}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[#9CA3AF] hidden sm:inline">{row.amount}</span>
                          <span className="text-[11px] font-medium text-[#2F9D70] bg-[#2F9D70]/10 px-2 py-0.5 rounded-full">
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
