import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { calculateScheduleMetrics } from '@/lib/schedule/graphEngine';
import { copilotService } from '@/../apps/api/src/modules/copilot';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = generateSyntheticProject();
    const { risks } = calculateScheduleMetrics(data.activities, data.dependencies);

    const questions = copilotService.generateSuggestedQuestions({
      activities: data.activities,
      reports: data.fieldReports,
      events: data.initialEvents,
      risks,
      historicalOutcomes: data.historicalOutcomes,
    });

    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: questions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
