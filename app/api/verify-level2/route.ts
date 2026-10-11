import { NextResponse } from 'next/server';
import { getParticipant, updateParticipantLevel2, addVerificationLog } from '@/lib/db';
import { verifyTargetImage } from '@/lib/imageVerifier';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, imageUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const participant = await getParticipant(userId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found. Please register first.' }, { status: 404 });
    }

    if (!participant.level1_completed) {
      return NextResponse.json({ error: 'Level 1 must be completed before attempting Level 2.' }, { status: 400 });
    }

    // Perform verification against target scenario image
    const result = await verifyTargetImage(imageUrl.trim());
    const timestamp = new Date().toISOString();

    // Save verification log
    await addVerificationLog({
      user_id: participant.id,
      user_name: participant.name,
      college_name: participant.college_name,
      url: imageUrl.trim(),
      status: result.success ? 'SUCCESS' : 'FAILED',
      level: 2,
      hash_match: result.success ? result.hashMatched : false,
      error_message: result.success ? null : 'This submission did not meet the round requirements.',
    });

    let updatedParticipant = participant;

    if (result.success) {
      const updated = await updateParticipantLevel2(participant.id, imageUrl.trim(), timestamp);
      if (updated) {
        updatedParticipant = updated;
      }
    }

    return NextResponse.json({
      success: result.success,
      isImageMime: result.success ? result.isImageMime : false,
      contentType: result.success ? result.contentType : null,
      byteSize: result.success ? result.byteSize : 0,
      sha256Hash: result.success ? result.sha256Hash : '',
      masterHash: result.success ? result.masterHash : '',
      hashMatched: result.success ? result.hashMatched : false,
      error: result.success ? null : 'This submission did not meet the round requirements.',
      completedAt: result.success ? (updatedParticipant.level2_completed_at || timestamp) : null,
      participant: updatedParticipant
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Level 2 verification failed' }, { status: 500 });
  }
}
