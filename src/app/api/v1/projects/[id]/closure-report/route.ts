import { NextResponse } from 'next/server';
import { projectClosureService } from '@/../apps/api/src/modules/history';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const report = await projectClosureService.generateQualityReport(projectId);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch project closure quality report' },
      { status: 500 }
    );
  }
}
