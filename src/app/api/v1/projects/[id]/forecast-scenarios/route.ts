import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { forecastingCoordinator } from '@/../apps/api/src/modules/forecasting';
import { validateRunScenario } from '@sitesync/validation';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validation = validateRunScenario({
      ...body,
      projectId: params.id,
    });

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { assumptions, title } = validation.data;
    const data = generateSyntheticProject();

    const scenario = forecastingCoordinator.simulateScenario({
      project: data.project,
      activities: data.activities,
      dependencies: data.dependencies,
      progressUpdates: [],
      assumptions,
      title,
      asOfDate: '2026-09-16',
    });

    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: scenario,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
