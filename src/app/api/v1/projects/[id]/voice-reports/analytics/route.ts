import { NextResponse } from 'next/server';
import { voiceAnalyticsService } from '@/../apps/api/src/modules/voice';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const analytics = await voiceAnalyticsService.getVoiceAnalytics(params.id);
    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: analytics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
