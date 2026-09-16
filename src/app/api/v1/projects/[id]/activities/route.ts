import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const discipline = searchParams.get('discipline');
  const status = searchParams.get('status');

  const data = generateSyntheticProject();
  let activities = data.activities;

  if (discipline && discipline !== 'ALL') {
    activities = activities.filter(a => a.discipline === discipline);
  }
  if (status) {
    activities = activities.filter(a => a.status === status);
  }

  return NextResponse.json({
    success: true,
    projectId: params.id,
    data: activities,
    total: activities.length,
  });
}
