import { NextResponse } from 'next/server';
import { FreshnessService } from '@/../apps/api/src/modules/dashboard/freshness.service';

const freshnessService = new FreshnessService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const data = await freshnessService.getDataFreshness(projectId);

    return NextResponse.json({
      success: true,
      projectId,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch freshness metrics' },
      { status: 500 }
    );
  }
}
