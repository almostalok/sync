import { NextResponse } from 'next/server';
import { WBSService } from '@sitesync/api/modules/wbs/wbs.service';

const wbsService = new WBSService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const nodes = await wbsService.getWBSByProjectId(params.id);
  return NextResponse.json({
    success: true,
    projectId: params.id,
    data: nodes,
    total: nodes.length,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const result = await wbsService.createWBSNode({ ...body, projectId: params.id });
    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
