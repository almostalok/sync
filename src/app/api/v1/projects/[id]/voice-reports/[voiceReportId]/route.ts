import { NextResponse } from 'next/server';
import { voiceReportService } from '@/../apps/api/src/modules/voice';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; voiceReportId: string } }
) {
  try {
    const report = await voiceReportService.getReportById(params.id, params.voiceReportId);
    if (!report) {
      return NextResponse.json({ success: false, error: 'Voice report not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: report,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
