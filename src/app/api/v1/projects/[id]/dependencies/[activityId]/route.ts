import { NextResponse } from 'next/server';
import { DependencyImpactService } from '@/../apps/api/src/modules/dashboard/dependency-impact.service';

const dependencyService = new DependencyImpactService();

export async function GET(
  req: Request,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const graph = await dependencyService.getDependencyGraph(projectId, params.activityId);

    if (!graph) {
      return NextResponse.json(
        { success: false, error: 'Activity not found in project dependency network' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projectId,
      data: graph,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch dependency graph' },
      { status: 500 }
    );
  }
}
