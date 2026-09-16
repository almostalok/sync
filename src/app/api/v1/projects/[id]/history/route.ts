import { NextResponse } from 'next/server';
import { historicalOutcomeService } from '@/../apps/api/src/modules/history';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const { searchParams } = new URL(req.url);
    const discipline = searchParams.get('discipline') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await historicalOutcomeService.searchHistoricalOutcomes({
      projectId,
      discipline,
      search,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch project history' },
      { status: 500 }
    );
  }
}
