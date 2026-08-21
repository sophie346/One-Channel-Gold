import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let mongo: 'ok' | 'unset' | 'error' = 'unset';
  try {
    const { ensureGoldSecrets } = await import('@/lib/loadGoldSecrets');
    await ensureGoldSecrets();
    if (process.env.MONGO_URI) {
      const { getGoldDb } = await import('@/lib/mongo');
      const db = await getGoldDb();
      await db.command({ ping: 1 });
      mongo = 'ok';
    }
  } catch {
    mongo = process.env.MONGO_URI ? 'error' : 'unset';
  }
  return NextResponse.json({ ok: true, mongo }, { status: 200 });
}
