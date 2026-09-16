import { NextRequest, NextResponse } from 'next/server';
import { ProgressHistoryService } from '@sitesync/api/modules/progress/progress-history.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const { id: projectId, activityId } = params;
    const historyService = new ProgressHistoryService();
    const history = await historyService.getHistory(projectId, activityId);

    return NextResponse.json({
      success: true,
      projectId,
      activityId,
      totalEntries: history.length,
      history,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
