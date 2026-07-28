import { NextResponse } from 'next/server';
import { DEMO_SPOT_PRICE_OUNCE } from '@/data/mockData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type GoldPricePayload = {
  price: number;
  previousPrice: number | null;
  changePercent: number | null;
  currency: string;
  unit: string;
  source: string;
  updatedAt: string;
  live: boolean;
};

let cache: { at: number; data: GoldPricePayload } | null = null;
const CACHE_MS = 60_000;

async function fetchLiveSpot(): Promise<GoldPricePayload | null> {
  const res = await fetch('https://api.goldprice.dev/v1/prices?symbol=XAU-USD-SPOT', {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;

  const json = await res.json();
  const row = json?.symbols?.[0];
  const price = Number(row?.price);
  if (!Number.isFinite(price) || price <= 0) return null;

  const previousPrice =
    cache?.data?.price && cache.data.price !== price ? cache.data.price : cache?.data?.previousPrice ?? null;

  const changePercent =
    previousPrice && previousPrice > 0
      ? ((price - previousPrice) / previousPrice) * 100
      : null;

  return {
    price,
    previousPrice,
    changePercent,
    currency: 'USD',
    unit: 'troy_ounce',
    source: 'goldprice.dev',
    updatedAt: row?.computed_at || new Date().toISOString(),
    live: true,
  };
}

function fallbackPayload(): GoldPricePayload {
  return {
    price: DEMO_SPOT_PRICE_OUNCE,
    previousPrice: null,
    changePercent: 0.18,
    currency: 'USD',
    unit: 'troy_ounce',
    source: 'demo',
    updatedAt: new Date().toISOString(),
    live: false,
  };
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
      });
    }

    const live = await fetchLiveSpot();
    const data = live ?? fallbackPayload();
    cache = { at: Date.now(), data };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch {
    const data = fallbackPayload();
    return NextResponse.json(data, { status: 200 });
  }
}
