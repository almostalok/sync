import { NextResponse } from 'next/server';
import { historicalAggregationService } from '../../../../../../apps/api/src/modules/history';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline') || undefined;
    const activityType = searchParams.get('activityType') || undefined;

    const benchmarks = await historicalAggregationService.getActivityBenchmarks({
      discipline,
      activityType,
    });

    return NextResponse.json({ success: true, data: benchmarks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch historical benchmarks' },
      { status: 500 }
    );
  }
}
