/**
 * SiteSync — Master Prompt 10: Advanced Forecasting & Predictive Intelligence Types
 * Strict typed contracts for feature engineering, deterministic baselines,
 * explainable multi-signal forecasts, conformal prediction intervals,
 * milestone aggregation, and read-only what-if scenario simulations.
 */

import { Discipline } from './enums';

export type ForecastType =
  | 'ACTIVITY_COMPLETION'
  | 'ACTIVITY_DURATION'
  | 'MILESTONE_COMPLETION'
  | 'PROGRESS_TRAJECTORY'
  | 'DELAY_RISK'
  | 'DEPENDENCY_IMPACT'
  | 'PROJECT_COMPLETION';

export type ForecastStatus = 'ACTIVE' | 'SUPERSEDED' | 'EXPIRED' | 'INVALIDATED';

export type ForecastReliability = 'SUFFICIENT' | 'LIMITED' | 'LOW_DATA';

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ForecastDriver {
  feature: string;
  value: number | string;
  direction: 'POSITIVE' | 'NEGATIVE';
  importance: number; // 0.0 to 1.0
  explanation: string;
}

export interface DataQualitySummary {
  daysSinceLastUpdate: number;
  isStale: boolean;
  verifiedProgressObservations: number;
  reliability: ForecastReliability;
  missingObservationNote?: string;
}

export interface HistoricalBasis {
  comparableSampleSize: number;
  historicalMedianDuration: number;
  historicalP25: number;
  historicalP75: number;
  historicalDelayRate: number;
  sampleStrength: 'LOW' | 'LIMITED' | 'STRONG';
}

export interface ForecastExplanation {
  drivers: ForecastDriver[];
  dataQuality: DataQualitySummary;
  historicalBasis?: HistoricalBasis;
  assumptions: string[];
  limitations: string[];
}

export interface BaselinePredictions {
  plannedFinish: string;
  linearProjectionFinish: string;
  historicalMedianFinish: string;
  recentVelocityFinish: string;
}

export interface ActivityFeatures {
  asOfDate: string;
  activityId: string;
  activityCode: string;
  discipline: string;
  plannedDurationDays: number;
  elapsedDays: number;
  remainingPlannedDays: number;
  floatDays: number;
  isCritical: boolean;
  scheduleVarianceDays: number;
  currentProgressPct: number;
  plannedProgressPct: number;
  progressLagPct: number;
  overallVelocityPctPerDay: number;
  recentVelocityPctPerDay: number;
  velocityTrend: 'ACCELERATING' | 'STEADY' | 'DECELERATING';
  predecessorCount: number;
  successorCount: number;
  criticalSuccessorCount: number;
  daysSinceLastUpdate: number;
  isStale: boolean;
  verifiedObservationsCount: number;
  historicalComparableCount: number;
  historicalMedianDurationDays: number;
  historicalDelayRate: number;
}

export interface Forecast {
  id: string;
  projectId: string;
  activityId?: string;
  activityCode?: string;
  activityName?: string;
  discipline?: string;
  forecastType: ForecastType;
  asOfDate: string;
  predictionDate: string; // YYYY-MM-DD
  predictionDurationDays: number;
  lowerBoundDate: string; // Conformal prediction interval lower (e.g. P10/P20)
  upperBoundDate: string; // Conformal prediction interval upper (e.g. P80/P90)
  confidence: number; // 0.0 to 1.0 calibrated model confidence
  reliability: ForecastReliability;
  riskBand: RiskBand;
  riskProbability: number; // Calibrated probability of exceeding baseline
  baselines: BaselinePredictions;
  explanation: ForecastExplanation;
  modelVersion: string;
  featureVersion: string;
  trainingDatasetVersion: string;
  generatedAt: string;
  expiresAt: string;
  status: ForecastStatus;
}

export interface MilestoneForecast {
  milestoneId: string;
  milestoneName: string;
  baselineFinish: string;
  forecastFinish: string;
  lowerBound: string;
  upperBound: string;
  varianceDays: number;
  riskBand: RiskBand;
  reliability: ForecastReliability;
  drivingPredecessorActivityId: string;
  drivingPredecessorCode: string;
  drivingPredecessorName: string;
  predecessorForecastsCount: number;
}

export interface ProjectCompletionForecast {
  projectId: string;
  baselineFinish: string;
  forecastFinish: string;
  lowerBound: string;
  upperBound: string;
  varianceDays: number;
  confidence: number;
  reliability: ForecastReliability;
  criticalPathActivitiesCount: number;
  atRiskMilestonesCount: number;
  activitiesCountByRisk: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface ScenarioAssumption {
  activityId: string;
  delayDays: number;
  reason?: string;
}

export interface ScenarioAffectedActivity {
  activityId: string;
  activityCode: string;
  activityName: string;
  originalForecastFinish: string;
  scenarioForecastFinish: string;
  additionalDelayDays: number;
  absorbedByFloatDays: number;
  isCritical: boolean;
}

export interface ScenarioMilestoneDelta {
  milestoneId: string;
  milestoneName: string;
  originalForecastFinish: string;
  scenarioForecastFinish: string;
  slipDays: number;
}

export interface ForecastScenario {
  scenarioId: string;
  projectId: string;
  title: string;
  simulatedAt: string;
  baseStateVersion: number;
  assumptions: ScenarioAssumption[];
  affectedActivities: ScenarioAffectedActivity[];
  affectedMilestones: ScenarioMilestoneDelta[];
  projectFinishDeltaDays: number;
  projectOriginalForecastFinish: string;
  projectScenarioForecastFinish: string;
  isPurelyHypothetical: true;
  summaryExplanation: string;
}

export interface ModelRegistryEntry {
  modelName: string;
  modelVersion: string;
  featureVersion: string;
  trainingDatasetVersion: string;
  target: ForecastType;
  algorithm: string;
  metrics: {
    maeDays: number;
    rmseDays: number;
    medianAbsoluteErrorDays: number;
    predictionIntervalCoverage80: number; // Target >= 0.80
    brierScore: number;
    expectedCalibrationError: number;
  };
  createdAt: string;
  status: 'TRAINING' | 'VALIDATED' | 'ACTIVE' | 'RETIRED';
}

export interface ForecastSummaryResponse {
  projectId: string;
  asOfDate: string;
  projectCompletion: ProjectCompletionForecast;
  milestoneForecasts: MilestoneForecast[];
  highRiskActivities: Forecast[];
  modelStatus: ModelRegistryEntry;
}
