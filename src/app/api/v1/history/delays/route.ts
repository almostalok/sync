import { NextResponse } from 'next/server';
import { delayIntelligenceService } from '../../../../../../apps/api/src/modules/history';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    const data = await delayIntelligenceService.getDelayIntelligence({
      discipline,
      projectId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch delay intelligence' },
      { status: 500 }
    );
  }
}
