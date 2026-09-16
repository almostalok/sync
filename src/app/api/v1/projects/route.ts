import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export async function GET() {
  const data = generateSyntheticProject();
  return NextResponse.json({
    success: true,
    data: [data.project],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: {
        id: `PROJ-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
