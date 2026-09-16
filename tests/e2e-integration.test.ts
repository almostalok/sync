import test from 'node:test';
import assert from 'node:assert/strict';
import { EndToEndPipelineService } from '../apps/api/src/modules/pipeline/e2e-pipeline.service';
import { EventBusService } from '../apps/api/src/modules/events/event-bus.service';
import { DomainEventType, ErrorClassification } from '../apps/api/src/modules/events/domain-events';

test('SiteSync Master Prompt 11 — End-to-End Integration & Production Hardening Suite', async (t) => {
  const pipeline = new EndToEndPipelineService();
  const eventBus = EventBusService.getInstance();

  await t.test('1. Execute Full 18-Step Canonical Pipeline Orchestration', async () => {
    eventBus.clear();
    const correlationId = `corr-test-golden-${Date.now()}`;
    const result = await pipeline.executeFullPipeline({
      projectId: 'PROJ-OIL-COMP-EXP',
      correlationId,
    });

    // Step 1 & 2: Project Creation & Schedule Import
    assert.equal(result.projectId, 'PROJ-OIL-COMP-EXP');
    assert.equal(result.scheduleImported, true);
    assert(result.activitiesCount > 0, 'Activities must be imported into canonical state');

    // Step 4 & 5: DPR Ingestion & Extraction
    assert(result.extractedEventsCount >= 3, 'Must extract at least 3 execution events from DPR');

    // Step 6 & 7 & 8: Matching & Review Acceptance
    assert.equal(result.matchesEvaluated, 1);
    assert.equal(result.reviewAccepted, true);
    assert(result.verifiedProgressId.length > 0, 'Must produce a verified ProgressUpdate ID');

    // Step 9 & 10: Schedule Variance & Downstream Risk
    assert(result.varianceDays >= 0, 'Schedule variance must be computed');
    assert(result.downstreamAffectedCount >= 1, 'Downstream impact analysis must run');
    assert(result.risksIdentified > 0, 'Risk signals must be identified deterministically');

    // Step 11 & 12: Forecasting & Copilot Grounded Query
    assert(result.forecastCompletionDate.length > 0, 'Forecast completion date must be generated');
    assert(result.copilotScheduleAnswer.length > 0, 'Copilot must provide answer to schedule query');

    // Step 13, 14, 15, 16: Voice Ingestion, Extraction & Follow-up Copilot
    assert(result.voiceEventsExtracted > 0, 'Voice agent must extract structured events');
    assert(result.copilotVoiceAnswer.length > 0, 'Copilot must answer voice-derived query');

    // Step 17 & 18: Project Closure & Historical Extraction
    assert.equal(result.projectClosed, true);
    assert(result.historicalOutcomesCreated > 0, 'Institutional memory must extract historical outcomes');
    assert.equal(result.allStepsSucceeded, true);

    // Timing check
    assert(Object.keys(result.stepTimingsMs).length >= 10, 'Step timings must be recorded');
  });

  await t.test('2. Domain Event Bus & Outbox Pattern Verification', async () => {
    const history = eventBus.getHistory('PROJ-OIL-COMP-EXP');
    assert(history.length >= 8, `Expected at least 8 domain events, got ${history.length}`);

    // Verify standardized envelope fields
    const firstEvent = history[0];
    assert(firstEvent.eventId.startsWith('evt-'), 'eventId must have standard prefix');
    assert(typeof firstEvent.eventType === 'string');
    assert.equal(firstEvent.projectId, 'PROJ-OIL-COMP-EXP');
    assert(firstEvent.occurredAt.length > 0);
    assert(firstEvent.correlationId.length > 0, 'correlationId must be present');

    // Verify Outbox entries
    const outbox = eventBus.getOutboxEntries();
    assert(outbox.length > 0, 'Outbox entries must be stored');
    const dispatched = eventBus.getOutboxEntries('DISPATCHED');
    assert.equal(dispatched.length, outbox.length, 'All synchronous events must be DISPATCHED');
  });

  await t.test('3. Consumer Deduplication & Consumer Idempotency', async () => {
    const consumer = 'RiskEngineConsumer';
    const testEventId = 'evt-test-dedup-001';
    const correlationId = 'corr-dedup-001';

    assert.equal(eventBus.hasProcessed(consumer, testEventId), false);
    eventBus.markProcessed(consumer, testEventId, correlationId);
    assert.equal(eventBus.hasProcessed(consumer, testEventId), true, 'Consumer must register event as processed');
  });

  await t.test('4. Dead Letter Queue & Error Classification', async () => {
    const testEvent = {
      eventId: 'evt-fail-001',
      eventType: DomainEventType.PROGRESS_VERIFIED,
      projectId: 'PROJ-OIL-COMP-EXP',
      actorType: 'SYSTEM' as const,
      aggregateType: 'ProgressUpdate',
      aggregateId: 'prog-001',
      occurredAt: new Date().toISOString(),
      correlationId: 'corr-dlq-001',
      payload: {},
    };

    const validationError = new Error('ValidationError: Progress exceeds 1.0 boundary');
    validationError.name = 'ValidationError';

    eventBus.handleConsumerError(testEvent, 'ScheduleSyncConsumer', validationError);

    const dlq = eventBus.getDeadLetterQueue();
    assert(dlq.length > 0, 'Dead Letter Queue must contain failed job');
    const failedJob = dlq[0];
    assert.equal(failedJob.errorClassification, ErrorClassification.VALIDATION);
    assert.equal(failedJob.queueName, 'ScheduleSyncConsumer');
    assert(failedJob.errorMessage.includes('ValidationError'));
  });

  await t.test('5. Baseline Immutability Invariant (Prompt Section 22)', async () => {
    // Verify that schedule actual updates do not corrupt or mutate planned baseline
    const { ScheduleSyncService } = await import('../apps/api/src/modules/schedule-sync/schedule-sync.service');
    const syncService = new ScheduleSyncService();

    const activityId = 'ACT-CIV-FOUND-01';
    ScheduleSyncService.setInMemoryActivity(activityId, {
      id: activityId,
      activityCode: 'CIV-01',
      name: 'Foundation Pour',
      plannedStart: new Date('2026-09-01'),
      plannedFinish: new Date('2026-09-15'),
      plannedDuration: 14,
      plannedProgress: 0.5,
      actualStart: new Date('2026-09-05'),
      actualProgress: 0.75,
      status: 'IN_PROGRESS',
    });

    const res = await syncService.syncActivitySchedule({
      projectId: 'PROJ-OIL-COMP-EXP',
      activityId,
      newProgress: 0.9,
    });

    const updated = ScheduleSyncService.getInMemoryActivity(activityId);
    assert.equal(updated.actualProgress, 0.9);
    // Baseline start & finish must remain strictly immutable
    assert.equal(new Date(updated.plannedStart).toISOString().slice(0, 10), '2026-09-01');
    assert.equal(new Date(updated.plannedFinish).toISOString().slice(0, 10), '2026-09-15');
    assert(res !== null && res.variance.startVarianceDays > 0);
  });
});
