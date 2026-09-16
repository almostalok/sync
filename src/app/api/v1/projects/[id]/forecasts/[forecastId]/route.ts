import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { forecastingCoordinator } from '@/../apps/api/src/modules/forecasting';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; forecastId: string } }
) {
  try {
    const data = generateSyntheticProject();
    const result = forecastingCoordinator.generateProjectForecasts({
      project: data.project,
      activities: data.activities,
      dependencies: data.dependencies,
      progressUpdates: [],
      asOfDate: '2026-09-16',
    });

    const forecast = result.activityForecasts.find(
      (f) => f.id === params.forecastId || f.activityId === params.forecastId
    );

    if (!forecast) {
      return NextResponse.json(
        { success: false, error: `Forecast not found for ID ${params.forecastId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: forecast,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
