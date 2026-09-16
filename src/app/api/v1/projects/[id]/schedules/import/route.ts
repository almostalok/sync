import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@sitesync/api/modules/schedules/schedule.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();

    const { content, format = 'CSV', isBaseline, versionName, description } = body;
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
    const result = await scheduleService.importSchedule(projectId, content, format, {
      isBaseline,
      versionName,
      description,
    });

    return NextResponse.json(
      {
        data: result,
        meta: {
          projectId,
          importedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to import schedule';
    return NextResponse.json(
      {
        error: {
          code: 'SCHEDULE_IMPORT_ERROR',
          message: msg,
        },
      },
      { status: 400 }
    );
  }
}
