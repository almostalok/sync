import { NextResponse } from 'next/server';
import { voiceReportService } from '@/../apps/api/src/modules/voice';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; voiceReportId: string } }
) {
  try {
    const audioUrl = await voiceReportService.getSignedAudioUrl(params.id, params.voiceReportId);
    if (!audioUrl) {
      return NextResponse.json({ success: false, error: 'Audio file not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: {
        audioUrl,
        expiresInSeconds: 900,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
