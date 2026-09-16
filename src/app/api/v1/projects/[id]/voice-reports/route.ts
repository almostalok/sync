import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { validateVoiceIngestion } from '@sitesync/validation';
import { voiceReportService } from '@/../apps/api/src/modules/voice';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validation = validateVoiceIngestion({
      ...body,
      projectId: params.id,
    });

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const data = generateSyntheticProject();
    const result = await voiceReportService.ingestVoiceReport(validation.data, {
      activities: data.activities,
      dependencies: data.dependencies,
    });

    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reports = await voiceReportService.getReportsByProject(params.id);
    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: reports,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
