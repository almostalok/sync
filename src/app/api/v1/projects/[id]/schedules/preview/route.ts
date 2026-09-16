import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@sitesync/api/modules/schedules/schedule.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();

    const { content, format = 'CSV' } = body;
    if (!content) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_CONTENT',
            message: "Missing 'content' field in request body",
          },
        },
        { status: 400 }
      );
    }

    const scheduleService = new ScheduleService();
    const preview = await scheduleService.previewSchedule(projectId, content, format);

    return NextResponse.json({
      data: preview,
      meta: {
        projectId,
        previewTimestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to preview schedule';
    return NextResponse.json(
      {
        error: {
          code: 'SCHEDULE_PREVIEW_ERROR',
          message: msg,
        },
      },
      { status: 400 }
    );
  }
}
