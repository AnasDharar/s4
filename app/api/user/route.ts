import { NextResponse } from 'next/server';
import { getParticipant, getUserLogs } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID parameter is required' }, { status: 400 });
    }

    const participant = await getParticipant(userId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const logs = await getUserLogs(userId);

    return NextResponse.json({
      success: true,
      participant,
      logs
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Failed to fetch user state' }, { status: 500 });
  }
}
