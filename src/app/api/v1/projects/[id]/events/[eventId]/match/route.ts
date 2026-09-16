import { NextRequest, NextResponse } from 'next/server';
import { MatchingService } from '@sitesync/api/modules/matching/matching.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  try {
    const projectId = params.id;
    const eventId = params.eventId;
    const body = await request.json();

    const matchingService = new MatchingService();
    const matchResult = await matchingService.matchSingleEvent(projectId, {
      id: eventId,
      reportId: body.reportId || 'rep-api',
      description: body.description,
      normalizedDescription: body.normalizedDescription || body.description,
      eventDate: body.eventDate || new Date().toISOString(),
      discipline: body.discipline || 'CIVIL',
      location: body.location || 'Compressor Area',
      progress: body.progress || 0.5,
      status: body.status || 'IN_PROGRESS',
      entities: body.entities || [],
      sourceText: body.sourceText || body.description,
      extractionConfidence: 0.9,
    });

    return NextResponse.json({
      data: matchResult,
      meta: {
        projectId,
        eventId,
        matchedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to match event';
    return NextResponse.json(
      {
        error: {
          code: 'SINGLE_MATCH_ERROR',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
