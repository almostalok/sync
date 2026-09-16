import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { extractEventsFromReport } from '@/lib/ai/extractor';
import { matchEventToActivities } from '@/lib/ai/hybridMatcher';
import { validateReportInput } from '@/packages/validation/schemas';

export async function GET() {
  const data = generateSyntheticProject();
  return NextResponse.json({
    success: true,
    data: data.fieldReports,
    total: data.fieldReports.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateReportInput(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const reportId = `REP-${Date.now().toString().slice(-6)}`;
    const synthetic = generateSyntheticProject();

    // 1. Ingestion & Event Extraction
    const extractedEvents = extractEventsFromReport({
      id: reportId,
      fileName: body.fileName || 'uploaded_field_report.pdf',
      rawText: body.rawText,
      reportDate: body.reportDate || '2026-09-16',
    });

    // 2. 7-Signal Hybrid Matching
    const matchedEvents = extractedEvents.map(ev => {
      const match = matchEventToActivities(ev, synthetic.activities, 5);
      return {
        ...ev,
        match,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId,
        fileName: body.fileName,
        extractedCount: extractedEvents.length,
        events: matchedEvents,
      },
      message: `Extracted and matched ${extractedEvents.length} execution events using 7-signal hybrid scorer.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
