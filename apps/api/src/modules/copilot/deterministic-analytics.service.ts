import { CopilotCalculation } from '@sitesync/types';
import { Activity, Dependency, ExtractedEvent, FieldReport, RiskSignal } from '@/types/domain';

export class DeterministicAnalyticsService {
  /**
   * Compute overall project schedule variance and progress metrics.
   */
  computeScheduleCalculations(
    project: { plannedProgress: number; actualProgress: number },
    activities: Activity[]
  ): CopilotCalculation[] {
    const calcs: CopilotCalculation[] = [];

    // 1. Overall Progress Deficit / Surplus
    const progressDiff = Number((project.actualProgress - project.plannedProgress).toFixed(1));
    calcs.push({
      name: 'Progress Variance',
      value: progressDiff,
      unit: '%',
      formula: 'actualProgress - plannedProgress',
      description:
        progressDiff < 0
          ? `${Math.abs(progressDiff)}% progress lag against planned baseline`
          : `${progressDiff}% ahead of baseline`,
    });

    // 2. Schedule Variance Days
    const delayedActs = activities.filter((a) => a.varianceDays > 0);
    const maxVariance = delayedActs.length > 0 ? Math.max(...delayedActs.map((a) => a.varianceDays)) : 0;
    calcs.push({
      name: 'Maximum Activity Delay',
      value: maxVariance,
      unit: 'days',
      formula: 'max(activity.varianceDays)',
      sourceActivityIds: delayedActs.slice(0, 5).map((a) => a.id),
      description: `Largest activity slippage currently active in schedule graph`,
    });

    // 3. Delayed Activity Count
    calcs.push({
      name: 'Delayed Activities Count',
      value: delayedActs.length,
      unit: 'activities',
      formula: 'count(activities where varianceDays > 0)',
      sourceActivityIds: delayedActs.slice(0, 10).map((a) => a.id),
      description: `${delayedActs.length} of ${activities.length} activities are behind planned dates`,
    });

    // 4. Critical Delayed Activities Count
    const criticalDelayed = delayedActs.filter((a) => a.criticalPath || (a as any).isCritical);
    calcs.push({
      name: 'Critical Path Delayed Activities',
      value: criticalDelayed.length,
      unit: 'activities',
      formula: 'count(activities where criticalPath == true && varianceDays > 0)',
      sourceActivityIds: criticalDelayed.map((a) => a.id),
      description: `Critical path activities with positive schedule variance risking project completion`,
    });

    return calcs;
  }

  /**
   * Compute discipline-level progress breakdowns.
   */
  computeDisciplineAnalytics(activities: Activity[]): {
    disciplines: { discipline: string; planned: number; actual: number; lag: number; count: number }[];
    slowestDiscipline: string;
    calculations: CopilotCalculation[];
  } {
    const map = new Map<string, { plannedSum: number; actualSum: number; count: number }>();

    for (const a of activities) {
      const disc = a.discipline || 'GENERAL';
      const cur = map.get(disc) || { plannedSum: 0, actualSum: 0, count: 0 };
      cur.plannedSum += a.plannedProgress;
      cur.actualSum += a.actualProgress;
      cur.count += 1;
      map.set(disc, cur);
    }

    const disciplines = Array.from(map.entries()).map(([disc, stats]) => {
      const planned = Number((stats.plannedSum / stats.count).toFixed(1));
      const actual = Number((stats.actualSum / stats.count).toFixed(1));
      const lag = Number((planned - actual).toFixed(1));
      return { discipline: disc, planned, actual, lag, count: stats.count };
    });

    // Sort by largest lag
    disciplines.sort((a, b) => b.lag - a.lag);
    const slowestDiscipline = disciplines.length > 0 ? disciplines[0].discipline : 'None';

    const calculations: CopilotCalculation[] = disciplines.slice(0, 3).map((d) => ({
      name: `${d.discipline} Progress Lag`,
      value: d.lag,
      unit: '%',
      formula: 'plannedProgress - actualProgress',
      description: `Average lag across ${d.count} ${d.discipline} activities`,
    }));

    return { disciplines, slowestDiscipline, calculations };
  }

  /**
   * Compute Day-Over-Day Change Analysis (Section 23).
   * Identifies new actual starts, finishes, progress deltas, new risks, and review delta.
   */
  computeChangeAnalysis(params: {
    activities: Activity[];
    reports: FieldReport[];
    events: ExtractedEvent[];
    risks: RiskSignal[];
    targetDate?: string;
  }): {
    targetDate: string;
    progressUpdatedCount: number;
    completedTodayCount: number;
    startedTodayCount: number;
    newlyDelayedCount: number;
    newRisksCount: number;
    acceptedReviewsCount: number;
    pendingReviewsCount: number;
    calculations: CopilotCalculation[];
    summaryPoints: string[];
  } {
    const targetDate = params.targetDate || '2026-09-16';

    const eventsOnDate = params.events.filter((e) => e.eventDate === targetDate);
    const reportsOnDate = params.reports.filter((r) => r.reportDate === targetDate);

    const progressUpdatedCount = eventsOnDate.length;
    const completedTodayCount = eventsOnDate.filter(
      (e) => e.status === 'COMPLETED' || (e.progress !== undefined && e.progress >= 100)
    ).length;
    const startedTodayCount = eventsOnDate.filter(
      (e) => e.status === 'IN_PROGRESS' && e.progress !== undefined && e.progress < 50
    ).length;

    const newlyDelayedCount = params.activities.filter((a) => a.varianceDays > 0).length;
    const newRisksCount = params.risks.filter((r) => r.severity === 'HIGH').length;
    const acceptedReviewsCount = params.events.filter((e) => e.match?.decision === 'ACCEPTED' || e.match?.decision === 'AUTO_LINKED').length;
    const pendingReviewsCount = params.events.filter((e) => e.match?.decision === 'PENDING_REVIEW').length;

    const calculations: CopilotCalculation[] = [
      {
        name: `Execution Events on ${targetDate}`,
        value: progressUpdatedCount,
        unit: 'events',
        formula: `count(events where date == '${targetDate}')`,
        description: `Field updates recorded on shift`,
      },
      {
        name: 'Completed Activities Today',
        value: completedTodayCount,
        unit: 'activities',
        formula: 'count(events completed today)',
        description: `Sub-milestones marked completed on ${targetDate}`,
      },
      {
        name: 'Active Delay Signals',
        value: newlyDelayedCount,
        unit: 'activities',
        formula: 'count(activities where varianceDays > 0)',
      },
    ];

    const summaryPoints = [
      `**Progress**: ${progressUpdatedCount} execution events recorded across ${reportsOnDate.length} daily field report(s).`,
      `**Milestones**: ${completedTodayCount} sub-milestone completed, ${startedTodayCount} activity initiated.`,
      `**Schedule**: ${newlyDelayedCount} activities currently flagged with positive schedule variance.`,
      `**Risks**: ${newRisksCount} high-severity risk signals requiring active mitigation.`,
      `**Verification Queue**: ${acceptedReviewsCount} matches verified; ${pendingReviewsCount} items awaiting planner confirmation.`,
    ];

    return {
      targetDate,
      progressUpdatedCount,
      completedTodayCount,
      startedTodayCount,
      newlyDelayedCount,
      newRisksCount,
      acceptedReviewsCount,
      pendingReviewsCount,
      calculations,
      summaryPoints,
    };
  }

  /**
   * Compute downstream dependency impact.
   */
  computeDownstreamImpact(
    activityId: string,
    activities: Activity[],
    dependencies: Dependency[]
  ): {
    directSuccessors: Activity[];
    cascadeActivities: Activity[];
    criticalSuccessors: Activity[];
    maxCascadeLag: number;
    calculations: CopilotCalculation[];
  } {
    const directDeps = dependencies.filter((d) => d.predecessorId === activityId);
    const directIds = new Set(directDeps.map((d) => d.successorId));
    const directSuccessors = activities.filter((a) => directIds.has(a.id));

    // Simple BFS cascade
    const visited = new Set<string>();
    const queue = [...directIds];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      const nextDeps = dependencies.filter((d) => d.predecessorId === cur);
      for (const nd of nextDeps) {
        if (!visited.has(nd.successorId)) {
          queue.push(nd.successorId);
        }
      }
    }

    const cascadeActivities = activities.filter((a) => visited.has(a.id));
    const criticalSuccessors = cascadeActivities.filter((a) => a.criticalPath || (a as any).isCritical);

    const calculations: CopilotCalculation[] = [
      {
        name: 'Direct Successors Count',
        value: directSuccessors.length,
        unit: 'activities',
        formula: `count(dependencies where predecessorId == '${activityId}')`,
        sourceActivityIds: directSuccessors.map((a) => a.id),
      },
      {
        name: 'Total Downstream Cascade',
        value: cascadeActivities.length,
        unit: 'activities',
        formula: 'transitive_closure(dependencies, activityId)',
        sourceActivityIds: cascadeActivities.map((a) => a.id),
      },
    ];

    return {
      directSuccessors,
      cascadeActivities,
      criticalSuccessors,
      maxCascadeLag: directDeps.reduce((max, d) => Math.max(max, d.lag || 0), 0),
      calculations,
    };
  }
}
