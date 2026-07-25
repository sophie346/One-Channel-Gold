import React, { useState } from 'react';
import { ShieldCheck, Server, Key, Eye, HelpCircle, FileSpreadsheet, Lock, RefreshCcw, Send, CheckCircle } from 'lucide-react';
import { StorageRecord } from '../types';
import { INITIAL_STORAGE, DEMO_SPOT_PRICE_GRAM } from '../data/mockData';

interface WholesaleAndStorageProps {
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function WholesaleAndStorage({ onShowNotification }: WholesaleAndStorageProps) {
  const [b2bName, setB2bName] = useState('');
  const [b2bTaxId, setB2bTaxId] = useState('');
  const [b2bItem, setB2bItem] = useState('kilobars');
  const [b2bWeightGrams, setB2bWeightGrams] = useState(5000); // 5kg
  const [b2bLockedPrice, setB2bLockedPrice] = useState(0);
  const [b2bSuccess, setB2bSuccess] = useState(false);
  const [storageItems, setStorageItems] = useState<StorageRecord[]>(INITIAL_STORAGE);

  // Live B2B pricing calculation based on volume premium discounts
  const calculateB2BOffer = () => {
    const baseVal = b2bWeightGrams * DEMO_SPOT_PRICE_GRAM;
    // Volume discounts: more weight = cheaper premium fee
    let premiumRate = 0.015; // 1.5% default B2B premium
    if (b2bWeightGrams >= 10000) premiumRate = 0.008; // 0.8% premium for 10kg+
    else if (b2bWeightGrams >= 5000) premiumRate = 0.012; // 1.2% premium for 5kg+

    const finalValue = baseVal * (1 + premiumRate);
    return Math.round(finalValue);
  };

  const handleB2BSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setB2bLockedPrice(calculateB2BOffer());
    setB2bSuccess(true);
  };

  const handleStorageRelease = (recordId: string) => {
    setStorageItems(prev => prev.map(item => {
      if (item.id === recordId) {
        return { ...item, status: 'Released' };
      }
      return item;
    }));
    if (onShowNotification) {
      onShowNotification(`Vault Storage Release Request logged in 1CA database for Record ID: ${recordId}. Verification email sent to owner.`, 'success');
    } else {
      alert(`Vault Storage Release Request logged in 1CA database for Record ID: ${recordId}. Verification email sent to owner.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-16">
      
      {/* SECTION 1: SECURE STORAGE PORTAL */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C8A45D] font-extrabold block mb-1">UL-Class 3 High-Security Vaulting</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#F7F4EC] tracking-tight">Secure Vaulting &amp; Custody Solutions</h2>
          <p className="text-sm text-[#AEB4C0] max-w-3xl leading-relaxed mt-2">
            Insured and vaulted physical assets mapped down to the RFID lock and barcode level. 1CA monitors temperature, security statuses, and Lloyd&rsquo;s insurance valuation indexing in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Storage Table */}
          <div className="lg:col-span-8 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 overflow-x-auto">
            <h3 className="text-xs font-bold text-[#F7F4EC] uppercase tracking-widest mb-4">Your Active Custody Vault Records</h3>
            
            <table className="w-full text-left text-xs text-[#AEB4C0] min-w-[600px]">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] pb-2 text-[10px] text-[#AEB4C0]/70 uppercase tracking-wider">
                  <th className="py-2.5">Record ID</th>
                  <th>Description</th>
                  <th>Vault Location</th>
                  <th>Bin / Seal ID</th>
                  <th>Insurance Value</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                {storageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/20 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#E3C27A]">{item.id}</td>
                    <td className="font-semibold text-[#F7F4EC]">{item.itemName}</td>
                    <td className="text-[11px]">{item.vaultLocation}</td>
                    <td className="font-mono text-[10px]">{item.binNumber} / {item.sealNumber}</td>
                    <td className="font-bold text-[#F7F4EC]">${item.insuranceValue.toLocaleString()}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.status === 'Secured' ? 'bg-[#2F9D70]/10 text-[#2F9D70]' : 'bg-white/10 text-[#AEB4C0]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-right">
                      {item.status === 'Secured' ? (
                        <button
                          onClick={() => handleStorageRelease(item.id)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-red-500/15 hover:text-red-400 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                        >
                          Request Release
                        </button>
                      ) : (
                        <span className="text-[9px] text-[#AEB4C0]/50 font-bold uppercase">Pending Release</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Secure details card right */}
          <div className="lg:col-span-4 bg-[#171A21] border border-[#C8A45D]/20 rounded-xl p-5 space-y-4">
            <div className="flex gap-2 items-center text-[#C8A45D]">
              <Lock className="w-5 h-5" />
              <h4 className="text-xs font-bold uppercase tracking-widest">1CA Secure Vault Specifications</h4>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#11141A] rounded border border-white/5 space-y-1">
                <span className="block text-[9px] text-[#AEB4C0] uppercase font-bold">Physical Audit compliance</span>
                <p className="text-[11px] text-[#F7F4EC] leading-normal font-semibold">Independent audits performed quarterly by Bureau Veritas standard certifications.</p>
              </div>

              <div className="p-3 bg-[#11141A] rounded border border-white/5 space-y-1">
                <span className="block text-[9px] text-[#AEB4C0] uppercase font-bold">Chain-of-Custody Tracking</span>
                <p className="text-[11px] text-[#F7F4EC] leading-normal font-semibold">Sealed multi-layered deposit packaging featuring tamper-evident RFID barcode systems.</p>
              </div>

              <div className="p-3 bg-[#11141A] rounded border border-white/5 space-y-1">
                <span className="block text-[9px] text-[#AEB4C0] uppercase font-bold">Insurance Index</span>
                <p className="text-[11px] text-[#F7F4EC] leading-normal font-semibold">100% value protected against structural loss, damage, or theft by Lloyd&rsquo;s of London underwriters.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WHOLESALE B2B TRADING */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C8A45D] font-extrabold block mb-1">Enterprise Dealer &amp; Institutional desk</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#F7F4EC] tracking-tight">Wholesale Gold Trading &amp; Volume Pricing</h2>
          <p className="text-sm text-[#AEB4C0] max-w-3xl leading-relaxed mt-2">
            Submit a verified B2B quote request to locking spot prices for bulk bars, coins, and mint bullion shipments. Integrated compliance pathways protect bulk liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Volume Tiers Grid */}
          <div className="lg:col-span-4 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F7F4EC] uppercase tracking-widest pb-2 border-b border-[rgba(255,255,255,0.06)]">Wholesale Volume premium schedules</h3>
            
            <div className="space-y-3">
              {[
                { weight: '100g – 999g', premium: 'Spot + 1.80%' },
                { weight: '1,000g – 4,999g (1kg–5kg)', premium: 'Spot + 1.40%' },
                { weight: '5,000g – 9,999g (5kg–10kg)', premium: 'Spot + 1.20%' },
                { weight: '10,000g+ (10kg+ Institutional)', premium: 'Spot + 0.80% (Tightest)' }
              ].map((tier, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                  <span className="font-semibold text-[#AEB4C0]">{tier.weight}</span>
                  <span className="font-mono font-bold text-[#E3C27A]">{tier.premium}</span>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-[#11141A] rounded text-[10px] leading-relaxed text-[#AEB4C0]/70 flex items-start gap-1.5 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-[#C8A45D] shrink-0" />
              <span>Dealer Verification: Institutional wholesale accounts require IRS tax identification numbers (EIN) or corporate certificates of registry to lock pricing schedules.</span>
            </div>
          </div>

          {/* Interactive B2B Quote Form */}
          <div className="lg:col-span-8 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="text-xs font-bold text-[#F7F4EC] uppercase tracking-widest mb-4">Request Spot-Locked Corporate Quote</h3>
            
            {b2bSuccess ? (
              <div className="p-6 text-center space-y-4 animate-fade-in bg-[#11141A] rounded border border-[#2F9D70]/45">
                <CheckCircle className="w-12 h-12 text-[#2F9D70] mx-auto" />
                <div>
                  <h4 className="text-base font-black text-[#F7F4EC] uppercase">Corporate pricing lock active</h4>
                  <p className="text-xs text-[#AEB4C0] mt-1">Institutional deal mapped for <strong>{b2bName || 'B2B Client Corporation'}</strong>.</p>
                </div>
                
                <div className="bg-[#171A21] p-4 rounded font-mono text-xs max-w-sm mx-auto text-left space-y-1 border border-white/5 text-[#AEB4C0]">
                  <p className="text-[10px] text-[#C8A45D] font-bold uppercase">1CA Spot Contract lock</p>
                  <p>Target Mass: <span>{b2bWeightGrams.toLocaleString()} grams fine gold</span></p>
                  <p>Spot-Locked Rate: <span className="font-bold text-[#E3C27A]">${b2bLockedPrice.toLocaleString()} USD</span></p>
                  <p>Deal Code: <span>1CA-B2B-{Math.floor(Math.random() * 90000 + 10000)}</span></p>
                </div>
                
                <button
                  onClick={() => setB2bSuccess(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-[#AEB4C0] uppercase font-bold"
                >
                  Configure new contract
                </button>
              </div>
            ) : (
              <form onSubmit={handleB2BSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Registered Corporate Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Precious Metals Inc."
                      value={b2bName}
                      onChange={(e) => setB2bName(e.target.value)}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold">Corporate EIN / Tax identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12-3456789"
                      value={b2bTaxId}
                      onChange={(e) => setB2bTaxId(e.target.value)}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold font-bold">Target physical Asset</label>
                    <select
                      value={b2bItem}
                      onChange={(e) => setB2bItem(e.target.value)}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                    >
                      <option value="kilobars">1kg Gold Bullion Bars (99.99%)</option>
                      <option value="sovereigns">Box of 1,000 Sovereign Coins</option>
                      <option value="grains">10kg Industrial Gold Grains</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider mb-2 font-bold font-bold">Total target Mass (Grams)</label>
                    <input
                      type="number"
                      min="100"
                      value={b2bWeightGrams}
                      onChange={(e) => setB2bWeightGrams(Math.max(100, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#11141A] border border-[rgba(255,255,255,0.04)] rounded flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[#AEB4C0] block text-[9px] uppercase">Spot-indexed Quote Estimate</span>
                    <p className="text-xl font-bold text-[#E3C27A]">${calculateB2BOffer().toLocaleString()} USD</p>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Lock Live Quote <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
