import { NextResponse } from 'next/server';
import { AttentionService } from '@/../apps/api/src/modules/dashboard/attention.service';

const attentionService = new AttentionService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const data = await attentionService.getAttentionRequired(projectId);

    return NextResponse.json({
      success: true,
      projectId,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch attention items' },
      { status: 500 }
    );
  }
}
