/**
 * SiteSync — Master Prompt 10: Feature Engineering Layer
 * Strict As-Of-Date (T) temporal cutoff to guarantee ZERO future data leakage.
 * Computes multi-signal schedule, velocity, dependency, quality, and historical features.
 */

import { Activity, Dependency, ProgressUpdate } from '@/types/domain';
import { ActivityFeatures } from '@sitesync/types';
import { HistoricalRecord } from './forecasting.types';

export class FeatureExtractorService {
  /**
   * Extract features for an activity strictly as of `asOfDate` T.
   * Any data dated after `asOfDate` is completely filtered out to prevent lookahead leakage.
   */
  extractFeatures(params: {
    activity: Activity;
    asOfDate: string; // YYYY-MM-DD
    dependencies: Dependency[];
    progressUpdates: ProgressUpdate[];
    historicalRecords?: HistoricalRecord[];
    activitiesMap?: Map<string, Activity>;
  }): ActivityFeatures {
    const {
      activity,
      asOfDate,
      dependencies,
      progressUpdates,
      historicalRecords = [],
      activitiesMap = new Map(),
    } = params;

    const asOfTime = new Date(`${asOfDate}T23:59:59Z`).getTime();
    const plannedStartTime = new Date(`${activity.plannedStart}T00:00:00Z`).getTime();
    const plannedFinishTime = new Date(`${activity.plannedFinish}T00:00:00Z`).getTime();

    // 1. Schedule Temporal Features
    const plannedDurationDays = Math.max(
      1,
      Math.round((plannedFinishTime - plannedStartTime) / (1000 * 60 * 60 * 24))
    );

    const elapsedDays = Math.max(
      0,
      Math.round((asOfTime - plannedStartTime) / (1000 * 60 * 60 * 24))
    );

    const remainingPlannedDays = Math.max(
      0,
      Math.round((plannedFinishTime - asOfTime) / (1000 * 60 * 60 * 24))
    );

    // 2. Filter Progress Updates strictly <= asOfDate (Zero Leakage Invariant)
    const validUpdates = progressUpdates
      .filter((u) => {
        if (u.activityId !== activity.id) return false;
        const updateTime = new Date(`${u.effectiveDate}T23:59:59Z`).getTime();
        return updateTime <= asOfTime;
      })
      .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

    // Current verified progress as of T
    let currentProgressPct = 0;
    if (validUpdates.length > 0) {
      currentProgressPct = validUpdates[validUpdates.length - 1].progress;
    } else if (activity.actualProgress !== undefined && asOfTime >= new Date(activity.updatedAt || asOfDate).getTime()) {
      currentProgressPct = activity.actualProgress;
    }

    // Planned progress at asOfDate assuming linear baseline progression
    let plannedProgressPct = 0;
    if (asOfTime <= plannedStartTime) {
      plannedProgressPct = 0;
    } else if (asOfTime >= plannedFinishTime) {
      plannedProgressPct = 100;
    } else {
      plannedProgressPct = Math.min(100, Math.round((elapsedDays / plannedDurationDays) * 100));
    }

    const progressLagPct = Math.max(-100, Math.min(100, plannedProgressPct - currentProgressPct));

    // 3. Velocity Calculations
    // Overall velocity: % progress per day since planned start
    const effectiveElapsedDays = Math.max(1, elapsedDays);
    const overallVelocityPctPerDay = Number((currentProgressPct / effectiveElapsedDays).toFixed(2));

    // Recent velocity over last 14 days before asOfDate
    let recentVelocityPctPerDay = overallVelocityPctPerDay;
    const fourteenDaysAgoTime = asOfTime - 14 * 24 * 60 * 60 * 1000;
    const recentUpdates = validUpdates.filter(
      (u) => new Date(`${u.effectiveDate}T00:00:00Z`).getTime() >= fourteenDaysAgoTime
    );

    if (recentUpdates.length >= 2) {
      const oldestRecent = recentUpdates[0];
      const newestRecent = recentUpdates[recentUpdates.length - 1];
      const daysDiff = Math.max(
        1,
        Math.round(
          (new Date(newestRecent.effectiveDate).getTime() - new Date(oldestRecent.effectiveDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      recentVelocityPctPerDay = Number(
        (Math.max(0, newestRecent.progress - oldestRecent.progress) / daysDiff).toFixed(2)
      );
    } else if (recentUpdates.length === 1 && validUpdates.length > 1) {
      const prior = validUpdates[validUpdates.length - 2];
      const latest = recentUpdates[0];
      const daysDiff = Math.max(
        1,
        Math.round(
          (new Date(latest.effectiveDate).getTime() - new Date(prior.effectiveDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      recentVelocityPctPerDay = Number(
        (Math.max(0, latest.progress - prior.progress) / daysDiff).toFixed(2)
      );
    }

    // Velocity Trend
    let velocityTrend: 'ACCELERATING' | 'STEADY' | 'DECELERATING' = 'STEADY';
    if (recentVelocityPctPerDay > overallVelocityPctPerDay * 1.15) {
      velocityTrend = 'ACCELERATING';
    } else if (recentVelocityPctPerDay < overallVelocityPctPerDay * 0.85) {
      velocityTrend = 'DECELERATING';
    }

    // Schedule variance in days (derived from lag and planned rate)
    const plannedDailyRate = 100 / plannedDurationDays;
    const scheduleVarianceDays = Math.round(progressLagPct / Math.max(0.1, plannedDailyRate));

    // 4. Dependencies Analysis
    const incomingDeps = dependencies.filter((d) => d.successorId === activity.id);
    const outgoingDeps = dependencies.filter((d) => d.predecessorId === activity.id);

    const predecessorCount = incomingDeps.length;
    const successorCount = outgoingDeps.length;

    let criticalSuccessorCount = 0;
    outgoingDeps.forEach((dep) => {
      const succ = activitiesMap.get(dep.successorId);
      if (succ && (succ.criticalPath || succ.totalFloat === 0)) {
        criticalSuccessorCount++;
      }
    });

    const floatDays = activity.totalFloat !== undefined ? activity.totalFloat : 0;
    const isCritical = activity.criticalPath || floatDays <= 0 || criticalSuccessorCount > 0;

    // 5. Data Freshness & Quality
    let daysSinceLastUpdate = 0;
    if (validUpdates.length > 0) {
      const lastUpdateTime = new Date(validUpdates[validUpdates.length - 1].effectiveDate).getTime();
      daysSinceLastUpdate = Math.max(0, Math.round((asOfTime - lastUpdateTime) / (1000 * 60 * 60 * 24)));
    } else {
      daysSinceLastUpdate = Math.max(0, elapsedDays);
    }
    const isStale = daysSinceLastUpdate >= 7;

    // 6. Historical Comparable Metrics strictly from projects closed <= asOfDate
    const validHistorical = historicalRecords.filter((h) => {
      const closedTime = new Date(h.closedAt || h.completedAt || '2026-01-01').getTime();
      return closedTime <= asOfTime && h.discipline === activity.discipline;
    });

    const historicalComparableCount = validHistorical.length;
    let historicalMedianDurationDays = plannedDurationDays;
    let historicalDelayRate = 0.25;

    if (validHistorical.length > 0) {
      const durations = validHistorical.map((h) => h.actualDurationDays || plannedDurationDays).sort((a, b) => a - b);
      const mid = Math.floor(durations.length / 2);
      historicalMedianDurationDays =
        durations.length % 2 !== 0 ? durations[mid] : Math.round((durations[mid - 1] + durations[mid]) / 2);

      const delayedCount = validHistorical.filter((h) => (h.scheduleVarianceDays || 0) > 0).length;
      historicalDelayRate = Number((delayedCount / validHistorical.length).toFixed(2));
    }

    return {
      asOfDate,
      activityId: activity.id,
      activityCode: activity.activityCode,
      discipline: activity.discipline,
      plannedDurationDays,
      elapsedDays,
      remainingPlannedDays,
      floatDays,
      isCritical,
      scheduleVarianceDays,
      currentProgressPct,
      plannedProgressPct,
      progressLagPct,
      overallVelocityPctPerDay,
      recentVelocityPctPerDay,
      velocityTrend,
      predecessorCount,
      successorCount,
      criticalSuccessorCount,
      daysSinceLastUpdate,
      isStale,
      verifiedObservationsCount: validUpdates.length,
      historicalComparableCount,
      historicalMedianDurationDays,
      historicalDelayRate,
    };
  }
}
