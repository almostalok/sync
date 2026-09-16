import { NextResponse } from 'next/server';
import { projectClosureService } from '../../../../../../apps/api/src/modules/history';

export async function GET() {
  try {
    const comparisons = await projectClosureService.getProjectComparisons();
    return NextResponse.json({ success: true, data: comparisons });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch project comparisons' },
      { status: 500 }
    );
  }
}
