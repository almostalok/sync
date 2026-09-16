import { NextResponse } from 'next/server';
import { historicalOutcomeService } from '../../../../../../apps/api/src/modules/history';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const outcome = await historicalOutcomeService.getOutcomeById(params.id);
    if (!outcome) {
      return NextResponse.json(
        { success: false, error: 'Historical outcome not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: outcome });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch historical outcome' },
      { status: 500 }
    );
  }
}
