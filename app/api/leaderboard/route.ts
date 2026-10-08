import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db';

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    return NextResponse.json({
      success: true,
      leaderboard
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
