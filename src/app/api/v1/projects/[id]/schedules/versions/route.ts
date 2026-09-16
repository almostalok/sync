import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@sitesync/api/modules/schedules/schedule.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const scheduleService = new ScheduleService();
    const versions = await scheduleService.listVersions(projectId);

    return NextResponse.json({
      data: versions,
      meta: {
        projectId,
        count: versions.length,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to list schedule versions';
    return NextResponse.json(
      {
        error: {
          code: 'LIST_VERSIONS_ERROR',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
