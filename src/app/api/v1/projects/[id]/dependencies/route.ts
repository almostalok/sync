import { NextResponse } from 'next/server';
import { DependencyService } from '@sitesync/api/modules/dependencies/dependency.service';

const depService = new DependencyService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const dependencies = await depService.getDependenciesByProject(params.id);
  return NextResponse.json({
    success: true,
    projectId: params.id,
    data: dependencies,
    total: dependencies.length,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const result = await depService.createDependency({ ...body, projectId: params.id });
    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
