import { NextRequest, NextResponse } from 'next/server';
import { MatchingService } from '@sitesync/api/modules/matching/matching.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const matchingService = new MatchingService();
    const results = await matchingService.getMatchingResults(projectId);

    return NextResponse.json({
      data: results,
      meta: {
        projectId,
        count: results.length,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to retrieve match results';
    return NextResponse.json(
      {
        error: {
          code: 'GET_MATCHING_RESULTS_ERROR',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
