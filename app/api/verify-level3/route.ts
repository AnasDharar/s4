import { NextResponse } from 'next/server';
import { addVerificationLog, getParticipant, updateParticipantLevel3 } from '@/lib/db';
import { verifyVmDeployment } from '@/lib/vmVerifier';

export async function POST(req: Request) {
  try {
    const { userId, vmIp } = await req.json();
    if (!userId || !vmIp || typeof vmIp !== 'string') {
      return NextResponse.json({ error: 'A VM IP address is required.' }, { status: 400 });
    }

    const participant = await getParticipant(userId);
    if (!participant) return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    if (!participant.level2_completed) return NextResponse.json({ error: 'Complete Round 2 before submitting this round.' }, { status: 400 });

    const result = await verifyVmDeployment(vmIp);
    const completedAt = new Date().toISOString();
    await addVerificationLog({
      user_id: participant.id,
      user_name: participant.name,
      college_name: participant.college_name,
      url: `http://${vmIp.trim()}`,
      status: result.success ? 'SUCCESS' : 'FAILED',
      level: 3,
      error_message: result.success ? null : 'This submission did not meet the round requirements.',
    });

    const updatedParticipant = result.success
      ? await updateParticipantLevel3(participant.id, completedAt)
      : participant;

    return NextResponse.json({
      success: result.success,
      error: result.success ? null : result.error,
      completedAt: result.success ? updatedParticipant?.level3_completed_at || completedAt : null,
      participant: updatedParticipant,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to verify this submission.' }, { status: 500 });
  }
}
