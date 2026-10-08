import { NextResponse } from 'next/server';
import { getParticipant, updateParticipantLevel1, addVerificationLog } from '@/lib/db';
import { verifyWebsite } from '@/lib/verifier';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, websiteUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!websiteUrl || typeof websiteUrl !== 'string' || !websiteUrl.trim()) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    const participant = await getParticipant(userId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found. Please register first.' }, { status: 404 });
    }

    // Perform verification checks
    const result = await verifyWebsite(websiteUrl.trim());
    const timestamp = new Date().toISOString();

    // Log the verification attempt in DB
    await addVerificationLog({
      user_id: participant.id,
      user_name: participant.name,
      college_name: participant.college_name,
      url: websiteUrl.trim(),
      status: result.success ? 'SUCCESS' : 'FAILED',
      section_match: result.success ? result.sectionMatched : false,
      h3_match: result.success ? result.h3Matched : false,
      error_message: result.success ? null : 'This submission did not meet the round requirements.',
    });

    let updatedParticipant = participant;

    if (result.success) {
      // Mark as verified and record completion timestamp
      const updated = await updateParticipantLevel1(participant.id, websiteUrl.trim(), timestamp);
      if (updated) {
        updatedParticipant = updated;
      }
    }

    return NextResponse.json({
      success: result.success,
      sectionMatched: result.success ? result.sectionMatched : false,
      h3Matched: result.success ? result.h3Matched : false,
      sectionFoundContent: result.success ? result.sectionFoundContent : null,
      h3FoundContent: result.success ? result.h3FoundContent : null,
      error: result.success ? null : 'This submission did not meet the round requirements.',
      completedAt: result.success ? (updatedParticipant.level1_completed_at || timestamp) : null,
      participant: updatedParticipant
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Verification failed' }, { status: 500 });
  }
}
