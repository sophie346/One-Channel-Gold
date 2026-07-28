import { useState, useEffect } from 'react';
import { Info, Calculator, ArrowRight } from 'lucide-react';
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
  const [deduction, setDeduction] = useState<number>(8);

  const [fineWeight, setFineWeight] = useState<number>(0);
  const [meltValue, setMeltValue] = useState<number>(0);
  const [offerMin, setOfferMin] = useState<number>(0);
  const [offerMax, setOfferMax] = useState<number>(0);

  const getWeightInGrams = (w: number, u: 'g' | 'oz' | 'dwt'): number => {
    if (u === 'oz') return w * 31.1035;
    if (u === 'dwt') return w * 1.5552;
    return w;
  };

  useEffect(() => {
    const weightGrams = getWeightInGrams(weight || 0, unit);
    const karatFactor = KARAT_FACTORS[karat] || 1.0;

    const calculatedFine = weightGrams * karatFactor;
    setFineWeight(parseFloat(calculatedFine.toFixed(2)));

    const rawMelt = calculatedFine * DEMO_SPOT_PRICE_GRAM;
    setMeltValue(parseFloat(rawMelt.toFixed(2)));

    let offerAdjustment = 1 - (deduction / 100);
    if (itemType === 'bars' || itemType === 'coins') {
      offerAdjustment = Math.min(offerAdjustment + 0.03, 0.99);
    } else if (itemType === 'dental' || itemType === 'scrap') {
      offerAdjustment = Math.max(offerAdjustment - 0.02, 0.75);
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

  const fieldClass =
    'w-full bg-[#080A0D] border border-white/10 rounded-lg px-4 py-3.5 text-base font-semibold text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none transition-colors';

  return (
    <div
      className={`bg-[#11141A] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${
        isCompact ? 'p-5' : 'p-6 md:p-8 lg:p-10'
      }`}
    >
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-11 h-11 rounded-lg bg-[#C8A45D]/10 flex items-center justify-center border border-[#C8A45D]/30">
          <Calculator className="w-5 h-5 text-[#C8A45D]" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-bold uppercase tracking-widest text-[#F7F4EC]">
            {title}
          </h3>
          <p className="text-sm uppercase tracking-wider text-[#AEB4C0]/70 mt-0.5">
            1CA Real-time Valuation Ledger
          </p>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${
          isCompact ? 'gap-5' : 'xl:grid-cols-12 gap-8 xl:gap-10'
        }`}
      >
        {/* Input Parameters */}
        <div className={`${isCompact ? '' : 'xl:col-span-7'} space-y-6`}>
          <div>
            <label className="block text-sm font-bold text-[#AEB4C0] uppercase tracking-widest mb-3">
              Item Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {itemTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setItemType(type.value)}
                  className={`py-3.5 px-3 text-sm rounded-lg border text-center transition-all duration-150 cursor-pointer ${
                    itemType === type.value
                      ? 'bg-[#C8A45D]/10 border-[#C8A45D] text-[#E3C27A] font-bold shadow-[0_0_0_1px_rgba(200,164,93,0.25)]'
                      : 'bg-[#080A0D] border-white/10 text-[#AEB4C0] hover:border-white/25 hover:text-[#F7F4EC]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-[#AEB4C0] uppercase tracking-widest mb-3">
                Total Metal Mass
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={weight || ''}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#AEB4C0] uppercase tracking-widest mb-3">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className={fieldClass}
              >
                <option value="g">g (Grams)</option>
                <option value="oz">oz (Troy)</option>
                <option value="dwt">dwt (Penny)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#AEB4C0] uppercase tracking-widest mb-3">
                Stated Karatage
              </label>
              <select
                value={karat}
                onChange={(e) => setKarat(e.target.value)}
                className={fieldClass}
              >
                {Object.keys(KARAT_FACTORS).map((k) => (
                  <option key={k} value={k}>
                    {k} ({(KARAT_FACTORS[k] * 100).toFixed(1)}% pure)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-[#AEB4C0] uppercase tracking-widest">
                  Assay Deduction
                </label>
                <span className="text-sm text-[#C8A45D] font-bold tabular-nums">{deduction}%</span>
              </div>
              <div className="h-[52px] flex items-center px-1">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={deduction}
                  onChange={(e) => setDeduction(parseInt(e.target.value))}
                  className="w-full accent-[#C8A45D] h-2 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-4 md:p-5 bg-[#080A0D] rounded-xl border border-white/5 flex gap-3 items-start">
            <Info className="w-5 h-5 text-[#C8A45D] shrink-0 mt-0.5" />
            <p className="text-sm text-[#AEB4C0]/90 leading-relaxed">
              Melt computations are based on dynamic Spot price of{' '}
              <strong className="text-[#F7F4EC]">${DEMO_SPOT_PRICE_GRAM.toFixed(2)}/g</strong> for fine
              24K gold. Refinement deduction represents typical melting, slagging, and administrative fees.
            </p>
          </div>
        </div>

        {/* Valuation Result */}
        <div className={`${isCompact ? '' : 'xl:col-span-5'} flex flex-col gap-4`}>
          <div className="bg-[#080A0D] border border-white/10 rounded-xl p-6 md:p-8 flex-1 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-[#AEB4C0]/70 font-semibold mb-1">
                  Fine Gold Mass
                </p>
                <p className="text-2xl md:text-3xl font-bold text-[#F7F4EC] tracking-tight">
                  {fineWeight}{' '}
                  <span className="text-base font-medium text-[#AEB4C0]/80">grams pure gold</span>
                </p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-widest text-[#AEB4C0]/70 font-semibold mb-1">
                  Estimated Melt Value
                </p>
                <p className="text-2xl md:text-3xl font-semibold text-[#F7F4EC] tracking-tight">
                  ${meltValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <p className="text-sm text-[#C8A45D] uppercase tracking-widest font-bold mb-2">
                  1CA Indicative Payout Range
                </p>
                <p className="text-3xl md:text-4xl font-light text-[#E3C27A] tracking-tight">
                  ${offerMin.toLocaleString()} &ndash; ${offerMax.toLocaleString()}
                </p>
                <span className="text-sm uppercase tracking-widest bg-[#2F9D70]/10 text-[#2F9D70] font-bold px-3 py-1 rounded-md mt-4 inline-block">
                  92-98% melt conversion
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyClick}
            className="w-full bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] py-4 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            Lock Valuation & Sell Gold
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
