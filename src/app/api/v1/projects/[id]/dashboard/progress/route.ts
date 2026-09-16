import { NextResponse } from 'next/server';
import { ProgressAnalyticsService } from '@/../apps/api/src/modules/dashboard/progress-analytics.service';

const progressService = new ProgressAnalyticsService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const data = await progressService.getProgressTimeSeries(projectId);

    return NextResponse.json({
      success: true,
      projectId,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch progress analytics' },
      { status: 500 }
    );
  }
}
