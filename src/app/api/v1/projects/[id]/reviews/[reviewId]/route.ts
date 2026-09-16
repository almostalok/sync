import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@sitesync/api/modules/review/review.service';
import { SEEDED_REVIEW_CASES } from '../../../../../../../../data/synthetic/review-cases';
import { ReviewItemModel } from '@sitesync/api/modules/review/review.types';

SEEDED_REVIEW_CASES.forEach((item: ReviewItemModel) => {
  ReviewService.registerReviewItem(item);
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { id: projectId, reviewId } = params;
    const reviewService = new ReviewService();
    const item = await reviewService.getReviewById(projectId, reviewId);

    if (!item) {
      return NextResponse.json(
        { success: false, error: `Review item '${reviewId}' not found in project '${projectId}'` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review: item,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 403 });
  }
}
