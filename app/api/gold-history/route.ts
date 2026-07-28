import { NextResponse } from 'next/server';
import {
  DEMO_SPOT_PRICE_OUNCE,
  GOLD_PRICE_HISTORY_7D,
  GOLD_PRICE_HISTORY_30D,
} from '@/data/mockData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type ChartPoint = {
  day: string;
  date: string;
  price: number;
  change: number;
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
  source: string;
  series7d: ChartPoint[];
  series30d: ChartPoint[];
  error?: string;
};

let cache: { at: number; data: GoldHistoryPayload } | null = null;
const CACHE_MS = 60_000;
const TROY_OZ_TO_GRAM = 31.1034768;

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function toPoints(barsNewestFirst: Array<{ bar_start: string; close: string | number }>): ChartPoint[] {
  const chronological = [...barsNewestFirst].reverse();
  return chronological.map((bar, i) => {
    const price = Number(bar.close);
    const prev = i > 0 ? Number(chronological[i - 1].close) : price;
    const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
    return {
      day: dayLabel(bar.bar_start),
      date: shortDate(bar.bar_start),
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
    };
  });
}

function demoSeries7d(): ChartPoint[] {
  return GOLD_PRICE_HISTORY_7D.map((d) => ({
    day: d.day,
    date: d.day,
    price: d.price,
    change: d.change ?? 0,
  }));
}

function demoSeries30d(): ChartPoint[] {
  return GOLD_PRICE_HISTORY_30D.map((d) => ({
    day: d.day,
    date: d.day,
    price: d.price,
    change: 0,
  }));
}

async function fetchSpot() {
  const res = await fetch('https://api.goldprice.dev/v1/prices?symbol=XAU-USD-SPOT', {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`spot_http_${res.status}`);
  const json = await res.json();
  const row = json?.symbols?.[0];
  const price = Number(row?.price);
  if (!Number.isFinite(price) || price <= 0) throw new Error('spot_invalid');
  return {
    price,
    bid: Number(row?.bid) || null,
    ask: Number(row?.ask) || null,
    updatedAt: (row?.computed_at as string) || new Date().toISOString(),
  };
}

async function fetchBars(days: number) {
  // Free tier allows roughly the last 30 calendar days; stay inside that window.
  const safeDays = Math.min(Math.max(days, 7), 29);
  const to = new Date();
  const from = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    symbol: 'XAU-USD-SPOT',
    interval: '1d',
    from: from.toISOString(),
    to: to.toISOString(),
    limit: String(safeDays + 2),
  });

  const res = await fetch(`https://api.goldprice.dev/v1/bars?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`bars_http_${res.status}:${body.slice(0, 160)}`);
  }
  const json = await res.json();
  const bars = Array.isArray(json?.bars) ? json.bars : [];
  if (!bars.length) throw new Error('bars_empty');
  return bars;
}

function fallbackPayload(error?: string): GoldHistoryPayload {
  return {
    spotOz: DEMO_SPOT_PRICE_OUNCE,
    spotGram: Number((DEMO_SPOT_PRICE_OUNCE / TROY_OZ_TO_GRAM).toFixed(2)),
    bid: null,
    ask: null,
    spreadPercent: 0.15,
    dailyChange: 14.4,
    dailyChangePercent: 0.48,
    updatedAt: new Date().toISOString(),
    live: false,
    source: 'demo',
    series7d: demoSeries7d(),
    series30d: demoSeries30d(),
    error,
  };
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
      });
    }

    let spot: Awaited<ReturnType<typeof fetchSpot>> | null = null;
    let bars30: Awaited<ReturnType<typeof fetchBars>> | null = null;
    const errors: string[] = [];

    try {
      spot = await fetchSpot();
    } catch (e: any) {
      errors.push(String(e?.message || e));
    }

    try {
      bars30 = await fetchBars(29);
    } catch (e: any) {
      errors.push(String(e?.message || e));
    }

    if (!spot && !bars30) {
      const data = fallbackPayload(errors.join(' | ') || 'upstream_failed');
      return NextResponse.json(data);
    }

    const series30d = bars30 ? toPoints(bars30).slice(-30) : demoSeries30d();
    const series7d = bars30 ? series30d.slice(-7) : demoSeries7d();

    const last = series30d[series30d.length - 1];
    const prev = series30d[series30d.length - 2];
    const dailyChange = prev ? Number((last.price - prev.price).toFixed(2)) : 0;
    const dailyChangePercent =
      prev && prev.price > 0
        ? Number((((last.price - prev.price) / prev.price) * 100).toFixed(2))
        : 0;

    const spotOz = spot?.price ?? last.price;
    let spreadPercent: number | null = null;
    if (spot?.bid && spot?.ask && spotOz > 0) {
      spreadPercent = Number((((spot.ask - spot.bid) / spotOz) * 100).toFixed(2));
    }

    const data: GoldHistoryPayload = {
      spotOz: Number(spotOz.toFixed(2)),
      spotGram: Number((spotOz / TROY_OZ_TO_GRAM).toFixed(2)),
      bid: spot?.bid ?? null,
      ask: spot?.ask ?? null,
      spreadPercent,
      dailyChange,
      dailyChangePercent,
      updatedAt: spot?.updatedAt || new Date().toISOString(),
      live: Boolean(spot || bars30),
      source: spot || bars30 ? 'goldprice.dev' : 'demo',
      series7d,
      series30d,
      ...(errors.length ? { error: errors.join(' | ') } : {}),
    };

    cache = { at: Date.now(), data };
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (e: any) {
    return NextResponse.json(fallbackPayload(String(e?.message || e)), { status: 200 });
  }
}
