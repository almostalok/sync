import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@sitesync/api/modules/review/review.service';
import { ReviewAction, UserRole } from '@sitesync/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { id: projectId, reviewId } = params;
    const body = await request.json().catch(() => ({}));

    if (!body.activityId && !body.selectedActivityId) {
      return NextResponse.json(
        { success: false, error: 'Reassigning a match requires a valid activityId.' },
        { status: 400 }
      );
    }
    if (!body.reason) {
      return NextResponse.json(
        { success: false, error: 'Reassigning an AI match proposal requires an explicit reason.' },
        { status: 400 }
      );
    }

    const selectedActivityId = body.activityId || body.selectedActivityId;
    const reviewerId = body.reviewerId || 'usr-planner-01';
    const reviewerName = body.reviewerName || 'Lead Planner';
    const reviewerRole = (body.reviewerRole || UserRole.PLANNER) as UserRole;
    const reason = body.reason;
    const comment = body.comment;
    const requestId = request.headers.get('x-request-id') || body.requestId;

    const reviewService = new ReviewService();
    const result = await reviewService.reassignMatch({
      projectId,
      reviewId,
      action: ReviewAction.REASSIGN,
      selectedActivityId,
      reviewerId,
      reviewerName,
      reviewerRole,
      reason,
      comment,
      requestId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes('not authorized') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
