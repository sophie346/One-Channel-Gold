'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import {
  DEMO_SPOT_PRICE_OUNCE,
  GOLD_PRICE_HISTORY_7D,
  GOLD_PRICE_HISTORY_30D,
} from '../data/mockData';

type ChartPoint = {
  day: string;
  date?: string;
  price: number;
  change?: number;
};

type GoldHistoryPayload = {
  spotOz: number;
  spotGram: number;
  bid: number | null;
  ask: number | null;
  spreadPercent: number | null;
  dailyChange: number;
  dailyChangePercent: number;
  updatedAt: string;
  live: boolean;
  series7d: ChartPoint[];
  series30d: ChartPoint[];
};

const FALLBACK: GoldHistoryPayload = {
  spotOz: DEMO_SPOT_PRICE_OUNCE,
  spotGram: Number((DEMO_SPOT_PRICE_OUNCE / 31.1034768).toFixed(2)),
  bid: null,
  ask: null,
  spreadPercent: 0.15,
  dailyChange: 14.4,
  dailyChangePercent: 0.48,
  updatedAt: new Date().toISOString(),
  live: false,
  series7d: GOLD_PRICE_HISTORY_7D,
  series30d: GOLD_PRICE_HISTORY_30D,
};

export default function GoldPriceChart() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [feed, setFeed] = useState<GoldHistoryPayload>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/gold-history', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.spotOz && Array.isArray(data?.series7d) && data.series7d.length) {
          setFeed(data);
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const data = timeframe === '7d' ? feed.series7d : feed.series30d;

  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const { coords, pathD, fillD, minPrice, maxPrice, priceRange } = useMemo(() => {
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices) * 0.998;
    const max = Math.max(...prices) * 1.002;
    const range = max - min || 1;

    const points = data.map((d, index) => {
      const x = paddingX + (index / Math.max(data.length - 1, 1)) * chartWidth;
      const y = paddingY + chartHeight - ((d.price - min) / range) * chartHeight;
      return {
        x,
        y,
        price: d.price,
        label: timeframe === '30d' ? d.date || d.day : d.day,
      };
    });

    let path = '';
    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
      }
    }

    const fill =
      points.length > 0
        ? `${path} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
        : '';

    return {
      coords: points,
      pathD: path,
      fillD: fill,
      minPrice: min,
      maxPrice: max,
      priceRange: range,
    };
  }, [data, timeframe, chartWidth, chartHeight]);

  const changeUp = feed.dailyChange >= 0;
  const changeLabel = `${changeUp ? '+' : ''}$${Math.abs(feed.dailyChange).toFixed(2)} (${changeUp ? '+' : ''}${feed.dailyChangePercent.toFixed(2)}%)`;
  const spreadLabel =
    feed.spreadPercent != null
      ? `${feed.spreadPercent.toFixed(2)}% (${feed.spreadPercent <= 0.2 ? 'Tight' : 'Wide'})`
      : '—';

  return (
    <div className="bg-[#11141A] border border-white/10 rounded-xl p-5 sm:p-6 space-y-6 relative">
      {loading && (
        <div className="absolute top-4 right-4 text-[#AEB4C0]">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-[#C8A45D] uppercase tracking-widest font-extrabold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Feed{feed.live ? ' · Live' : ' · Demo'}</span>
          </div>
          <h3 className="text-lg font-bold text-[#F7F4EC]">Interactive Gold Spot Rate</h3>
        </div>

        <div className="flex gap-1 p-1 bg-[#080A0D] border border-white/10 rounded-sm">
          <button
            type="button"
            onClick={() => {
              setTimeframe('7d');
              setHoverIndex(null);
            }}
            className={`px-3 py-1.5 text-[13px] font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer ${
              timeframe === '7d' ? 'bg-[#C8A45D]/10 text-[#E3C27A]' : 'text-[#AEB4C0] hover:text-[#F7F4EC]'
            }`}
          >
            7-Day Spot
          </button>
          <button
            type="button"
            onClick={() => {
              setTimeframe('30d');
              setHoverIndex(null);
            }}
            className={`px-3 py-1.5 text-[13px] font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer ${
              timeframe === '30d' ? 'bg-[#C8A45D]/10 text-[#E3C27A]' : 'text-[#AEB4C0] hover:text-[#F7F4EC]'
            }`}
          >
            30-Day Spot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="space-y-1">
          <span className="text-[13px] text-[#AEB4C0] uppercase tracking-wider block">Spot Rate (oz)</span>
          <span className="text-xl font-bold text-[#F7F4EC] tabular-nums">
            ${feed.spotOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="space-y-1 border-l border-[rgba(255,255,255,0.06)] pl-4">
          <span className="text-[13px] text-[#AEB4C0] uppercase tracking-wider block">Spot Rate (g)</span>
          <span className="text-xl font-bold text-[#F7F4EC] tabular-nums">${feed.spotGram.toFixed(2)}</span>
        </div>
        <div className="space-y-1 border-l border-[rgba(255,255,255,0.06)] pl-4">
          <span className="text-[13px] text-[#AEB4C0] uppercase tracking-wider block">Daily Change</span>
          <span className={`text-xl font-bold tabular-nums ${changeUp ? 'text-[#2F9D70]' : 'text-red-400'}`}>
            {changeLabel}
          </span>
        </div>
        <div className="space-y-1 border-l border-[rgba(255,255,255,0.06)] pl-4">
          <span className="text-[13px] text-[#AEB4C0] uppercase tracking-wider block">Bid-Ask Spread</span>
          <span className="text-xl font-bold text-[#C8A45D] tabular-nums">{spreadLabel}</span>
        </div>
      </div>

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

          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
          <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.08)" />

          <path d={fillD} fill="url(#goldGradient)" />
          <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" />

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
                r={hoverIndex === i ? 6 : timeframe === '30d' ? 2.5 : 3.5}
                fill={hoverIndex === i ? '#E3C27A' : '#C8A45D'}
                stroke="#171A21"
                strokeWidth={1.5}
                className="transition-all duration-150"
              />
            </g>
          ))}

          {coords.map((c, i) => {
            if (timeframe === '30d' && i % 4 !== 0 && i !== coords.length - 1) return null;
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

          <text x={width - paddingX + 10} y={paddingY + 4} fill="#AEB4C0" fontSize="9" fontWeight="bold">
            ${Math.round(maxPrice)}
          </text>
          <text x={width - paddingX + 10} y={paddingY + chartHeight / 2 + 4} fill="#AEB4C0" fontSize="9" fontWeight="bold">
            ${Math.round(minPrice + priceRange / 2)}
          </text>
          <text x={width - paddingX + 10} y={height - paddingY + 4} fill="#AEB4C0" fontSize="9" fontWeight="bold">
            ${Math.round(minPrice)}
          </text>
        </svg>

        {hoverIndex !== null && coords[hoverIndex] && (
          <div
            className="absolute bg-[#11141A] border border-[#C8A45D] rounded p-2.5 shadow-2xl pointer-events-none text-xs space-y-0.5 z-10"
            style={{
              left: `${Math.min(85, Math.max(15, (coords[hoverIndex].x / width) * 100))}%`,
              top: `${Math.max(10, (coords[hoverIndex].y / height) * 100 - 32)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="text-xs uppercase tracking-wider text-[#AEB4C0]">{coords[hoverIndex].label}</p>
            <p className="font-bold text-[#F7F4EC]">
              ${coords[hoverIndex].price.toLocaleString('en-US', { minimumFractionDigits: 2 })}/oz
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-[rgba(255,255,255,0.05)] pt-6 text-sm text-center">
        <div>
          <span className="text-[#AEB4C0] uppercase text-[13px] block">24K Spot/g</span>
          <p className="text-lg font-bold text-[#F7F4EC] tabular-nums">${feed.spotGram.toFixed(2)} USD</p>
        </div>
        <div>
          <span className="text-[#AEB4C0] uppercase text-[13px] block">18K Spot/g</span>
          <p className="text-lg font-bold text-[#F7F4EC] tabular-nums">
            ${(feed.spotGram * 0.75).toFixed(2)} USD
          </p>
        </div>
        <div>
          <span className="text-[#AEB4C0] uppercase text-[13px] block">14K Spot/g</span>
          <p className="text-lg font-bold text-[#F7F4EC] tabular-nums">
            ${(feed.spotGram * 0.585).toFixed(2)} USD
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-[#080A0D] rounded border border-[rgba(255,255,255,0.04)] flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2F9D70]" />
          <span className="text-sm font-semibold text-[#AEB4C0]">London Bullion Association (LBMA) Match</span>
        </div>
        <div className="p-3.5 bg-[#080A0D] rounded border border-[rgba(255,255,255,0.04)] flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C8A45D]" />
          <span className="text-sm font-semibold text-[#AEB4C0]">OneChannelAdmin Secured Liquidity Pool</span>
        </div>
      </div>
    </div>
  );
}
