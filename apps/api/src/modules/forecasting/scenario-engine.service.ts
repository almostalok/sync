/**
 * SiteSync — Master Prompt 10: Read-Only Scenario Simulation Engine
 * Simulates hypothetical "what-if" delays across dependency chains without mutating
 * authoritative project state, baselines, verified progress, or audit records.
 */

import { Activity, Dependency, Project } from '@/types/domain';
import {
  Forecast,
  ForecastScenario,
  MilestoneForecast,
  ProjectCompletionForecast,
  ScenarioAffectedActivity,
  ScenarioAssumption,
  ScenarioMilestoneDelta,
} from '@sitesync/types';

export class ScenarioEngineService {
  /**
   * Helper to format Date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    if (isNaN(date.getTime())) return '2026-12-31';
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper to add days to a YYYY-MM-DD string
   */
  private addDays(dateStr: string, days: number): string {
    if (!dateStr || isNaN(days) || !isFinite(days)) {
      return dateStr || '2026-12-31';
    }
    const cleanDate = dateStr.slice(0, 10);
    const d = new Date(`${cleanDate}T00:00:00Z`);
    if (isNaN(d.getTime())) return '2026-12-31';
    const safeDays = Math.min(1825, Math.max(-1825, Math.round(days)));
    d.setDate(d.getDate() + safeDays);
    return this.formatDate(d);
  }

  /**
   * Run what-if scenario simulation across dependency chains (Strictly Read-Only)
   */
  simulateScenario(params: {
    project: Project;
    activities: Activity[];
    dependencies: Dependency[];
    baseForecasts: Map<string, Forecast>;
    baseMilestones: MilestoneForecast[];
    baseProjectCompletion: ProjectCompletionForecast;
    assumptions: ScenarioAssumption[];
    title?: string;
  }): ForecastScenario {
    const {
      project,
      activities,
      dependencies,
      baseForecasts,
      baseMilestones,
      baseProjectCompletion,
      assumptions,
      title = 'What-If Delay Simulation',
    } = params;

    const activityMap = new Map<string, Activity>();
    activities.forEach((a) => activityMap.set(a.id, a));

    // Map tracking simulated delay days added to each activity
    const simulatedDelayDays = new Map<string, number>();

    // 1. Initialize assumptions
    assumptions.forEach((assump) => {
      simulatedDelayDays.set(assump.activityId, assump.delayDays);
    });

    // 2. Propagate delay through topological downstream dependency graph
    // Queue of activities whose delays need propagation to successors
    const queue = assumptions.map((a) => a.activityId);
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentDelay = simulatedDelayDays.get(currentId) || 0;
      if (currentDelay <= 0) continue;

      const outgoing = dependencies.filter((d) => d.predecessorId === currentId);

      for (const dep of outgoing) {
        const succId = dep.successorId;
        const succAct = activityMap.get(succId);
        if (!succAct) continue;

        const succFloat = succAct.totalFloat !== undefined ? succAct.totalFloat : 0;
        // Float absorbs part or all of the delay
        const propagatedDelay = Math.max(0, currentDelay - succFloat);

        const existingSuccDelay = simulatedDelayDays.get(succId) || 0;
        if (propagatedDelay > existingSuccDelay) {
          simulatedDelayDays.set(succId, propagatedDelay);
          if (!visited.has(succId)) {
            visited.add(succId);
            queue.push(succId);
          }
        }
      }
    }

    // 3. Build list of affected activities
    const affectedActivities: ScenarioAffectedActivity[] = [];

    simulatedDelayDays.forEach((delayDays, actId) => {
      const act = activityMap.get(actId);
      if (!act || delayDays <= 0) return;

      const baseFcst = baseForecasts.get(actId);
      const originalFinish = baseFcst ? baseFcst.predictionDate : act.plannedFinish;
      const scenarioFinish = this.addDays(originalFinish, delayDays);

      const float = act.totalFloat !== undefined ? act.totalFloat : 0;
      const absorbed = Math.min(float, delayDays);

      affectedActivities.push({
        activityId: act.id,
        activityCode: act.activityCode,
        activityName: act.name,
        originalForecastFinish: originalFinish,
        scenarioForecastFinish: scenarioFinish,
        additionalDelayDays: delayDays,
        absorbedByFloatDays: absorbed,
        isCritical: act.criticalPath || float === 0,
      });
    });

    // 4. Calculate milestone deltas
    const affectedMilestones: ScenarioMilestoneDelta[] = [];
    let maxProjectFinishTime = new Date(`${baseProjectCompletion.forecastFinish}T00:00:00Z`).getTime();

    baseMilestones.forEach((m) => {
      // Find maximum delay among predecessors of this milestone
      let maxPredDelay = 0;
      simulatedDelayDays.forEach((del, actId) => {
        // If this activity affects the milestone
        if (m.drivingPredecessorActivityId === actId || m.milestoneId === actId) {
          if (del > maxPredDelay) maxPredDelay = del;
        }
      });

      // If driving predecessor or milestone itself slipped
      if (maxPredDelay > 0) {
        const originalFinish = m.forecastFinish;
        const scenarioFinish = this.addDays(originalFinish, maxPredDelay);

        affectedMilestones.push({
          milestoneId: m.milestoneId,
          milestoneName: m.milestoneName,
          originalForecastFinish: originalFinish,
          scenarioForecastFinish: scenarioFinish,
          slipDays: maxPredDelay,
        });

        const mScenarioTime = new Date(`${scenarioFinish}T00:00:00Z`).getTime();
        if (mScenarioTime > maxProjectFinishTime) {
          maxProjectFinishTime = mScenarioTime;
        }
      }
    });

    // 5. Calculate net project completion delta
    const baseProjectFinishTime = new Date(`${baseProjectCompletion.forecastFinish}T00:00:00Z`).getTime();
    const projectFinishDeltaDays = Math.max(
      0,
      Math.round((maxProjectFinishTime - baseProjectFinishTime) / (1000 * 60 * 60 * 24))
    );
    const projectScenarioFinish = this.addDays(
      baseProjectCompletion.forecastFinish,
      projectFinishDeltaDays
    );

    // 6. Generate human-readable operational explanation
    const primaryAssumption = assumptions[0];
    const primaryAct = activityMap.get(primaryAssumption?.activityId || '');
    const summaryExplanation = `Hypothetical ${primaryAssumption?.delayDays || 0}-day delay on ${primaryAct?.activityCode || 'activity'}: cascades to ${affectedActivities.length} downstream activities. ${affectedMilestones.length} milestone(s) impacted. Net project completion potential slip: ${projectFinishDeltaDays} day(s).`;

    return {
      scenarioId: `SCN-${Date.now().toString().slice(-6)}`,
      projectId: project.id,
      title,
      simulatedAt: new Date().toISOString(),
      baseStateVersion: 1,
      assumptions,
      affectedActivities,
      affectedMilestones,
      projectFinishDeltaDays,
      projectOriginalForecastFinish: baseProjectCompletion.forecastFinish,
      projectScenarioForecastFinish: projectScenarioFinish,
      isPurelyHypothetical: true,
      summaryExplanation,
    };
  }
}
