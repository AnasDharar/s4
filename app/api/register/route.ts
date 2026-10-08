import { NextResponse } from 'next/server';
import { createParticipant } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, collegeName } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!collegeName || typeof collegeName !== 'string' || !collegeName.trim()) {
      return NextResponse.json({ error: 'College Name is required' }, { status: 400 });
    }

    const participant = await createParticipant(name, collegeName);

    return NextResponse.json({
      success: true,
      participant
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Registration failed' }, { status: 500 });
  }
}
