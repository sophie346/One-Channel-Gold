import { useState } from 'react';
import { GOLD_PRICE_HISTORY_7D, GOLD_PRICE_HISTORY_30D, DEMO_SPOT_PRICE_OUNCE } from '../data/mockData';
import { TrendingUp, Award, DollarSign } from 'lucide-react';

export default function GoldPriceChart() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = timeframe === '7d' ? GOLD_PRICE_HISTORY_7D : GOLD_PRICE_HISTORY_30D;

  // Custom mathematical coordinates for the SVG path
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  const priceRange = maxPrice - minPrice;

  const getCoordinates = () => {
    return data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight;
      return { x, y, price: d.price, label: d.day };
    });
  };

  const coords = getCoordinates();

  // Draw smooth cubic bezier or strict polyline
  let pathD = '';
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      // Tension parameters for subtle curve
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  // Draw gradient boundary fill
  const fillD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="bg-[#11141A] border border-white/10 rounded-xl p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#C8A45D] uppercase tracking-widest font-extrabold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Feed</span>
          </div>
          <h3 className="text-lg font-bold text-[#F7F4EC]">Interactive Gold Spot Rate</h3>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex gap-1 p-1 bg-[#080A0D] border border-white/10 rounded-sm">
          <button
            onClick={() => { setTimeframe('7d'); setHoverIndex(null); }}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer ${
              timeframe === '7d' ? 'bg-[#C8A45D]/10 text-[#E3C27A]' : 'text-[#AEB4C0] hover:text-[#F7F4EC]'
            }`}
          >
            7-Day Spot
          </button>
          <button
            onClick={() => { setTimeframe('30d'); setHoverIndex(null); }}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer ${
              timeframe === '30d' ? 'bg-[#C8A45D]/10 text-[#E3C27A]' : 'text-[#AEB4C0] hover:text-[#F7F4EC]'
            }`}
          >
            30-Day Spot
          </button>
        </div>
      </div>

      {/* Hero metrics block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="space-y-1">
          <span className="text-[10px] text-[#AEB4C0] uppercase tracking-wider block">Spot Rate (oz)</span>
          <span className="text-xl font-bold text-[#F7F4EC]">${DEMO_SPOT_PRICE_OUNCE.toFixed(2)}</span>
        </div>
        <div className="space-y-1 border-l border-[rgba(255,255,255,0.06)] pl-4">
          <span className="text-[10px] text-[#AEB4C0] uppercase tracking-wider block">Spot Rate (g)</span>
          <span className="text-xl font-bold text-[#F7F4EC]">${(DEMO_SPOT_PRICE_OUNCE / 31.1035).toFixed(2)}</span>
        </div>
        <div className="space-y-1 border-l border-[rgba(255,255,255,0.06)] pl-4">
          <span className="text-[10px] text-[#AEB4C0] uppercase tracking-wider block">Daily Change</span>
          <span className="text-xl font-bold text-[#2F9D70]">+$14.40 (+0.48%)</span>
        </div>
        <div className="space-y-1 border-l border-[rgba(255,255,255,0.06)] pl-4">
          <span className="text-[10px] text-[#AEB4C0] uppercase tracking-wider block">Spread Spread</span>
          <span className="text-xl font-bold text-[#C8A45D]">0.15% (Tight)</span>
        </div>
      </div>

      {/* SVG Canvas for Chart */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '240px' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="overflow-visible select-none"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8A45D" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#C8A45D" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8F6A32" />
              <stop offset="50%" stopColor="#C8A45D" />
              <stop offset="100%" stopColor="#E3C27A" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
          <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.08)" />

          {/* Gradient Area Payout */}
          <path d={fillD} fill="url(#goldGradient)" />

          {/* Core Vector Line */}
          <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Chart Nodes / Dots */}
          {coords.map((c, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r={hoverIndex === i ? 6 : 3.5}
                fill={hoverIndex === i ? '#E3C27A' : '#C8A45D'}
                stroke="#171A21"
                strokeWidth={1.5}
                className="transition-all duration-150"
              />
            </g>
          ))}

          {/* Labeling axis */}
          {coords.map((c, i) => {
            // limit labels for 30d view to avoid clutter
            if (timeframe === '30d' && i % 3 !== 0 && i !== coords.length - 1) return null;
            return (
              <text
                key={i}
                x={c.x}
                y={height - 10}
                textAnchor="middle"
                fill="#AEB4C0"
                fontSize="10"
                fontWeight="600"
                className="opacity-70"
              >
                {c.label}
              </text>
            );
          })}

          {/* Vertical pricing markers on right */}
          <text x={width - paddingX + 10} y={paddingY + 4} fill="#AEB4C0" fontSize="9" fontWeight="bold">${Math.round(maxPrice)}</text>
          <text x={width - paddingX + 10} y={paddingY + chartHeight / 2 + 4} fill="#AEB4C0" fontSize="9" fontWeight="bold">${Math.round(minPrice + priceRange / 2)}</text>
          <text x={width - paddingX + 10} y={height - paddingY + 4} fill="#AEB4C0" fontSize="9" fontWeight="bold">${Math.round(minPrice)}</text>
        </svg>

        {/* Floating Tooltip Box */}
        {hoverIndex !== null && coords[hoverIndex] && (
          <div
            className="absolute bg-[#11141A] border border-[#C8A45D] rounded p-2.5 shadow-2xl pointer-events-none text-xs space-y-0.5"
            style={{
              left: `${Math.min(width - 150, Math.max(20, (coords[hoverIndex].x / width) * 100))}%`,
              top: `${Math.max(10, (coords[hoverIndex].y / height) * 100 - 32)}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <p className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">{coords[hoverIndex].label}</p>
            <p className="font-bold text-[#F7F4EC]">${coords[hoverIndex].price.toLocaleString('en-US', { minimumFractionDigits: 2 })}/oz</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-[#080A0D] rounded border border-[rgba(255,255,255,0.04)] flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2F9D70]" />
          <span className="text-[11px] font-semibold text-[#AEB4C0]">London Bullion Association (LBMA) Match</span>
        </div>
        <div className="p-3.5 bg-[#080A0D] rounded border border-[rgba(255,255,255,0.04)] flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C8A45D]" />
          <span className="text-[11px] font-semibold text-[#AEB4C0]">OneChannelAdmin Secured Liquidity Pool</span>
        </div>
      </div>
    </div>
  );
}
