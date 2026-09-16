import { NextRequest, NextResponse } from 'next/server';
import { MatchingService } from '@sitesync/api/modules/matching/matching.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const matchingService = new MatchingService();
    const result = await matchingService.runBatchMatching(projectId);

    return NextResponse.json({
      data: result,
      meta: {
        projectId,
        matchedCount: result.matchedCount,
        executedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to execute batch matching';
    return NextResponse.json(
      {
        error: {
          code: 'BATCH_MATCHING_ERROR',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
