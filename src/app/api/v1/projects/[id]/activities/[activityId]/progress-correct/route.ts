import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@sitesync/api/modules/progress/progress.service';
import { UserRole } from '@sitesync/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const { id: projectId, activityId } = params;
    const body = await request.json().catch(() => ({}));

    if (body.newProgress === undefined || body.newProgress === null) {
      return NextResponse.json({ success: false, error: 'newProgress is required' }, { status: 400 });
    }
    if (!body.reason) {
      return NextResponse.json(
        { success: false, error: 'Progress correction requires an explicit justification reason.' },
        { status: 400 }
      );
    }

    const correctedBy = body.correctedBy || 'Lead Planner';
    const actorRole = body.actorRole || UserRole.PLANNER;

    const progressService = new ProgressService();
    const result = await progressService.correctProgress({
      projectId,
      activityId,
      newProgress: parseFloat(body.newProgress),
      reason: body.reason,
      correctedBy,
      actorRole,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes('not authorized') ? 403 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
