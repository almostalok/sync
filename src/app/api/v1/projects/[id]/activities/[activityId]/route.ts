import { NextResponse } from 'next/server';
import { ScheduleViewService } from '@/../apps/api/src/modules/dashboard/schedule-view.service';

const scheduleViewService = new ScheduleViewService();

export async function GET(
  req: Request,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const detail = await scheduleViewService.getActivityDetail(projectId, params.activityId);

    if (!detail) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projectId,
      data: detail,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch activity detail' },
      { status: 500 }
    );
  }
}
