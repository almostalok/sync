import { NextResponse } from 'next/server';
import { DisciplineAnalyticsService } from '@/../apps/api/src/modules/dashboard/discipline-analytics.service';

const disciplineService = new DisciplineAnalyticsService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const data = await disciplineService.getDisciplinePerformance(projectId);

    return NextResponse.json({
      success: true,
      projectId,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch discipline performance' },
      { status: 500 }
    );
  }
}
