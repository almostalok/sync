import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@sitesync/api/modules/review/review.service';
import { SEEDED_REVIEW_CASES } from '../../../../../../../data/synthetic/review-cases';
import { Discipline, ReviewSortOption } from '@sitesync/types';
import { ReviewItemModel } from '@sitesync/api/modules/review/review.types';

// Initialize seeded review queue if not already populated
SEEDED_REVIEW_CASES.forEach((item: ReviewItemModel) => {
  ReviewService.registerReviewItem(item);
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const url = new URL(request.url);

    const discipline = url.searchParams.get('discipline') as Discipline | undefined;
    const status = url.searchParams.get('status') || undefined;
    const minConfidence = url.searchParams.get('minConfidence') ? parseFloat(url.searchParams.get('minConfidence')!) : undefined;
    const maxConfidence = url.searchParams.get('maxConfidence') ? parseFloat(url.searchParams.get('maxConfidence')!) : undefined;
    const search = url.searchParams.get('search') || undefined;
    const sort = (url.searchParams.get('sort') || 'PRIORITY_DESC') as ReviewSortOption;

    const reviewService = new ReviewService();
    const result = await reviewService.getReviewQueue(
      {
        projectId,
        discipline,
        status,
        minConfidence,
        maxConfidence,
        search,
      },
      sort as any
    );

    return NextResponse.json({
      success: true,
      projectId,
      total: result.total,
      reviews: result.items,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
