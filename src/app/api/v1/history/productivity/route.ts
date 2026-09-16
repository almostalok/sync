import { NextResponse } from 'next/server';
import { productivityIntelligenceService } from '../../../../../../apps/api/src/modules/history';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    const data = await productivityIntelligenceService.getProductivityIntelligence({
      discipline,
      projectId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch productivity intelligence' },
      { status: 500 }
    );
  }
}
