import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActivityStatus,
  Discipline,
  GanttZoomLevel,
  ProjectStatus,
  RiskSeverity,
  RiskType,
} from '../packages/types/src';
import { DashboardSummaryService } from '../apps/api/src/modules/dashboard/dashboard-summary.service';
import { ProgressAnalyticsService } from '../apps/api/src/modules/dashboard/progress-analytics.service';
import { DisciplineAnalyticsService } from '../apps/api/src/modules/dashboard/discipline-analytics.service';
import { AttentionService } from '../apps/api/src/modules/dashboard/attention.service';
import { FreshnessService } from '../apps/api/src/modules/dashboard/freshness.service';
import { ScheduleViewService } from '../apps/api/src/modules/dashboard/schedule-view.service';
import { DependencyImpactService } from '../apps/api/src/modules/dashboard/dependency-impact.service';
import { RiskService } from '../apps/api/src/modules/risk/risk.service';
import { DASHBOARD_CONFIG } from '../apps/api/src/modules/dashboard/dashboard-metrics.config';

test('SiteSync Command Center & Risk Engine Suite', async (t) => {
  const projectId = 'PROJ-OIL-2026-01';

  const summaryService = new DashboardSummaryService();
  const progressService = new ProgressAnalyticsService();
  const disciplineService = new DisciplineAnalyticsService();
  const attentionService = new AttentionService();
  const freshnessService = new FreshnessService();
  const scheduleViewService = new ScheduleViewService();
  const dependencyService = new DependencyImpactService();
  const riskService = new RiskService();

  await t.test('1. Dashboard Summary: Duration-Weighted Progress & Executive Metrics', async () => {
    const res = await summaryService.getSummary(projectId);

    assert.ok(res.header, 'Header must be present');
    assert.equal(res.header.projectId, projectId);
    assert.ok(res.header.currentStatus, 'Project status must be calculated deterministically');
    assert.ok(res.header.statusReason.length > 0, 'Status reason must explain status');

    assert.ok(res.metrics, 'Metrics must be present');
    assert.ok(res.metrics.overallProgress > 0 && res.metrics.overallProgress <= 100, 'Overall progress must be between 0 and 100');
    assert.ok(res.metrics.totalActivities > 0, 'Total activities count must be greater than zero');
    assert.ok(res.metrics.verifiedUpdates > 0, 'Verified updates count must be greater than zero');
    assert.ok(res.metrics.calculationMethodology.includes('Weighted Project Progress'), 'Methodology must document weighted progress');

    assert.ok(res.health, 'Health breakdown must be present');
    assert.ok(res.health.total >= res.health.completed + res.health.onTrack + res.health.atRisk + res.health.delayed + res.health.notStarted);
  });

  await t.test('2. Progress S-Curve Time Series Analytics', async () => {
    const res = await progressService.getProgressTimeSeries(projectId);

    assert.equal(res.projectId, projectId);
    assert.ok(res.series.length > 5, 'S-curve series should have multiple time points');

    // First point should be 0 progress
    assert.equal(res.series[0].plannedProgress, 0);

    // Points should be monotonically increasing in planned progress
    for (let i = 1; i < res.series.length; i++) {
      assert.ok(
        res.series[i].plannedProgress >= res.series[i - 1].plannedProgress,
        'Planned progress must be non-decreasing'
      );
    }
  });

  await t.test('3. Discipline Performance Analytics', async () => {
    const res = await disciplineService.getDisciplinePerformance(projectId);

    assert.equal(res.projectId, projectId);
    assert.ok(res.disciplines.length >= 5, 'Should include all primary engineering disciplines');

    const civil = res.disciplines.find((d) => d.discipline === Discipline.CIVIL);
    assert.ok(civil, 'Civil discipline must be present');
    assert.ok(civil!.activityCount > 0, 'Civil activity count must be positive');
    assert.ok(civil!.actualProgress > 0, 'Civil actual progress must be computed');

    const electrical = res.disciplines.find((d) => d.discipline === Discipline.ELECTRICAL);
    assert.ok(electrical, 'Electrical discipline must be present');
    assert.ok(typeof electrical!.variancePercentage === 'number', 'Variance percentage must be a number');
  });

  await t.test('4. Attention Required: Priorities and Unmatched Events', async () => {
    const res = await attentionService.getAttentionRequired(projectId);

    assert.equal(res.projectId, projectId);
    assert.ok(res.totalReviewCount > 0, 'Review count should be positive');
    assert.equal(
      res.totalReviewCount,
      res.priorityBreakdown.high + res.priorityBreakdown.medium + res.priorityBreakdown.low,
      'Total review count must match sum of priority buckets'
    );
    assert.ok(res.unmatchedCount > 0, 'Unmatched count should be positive');
    assert.ok(res.staleActivitiesCount >= 0, 'Stale count should be non-negative');
    assert.equal(res.staleThresholdHours, DASHBOARD_CONFIG.STALE_AFTER_HOURS);
  });

  await t.test('5. Operational Data Freshness', async () => {
    const res = await freshnessService.getDataFreshness(projectId);

    assert.equal(res.projectId, projectId);
    assert.ok(res.lastFieldUpdate !== null, 'Last field update timestamp must be recorded');
    assert.ok(res.freshnessPercentage >= 0 && res.freshnessPercentage <= 100, 'Freshness must be percentage');
    assert.ok(res.statusLabel.length > 0, 'Status label must be formatted');
  });

  await t.test('6. Deterministic Risk Rule: SCHEDULE_DELAY', () => {
    const risks = riskService.evaluateActivityRisks({
      projectId,
      activityId: 'ACT-TEST-01',
      activityCode: 'CIV-EXC-042',
      activityName: 'Compressor Foundation Excavation',
      discipline: Discipline.CIVIL,
      plannedStart: '2026-09-10',
      plannedEnd: '2026-09-14',
      actualStart: '2026-09-14',
      plannedDuration: 4,
      plannedProgress: 1.0,
      actualProgress: 0.85,
      status: ActivityStatus.IN_PROGRESS,
      varianceDays: 4,
      isCritical: true,
      successorCount: 4,
    });

    const delayRisk = risks.find((r) => r.riskType === RiskType.SCHEDULE_DELAY);
    assert.ok(delayRisk, 'SCHEDULE_DELAY risk must be triggered');
    assert.equal(delayRisk!.severity, RiskSeverity.CRITICAL, 'Critical path 4-day delay must be CRITICAL severity');
    assert.ok(delayRisk!.score >= 70, 'Score should reflect critical severity');
    assert.ok(delayRisk!.factors.length >= 3, 'Must provide structured explainable factors');

    // Verify 5 Explanation Questions
    assert.ok(delayRisk!.explanation.whatHappened.includes('delayed by 4 days'));
    assert.ok(delayRisk!.explanation.whyItMatters.includes('Critical Path'));
    assert.ok(delayRisk!.explanation.evidence.includes('variance of +4 days'));
    assert.equal(delayRisk!.explanation.affectedDownstreamCount, 4);
    assert.ok(delayRisk!.explanation.recommendedAction.length > 0);
  });

  await t.test('7. Deterministic Risk Rule: PROGRESS_LAG', () => {
    const risks = riskService.evaluateActivityRisks({
      projectId,
      activityId: 'ACT-TEST-02',
      activityCode: 'PIP-WLD-101',
      activityName: 'Interconnecting Pipe Rack Welding',
      discipline: Discipline.PIPING,
      plannedStart: '2026-08-15',
      plannedEnd: '2026-09-30',
      plannedDuration: 46,
      plannedProgress: 0.75,
      actualProgress: 0.40, // 35% lag
      status: ActivityStatus.IN_PROGRESS,
      varianceDays: 0,
      isCritical: false,
      successorCount: 2,
    });

    const lagRisk = risks.find((r) => r.riskType === RiskType.PROGRESS_LAG);
    assert.ok(lagRisk, 'PROGRESS_LAG risk must be triggered for 35% lag');
    assert.equal(lagRisk!.severity, RiskSeverity.HIGH, '35% lag should trigger HIGH severity');
    assert.ok(lagRisk!.explanation.whatHappened.includes('lagging behind'));
  });

  await t.test('8. Deterministic Risk Rule: STALE_UPDATE', () => {
    // 72 hours ago
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    const risks = riskService.evaluateActivityRisks({
      projectId,
      activityId: 'ACT-TEST-03',
      activityCode: 'ELE-CBL-005',
      activityName: 'Substation Cable Trench Excavation',
      discipline: Discipline.ELECTRICAL,
      plannedStart: '2026-09-01',
      plannedEnd: '2026-09-20',
      plannedDuration: 19,
      plannedProgress: 0.50,
      actualProgress: 0.45,
      status: ActivityStatus.IN_PROGRESS,
      varianceDays: 0,
      isCritical: false,
      lastUpdateDate: threeDaysAgo,
      successorCount: 1,
    });

    const staleRisk = risks.find((r) => r.riskType === RiskType.STALE_UPDATE);
    assert.ok(staleRisk, 'STALE_UPDATE risk must be triggered when last update > 48h');
    assert.ok(staleRisk!.explanation.whatHappened.includes('IN_PROGRESS but has received no verified DPR updates'));
  });

  await t.test('9. Schedule View: WBS Tree, Zoom, and Server-Side Filtering', async () => {
    const res = await scheduleViewService.getScheduleView(projectId, {
      zoomLevel: GanttZoomLevel.WEEK,
      discipline: Discipline.CIVIL,
    });

    assert.equal(res.projectId, projectId);
    assert.equal(res.zoomLevel, GanttZoomLevel.WEEK);
    assert.ok(res.wbsTree.length > 0, 'WBS tree should contain root nodes');
    assert.ok(res.filteredActivitiesCount > 0, 'Filtered civil activities must be present');

    // Test search filter
    const searchRes = await scheduleViewService.getScheduleView(projectId, {
      search: 'Excavation',
    });
    assert.ok(searchRes.filteredActivitiesCount > 0, 'Search should find activities matching keyword');
  });

  await t.test('10. Activity Detail & Dependency Impact Graph', async () => {
    const detail = await scheduleViewService.getActivityDetail(projectId, 'CIV-EXC-042');
    assert.ok(detail, 'Activity detail should be found');
    assert.ok(detail!.evidenceChain.length > 0, 'Evidence chain should be attached');
    assert.ok(detail!.recentUpdates.length > 0, 'Recent updates should be listed');

    const graph = await dependencyService.getDependencyGraph(projectId, 'CIV-EXC-042');
    assert.ok(graph, 'Dependency graph should be generated');
    assert.ok(graph!.directSuccessors.length >= 0, 'Direct successors should be array');
    assert.ok(graph!.downstreamCascade.length >= 0, 'Downstream cascade should be array');
  });

});
