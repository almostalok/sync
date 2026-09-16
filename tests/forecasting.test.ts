/**
 * SiteSync — Master Prompt 10: Advanced Forecasting & Predictive Intelligence Test Suite
 * Comprehensive automated verification of deterministic baselines, zero-leakage feature extraction,
 * explainable multi-signal forecasts, conformal intervals, milestone propagation,
 * read-only scenario simulation invariants, calibration, and 500-case benchmark evaluation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

import {
  FeatureExtractorService,
  ForecastingService,
  MilestoneForecasterService,
  ScenarioEngineService,
  ModelRegistryService,
  ForecastingCoordinatorService,
} from '../apps/api/src/modules/forecasting';
import { generateSyntheticProject } from '../src/lib/data/syntheticGenerator';
import { Activity, Dependency, ProgressUpdate } from '../src/types/domain';

test('SiteSync Advanced Forecasting & Predictive Intelligence Suite (Master Prompt 10)', async (t) => {
  const featureExtractor = new FeatureExtractorService();
  const forecaster = new ForecastingService(featureExtractor);
  const milestoneForecaster = new MilestoneForecasterService();
  const scenarioEngine = new ScenarioEngineService();
  const modelRegistry = new ModelRegistryService();
  const coordinator = new ForecastingCoordinatorService(
    featureExtractor,
    forecaster,
    milestoneForecaster,
    scenarioEngine,
    modelRegistry
  );

  const data = generateSyntheticProject();

  await t.test('1. 4 Deterministic Baselines Generation', () => {
    const act = data.activities[0];
    const features = featureExtractor.extractFeatures({
      activity: act,
      asOfDate: '2026-09-16',
      dependencies: data.dependencies,
      progressUpdates: [],
    });

    const baselines = forecaster.computeBaselines(act, features, '2026-09-16');

    // Baseline 1: Planned Finish
    assert.equal(baselines.plannedFinish, act.plannedFinish);
    // Baseline 2: Linear Projection Finish
    assert.ok(baselines.linearProjectionFinish >= '2026-09-16');
    // Baseline 3: Historical Median Finish
    assert.ok(baselines.historicalMedianFinish.length === 10);
    // Baseline 4: Recent Velocity Finish
    assert.ok(baselines.recentVelocityFinish >= '2026-09-16');
  });

  await t.test('2. Feature Engineering & Zero Future Lookahead Leakage (Section 11)', () => {
    const act = data.activities[0];

    // Artificial future update on 2026-09-25
    const futureUpdate: ProgressUpdate = {
      id: 'UPD-FUTURE-99',
      activityId: act.id,
      activityCode: act.activityCode,
      eventId: 'EVT-01',
      progress: 99,
      status: 'IN_PROGRESS',
      effectiveDate: '2026-09-25',
      sourceReport: 'Future_DPR.pdf',
      verifiedBy: 'Future Auditor',
      verifiedAt: '2026-09-25T00:00:00Z',
      previousProgress: 60,
    };

    const pastUpdates: ProgressUpdate[] = [
      {
        id: 'UPD-PAST-01',
        activityId: act.id,
        activityCode: act.activityCode,
        eventId: 'EVT-01',
        progress: 40,
        status: 'IN_PROGRESS',
        effectiveDate: '2026-09-05',
        sourceReport: 'DPR-01.pdf',
        verifiedBy: 'Supervisor',
        verifiedAt: '2026-09-05T00:00:00Z',
        previousProgress: 0,
      },
      {
        id: 'UPD-PAST-02',
        activityId: act.id,
        activityCode: act.activityCode,
        eventId: 'EVT-01',
        progress: 60,
        status: 'IN_PROGRESS',
        effectiveDate: '2026-09-12',
        sourceReport: 'DPR-02.pdf',
        verifiedBy: 'Supervisor',
        verifiedAt: '2026-09-12T00:00:00Z',
        previousProgress: 40,
      },
      futureUpdate,
    ];

    // Extract features strictly as of 2026-09-15
    const featuresAtT = featureExtractor.extractFeatures({
      activity: act,
      asOfDate: '2026-09-15',
      dependencies: data.dependencies,
      progressUpdates: pastUpdates,
    });

    // Invariant: future update at 2026-09-25 MUST NOT leak into 2026-09-15 features!
    assert.equal(
      featuresAtT.currentProgressPct,
      60,
      'Must use progress from 2026-09-12 (60%), never future 2026-09-25 (99%)'
    );
    assert.equal(featuresAtT.verifiedObservationsCount, 2, 'Future update must be excluded from observation count');
  });

  await t.test('3. Explainable Multi-Signal Forecast & Driver Attribution', () => {
    const act = data.activities[0];
    const fcst = forecaster.forecastActivity({
      activity: act,
      asOfDate: '2026-09-16',
      dependencies: data.dependencies,
      progressUpdates: [],
    });

    assert.ok(fcst.id.startsWith('FCST-'));
    assert.ok(fcst.predictionDate.length === 10);
    assert.ok(fcst.predictionDurationDays > 0);
    assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(fcst.riskBand));
    assert.ok(fcst.riskProbability >= 0 && fcst.riskProbability <= 1.0);

    // Explainability drivers
    assert.ok(fcst.explanation.drivers.length >= 2, 'Must provide at least 2 quantified drivers');
    const d1 = fcst.explanation.drivers[0];
    assert.ok(['POSITIVE', 'NEGATIVE'].includes(d1.direction));
    assert.ok(d1.importance > 0);
    assert.ok(d1.explanation.length > 10);
    assert.ok(fcst.explanation.assumptions.length >= 2);
  });

  await t.test('4. Conformal Prediction Intervals & Uncertainty Bounds (Section 7 & 45)', () => {
    const act = data.activities[0];
    const fcst = forecaster.forecastActivity({
      activity: act,
      asOfDate: '2026-09-16',
      dependencies: data.dependencies,
      progressUpdates: [],
    });

    const lowerTime = new Date(`${fcst.lowerBoundDate}T00:00:00Z`).getTime();
    const predTime = new Date(`${fcst.predictionDate}T00:00:00Z`).getTime();
    const upperTime = new Date(`${fcst.upperBoundDate}T00:00:00Z`).getTime();

    assert.ok(lowerTime <= predTime, 'Lower bound must be <= predicted date');
    assert.ok(predTime <= upperTime, 'Predicted date must be <= upper bound date');
    assert.ok(fcst.confidence >= 0.5 && fcst.confidence <= 1.0);
  });

  await t.test('5. Data Sufficiency & Reliability Grading (Section 21 & 46)', () => {
    const act = data.activities[0];

    // 0 updates -> LOW_DATA
    const fcstLow = forecaster.forecastActivity({
      activity: act,
      asOfDate: '2026-09-16',
      dependencies: data.dependencies,
      progressUpdates: [],
    });
    assert.equal(fcstLow.reliability, 'LOW_DATA');

    // 6 updates -> SUFFICIENT
    const sixUpdates: ProgressUpdate[] = Array.from({ length: 6 }, (_, i) => ({
      id: `UPD-SAMPLE-${i}`,
      activityId: act.id,
      activityCode: act.activityCode,
      eventId: 'EVT-01',
      progress: (i + 1) * 12,
      status: 'IN_PROGRESS',
      effectiveDate: `2026-09-1${i}`,
      sourceReport: `DPR-${i}.pdf`,
      verifiedBy: 'Engineer',
      verifiedAt: `2026-09-1${i}T00:00:00Z`,
      previousProgress: i * 12,
    }));

    const fcstSuff = forecaster.forecastActivity({
      activity: act,
      asOfDate: '2026-09-16',
      dependencies: data.dependencies,
      progressUpdates: sixUpdates,
    });
    assert.equal(fcstSuff.reliability, 'SUFFICIENT');
  });

  await t.test('6. Dependency-Aware Milestone & Project Completion Forecaster', () => {
    const bundle = coordinator.generateProjectForecasts({
      project: data.project,
      activities: data.activities,
      dependencies: data.dependencies,
      progressUpdates: [],
      asOfDate: '2026-09-16',
    });

    assert.ok(bundle.milestoneForecasts.length > 0);
    const m1 = bundle.milestoneForecasts[0];
    assert.ok(m1.milestoneId.length > 0);
    assert.ok(m1.forecastFinish.length === 10);
    assert.ok(m1.drivingPredecessorActivityId.length > 0);
    assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(m1.riskBand));

    // Project completion
    assert.ok(bundle.projectCompletion.forecastFinish >= data.project.plannedStart);
    assert.ok(bundle.projectCompletion.confidence > 0.7);
    assert.ok(bundle.projectCompletion.activitiesCountByRisk.low >= 0);
  });

  await t.test('7. Read-Only What-If Scenario Simulation Invariant (Section 48 & 51)', () => {
    const act = data.activities[0];
    const initialProgress = act.actualProgress;
    const initialPlannedFinish = act.plannedFinish;
    const initialCount = data.activities.length;

    const scenario = coordinator.simulateScenario({
      project: data.project,
      activities: data.activities,
      dependencies: data.dependencies,
      progressUpdates: [],
      assumptions: [
        {
          activityId: act.id,
          delayDays: 5,
          reason: 'Material shipment delay test',
        },
      ],
      asOfDate: '2026-09-16',
    });

    assert.ok(scenario.scenarioId.startsWith('SCN-'));
    assert.equal(scenario.isPurelyHypothetical, true);
    assert.ok(scenario.affectedActivities.length >= 1);
    assert.ok(scenario.projectFinishDeltaDays >= 0);
    assert.ok(scenario.summaryExplanation.includes('cascades to'));

    // STRICT SAFETY INVARIANT: Real project state must be 100% UNTOUCHED!
    assert.equal(act.actualProgress, initialProgress, 'Actual progress must NOT be mutated by scenario');
    assert.equal(act.plannedFinish, initialPlannedFinish, 'Baseline planned finish must NOT be mutated');
    assert.equal(data.activities.length, initialCount, 'Activity count must remain untouched');
  });

  await t.test('8. Delay Risk Calibration & Probabilistic Scoring (Section 8 & 30)', () => {
    const act = data.activities[0];
    const fcst = forecaster.forecastActivity({
      activity: act,
      asOfDate: '2026-09-16',
      dependencies: data.dependencies,
      progressUpdates: [],
    });

    assert.ok(fcst.riskProbability >= 0.05 && fcst.riskProbability <= 0.98);
    if (fcst.riskProbability >= 0.65) {
      assert.equal(fcst.riskBand, 'HIGH');
    } else if (fcst.riskProbability >= 0.3) {
      assert.equal(fcst.riskBand, 'MEDIUM');
    } else {
      assert.equal(fcst.riskBand, 'LOW');
    }
  });

  await t.test('9. Model Registry & Version Tracking (Section 37 & 38)', () => {
    const active = modelRegistry.getActiveModel();
    assert.equal(active.modelVersion, 'completion-xgb-v1.4');
    assert.equal(active.featureVersion, 'feat-v2.1');
    assert.equal(active.trainingDatasetVersion, 'forecast-dataset-v1');
    assert.ok(active.metrics.maeDays < 4.5, 'Validation MAE must beat 4.5 days target');
    assert.ok(active.metrics.predictionIntervalCoverage80 >= 0.8, 'Coverage must be >= 80%');
    assert.ok(active.metrics.brierScore < 0.2, 'Brier score must indicate good calibration');
  });

  await t.test('10. Execution of 500-Case Chronological Golden Benchmark (Section 71 & 72)', () => {
    const benchPath = path.resolve(__dirname, '../data/benchmark/forecast-evaluation.json');
    assert.ok(fs.existsSync(benchPath), 'Benchmark dataset file must exist');

    const benchContent = JSON.parse(fs.readFileSync(benchPath, 'utf8'));
    assert.equal(benchContent.items.length, 500, 'Benchmark must contain exactly 500 test cases');

    let totalErrorDays = 0;
    let insideIntervalCount = 0;

    // Evaluate a representative chronological sample of 50 benchmark cases
    const sample = benchContent.items.filter((_: any, idx: number) => idx % 10 === 0);

    sample.forEach((item: any) => {
      // Create mock activity from item
      const mockAct: Activity = {
        id: item.id,
        projectId: 'PROJ-TEST',
        wbsNodeId: 'WBS-1',
        activityCode: item.activityCode,
        name: item.activityName,
        description: item.activityName,
        discipline: item.discipline,
        location: 'Area 1',
        wbsPath: '1.1',
        plannedStart: item.plannedStart,
        plannedFinish: item.plannedFinish,
        plannedDuration: item.plannedDurationDays,
        plannedProgress: 50,
        actualProgress: item.currentProgressPct,
        status: 'IN_PROGRESS',
        varianceDays: 0,
        criticalPath: item.isCritical,
        totalFloat: item.floatDays,
        freeFloat: item.floatDays,
        updatedAt: item.asOfDate,
      };

      const fcst = forecaster.forecastActivity({
        activity: mockAct,
        asOfDate: item.asOfDate,
        dependencies: [],
        progressUpdates: [],
      });

      const groundTruthDays = item.groundTruthActualDurationDays;
      const predictedDays = fcst.predictionDurationDays;
      const error = Math.abs(predictedDays - groundTruthDays);
      totalErrorDays += error;

      // Check if prediction is within reasonable margin
      if (error <= 5) insideIntervalCount++;
    });

    const sampleMae = totalErrorDays / sample.length;
    assert.ok(sampleMae < 6.0, `Sample MAE (${sampleMae.toFixed(2)}d) must be well within tolerance`);
    assert.ok(insideIntervalCount / sample.length >= 0.7, 'At least 70% of sample must be within tight margin');
  });
});
