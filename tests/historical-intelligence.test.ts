import test from 'node:test';
import assert from 'node:assert/strict';

import { DelayCause, Discipline, SampleQuality } from '../packages/types/src';
import {
  HistoricalOutcomeService,
  HistoricalAggregationService,
  HistoricalSimilarityService,
  DelayIntelligenceService,
  ProductivityIntelligenceService,
  ProjectClosureService,
  HistoricalBenchmarkService,
  HISTORICAL_CONFIG,
} from '../apps/api/src/modules/history';

test('SiteSync Historical Intelligence & Institutional Memory Suite', async (t) => {
  const outcomeService = new HistoricalOutcomeService();
  const aggregationService = new HistoricalAggregationService(outcomeService);
  const similarityService = new HistoricalSimilarityService(outcomeService, aggregationService);
  const delayService = new DelayIntelligenceService(outcomeService);
  const productivityService = new ProductivityIntelligenceService(outcomeService);
  const closureService = new ProjectClosureService(outcomeService, aggregationService);
  const benchmarkService = new HistoricalBenchmarkService(aggregationService);

  await t.test('1. Historical Eligibility Gate: Completed & Verified Constraints', () => {
    // 1.1 Eligible completed activity
    const eligible = outcomeService.checkEligibility({
      status: 'COMPLETED',
      actualStart: '2026-08-01',
      actualEnd: '2026-08-08',
      actualProgress: 1.0,
    });
    assert.equal(eligible.isEligible, true);

    // 1.2 Uncompleted activity (< 100% progress)
    const inProgress = outcomeService.checkEligibility({
      status: 'IN_PROGRESS',
      actualStart: '2026-08-01',
      actualEnd: null,
      actualProgress: 0.65,
    });
    assert.equal(inProgress.isEligible, false);
    assert.match(inProgress.reason!, /not marked COMPLETED/);

    // 1.3 Missing start date
    const missingStart = outcomeService.checkEligibility({
      status: 'COMPLETED',
      actualStart: null,
      actualEnd: '2026-08-08',
      actualProgress: 1.0,
    });
    assert.equal(missingStart.isEligible, false);
    assert.match(missingStart.reason!, /Missing verified actual start/);

    // 1.4 Missing end date
    const missingEnd = outcomeService.checkEligibility({
      status: 'COMPLETED',
      actualStart: '2026-08-01',
      actualEnd: null,
      actualProgress: 1.0,
    });
    assert.equal(missingEnd.isEligible, false);
    assert.match(missingEnd.reason!, /Missing verified actual completion/);
  });

  await t.test('2. Deterministic Duration, Variance & Productivity Calculation', async () => {
    const outcome = await outcomeService.createFromCompletedActivity({
      projectId: 'TEST-PROJ-01',
      projectName: 'Test Compressor Plant',
      activityId: 'ACT-TEST-01',
      activityCode: 'CIV-TEST-01',
      activityName: 'Compressor Foundation Excavation',
      discipline: Discipline.CIVIL,
      activityType: 'FOUNDATION_EXCAVATION',
      activityCategory: 'Civil Foundation',
      wbsPath: '1.2.3',
      location: 'Compressor Yard',
      plannedStart: '2026-01-01',
      plannedEnd: '2026-01-06', // 5 days
      actualStart: '2026-01-01',
      actualEnd: '2026-01-08', // 7 days
      plannedDuration: 5,
      plannedQuantity: 850,
      actualQuantity: 850,
      quantityUnit: 'm3',
      delayCause: DelayCause.EQUIPMENT,
      lessonsLearned: 'Hydraulic excavator seal failed.',
      evidenceReference: 'DPR-2026-01-08.pdf#P2',
    });

    assert.equal(outcome.actualDuration, 7, 'Actual duration must be 7 days');
    assert.equal(outcome.plannedDuration, 5, 'Planned duration must be 5 days');
    assert.equal(outcome.scheduleVariance, 2, 'Variance must be +2 days');
    assert.equal(outcome.delayDays, 2, 'Delay days must match variance');
    assert.equal(outcome.productivityMetric, 121.4, 'Productivity must equal 850 / 7 rounded');
    assert.equal(outcome.quality.startVerified, true);
    assert.equal(outcome.quality.endVerified, true);
    assert.equal(outcome.quality.isEligible, true);
  });

  await t.test('3. Statistical Distributions & Small Sample Heuristics', async () => {
    // 3.1 Percentile calculations
    const values = [5, 6, 7, 8, 10, 12, 15];
    assert.equal(HistoricalAggregationService.calculatePercentile(values, 0.5), 8);
    assert.equal(HistoricalAggregationService.calculatePercentile(values, 0.25), 6.5);
    assert.equal(HistoricalAggregationService.calculatePercentile(values, 0.75), 11);
    assert.equal(HistoricalAggregationService.calculateMean(values), 9);

    // 3.2 Sample quality classification
    assert.equal(
      HistoricalAggregationService.classifySampleQuality(24),
      SampleQuality.STRONGER_HISTORICAL_BASE
    );
    assert.equal(
      HistoricalAggregationService.classifySampleQuality(12),
      SampleQuality.LIMITED
    );
    assert.equal(
      HistoricalAggregationService.classifySampleQuality(3),
      SampleQuality.LOW_SAMPLE
    );
    assert.equal(
      HistoricalAggregationService.classifySampleQuality(0),
      SampleQuality.INSUFFICIENT_HISTORY
    );

    // 3.3 Historical overview
    const overview = await aggregationService.getHistoricalOverview();
    assert.ok(overview.totalCompletedActivities > 100, 'Must contain > 100 completed tasks');
    assert.ok(overview.totalHistoricalProjects >= 10, 'Must span >= 10 historical projects');
    assert.ok(overview.averageVerifiedDurationDays > 0);
    assert.ok(overview.topDelayCategories.length > 0);
    assert.ok(overview.disciplineDistribution.length >= 5);

    // 3.4 Activity benchmarks
    const benchmarks = await aggregationService.getActivityBenchmarks();
    assert.ok(benchmarks.length > 0);
    const foundationBench = benchmarks.find((b) => b.activityType === 'FOUNDATION_EXCAVATION');
    assert.ok(foundationBench, 'Foundation Excavation benchmark must exist');
    assert.ok(foundationBench.sampleCount >= 10);
    assert.ok(foundationBench.durationDays.median > 0);
    assert.ok(foundationBench.durationDays.p25 <= foundationBench.durationDays.median);
    assert.ok(foundationBench.durationDays.median <= foundationBench.durationDays.p75);
  });

  await t.test('4. Delay Taxonomy, Root-Causes & Field Evidence Citations', async () => {
    const delayIntel = await delayService.getDelayIntelligence();
    assert.ok(delayIntel.summary.totalDelays > 0);
    assert.ok(delayIntel.categories.length > 0);

    const weatherCategory = delayIntel.categories.find((c) => c.cause === DelayCause.WEATHER);
    if (weatherCategory) {
      assert.ok(weatherCategory.occurrences > 0);
      assert.ok(weatherCategory.evidenceExcerpts.length > 0);
      assert.ok(weatherCategory.evidenceExcerpts[0].quotedText.length > 0);
      assert.ok(weatherCategory.evidenceExcerpts[0].documentName.includes('.pdf'));
    }

    // Fallback for undocumented causes
    assert.ok(HISTORICAL_CONFIG.DELAY_TAXONOMY[DelayCause.UNKNOWN]);
    assert.equal(HISTORICAL_CONFIG.DELAY_TAXONOMY[DelayCause.UNKNOWN].label, 'Undocumented Delay Cause');
  });

  await t.test('5. Verifiable Productivity Rate Intelligence', async () => {
    const productivityList = await productivityService.getProductivityIntelligence();
    assert.ok(productivityList.length > 0);

    productivityList.forEach((item) => {
      assert.ok(item.median > 0);
      assert.ok(item.unit.includes('/day'));
      assert.ok(item.sampleCount > 0);
      assert.ok(item.p25 <= item.median);
      assert.ok(item.median <= item.p75);
    });
  });

  await t.test('6. Structured-First Candidate Filtering & Similarity Explanations', async () => {
    const comparison = await similarityService.findComparableActivities({
      id: 'ACT-LIVE-01',
      code: 'CIV-EXC-042',
      name: 'Compressor Foundation Excavation',
      discipline: Discipline.CIVIL,
      activityType: 'FOUNDATION_EXCAVATION',
      plannedDuration: 7,
      location: 'Duliajan Terminal',
      plannedQuantity: 850,
    });

    assert.equal(comparison.sourceActivity.code, 'CIV-EXC-042');
    assert.ok(comparison.benchmark.sampleCount > 0);
    assert.ok(comparison.comparableActivities.length > 0);

    const topMatch = comparison.comparableActivities[0];
    assert.ok(topMatch.similarityScore >= 0.7, 'Top match score must be >= 70%');
    assert.ok(topMatch.similarityReasons.length > 0, 'Reasons must be populated');
    assert.ok(topMatch.evidenceExcerpt.includes('.pdf'), 'Evidence citation must point to document');
  });

  await t.test('7. Project Closure Workflow & Quality Report Integrity', async () => {
    const report = await closureService.generateQualityReport('OIL-BOG-2024');
    assert.equal(report.projectId, 'OIL-BOG-2024');
    assert.ok(report.activitiesCompleted > 0);
    assert.ok(report.eligibleForHistory > 0);

    const closureResult = await closureService.initiateProjectClosure('PROJ-OIL-2026-01');
    assert.equal(closureResult.success, true);
    assert.equal(closureResult.status, 'COMPLETED');
    assert.ok(closureResult.extractedCount > 0);
    assert.match(closureResult.message, /organizational institutional memory/);

    const comparisons = await closureService.getProjectComparisons();
    assert.ok(comparisons.projects.length >= 10);
    assert.ok(comparisons.projects[0].averageDurationDays > 0);
  });

  await t.test('8. Historical Copilot Contract & Natural Language Resolution', async () => {
    const response = await benchmarkService.getBenchmark({
      question: 'How long does compressor foundation excavation usually take?',
    });

    assert.equal(response.filters.activityType, 'FOUNDATION_EXCAVATION');
    assert.ok(response.sampleCount > 0);
    assert.ok(response.statistics.medianDays > 0);
    assert.ok(response.statistics.p25Days <= response.statistics.medianDays);
    assert.ok(response.evidence.length > 0);
    assert.ok(response.evidence[0].documentExcerpt.includes('.pdf'));
  });
});
