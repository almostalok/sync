import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { queryGroundedCopilot } from '@/lib/ai/copilotEngine';
import { calculateScheduleMetrics } from '@/lib/schedule/graphEngine';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json({ success: false, error: 'Question is required' }, { status: 400 });
    }

    const data = generateSyntheticProject();
    const { risks } = calculateScheduleMetrics(data.activities, data.dependencies);

    const response = queryGroundedCopilot(body.question, {
      project: data.project,
      activities: data.activities,
      dependencies: data.dependencies,
      reports: data.fieldReports,
      events: data.initialEvents,
      risks,
      historicalOutcomes: data.historicalOutcomes,
      reviewQueueCount: data.initialEvents.filter(e => e.difficulty === 'LEVEL_5_AMBIGUOUS').length,
    });

    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
