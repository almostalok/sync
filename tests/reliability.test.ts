import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CircuitBreakerService,
  CircuitState,
  ConcurrencyLockService,
} from '../apps/api/src/modules/resilience';
import { EventBusService } from '../apps/api/src/modules/events/event-bus.service';
import { DomainEventType, ErrorClassification } from '../apps/api/src/modules/events/domain-events';

test('SiteSync Reliability, Fault Tolerance & Concurrency Suite (Master Prompt 12)', async (t) => {
  const circuitBreaker = new CircuitBreakerService();
  const concurrencyService = new ConcurrencyLockService();
  const eventBus = EventBusService.getInstance();

  await t.test('1. Circuit Breaker: State Transition from CLOSED to OPEN on Failure Threshold', async () => {
    const serviceName = 'ExternalLLMProvider';
    CircuitBreakerService.reset(serviceName);

    assert.equal(circuitBreaker.getState(serviceName), CircuitState.CLOSED);

    // Fail 3 times (default threshold is 3)
    for (let i = 1; i <= 3; i++) {
      const res = await circuitBreaker.execute(
        serviceName,
        async () => {
          throw new Error('LLM Provider Gateway Timeout (504)');
        },
        () => 'FALLBACK_DETERMINISTIC_RESPONSE'
      );
      assert.equal(res, 'FALLBACK_DETERMINISTIC_RESPONSE');
    }

    // Circuit should now be tripped to OPEN
    assert.equal(circuitBreaker.getState(serviceName), CircuitState.OPEN);
  });

  await t.test('2. Circuit Breaker: Fast-Fails Without Calling Primary Operation When OPEN', async () => {
    const serviceName = 'ExternalLLMProvider';
    let primaryCalled = false;

    const res = await circuitBreaker.execute(
      serviceName,
      async () => {
        primaryCalled = true;
        return 'PRIMARY_RESPONSE';
      },
      () => 'FALLBACK_FAST_FAIL'
    );

    assert.equal(primaryCalled, false, 'Should not invoke failing primary operation while OPEN');
    assert.equal(res, 'FALLBACK_FAST_FAIL');
  });

  await t.test('3. Optimistic Concurrency Control & Race Condition Prevention', () => {
    ConcurrencyLockService.clear();
    const matchId = 'match-case-001';

    const v1 = ConcurrencyLockService.getVersion(matchId);
    assert.equal(v1, 1);

    // Planner A accepts match at v1 -> updates to v2
    const plannerAAction = concurrencyService.executeWithOptimisticLock(matchId, 1, (newV) => ({
      decision: 'ACCEPTED',
      version: newV,
    }));
    assert.equal(plannerAAction.success, true);
    assert.equal(plannerAAction.newVersion, 2);

    // Planner B simultaneously tries to reject match at stale v1 -> CONFLICT
    assert.throws(
      () => {
        concurrencyService.executeWithOptimisticLock(matchId, 1, (newV) => ({
          decision: 'REJECTED',
          version: newV,
        }));
      },
      (err: any) => err.message.includes('CONCURRENCY_CONFLICT')
    );
  });

  await t.test('4. Dead Letter Queue & Error Classification', () => {
    eventBus.clear();
    const mockEvent = {
      eventId: 'evt-job-fail-002',
      eventType: DomainEventType.FIELD_REPORT_CREATED,
      projectId: 'PROJ-OIL-2026-01',
      actorType: 'SYSTEM' as const,
      aggregateType: 'FieldReport',
      aggregateId: 'rep-001',
      occurredAt: new Date().toISOString(),
      correlationId: 'corr-fail-test',
      payload: {},
    };

    // Route permanent validation failure
    eventBus.handleConsumerError(mockEvent, 'ReportIngestionWorker', new Error('ValidationError: Malformed DPR PDF'));

    const dlq = eventBus.getDeadLetterQueue();
    assert.equal(dlq.length, 1);
    assert.equal(dlq[0].errorClassification, ErrorClassification.VALIDATION);
    assert.equal(dlq[0].queueName, 'ReportIngestionWorker');
  });

  await t.test('5. Consumer Idempotency & Deduplication', () => {
    const consumer = 'ForecastingCoordinatorConsumer';
    const eventId = 'evt-unique-broadcast-100';
    const correlationId = 'corr-broadcast-100';

    assert.equal(eventBus.hasProcessed(consumer, eventId), false);
    eventBus.markProcessed(consumer, eventId, correlationId);
    assert.equal(eventBus.hasProcessed(consumer, eventId), true);
  });
});
