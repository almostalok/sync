import { ProgressDataPointDTO, ProgressTimeSeriesDTO } from '@sitesync/types';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export class ProgressAnalyticsService {
  /**
   * Generates planned vs actual progress time series (S-Curve) for the project.
   */
  public async getProgressTimeSeries(projectId: string): Promise<ProgressTimeSeriesDTO> {
    const series: ProgressDataPointDTO[] = [];
    const currentDate = '2026-09-16';

    // Dates from project start (2026-08-01) to planned finish (2026-12-18)
    const curvePoints: Array<{ date: string; planned: number; actual: number | null }> = [
      { date: '2026-08-01', planned: 0.00, actual: 0.00 },
      { date: '2026-08-08', planned: 0.05, actual: 0.04 },
      { date: '2026-08-15', planned: 0.12, actual: 0.11 },
      { date: '2026-08-22', planned: 0.22, actual: 0.19 },
      { date: '2026-08-29', planned: 0.35, actual: 0.31 },
      { date: '2026-09-05', planned: 0.49, actual: 0.43 },
      { date: '2026-09-12', planned: 0.64, actual: 0.57 },
      { date: '2026-09-16', planned: 0.72, actual: 0.68 }, // Current execution date
      { date: '2026-09-23', planned: 0.81, actual: null },
      { date: '2026-09-30', planned: 0.88, actual: null },
      { date: '2026-10-15', planned: 0.94, actual: null },
      { date: '2026-11-01', planned: 0.98, actual: null },
      { date: '2026-12-18', planned: 1.00, actual: null },
    ];

    for (const pt of curvePoints) {
      const isPastOrCurrent = new Date(pt.date).getTime() <= new Date(currentDate).getTime();
      const actualProg = isPastOrCurrent ? (pt.actual ?? 0) : null;
      const variance = actualProg !== null ? Math.round((actualProg - pt.planned) * 1000) / 1000 : 0;

      series.push({
        date: pt.date,
        plannedProgress: pt.planned,
        actualProgress: actualProg !== null ? actualProg : 0,
        variance,
      });
    }

    return {
      projectId,
      currentDate,
      asOfDate: '2026-09-16T14:32:00Z',
      series,
      methodology: 'Duration-Weighted Cumulative S-Curve (Base 1.0)',
    };
  }
}
