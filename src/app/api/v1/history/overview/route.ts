import { NextResponse } from 'next/server';
import { historicalAggregationService } from '../../../../../../apps/api/src/modules/history';

export async function GET() {
  try {
    const overview = await historicalAggregationService.getHistoricalOverview();
    return NextResponse.json({ success: true, data: overview });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch historical overview' },
      { status: 500 }
    );
  }
}
