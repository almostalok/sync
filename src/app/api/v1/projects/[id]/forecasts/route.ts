import { NextResponse } from 'next/server';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';
import { forecastingCoordinator } from '@/../apps/api/src/modules/forecasting';
import { validateForecastFilter } from '@sitesync/validation';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url);
    const filterInput = {
      discipline: url.searchParams.get('discipline') || undefined,
      riskBand: (url.searchParams.get('riskBand') as any) || undefined,
      isCritical: url.searchParams.get('isCritical') === 'true' ? true : undefined,
      asOfDate: url.searchParams.get('asOfDate') || '2026-09-16',
    };

    const validation = validateForecastFilter(filterInput);
    const filter = validation.data;

    const data = generateSyntheticProject();
    const result = forecastingCoordinator.generateProjectForecasts({
      project: data.project,
      activities: data.activities,
      dependencies: data.dependencies,
      progressUpdates: [],
      asOfDate: filter.asOfDate || '2026-09-16',
    });

    let filtered = result.activityForecasts;
    if (filter.discipline) {
      filtered = filtered.filter((f) => f.discipline === filter.discipline);
    }
    if (filter.riskBand) {
      filtered = filtered.filter((f) => f.riskBand === filter.riskBand);
    }
    if (filter.isCritical) {
      filtered = filtered.filter((f) => {
        const act = data.activities.find((a) => a.id === f.activityId);
        return act?.criticalPath || (act?.totalFloat !== undefined && act.totalFloat <= 0);
      });
    }

    return NextResponse.json({
      success: true,
      projectId: params.id,
      asOfDate: filter.asOfDate || '2026-09-16',
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
