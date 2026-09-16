import { NextResponse } from 'next/server';
import { historicalOutcomeService } from '../../../../../../apps/api/src/modules/history';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || undefined;
    const discipline = searchParams.get('discipline') || undefined;
    const activityType = searchParams.get('activityType') || undefined;
    const delayCause = searchParams.get('delayCause') || undefined;
    const location = searchParams.get('location') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await historicalOutcomeService.searchHistoricalOutcomes({
      projectId,
      discipline,
      activityType,
      delayCause,
      location,
      search,
      page,
      limit,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to search historical outcomes' },
      { status: 500 }
    );
  }
}
