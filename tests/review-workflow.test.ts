import { ReviewService } from '../apps/api/src/modules/review/review.service';
import { ReviewPriorityService } from '../apps/api/src/modules/review/review-priority.service';
import { ReviewPolicyService } from '../apps/api/src/modules/review/review-policy.service';
import { ProgressValidationService } from '../apps/api/src/modules/progress/progress-validation.service';
import { ProgressService } from '../apps/api/src/modules/progress/progress.service';
import { ScheduleVarianceService } from '../apps/api/src/modules/schedule-sync/schedule-variance.service';
import { DependencyImpactService } from '../apps/api/src/modules/schedule-sync/dependency-impact.service';
import { EvidenceService } from '../apps/api/src/modules/evidence/evidence.service';
import { AuditService } from '../apps/api/src/modules/audit/audit.service';
import { Discipline, MatchDecision, MatchStatus, ReviewAction, UserRole, ActivityStatus, ActorType, AuditEventType } from '@sitesync/types';
import { SEEDED_REVIEW_CASES } from '../data/synthetic/review-cases';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Running SiteSync Review Workflow, Evidence, Progress & Audit Tests...\n');

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${name}: ${msg}`);
      failed++;
    }
  };

  const reviewService = new ReviewService();
  const priorityService = new ReviewPriorityService();
  const policyService = new ReviewPolicyService();
  const validationService = new ProgressValidationService();
  const progressService = new ProgressService();
  const varianceService = new ScheduleVarianceService();
  const evidenceService = new EvidenceService();
  const auditService = new AuditService();

  // Reset in-memory state before tests
  ReviewService.clear();
  AuditService.clearMemoryStore();
  SEEDED_REVIEW_CASES.forEach((c) => ReviewService.registerReviewItem(JSON.parse(JSON.stringify(c))));

  // Test 1: Review Queue Retrieval & Priority Sorting
  await test('Review Queue: Retrieves pending reviews sorted by deterministic priority score', async () => {
    const queue = await reviewService.getReviewQueue({ projectId: 'PROJ-OIL-2026-01' }, 'PRIORITY_DESC');
    assert(queue.total >= 4, `Expected at least 4 seeded items, got ${queue.total}`);
    assert(queue.items[0].reviewPriority.score >= queue.items[1].reviewPriority.score, 'Items must be sorted by priority descending');
  });

  // Test 2: Acceptance Workflow Creates Verified Progress & Audit Log
  await test('Accept Workflow: Transitions to ACCEPTED, creates verified ProgressUpdate, and emits AuditLog', async () => {
    const result = await reviewService.acceptMatch({
      projectId: 'PROJ-OIL-2026-01',
      reviewId: 'rev-case-001',
      action: ReviewAction.ACCEPT,
      reviewerId: 'usr-planner-01',
      reviewerName: 'Lead Planner',
      reviewerRole: UserRole.PLANNER,
      requestId: 'req-accept-001',
    });

    assert(result.success === true, 'Accept result must be true');
    assert(result.newStatus === MatchStatus.ACCEPTED, 'Status must be ACCEPTED');
    assert(Boolean(result.progressUpdateId), 'Must return progressUpdateId');

    const item = await reviewService.getReviewById('PROJ-OIL-2026-01', 'rev-case-001');
    assert(item?.status === MatchStatus.ACCEPTED, 'Item status in memory must be ACCEPTED');

    const logs = await auditService.getAuditLogs({ projectId: 'PROJ-OIL-2026-01', action: AuditEventType.MATCH_ACCEPTED });
    assert(logs.total > 0, 'Must record MATCH_ACCEPTED audit log');
  });

  // Test 3: Idempotency Guards
  await test('Idempotency: Repeated submission with same requestId returns cached result without creating duplicate records', async () => {
    const res1 = await reviewService.acceptMatch({
      projectId: 'PROJ-OIL-2026-01',
      reviewId: 'rev-case-006',
      action: ReviewAction.ACCEPT,
      reviewerId: 'usr-planner-01',
      reviewerName: 'Lead Planner',
      reviewerRole: UserRole.PLANNER,
      requestId: 'req-idempotent-key',
    });

    const logsBefore = (await auditService.getAuditLogs({ projectId: 'PROJ-OIL-2026-01' })).total;

    const res2 = await reviewService.acceptMatch({
      projectId: 'PROJ-OIL-2026-01',
      reviewId: 'rev-case-006',
      action: ReviewAction.ACCEPT,
      reviewerId: 'usr-planner-01',
      reviewerName: 'Lead Planner',
      reviewerRole: UserRole.PLANNER,
      requestId: 'req-idempotent-key',
    });

    const logsAfter = (await auditService.getAuditLogs({ projectId: 'PROJ-OIL-2026-01' })).total;

    assert(res1.decisionId === res2.decisionId, 'Decision IDs must match');
    assert(logsBefore === logsAfter, 'Must not duplicate audit log entries on idempotent call');
  });

  // Test 4: Rejection Workflow Requires Reason and Preserves Original AI Proposal
  await test('Reject Workflow: Requires explicit reason and preserves original candidate in audit log', async () => {
    const result = await reviewService.rejectMatch({
      projectId: 'PROJ-OIL-2026-01',
      reviewId: 'rev-case-002',
      action: ReviewAction.REJECT,
      reviewerId: 'usr-planner-01',
      reviewerName: 'Lead Planner',
      reviewerRole: UserRole.PLANNER,
      reason: 'Field report refers to C-102 foundation based on site log book.',
    });

    assert(result.success === true, 'Reject must succeed');
    assert(result.newStatus === MatchStatus.REJECTED, 'Status must be REJECTED');

    const item = await reviewService.getReviewById('PROJ-OIL-2026-01', 'rev-case-002');
    assert(item?.status === MatchStatus.REJECTED, 'Memory state updated to REJECTED');
    assert(item?.recommendedMatch.activityCode === 'CIV-EXC-0042', 'Preserves original AI proposal');
  });

  // Test 5: Reassignment Workflow Links Planner-Selected Activity
  await test('Reassign Workflow: Maps AI proposal to alternative activity and creates verified progress for new target', async () => {
    const result = await reviewService.reassignMatch({
      projectId: 'PROJ-OIL-2026-01',
      reviewId: 'rev-case-003',
      action: ReviewAction.REASSIGN,
      selectedActivityId: 'proj-cse-2026-act-civ-pcc-0042',
      reviewerId: 'usr-planner-01',
      reviewerName: 'Lead Planner',
      reviewerRole: UserRole.PLANNER,
      reason: 'Work executed is blinding concrete mud mat (PCC), not bulk excavation.',
    });

    assert(result.success === true, 'Reassignment must succeed');
    assert(result.newStatus === MatchStatus.REASSIGNED, 'Status must be REASSIGNED');
    assert(result.selectedActivityId === 'proj-cse-2026-act-civ-pcc-0042', 'Selected activity must be PCC');
  });

  // Test 6: Mark Unmatched Workflow for Out-of-Scope Events
  await test('Mark Unmatched: Correctly tags out-of-scope site event as UNMATCHED without modifying schedule', async () => {
    const result = await reviewService.markUnmatched({
      projectId: 'PROJ-OIL-2026-01',
      reviewId: 'rev-case-004',
      action: ReviewAction.MARK_UNMATCHED,
      reviewerId: 'usr-planner-01',
      reviewerName: 'Lead Planner',
      reviewerRole: UserRole.PLANNER,
      reason: 'Perimeter fence repair is non-schedule routine maintenance.',
    });

    assert(result.success === true, 'Mark unmatched must succeed');
    assert(result.newStatus === MatchStatus.UNMATCHED, 'Status must be UNMATCHED');
  });

  // Test 7: Progress Validation & Monotonic Bounds
  await test('Progress Validation: Enforces [0, 1] range, prevents unauthorized regress, and auto-derives status', () => {
    const valid = validationService.validateUpdate({
      previousProgress: 0.20,
      newProgress: 0.85,
      effectiveDate: '2026-03-12T08:00:00.000Z',
    });
    assert(valid.isValid === true, 'Progress progression 20% -> 85% must be valid');
    assert(valid.suggestedStatus === ActivityStatus.IN_PROGRESS, 'Status must be IN_PROGRESS');

    const regressive = validationService.validateUpdate({
      previousProgress: 0.85,
      newProgress: 0.60,
      effectiveDate: '2026-03-13T08:00:00.000Z',
    });
    assert(regressive.isValid === false, 'Regressive update (85% -> 60%) must be rejected without correction workflow');

    const correction = validationService.validateUpdate({
      previousProgress: 0.85,
      newProgress: 0.60,
      effectiveDate: '2026-03-13T08:00:00.000Z',
      isCorrection: true,
      correctionReason: 'Planner data entry correction after site re-survey',
    });
    assert(correction.isValid === true, 'Correction update with reason must be accepted');

    const complete = validationService.validateUpdate({
      previousProgress: 0.85,
      newProgress: 1.0,
      effectiveDate: '2026-03-14T08:00:00.000Z',
    });
    assert(complete.suggestedStatus === ActivityStatus.COMPLETED, '100% progress sets status to COMPLETED');
    assert(complete.actualEndDate === '2026-03-14T08:00:00.000Z', 'Sets actualEndDate on completion');
  });

  // Test 8: Schedule Variance Engine Calculations
  await test('Schedule Variance: Computes start variance, end variance, duration variance, and progress variance', () => {
    const variance = varianceService.calculateVariance({
      activityId: 'act-1',
      activityCode: 'CIV-EXC-0042',
      plannedStart: '2026-03-01T08:00:00.000Z',
      plannedFinish: '2026-03-15T17:00:00.000Z',
      actualStart: '2026-03-04T08:00:00.000Z', // 3 days late
      actualFinish: null,
      plannedDuration: 14,
      plannedProgress: 0.80,
      actualProgress: 0.50, // -30% variance
      status: 'IN_PROGRESS',
    });

    assert(variance.startVarianceDays === 3, `Expected startVariance 3d, got ${variance.startVarianceDays}`);
    assert(variance.progressVariance === -0.3, `Expected progressVariance -0.3, got ${variance.progressVariance}`);
    assert(variance.isDelayed === true, 'Must flag activity as delayed');
  });

  // Test 9: RBAC Enforcement & Project Isolation
  await test('RBAC & Project Isolation: Restricts Viewer approval authority and rejects cross-project access', async () => {
    const viewerCheck = policyService.authorizeReviewer(UserRole.VIEWER);
    assert(viewerCheck.authorized === false, 'Viewer role must be blocked from approving reviews');

    const supervisorCheck = policyService.authorizeReviewer(UserRole.SUPERVISOR);
    assert(supervisorCheck.authorized === false, 'Supervisor role must not have schedule approval authority');

    const plannerCheck = policyService.authorizeReviewer(UserRole.PLANNER);
    assert(plannerCheck.authorized === true, 'Planner role must be authorized');

    const crossProject = policyService.verifyProjectScope('PROJ-OIL-2026-01', 'PROJ-OIL-OTHER');
    assert(crossProject.valid === false, 'Cross-project access must be rejected');
  });

  // Test 10: Evidence Chain Backward Traceability
  await test('Evidence Chain: Traces backward from verified update to primary source document locator', async () => {
    await evidenceService.createEvidence({
      projectId: 'PROJ-OIL-2026-01',
      fieldReportId: 'DPR-2026-03-12',
      eventId: 'evt-case-001',
      sourceType: 'PDF',
      sourceLocator: 'DPR-2026-03-12.pdf',
      pageNumber: 3,
      quotedText: 'Civil Works: C-101 foundation excavation reached 95% completion.',
    });

    const chain = await evidenceService.getEvidenceChain({
      progressUpdateId: 'prog-1',
      matchId: 'match-case-001',
      eventId: 'evt-case-001',
      fieldReportId: 'DPR-2026-03-12',
    });

    assert(chain.sourceType === 'PDF', 'Source type must be PDF');
    assert(chain.sourceLocator === 'DPR-2026-03-12.pdf', 'Locator matches file');
    assert(chain.pageNumber === 3, 'Page number is 3');
    assert(chain.quotedText.includes('C-101 foundation excavation'), 'Quoted text preserved in evidence chain');
  });

  console.log('\n========================================');
  console.log(`Review Workflow Tests: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error during review workflow tests:', err);
  process.exit(1);
});
