import { ScheduleVarianceDTO } from '@sitesync/types';

export class ScheduleVarianceService {
  /**
   * Calculates deterministic schedule variance components for an activity.
   */
  public calculateVariance(params: {
    activityId: string;
    activityCode: string;
    plannedStart: string | Date;
    plannedFinish: string | Date;
    actualStart?: string | Date | null;
    actualFinish?: string | Date | null;
    plannedDuration: number;
    actualDuration?: number | null;
    plannedProgress: number;
    actualProgress: number;
    status: string;
  }): ScheduleVarianceDTO {
    const pStart = new Date(params.plannedStart).getTime();
    const pFinish = new Date(params.plannedFinish).getTime();
    const aStart = params.actualStart ? new Date(params.actualStart).getTime() : null;
    const aFinish = params.actualFinish ? new Date(params.actualFinish).getTime() : null;

    const msPerDay = 1000 * 60 * 60 * 24;

    // 1. Start Variance (days)
    let startVarianceDays = 0;
    if (aStart) {
      startVarianceDays = Math.round((aStart - pStart) / msPerDay);
    }

    // 2. End Variance (days)
    let endVarianceDays = 0;
    if (aFinish) {
      endVarianceDays = Math.round((aFinish - pFinish) / msPerDay);
    } else if (aStart && params.status === 'IN_PROGRESS') {
      // Projected end variance if in progress
      startVarianceDays = Math.round((aStart - pStart) / msPerDay);
    }

    // 3. Duration Variance (days)
    let durationVarianceDays = 0;
    if (params.actualDuration !== undefined && params.actualDuration !== null) {
      durationVarianceDays = params.actualDuration - params.plannedDuration;
    } else if (aStart && aFinish) {
      const computedDuration = Math.max(1, Math.round((aFinish - aStart) / msPerDay));
      durationVarianceDays = computedDuration - params.plannedDuration;
    }

    // 4. Progress Variance
    const progressVariance = Math.round((params.actualProgress - params.plannedProgress) * 1000) / 1000;

    // Delayed flag
    const isDelayed = startVarianceDays > 2 || endVarianceDays > 2 || progressVariance < -0.10;

    return {
      activityId: params.activityId,
      activityCode: params.activityCode,
      plannedStart: new Date(params.plannedStart).toISOString(),
      plannedFinish: new Date(params.plannedFinish).toISOString(),
      actualStart: params.actualStart ? new Date(params.actualStart).toISOString() : null,
      actualFinish: params.actualFinish ? new Date(params.actualFinish).toISOString() : null,
      plannedDuration: params.plannedDuration,
      actualDuration: params.actualDuration ?? null,
      startVarianceDays,
      endVarianceDays,
      durationVarianceDays,
      progressVariance,
      status: params.status,
      isDelayed,
    };
  }
}
