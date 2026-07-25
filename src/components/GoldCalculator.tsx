import { useState, useEffect } from 'react';
import { HelpCircle, AlertCircle, Info, Calculator, ArrowRight } from 'lucide-react';
import { DEMO_SPOT_PRICE_GRAM, KARAT_FACTORS } from '../data/mockData';

interface GoldCalculatorProps {
  onEstimateAction?: (estimate: any) => void;
  title?: string;
  isCompact?: boolean;
}

export default function GoldCalculator({
  onEstimateAction,
  title = "Your Instant Valuation Engine",
  isCompact = false
}: GoldCalculatorProps) {
  const [weight, setWeight] = useState<number>(25);
  const [unit, setUnit] = useState<'g' | 'oz' | 'dwt'>('g');
  const [karat, setKarat] = useState<string>('18K');
  const [itemType, setItemType] = useState<string>('jewelry');
  const [deduction, setDeduction] = useState<number>(8); // default 8% fee

  const [fineWeight, setFineWeight] = useState<number>(0);
  const [meltValue, setMeltValue] = useState<number>(0);
  const [offerMin, setOfferMin] = useState<number>(0);
  const [offerMax, setOfferMax] = useState<number>(0);

  // Conversion rates
  // 1 Troy Ounce = 31.1034768 grams
  // 1 Pennyweight (dwt) = 1.55517384 grams
  const getWeightInGrams = (w: number, u: 'g' | 'oz' | 'dwt'): number => {
    if (u === 'oz') return w * 31.1035;
    if (u === 'dwt') return w * 1.5552;
    return w;
  };

  useEffect(() => {
    const weightGrams = getWeightInGrams(weight || 0, unit);
    const karatFactor = KARAT_FACTORS[karat] || 1.0;
    
    // Fine gold weight = gross weight * karat purity factor
    const calculatedFine = weightGrams * karatFactor;
    setFineWeight(parseFloat(calculatedFine.toFixed(2)));

    // Melt value = fine gold weight * spot price per gram
    const rawMelt = calculatedFine * DEMO_SPOT_PRICE_GRAM;
    setMeltValue(parseFloat(rawMelt.toFixed(2)));

    // Offers scale with item type and deduct fees
    // Jewelry: has higher physical handling deductions
    // Coins/Bars: very low deductions
    let offerAdjustment = 1 - (deduction / 100);
    if (itemType === 'bars' || itemType === 'coins') {
      offerAdjustment = Math.min(offerAdjustment + 0.03, 0.99); // higher payout for bullion
    } else if (itemType === 'dental' || itemType === 'scrap') {
      offerAdjustment = Math.max(offerAdjustment - 0.02, 0.75); // higher refinement cost
    }

    const calculatedMin = rawMelt * offerAdjustment * 0.95;
    const calculatedMax = rawMelt * offerAdjustment * 1.01;

    setOfferMin(Math.round(calculatedMin));
    setOfferMax(Math.round(calculatedMax));
  }, [weight, unit, karat, itemType, deduction]);

  const itemTypes = [
    { label: 'Gold Jewelry', value: 'jewelry' },
    { label: 'Bullion Coins', value: 'coins' },
    { label: 'Investment Bars', value: 'bars' },
    { label: 'Scrap / Gold Flakes', value: 'scrap' },
    { label: 'Raw Nuggets', value: 'nuggets' },
    { label: 'Dental Gold', value: 'dental' },
  ];

  const handleApplyClick = () => {
    if (onEstimateAction) {
      onEstimateAction({
        weight,
        unit,
        karat,
        itemType,
        fineWeight,
        meltValue,
        offerMin,
        offerMax
      });
    }
  };

  return (
    <div className={`bg-[#11141A] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${isCompact ? 'p-5' : 'p-6 lg:p-8'}`}>
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-sm bg-[#C8A45D]/10 flex items-center justify-center border border-[#C8A45D]/30">
          <Calculator className="w-4 h-4 text-[#C8A45D]" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#F7F4EC]">{title}</h3>
          <p className="text-[10px] uppercase tracking-wider text-[#AEB4C0]/60">1CA Real-time Valuation Ledger</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isCompact ? 'gap-4' : 'lg:grid-cols-12 gap-8'}`}>
        {/* Input Parameters panel */}
        <div className={`${isCompact ? '' : 'lg:col-span-7'} space-y-4`}>
          {/* Item Category */}
          <div>
            <label className="block text-[10px] font-bold text-[#AEB4C0] uppercase tracking-widest mb-2">Item Classification</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {itemTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setItemType(type.value)}
                  className={`py-2 px-3 text-xs rounded-sm border text-center transition-all duration-150 cursor-pointer ${
                    itemType === type.value
                      ? 'bg-[#C8A45D]/10 border-[#C8A45D] text-[#E3C27A] font-bold'
                      : 'bg-[#080A0D] border-white/10 text-[#AEB4C0] hover:border-white/20'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mass Input Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-[#AEB4C0] uppercase tracking-widest mb-2">Total Metal Mass</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={weight || ''}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#080A0D] border border-white/10 rounded-sm p-2.5 text-sm font-bold text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#AEB4C0] uppercase tracking-widest mb-2">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-[#080A0D] border border-white/10 rounded-sm p-2.5 text-sm font-bold text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
              >
                <option value="g">g (Grams)</option>
                <option value="oz">oz (Troy)</option>
                <option value="dwt">dwt (Penny)</option>
              </select>
            </div>
          </div>

          {/* Karat Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#AEB4C0] uppercase tracking-widest mb-2">Stated Karatage</label>
              <select
                value={karat}
                onChange={(e) => setKarat(e.target.value)}
                className="w-full bg-[#080A0D] border border-white/10 rounded-sm p-2.5 text-sm font-bold text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
              >
                {Object.keys(KARAT_FACTORS).map((k) => (
                  <option key={k} value={k}>
                    {k} ({(KARAT_FACTORS[k] * 100).toFixed(1)}% pure)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-[#AEB4C0] uppercase tracking-widest">Assay Deduction</label>
                <span className="text-[10px] text-[#C8A45D] font-bold">{deduction}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={deduction}
                onChange={(e) => setDeduction(parseInt(e.target.value))}
                className="w-full accent-[#C8A45D] mt-2.5 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#080A0D] rounded-sm border border-white/5 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-[#C8A45D] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#AEB4C0]/80 leading-relaxed">
              Melt computations are based on dynamic Spot price of <strong>${DEMO_SPOT_PRICE_GRAM.toFixed(2)}/g</strong> for fine 24K gold. Refinement deduction represents typical melting, slagging, and administrative fees.
            </p>
          </div>
        </div>

        {/* Dynamic Valuation Result Screen */}
        <div className={`${isCompact ? '' : 'lg:col-span-5'} flex flex-col justify-between`}>
          <div className="bg-[#080A0D] border border-white/10 rounded-sm p-5 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#AEB4C0]/60 font-semibold">Fine Gold Mass</p>
                <p className="text-xl font-bold text-[#F7F4EC]">
                  {fineWeight} <span className="text-xs text-[#AEB4C0]/70">grams pure gold</span>
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#AEB4C0]/60 font-semibold">Estimated Melt Value</p>
                <p className="text-xl font-semibold text-[#F7F4EC]">
                  ${meltValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-bold">1CA Indicative Payout Range</p>
                <p className="text-3xl font-light text-[#E3C27A] mt-1 tracking-tight">
                  ${offerMin.toLocaleString()} &ndash; ${offerMax.toLocaleString()}
                </p>
                <span className="text-[9px] uppercase tracking-widest bg-[#2F9D70]/10 text-[#2F9D70] font-bold px-2 py-0.5 rounded-sm mt-2 inline-block">
                  92-98% melt conversion
                </span>
              </div>
            </div>


          </div>

          <button
            onClick={handleApplyClick}
            className="w-full mt-4 bg-[#C8A45D] hover:bg-[#E3C27A] text-black py-3.5 text-xs font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 cursor-pointer"
          >
            Lock Valuation & Sell Gold
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
