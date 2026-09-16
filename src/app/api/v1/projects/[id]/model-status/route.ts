import { NextResponse } from 'next/server';
import { forecastingCoordinator } from '@/../apps/api/src/modules/forecasting';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activeModel = forecastingCoordinator.modelRegistry.getActiveModel();
    const allModels = forecastingCoordinator.modelRegistry.listModels();

    return NextResponse.json({
      success: true,
      projectId: params.id,
      activeModel,
      allModels,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
