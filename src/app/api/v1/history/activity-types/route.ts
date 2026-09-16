import { NextResponse } from 'next/server';
import { historicalAggregationService } from '../../../../../../apps/api/src/modules/history';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline') || undefined;

    const benchmarks = await historicalAggregationService.getActivityBenchmarks({ discipline });
    const activityTypes = benchmarks.map((b) => ({
      activityType: b.activityType,
      activityName: b.activityName,
      discipline: b.discipline,
      sampleCount: b.sampleCount,
      quality: b.quality,
      medianDuration: b.durationDays.median,
      medianVariance: b.scheduleVarianceDays.median,
    }));

    return NextResponse.json({ success: true, data: activityTypes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch activity types' },
      { status: 500 }
    );
  }
}
