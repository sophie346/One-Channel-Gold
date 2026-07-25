import { ArrowUpRight, Shield, RefreshCw, Mail, Phone, MapPin, Globe, CreditCard } from 'lucide-react';
import { DEMO_SPOT_PRICE_OUNCE } from '../data/mockData';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Footer({ setCurrentTab, onShowNotification }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerCols = [
    {
      title: 'Buy Gold',
      items: [
        { label: 'Gold Bullion Bars', id: 'buy' },
        { label: 'Investment Coins', id: 'buy' },
        { label: 'Certified Rings', id: 'buy' },
        { label: 'Classic Gold Chains', id: 'buy' },
        { label: 'Custom Designs', id: 'services' },
      ],
    },
    {
      title: 'Sell & Pawn',
      items: [
        { label: 'Sell Scrap Jewelry', id: 'sell' },
        { label: 'Pawn Collateral Estimator', id: 'pawn' },
        { label: 'Insured Mailing Kits', id: 'sell' },
        { label: 'Local Safe Lockboxes', id: 'storage' },
        { label: 'Trade-In Exchange', id: 'services' },
      ],
    },
    {
      title: 'Auctions',
      items: [
        { label: 'Live Liquidations', id: 'auctions' },
        { label: 'Upcoming Catalog', id: 'auctions' },
        { label: 'Pawn Default Inventory', id: 'auctions' },
        { label: 'Bidder Verification', id: 'auctions' },
        { label: 'Recently Sold Lots', id: 'auctions' },
      ],
    },
    {
      title: 'Expertise',
      items: [
        { label: 'Laboratory Appraisals', id: 'appraisal' },
        { label: 'XRF Assay Testing', id: 'appraisal' },
        { label: 'Cleaning & Polishing', id: 'services' },
        { label: 'Jewelry Restoration', id: 'services' },
        { label: 'Wholesale B2B Program', id: 'wholesale' },
      ],
    },
  ];

  return (
    <footer id="main-footer" className="bg-[#080A0D] border-t border-[rgba(255,255,255,0.08)] pt-20 pb-12 text-[#AEB4C0]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Top Newsletter & Spot Price Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[rgba(255,255,255,0.06)]">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#C8A45D] flex items-center justify-center font-extrabold text-[#080A0D] text-xs">
                1G
              </div>
              <span className="text-[#F7F4EC] text-lg font-bold tracking-tight">OneGold Terminal</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md text-[#AEB4C0]/80">
              Subscribe to the OneGold market bulletin. Receive direct alerts for global spot price adjustments, upcoming high-volume auctions, and institutional wholesale offers.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (onShowNotification) { onShowNotification('Bulletin subscription confirmed! (Demo only)', 'success'); } else { alert('Bulletin subscription confirmed! (Demo only)'); } }} className="flex gap-2 max-w-sm">
              <input
                type="email"
                required
                placeholder="Enter business email"
                className="bg-[#11141A] border border-white/10 focus:border-[#C8A45D] focus:outline-none text-xs rounded-sm px-3.5 py-2.5 w-full text-[#F7F4EC] placeholder-[#AEB4C0]/40 font-semibold"
              />
              <button
                type="submit"
                className="bg-[#C8A45D] hover:bg-[#E3C27A] text-black text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0"
              >
                Join <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-5 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.04)] space-y-2">
              <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-[#C8A45D] font-bold">
                <span>Gold Spot Price</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F9D70]"></span>
              </div>
              <p className="text-2xl font-black text-[#F7F4EC]">${DEMO_SPOT_PRICE_OUNCE.toFixed(2)}</p>
              <p className="text-[10px] text-[#2F9D70] font-medium">+0.48% (+$14.40) today</p>
            </div>

            <div className="p-5 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.04)] space-y-2">
              <span className="text-[10px] tracking-wider uppercase text-[#AEB4C0] font-bold block">1CA API Synced</span>
              <div className="flex items-center gap-2 text-xs text-[#F7F4EC]">
                <Shield className="w-4 h-4 text-[#C8A45D]" />
                <span>OneChannelAdmin Core</span>
              </div>
              <p className="text-[10px] text-[#AEB4C0]/70">Centralized logs for compliance, vault storage & bids.</p>
            </div>

            <div className="p-5 bg-[#11141A] rounded-lg border border-[rgba(255,255,255,0.04)] flex flex-col justify-between">
              <span className="text-[10px] tracking-wider uppercase text-[#AEB4C0] font-bold block">Physical Integrity</span>
              <div className="text-xs text-[#F7F4EC] font-semibold flex items-center gap-1">
                <span>Refinery Standard ISO 9001</span>
              </div>
              <div className="text-[10px] text-[#AEB4C0]/60 flex items-center gap-1.5 mt-2">
                <RefreshCw className="w-3 h-3 text-[#C8A45D] animate-spin-slow" />
                <span>Independent lab assaying</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 py-16">
          {footerCols.map((col, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="text-xs font-bold text-[#F7F4EC] uppercase tracking-widest">{col.title}</h4>
              <ul className="space-y-2">
                {col.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <button
                      onClick={() => handleLinkClick(item.id)}
                      className="text-sm hover:text-[#E3C27A] transition-colors duration-200 text-[#AEB4C0]/80 text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Details */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <h4 className="text-xs font-bold text-[#F7F4EC] uppercase tracking-widest">Connect</h4>
            <div className="space-y-3.5 text-sm">
              <a href="tel:+18005553010" className="flex items-center gap-2.5 hover:text-[#E3C27A] transition-colors">
                <Phone className="w-4 h-4 text-[#C8A45D]" />
                <span>+1 (800) 555-3010</span>
              </a>
              <a href="mailto:vault@onegold-1ca.com" className="flex items-center gap-2.5 hover:text-[#E3C27A] transition-colors">
                <Mail className="w-4 h-4 text-[#C8A45D]" />
                <span>vault@onegold-1ca.com</span>
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C8A45D] shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed text-[#AEB4C0]/80">
                  Suite 920, Financial District,<br />Manhattan, NY 10005
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Disclosures Box */}
        <div className="p-5 bg-[#11141A]/60 border border-[rgba(255,255,255,0.04)] rounded-lg text-xs leading-relaxed text-[#AEB4C0]/60 space-y-3">
          <p className="font-semibold text-[#F7F4EC]/80">Important Regulatory Disclosures & Disclaimers:</p>
          <p>
            <strong>Gold Loans & Pawn Services:</strong> Collateralized transactions are subject to jurisdictional requirements. Pawn finance charges, APRs ranging from 12% to 36%, maturity dates, grace periods, and renewal regulations vary according to local statutes. All items are evaluated by certified physical assay inside 1CA compliant facilities. This is a prototype system, and interest calculations/estimates shown herein are strictly demonstrative.
          </p>
          <p>
            <strong>Auction Sales:</strong> Bids made in live digital auctions constitute legally binding intent. A standard buyer’s premium (15% unless otherwise noted) and local sales taxes are applicable upon completion. Physical lots are secured in OneGold vaults and are fully insured against major loss by Lloyd&rsquo;s of London underwriters.
          </p>
        </div>

        {/* Lower Info bar & Selectors */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 mt-12 border-t border-[rgba(255,255,255,0.06)] text-xs text-[#AEB4C0]/70">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <span>&copy; {currentYear} OneGold Inc. All Rights Reserved.</span>
            <span className="text-[rgba(255,255,255,0.15)]">|</span>
            <span className="cursor-pointer hover:text-[#F7F4EC]">Terms of Service</span>
            <span className="cursor-pointer hover:text-[#F7F4EC]">Privacy Policy</span>
            <span className="cursor-pointer hover:text-[#F7F4EC]">State Disclosures</span>
            <span className="cursor-pointer hover:text-[#F7F4EC]">AML Compliance</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selection */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#C8A45D]" />
              <select className="bg-transparent border-none text-[11px] font-semibold text-[#AEB4C0] hover:text-[#F7F4EC] focus:outline-none">
                <option value="en" className="bg-[#080A0D]">EN (US)</option>
                <option value="de" className="bg-[#080A0D]">DE (CH)</option>
                <option value="uk" className="bg-[#080A0D]">GB (UK)</option>
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#C8A45D]" />
              <select className="bg-transparent border-none text-[11px] font-semibold text-[#AEB4C0] hover:text-[#F7F4EC] focus:outline-none">
                <option value="usd" className="bg-[#080A0D]">USD ($)</option>
                <option value="eur" className="bg-[#080A0D]">EUR (€)</option>
                <option value="chf" className="bg-[#080A0D]">CHF (₣)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
