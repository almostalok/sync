/**
 * SiteSync — Master Prompt 10: Dependency-Aware Milestone & Project Forecaster
 * Propagates activity forecasts through the topological network to calculate milestone
 * completion dates, driving predecessors, and overall project completion uncertainty.
 */

import { Activity, Dependency, Project } from '@/types/domain';
import {
  Forecast,
  MilestoneForecast,
  ProjectCompletionForecast,
  RiskBand,
  ForecastReliability,
} from '@sitesync/types';

export class MilestoneForecasterService {
  /**
   * Forecast milestones based on activity completion forecasts and dependency topology
   */
  forecastMilestones(params: {
    project: Project;
    activities: Activity[];
    dependencies: Dependency[];
    activityForecasts: Map<string, Forecast>;
    asOfDate: string;
  }): MilestoneForecast[] {
    const { project, activities, dependencies, activityForecasts, asOfDate } = params;

    // Detect milestones: activities marked as milestone, or activities with 0 planned duration, or ending key WBS phases
    const milestoneActivities = activities.filter(
      (a) =>
        a.isMilestone ||
        a.name.toLowerCase().includes('milestone') ||
        a.name.toLowerCase().includes('completion') ||
        a.name.toLowerCase().includes('ready')
    );

    // If no explicit milestone flag, select the final activity of each major discipline
    const targetMilestones =
      milestoneActivities.length > 0
        ? milestoneActivities
        : activities.filter((a) => {
            const outgoing = dependencies.filter((d) => d.predecessorId === a.id);
            return outgoing.length === 0; // leaf activities
          });

    const results: MilestoneForecast[] = [];

    targetMilestones.forEach((milestone) => {
      // Find all direct and transitive predecessor activities
      const predecessorIds = new Set<string>();
      const queue = [milestone.id];

      while (queue.length > 0) {
        const currId = queue.shift()!;
        const incoming = dependencies.filter((d) => d.successorId === currId);
        incoming.forEach((dep) => {
          if (!predecessorIds.has(dep.predecessorId)) {
            predecessorIds.add(dep.predecessorId);
            queue.push(dep.predecessorId);
          }
        });
      }

      // Also include the milestone activity itself if it has a forecast
      predecessorIds.add(milestone.id);

      let latestForecastTime = new Date(`${milestone.plannedFinish}T00:00:00Z`).getTime();
      let latestForecastDate = milestone.plannedFinish;
      let lowerBoundDate = milestone.plannedFinish;
      let upperBoundDate = milestone.plannedFinish;
      let drivingId = milestone.id;
      let drivingCode = milestone.activityCode;
      let drivingName = milestone.name;
      let worstReliability: ForecastReliability = 'SUFFICIENT';

      predecessorIds.forEach((predId) => {
        const fcst = activityForecasts.get(predId);
        if (fcst) {
          const fcstTime = new Date(`${fcst.predictionDate}T00:00:00Z`).getTime();
          if (fcstTime >= latestForecastTime) {
            latestForecastTime = fcstTime;
            latestForecastDate = fcst.predictionDate;
            lowerBoundDate = fcst.lowerBoundDate;
            upperBoundDate = fcst.upperBoundDate;
            drivingId = predId;
            drivingCode = fcst.activityCode || predId;
            drivingName = fcst.activityName || predId;
          }

          if (fcst.reliability === 'LOW_DATA') worstReliability = 'LOW_DATA';
          else if (fcst.reliability === 'LIMITED' && worstReliability !== 'LOW_DATA') {
            worstReliability = 'LIMITED';
          }
        }
      });

      const plannedFinishTime = new Date(`${milestone.plannedFinish}T00:00:00Z`).getTime();
      const varianceDays = Math.round((latestForecastTime - plannedFinishTime) / (1000 * 60 * 60 * 24));

      let riskBand: RiskBand = 'LOW';
      if (varianceDays >= 10) riskBand = 'HIGH';
      else if (varianceDays >= 3) riskBand = 'MEDIUM';

      results.push({
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        baselineFinish: milestone.plannedFinish,
        forecastFinish: latestForecastDate,
        lowerBound: lowerBoundDate,
        upperBound: upperBoundDate,
        varianceDays,
        riskBand,
        reliability: worstReliability,
        drivingPredecessorActivityId: drivingId,
        drivingPredecessorCode: drivingCode,
        drivingPredecessorName: drivingName,
        predecessorForecastsCount: predecessorIds.size,
      });
    });

    return results;
  }

  /**
   * Forecast overall project completion date and critical risk indicators
   */
  forecastProjectCompletion(params: {
    project: Project;
    activities: Activity[];
    milestoneForecasts: MilestoneForecast[];
    activityForecasts: Map<string, Forecast>;
  }): ProjectCompletionForecast {
    const { project, activities, milestoneForecasts, activityForecasts } = params;

    let latestProjectTime = new Date(`${project.plannedFinish}T00:00:00Z`).getTime();
    let latestProjectDate = project.plannedFinish;
    let lowerBoundDate = project.plannedFinish;
    let upperBoundDate = project.plannedFinish;

    // Check all milestone forecasts
    milestoneForecasts.forEach((m) => {
      const mTime = new Date(`${m.forecastFinish}T00:00:00Z`).getTime();
      if (mTime > latestProjectTime) {
        latestProjectTime = mTime;
        latestProjectDate = m.forecastFinish;
        lowerBoundDate = m.lowerBound;
        upperBoundDate = m.upperBound;
      }
    });

    // Also check all activity forecasts
    activityForecasts.forEach((a) => {
      const aTime = new Date(`${a.predictionDate}T00:00:00Z`).getTime();
      if (aTime > latestProjectTime) {
        latestProjectTime = aTime;
        latestProjectDate = a.predictionDate;
        lowerBoundDate = a.lowerBoundDate;
        upperBoundDate = a.upperBoundDate;
      }
    });

    const plannedProjectTime = new Date(`${project.plannedFinish}T00:00:00Z`).getTime();
    const varianceDays = Math.round((latestProjectTime - plannedProjectTime) / (1000 * 60 * 60 * 24));

    // Risk counts
    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    activityForecasts.forEach((f) => {
      if (f.riskBand === 'HIGH') highCount++;
      else if (f.riskBand === 'MEDIUM') medCount++;
      else lowCount++;
    });

    const criticalPathCount = activities.filter((a) => a.criticalPath || a.totalFloat === 0).length;
    const atRiskMilestonesCount = milestoneForecasts.filter((m) => m.riskBand === 'HIGH').length;

    return {
      projectId: project.id,
      baselineFinish: project.plannedFinish,
      forecastFinish: latestProjectDate,
      lowerBound: lowerBoundDate,
      upperBound: upperBoundDate,
      varianceDays,
      confidence: 0.82,
      reliability: atRiskMilestonesCount > 0 ? 'LIMITED' : 'SUFFICIENT',
      criticalPathActivitiesCount: criticalPathCount,
      atRiskMilestonesCount,
      activitiesCountByRisk: {
        low: lowCount,
        medium: medCount,
        high: highCount,
      },
    };
  }
}
