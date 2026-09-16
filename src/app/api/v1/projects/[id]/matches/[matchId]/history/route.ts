import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@sitesync/api/modules/review/review.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const { id: projectId, matchId } = params;
    const reviewService = new ReviewService();
    const history = await reviewService.getMatchHistory(projectId, matchId);

    return NextResponse.json({
      success: true,
      projectId,
      matchId,
      totalEntries: history.total,
      history: history.logs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
