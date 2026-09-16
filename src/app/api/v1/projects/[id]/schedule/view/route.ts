import { NextResponse } from 'next/server';
import { ScheduleViewService } from '@/../apps/api/src/modules/dashboard/schedule-view.service';
import { GanttZoomLevel } from '@sitesync/types';

const scheduleViewService = new ScheduleViewService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id || 'PROJ-OIL-2026-01';
    const { searchParams } = new URL(req.url);

    const discipline = searchParams.get('discipline') || undefined;
    const wbsNodeId = searchParams.get('wbsNodeId') || undefined;
    const status = searchParams.get('status') || undefined;
    const isCritical = searchParams.get('isCritical') ? searchParams.get('isCritical') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;
    const zoomLevel = (searchParams.get('zoomLevel') as GanttZoomLevel) || GanttZoomLevel.MONTH;

    const data = await scheduleViewService.getScheduleView(projectId, {
      discipline,
      wbsNodeId,
      status,
      isCritical,
      search,
      zoomLevel,
    });

    return NextResponse.json({
      success: true,
      projectId,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch schedule view' },
      { status: 500 }
    );
  }
}
