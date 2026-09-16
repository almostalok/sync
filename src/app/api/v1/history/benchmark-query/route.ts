import { NextResponse } from 'next/server';
import { historicalBenchmarkService } from '../../../../../../apps/api/src/modules/history';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const question = searchParams.get('question') || undefined;
    const discipline = searchParams.get('discipline') || undefined;
    const activityType = searchParams.get('activityType') || undefined;

    const response = await historicalBenchmarkService.getBenchmark({
      question,
      discipline,
      activityType,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process benchmark query' },
      { status: 500 }
    );
  }
}
