import { NextResponse } from 'next/server';
import { RiskService } from '@/../apps/api/src/modules/risk/risk.service';

const riskService = new RiskService();

export async function GET(
  req: Request,
  { params }: { params: { id: string; riskId: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const risk = await riskService.getRiskById(projectId, params.riskId);

    if (!risk) {
      return NextResponse.json(
        { success: false, error: 'Risk record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projectId,
      data: risk,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch risk detail' },
      { status: 500 }
    );
  }
}
