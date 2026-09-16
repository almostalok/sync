import { NextResponse } from 'next/server';
import { ScheduleViewService } from '@/../apps/api/src/modules/dashboard/schedule-view.service';
import { historicalSimilarityService } from '@/../apps/api/src/modules/history';
import { Discipline } from '@sitesync/types';

const scheduleViewService = new ScheduleViewService();

export async function GET(
  req: Request,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const activityId = params.activityId;

    const detail = await scheduleViewService.getActivityDetail(projectId, activityId);

    const activityContext = detail
      ? {
          id: detail.id,
          code: detail.activityCode,
          name: detail.name,
          discipline: detail.discipline,
          location: detail.location,
          plannedDuration: detail.plannedDuration || 7,
          plannedQuantity: undefined,
        }
      : {
          id: activityId,
          code: activityId,
          name: 'Compressor Foundation Excavation',
          discipline: Discipline.CIVIL,
          location: 'Terminal Yard East',
          plannedDuration: 7,
          plannedQuantity: 850,
        };

    const comparison = await historicalSimilarityService.findComparableActivities(activityContext);

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch historical comparisons' },
      { status: 500 }
    );
  }
}
