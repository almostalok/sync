import { NextResponse } from 'next/server';
import { DashboardSummaryService } from '@/../apps/api/src/modules/dashboard/dashboard-summary.service';

const summaryService = new DashboardSummaryService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const data = await summaryService.getSummary(projectId);

    return NextResponse.json({
      success: true,
      projectId,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
