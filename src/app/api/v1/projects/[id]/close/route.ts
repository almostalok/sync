import { NextResponse } from 'next/server';
import { projectClosureService } from '@/../apps/api/src/modules/history';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const result = await projectClosureService.initiateProjectClosure(projectId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initiate project closure' },
      { status: 500 }
    );
  }
}
