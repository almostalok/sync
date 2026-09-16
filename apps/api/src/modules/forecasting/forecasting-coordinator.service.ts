/**
 * SiteSync — Master Prompt 10: Forecasting Coordinator Service
 * Orchestrates activity forecasts, milestone propagation, project completion metrics,
 * model registry access, and read-only what-if scenario simulations.
 */

import { Activity, Dependency, ProgressUpdate, Project } from '@/types/domain';
import {
  Forecast,
  ForecastScenario,
  ForecastSummaryResponse,
  MilestoneForecast,
  ProjectCompletionForecast,
  ScenarioAssumption,
} from '@sitesync/types';
import { FeatureExtractorService } from './feature-extractor.service';
import { ForecastingService } from './forecasting.service';
import { MilestoneForecasterService } from './milestone-forecaster.service';
import { ScenarioEngineService } from './scenario-engine.service';
import { ModelRegistryService } from './model-registry.service';
import { HistoricalRecord } from './forecasting.types';

export class ForecastingCoordinatorService {
  constructor(
    public featureExtractor = new FeatureExtractorService(),
    public forecaster = new ForecastingService(featureExtractor),
    public milestoneForecaster = new MilestoneForecasterService(),
    public scenarioEngine = new ScenarioEngineService(),
    public modelRegistry = new ModelRegistryService()
  ) {}

  /**
   * Compute full forecasting intelligence bundle for a project
   */
  generateProjectForecasts(params: {
    project: Project;
    activities: Activity[];
    dependencies: Dependency[];
    progressUpdates: ProgressUpdate[];
    historicalRecords?: HistoricalRecord[];
    asOfDate?: string;
  }): {
    activityForecasts: Forecast[];
    milestoneForecasts: MilestoneForecast[];
    projectCompletion: ProjectCompletionForecast;
    forecastsMap: Map<string, Forecast>;
  } {
    const {
      project,
      activities,
      dependencies,
      progressUpdates,
      historicalRecords = [],
      asOfDate = '2026-09-16',
    } = params;

    const activitiesMap = new Map<string, Activity>();
    activities.forEach((a) => activitiesMap.set(a.id, a));

    const forecastsMap = new Map<string, Forecast>();
    const activityForecasts: Forecast[] = [];

    // 1. Generate individual activity forecasts
    activities.forEach((act) => {
      const fcst = this.forecaster.forecastActivity({
        activity: act,
        asOfDate,
        dependencies,
        progressUpdates,
        historicalRecords,
        activitiesMap,
      });

      forecastsMap.set(act.id, fcst);
      activityForecasts.push(fcst);
    });

    // 2. Propagate to milestones
    const milestoneForecasts = this.milestoneForecaster.forecastMilestones({
      project,
      activities,
      dependencies,
      activityForecasts: forecastsMap,
      asOfDate,
    });

    // 3. Overall project completion
    const projectCompletion = this.milestoneForecaster.forecastProjectCompletion({
      project,
      activities,
      milestoneForecasts,
      activityForecasts: forecastsMap,
    });

    return {
      activityForecasts,
      milestoneForecasts,
      projectCompletion,
      forecastsMap,
    };
  }

  /**
   * Run read-only scenario simulation
   */
  simulateScenario(params: {
    project: Project;
    activities: Activity[];
    dependencies: Dependency[];
    progressUpdates: ProgressUpdate[];
    historicalRecords?: HistoricalRecord[];
    assumptions: ScenarioAssumption[];
    title?: string;
    asOfDate?: string;
  }): ForecastScenario {
    const {
      project,
      activities,
      dependencies,
      progressUpdates,
      historicalRecords = [],
      assumptions,
      title,
      asOfDate = '2026-09-16',
    } = params;

    const base = this.generateProjectForecasts({
      project,
      activities,
      dependencies,
      progressUpdates,
      historicalRecords,
      asOfDate,
    });

    return this.scenarioEngine.simulateScenario({
      project,
      activities,
      dependencies,
      baseForecasts: base.forecastsMap,
      baseMilestones: base.milestoneForecasts,
      baseProjectCompletion: base.projectCompletion,
      assumptions,
      title,
    });
  }

  /**
   * Get executive summary response for the Command Center
   */
  getForecastSummary(params: {
    project: Project;
    activities: Activity[];
    dependencies: Dependency[];
    progressUpdates: ProgressUpdate[];
    historicalRecords?: HistoricalRecord[];
    asOfDate?: string;
  }): ForecastSummaryResponse {
    const { asOfDate = '2026-09-16' } = params;
    const bundle = this.generateProjectForecasts(params);

    const highRiskActivities = bundle.activityForecasts.filter((f) => f.riskBand === 'HIGH');

    return {
      projectId: params.project.id,
      asOfDate,
      projectCompletion: bundle.projectCompletion,
      milestoneForecasts: bundle.milestoneForecasts,
      highRiskActivities,
      modelStatus: this.modelRegistry.getActiveModel(),
    };
  }
}

export const forecastingCoordinator = new ForecastingCoordinatorService();
