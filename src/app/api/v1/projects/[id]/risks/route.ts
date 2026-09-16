import { NextResponse } from 'next/server';
import { RiskService } from '@/../apps/api/src/modules/risk/risk.service';

const riskService = new RiskService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity');
    const riskType = searchParams.get('type');
    const activityId = searchParams.get('activityId');

    const overview = await riskService.evaluateProjectRisks(projectId);

    let filteredRisks = overview.risks;
    if (severity && severity !== 'ALL') {
      filteredRisks = filteredRisks.filter((r) => r.severity === severity.toUpperCase());
    }
    if (riskType && riskType !== 'ALL') {
      filteredRisks = filteredRisks.filter((r) => r.riskType === riskType.toUpperCase());
    }
    if (activityId) {
      filteredRisks = filteredRisks.filter((r) => r.activityId === activityId || r.activityCode === activityId);
    }

    return NextResponse.json({
      success: true,
      projectId,
      data: {
        summary: overview.summary,
        risks: filteredRisks,
        total: filteredRisks.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}
