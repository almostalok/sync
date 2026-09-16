import { Activity, Dependency, RiskSignal } from '@/types/domain';

export interface ScheduleMetrics {
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  delayedActivities: number;
  overallPlannedProgress: number;
  overallActualProgress: number;
  overallScheduleVarianceDays: number;
  criticalPathCount: number;
  staleCount: number;
  highRiskCount: number;
}

export interface DownstreamImpact {
  sourceActivityId: string;
  sourceActivityName: string;
  sourceDelayDays: number;
  affectedActivities: {
    activityId: string;
    activityCode: string;
    name: string;
    discipline: string;
    plannedStart: string;
    newProjectedStart: string;
    delayDays: number;
  }[];
}

export function calculateScheduleMetrics(
  activities: Activity[],
  dependencies: Dependency[]
): {
  metrics: ScheduleMetrics;
  risks: RiskSignal[];
  staleActivities: Activity[];
} {
  const total = activities.length;
  if (total === 0) {
    return {
      metrics: {
        totalActivities: 0,
        completedActivities: 0,
        inProgressActivities: 0,
        delayedActivities: 0,
        overallPlannedProgress: 0,
        overallActualProgress: 0,
        overallScheduleVarianceDays: 0,
        criticalPathCount: 0,
        staleCount: 0,
        highRiskCount: 0,
      },
      risks: [],
      staleActivities: [],
    };
  }

  let completed = 0;
  let inProgress = 0;
  let delayed = 0;
  let totalPlannedProgress = 0;
  let totalActualProgress = 0;
  let totalVarianceDays = 0;
  let criticalCount = 0;

  const staleActivities: Activity[] = [];
  const risks: RiskSignal[] = [];

  const activityMap = new Map<string, Activity>();
  activities.forEach(a => activityMap.set(a.id, a));

  // Build successor index
  const successorMap = new Map<string, string[]>();
  dependencies.forEach(d => {
    if (!successorMap.has(d.predecessorId)) {
      successorMap.set(d.predecessorId, []);
    }
    successorMap.get(d.predecessorId)!.push(d.successorId);
  });

  const now = new Date('2026-09-16T00:00:00Z').getTime();

  for (const act of activities) {
    totalPlannedProgress += act.plannedProgress;
    totalActualProgress += act.actualProgress;
    totalVarianceDays += act.varianceDays;

    if (act.status === 'COMPLETED' || act.actualProgress === 100) {
      completed++;
    } else if (act.actualProgress > 0 || act.status === 'IN_PROGRESS') {
      inProgress++;
    }

    if (act.varianceDays > 0) {
      delayed++;
    }

    if (act.criticalPath) {
      criticalCount++;
    }

    // Stale check
    const pStart = new Date(act.plannedStart).getTime();
    if (pStart <= now && act.actualProgress === 0 && act.status !== 'COMPLETED') {
      act.isStale = true;
      staleActivities.push(act);
    }

    // Risk generation
    const successors = successorMap.get(act.id) || [];
    const downstreamNames = successors
      .map(sid => activityMap.get(sid)?.activityCode || sid)
      .slice(0, 5);

    if (act.varianceDays >= 4 || (act.criticalPath && act.varianceDays > 1)) {
      risks.push({
        id: `RISK-${act.id}`,
        activityId: act.id,
        activityCode: act.activityCode,
        activityName: act.name,
        discipline: act.discipline,
        severity: 'HIGH',
        category: 'SCHEDULE_SLIPPAGE',
        varianceDays: act.varianceDays,
        impactDescription: `Critical path delay of +${act.varianceDays} days. Potential cascade delay to ${successors.length} downstream milestones.`,
        downstreamAffectedActivities: downstreamNames,
      });
    } else if (act.varianceDays > 0) {
      risks.push({
        id: `RISK-${act.id}`,
        activityId: act.id,
        activityCode: act.activityCode,
        activityName: act.name,
        discipline: act.discipline,
        severity: 'MEDIUM',
        category: 'SCHEDULE_SLIPPAGE',
        varianceDays: act.varianceDays,
        impactDescription: `Activity is lagging behind baseline by ${act.varianceDays} days.`,
        downstreamAffectedActivities: downstreamNames,
      });
    } else if (act.isStale) {
      risks.push({
        id: `RISK-STALE-${act.id}`,
        activityId: act.id,
        activityCode: act.activityCode,
        activityName: act.name,
        discipline: act.discipline,
        severity: 'MEDIUM',
        category: 'STALE_UPDATE',
        varianceDays: 0,
        impactDescription: `Activity passed planned start date (${act.plannedStart}) with 0% verified progress and no recent field reports.`,
        downstreamAffectedActivities: downstreamNames,
      });
    }
  }

  // Sort risks by severity (HIGH then MEDIUM then LOW)
  risks.sort((a, b) => {
    const sevScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return sevScore[b.severity] - sevScore[a.severity] || b.varianceDays - a.varianceDays;
  });

  return {
    metrics: {
      totalActivities: total,
      completedActivities: completed,
      inProgressActivities: inProgress,
      delayedActivities: delayed,
      overallPlannedProgress: Number((totalPlannedProgress / total).toFixed(1)),
      overallActualProgress: Number((totalActualProgress / total).toFixed(1)),
      overallScheduleVarianceDays: Number((totalVarianceDays / total).toFixed(1)),
      criticalPathCount: criticalCount,
      staleCount: staleActivities.length,
      highRiskCount: risks.filter(r => r.severity === 'HIGH').length,
    },
    risks,
    staleActivities,
  };
}

export function traceDownstreamCascade(
  sourceActivityId: string,
  activities: Activity[],
  dependencies: Dependency[]
): DownstreamImpact | null {
  const actMap = new Map<string, Activity>();
  activities.forEach(a => actMap.set(a.id, a));

  const source = actMap.get(sourceActivityId);
  if (!source) return null;

  const successorMap = new Map<string, string[]>();
  dependencies.forEach(d => {
    if (!successorMap.has(d.predecessorId)) {
      successorMap.set(d.predecessorId, []);
    }
    successorMap.get(d.predecessorId)!.push(d.successorId);
  });

  const affected: DownstreamImpact['affectedActivities'] = [];
  const visited = new Set<string>();
  const queue: { id: string; accumulatedDelay: number }[] = [
    { id: sourceActivityId, accumulatedDelay: Math.max(1, source.varianceDays || 3) }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const succIds = successorMap.get(current.id) || [];

    for (const sid of succIds) {
      if (!visited.has(sid)) {
        visited.add(sid);
        const succAct = actMap.get(sid);
        if (succAct) {
          const origStart = new Date(succAct.plannedStart);
          const newStart = new Date(origStart.getTime() + current.accumulatedDelay * 24 * 60 * 60 * 1000);
          
          affected.push({
            activityId: succAct.id,
            activityCode: succAct.activityCode,
            name: succAct.name,
            discipline: succAct.discipline,
            plannedStart: succAct.plannedStart,
            newProjectedStart: newStart.toISOString().split('T')[0],
            delayDays: current.accumulatedDelay,
          });

          queue.push({ id: sid, accumulatedDelay: current.accumulatedDelay });
        }
      }
    }
  }

  return {
    sourceActivityId: source.id,
    sourceActivityName: source.name,
    sourceDelayDays: source.varianceDays || 4,
    affectedActivities: affected,
  };
}
