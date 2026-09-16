import { NextRequest, NextResponse } from 'next/server';
import { MatchingService } from '@sitesync/api/modules/matching/matching.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();

    const { reportId, reportDate, discipline, text } = body;
    if (!text || !reportId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: "Missing 'text' or 'reportId' in request body",
          },
        },
        { status: 400 }
      );
    }

    const matchingService = new MatchingService();
    const events = matchingService.extractEvents({
      reportId,
      projectId,
      reportDate: reportDate || new Date().toISOString(),
      discipline,
      text,
    });

    return NextResponse.json({
      data: {
        reportId,
        extractedCount: events.length,
        events,
      },
      meta: {
        projectId,
        extractedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to extract events';
    return NextResponse.json(
      {
        error: {
          code: 'EVENT_EXTRACTION_ERROR',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
