/**
 * SiteSync — Master Prompt 10: Forecast Benchmark Dataset Generator
 * Generates 500 chronological test cases across 10 scenarios with zero lookahead leakage
 * to evaluate regression MAE/RMSE, interval coverage, calibration, and backtesting.
 */

import * as fs from 'fs';
import * as path from 'path';

interface BenchmarkCase {
  id: string;
  scenario: string;
  asOfDate: string;
  activityCode: string;
  activityName: string;
  discipline: 'CIVIL' | 'PIPING' | 'MECHANICAL' | 'ELECTRICAL' | 'INSTRUMENTATION';
  plannedStart: string;
  plannedFinish: string;
  plannedDurationDays: number;
  currentProgressPct: number;
  verifiedUpdatesCount: number;
  daysSinceLastUpdate: number;
  isCritical: boolean;
  floatDays: number;
  recentVelocityPctPerDay: number;
  historicalComparableCount: number;
  groundTruthActualFinish: string;
  groundTruthActualDurationDays: number;
  expectedRiskBand: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedReliability: 'SUFFICIENT' | 'LIMITED' | 'LOW_DATA';
}

const SCENARIOS = [
  'HEALTHY_ON_SCHEDULE',
  'DECELERATING_PROGRESS',
  'DELAYED_MATERIAL',
  'CRITICAL_PATH_SQUEEZE',
  'STALE_NO_UPDATES',
  'INSUFFICIENT_HISTORY',
  'STRONG_HISTORICAL_PRIOR',
  'FLUCTUATING_UPDATES',
  'DOWNSTREAM_DEPENDENCY_CHAIN',
  'NEAR_COMPLETION_FINAL_MILE',
];

const DISCIPLINES = ['CIVIL', 'PIPING', 'MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION'] as const;

function generateBenchmark(): BenchmarkCase[] {
  const cases: BenchmarkCase[] = [];
  const TOTAL_CASES = 500;

  for (let i = 0; i < TOTAL_CASES; i++) {
    const scenario = SCENARIOS[i % SCENARIOS.length];
    const discipline = DISCIPLINES[i % DISCIPLINES.length];
    const plannedDurationDays = 15 + (i % 30);
    const plannedStart = '2026-08-01';

    // Calculate baseline planned finish
    const pStartDate = new Date(`${plannedStart}T00:00:00Z`);
    const pFinishDate = new Date(pStartDate);
    pFinishDate.setDate(pFinishDate.getDate() + plannedDurationDays);
    const plannedFinish = pFinishDate.toISOString().split('T')[0];

    // Chronological asOfDate between 2026-08-10 and 2026-09-16
    const asOfOffset = 10 + (i % 25);
    const asOfD = new Date(pStartDate);
    asOfD.setDate(asOfD.getDate() + asOfOffset);
    const asOfDate = asOfD.toISOString().split('T')[0];

    let currentProgressPct = 50;
    let verifiedUpdatesCount = 4;
    let daysSinceLastUpdate = 2;
    let isCritical = false;
    let floatDays = 6;
    let recentVelocityPctPerDay = 2.5;
    let historicalComparableCount = 12;
    let delayFactor = 0;
    let expectedRiskBand: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let expectedReliability: 'SUFFICIENT' | 'LIMITED' | 'LOW_DATA' = 'SUFFICIENT';

    switch (scenario) {
      case 'HEALTHY_ON_SCHEDULE':
        currentProgressPct = Math.min(95, Math.round((asOfOffset / plannedDurationDays) * 100));
        recentVelocityPctPerDay = 3.0;
        verifiedUpdatesCount = 6;
        daysSinceLastUpdate = 1;
        floatDays = 8;
        delayFactor = 0;
        expectedRiskBand = 'LOW';
        expectedReliability = 'SUFFICIENT';
        break;

      case 'DECELERATING_PROGRESS':
        currentProgressPct = Math.max(20, Math.round((asOfOffset / plannedDurationDays) * 60));
        recentVelocityPctPerDay = 0.8;
        verifiedUpdatesCount = 5;
        daysSinceLastUpdate = 3;
        floatDays = 2;
        delayFactor = 6;
        expectedRiskBand = 'HIGH';
        expectedReliability = 'SUFFICIENT';
        break;

      case 'DELAYED_MATERIAL':
        currentProgressPct = 35;
        recentVelocityPctPerDay = 0.2;
        verifiedUpdatesCount = 4;
        daysSinceLastUpdate = 4;
        floatDays = 1;
        delayFactor = 9;
        expectedRiskBand = 'HIGH';
        expectedReliability = 'LIMITED';
        break;

      case 'CRITICAL_PATH_SQUEEZE':
        currentProgressPct = 60;
        recentVelocityPctPerDay = 2.0;
        verifiedUpdatesCount = 6;
        isCritical = true;
        floatDays = 0;
        delayFactor = 4;
        expectedRiskBand = 'MEDIUM';
        expectedReliability = 'SUFFICIENT';
        break;

      case 'STALE_NO_UPDATES':
        currentProgressPct = 40;
        recentVelocityPctPerDay = 1.0;
        verifiedUpdatesCount = 2;
        daysSinceLastUpdate = 14;
        floatDays = 4;
        delayFactor = 5;
        expectedRiskBand = 'MEDIUM';
        expectedReliability = 'LIMITED';
        break;

      case 'INSUFFICIENT_HISTORY':
        currentProgressPct = 15;
        recentVelocityPctPerDay = 1.5;
        verifiedUpdatesCount = 1;
        daysSinceLastUpdate = 2;
        floatDays = 5;
        historicalComparableCount = 2;
        delayFactor = 2;
        expectedRiskBand = 'MEDIUM';
        expectedReliability = 'LOW_DATA';
        break;

      case 'STRONG_HISTORICAL_PRIOR':
        currentProgressPct = 70;
        recentVelocityPctPerDay = 2.4;
        verifiedUpdatesCount = 8;
        daysSinceLastUpdate = 1;
        floatDays = 6;
        historicalComparableCount = 35;
        delayFactor = 1;
        expectedRiskBand = 'LOW';
        expectedReliability = 'SUFFICIENT';
        break;

      case 'FLUCTUATING_UPDATES':
        currentProgressPct = 55;
        recentVelocityPctPerDay = 1.2;
        verifiedUpdatesCount = 5;
        daysSinceLastUpdate = 3;
        floatDays = 3;
        delayFactor = 4;
        expectedRiskBand = 'MEDIUM';
        expectedReliability = 'SUFFICIENT';
        break;

      case 'DOWNSTREAM_DEPENDENCY_CHAIN':
        currentProgressPct = 45;
        recentVelocityPctPerDay = 1.6;
        verifiedUpdatesCount = 5;
        isCritical = true;
        floatDays = 0;
        delayFactor = 7;
        expectedRiskBand = 'HIGH';
        expectedReliability = 'SUFFICIENT';
        break;

      case 'NEAR_COMPLETION_FINAL_MILE':
        currentProgressPct = 92;
        recentVelocityPctPerDay = 3.2;
        verifiedUpdatesCount = 9;
        daysSinceLastUpdate = 1;
        floatDays = 10;
        delayFactor = 0;
        expectedRiskBand = 'LOW';
        expectedReliability = 'SUFFICIENT';
        break;
    }

    const actualDurationDays = plannedDurationDays + delayFactor;
    const actualFinishDate = new Date(pStartDate);
    actualFinishDate.setDate(actualFinishDate.getDate() + actualDurationDays);
    const groundTruthActualFinish = actualFinishDate.toISOString().split('T')[0];

    cases.push({
      id: `FCST-BENCH-${(i + 1).toString().padStart(4, '0')}`,
      scenario,
      asOfDate,
      activityCode: `${discipline.slice(0, 3)}-L6-${(100 + (i % 200)).toString()}`,
      activityName: `${discipline} Package Sub-task #${i + 1}`,
      discipline,
      plannedStart,
      plannedFinish,
      plannedDurationDays,
      currentProgressPct,
      verifiedUpdatesCount,
      daysSinceLastUpdate,
      isCritical,
      floatDays,
      recentVelocityPctPerDay,
      historicalComparableCount,
      groundTruthActualFinish,
      groundTruthActualDurationDays: actualDurationDays,
      expectedRiskBand,
      expectedReliability,
    });
  }

  return cases;
}

const benchmarkDataset = {
  version: 'forecast-dataset-v1',
  datasetName: 'SiteSync 500-Case Chronological Forecasting Benchmark',
  generatedAt: new Date().toISOString(),
  target: 'ACTIVITY_COMPLETION',
  metricsTarget: {
    maxMaeDays: 4.5,
    minCoverage80: 0.8,
    maxBrierScore: 0.2,
    maxECE: 0.08,
  },
  scenariosCount: SCENARIOS.length,
  totalItems: 500,
  items: generateBenchmark(),
};

const outputDir = path.resolve(__dirname, '../data/benchmark');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'forecast-evaluation.json');
fs.writeFileSync(outputPath, JSON.stringify(benchmarkDataset, null, 2), 'utf8');

console.log(`Successfully generated ${benchmarkDataset.items.length} forecast benchmark test cases at:`);
console.log(outputPath);
