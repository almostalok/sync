import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSyntheticProject } from '../src/lib/data/syntheticGenerator';
import { DataIntegrityService } from '../apps/api/src/modules/integrity/data-integrity.service';
import { Activity, Dependency, ProgressUpdate } from '@/types/domain';
import { ActivityStatus } from '@sitesync/types';

test('SiteSync Data Integrity & Orphan Detection Test Suite (Master Prompt 12)', async (t) => {
  const integrityService = new DataIntegrityService();
  const synthetic = generateSyntheticProject();

  await t.test('1. Baseline Referential Integrity Audit Passes for Canonical Synthetic Project', () => {
    const report = integrityService.auditProjectIntegrity({
      projectId: synthetic.project.id,
      activities: synthetic.activities,
      wbsNodes: synthetic.wbsNodes,
      dependencies: synthetic.dependencies,
      reports: synthetic.fieldReports,
      progressUpdates: [],
    });

    assert.equal(report.isHealthy, true);
    assert.equal(report.violationsCount, 0);
    assert.equal(report.qualityScorePercentage, 100);
    assert(report.totalChecks > 100);
  });

  await t.test('2. Detects Orphaned Activity Referencing Missing WBS Node', () => {
    const corruptedActivities: Activity[] = [
      ...synthetic.activities,
      {
        id: 'ACT-ORPHAN-001',
        projectId: synthetic.project.id,
        wbsNodeId: 'WBS-NON-EXISTENT-999',
        activityCode: 'CIV-ORPHAN-01',
        name: 'Trenching without WBS',
        description: 'Trenching without WBS',
        wbsPath: '1.0 > 1.1',
        discipline: 'CIVIL',
        location: 'Compressor Area',
        plannedStart: '2026-09-01',
        plannedFinish: '2026-09-10',
        plannedDuration: 9,
        plannedProgress: 0.5,
        actualProgress: 0.5,
        status: 'IN_PROGRESS',
        varianceDays: 0,
        updatedAt: new Date().toISOString(),
      },
    ];

    const report = integrityService.auditProjectIntegrity({
      projectId: synthetic.project.id,
      activities: corruptedActivities,
      wbsNodes: synthetic.wbsNodes,
      dependencies: synthetic.dependencies,
      reports: synthetic.fieldReports,
      progressUpdates: [],
    });

    assert.equal(report.isHealthy, false);
    assert(report.violationsCount >= 1);
    const violation = report.orphanedEntities.find((e) => e.entityId === 'ACT-ORPHAN-001');
    assert(violation !== undefined);
    assert.equal(violation.missingReferenceType, 'WBSNode');
    assert.equal(violation.missingReferenceId, 'WBS-NON-EXISTENT-999');
  });

  await t.test('3. Detects Broken Dependency With Non-Existent Predecessor', () => {
    const corruptedDependencies: Dependency[] = [
      ...synthetic.dependencies,
      {
        id: 'DEP-ORPHAN-001',
        projectId: synthetic.project.id,
        predecessorId: 'ACT-NON-EXISTENT-PRED',
        successorId: synthetic.activities[0].id,
        dependencyType: 'FS',
        lag: 0,
      },
    ];

    const report = integrityService.auditProjectIntegrity({
      projectId: synthetic.project.id,
      activities: synthetic.activities,
      wbsNodes: synthetic.wbsNodes,
      dependencies: corruptedDependencies,
      reports: synthetic.fieldReports,
      progressUpdates: [],
    });

    assert.equal(report.isHealthy, false);
    const depViolation = report.orphanedEntities.find((e) => e.entityId === 'DEP-ORPHAN-001');
    assert(depViolation !== undefined);
    assert.equal(depViolation.missingReferenceType, 'PredecessorActivity');
  });

  await t.test('4. Detects Orphaned ProgressUpdate Referencing Deleted Activity', () => {
    const ghostProgressUpdates: ProgressUpdate[] = [
      {
        id: 'PROG-ORPHAN-001',
        activityId: 'ACT-DELETED-999',
        activityCode: 'CIV-DELETED-999',
        eventId: 'EVT-001',
        progress: 0.8,
        previousProgress: 0.0,
        status: ActivityStatus.IN_PROGRESS,
        effectiveDate: '2026-09-12',
        sourceReport: 'DPR-001',
        verifiedBy: 'Chief Planner Baruah',
        verifiedAt: new Date().toISOString(),
      },
    ];

    const report = integrityService.auditProjectIntegrity({
      projectId: synthetic.project.id,
      activities: synthetic.activities,
      wbsNodes: synthetic.wbsNodes,
      dependencies: synthetic.dependencies,
      reports: synthetic.fieldReports,
      progressUpdates: ghostProgressUpdates,
    });

    assert.equal(report.isHealthy, false);
    const progViolation = report.orphanedEntities.find((e) => e.entityId === 'PROG-ORPHAN-001');
    assert(progViolation !== undefined);
    assert.equal(progViolation.missingReferenceType, 'TargetActivity');
  });
});
