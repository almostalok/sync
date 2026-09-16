import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { forecastingCoordinator } from '@/../apps/api/src/modules/forecasting';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url);
    const asOfDate = url.searchParams.get('asOfDate') || '2026-09-16';

    const data = generateSyntheticProject();
    const summary = forecastingCoordinator.getForecastSummary({
      project: data.project,
      activities: data.activities,
      dependencies: data.dependencies,
      progressUpdates: [],
      asOfDate,
    });

    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: summary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
