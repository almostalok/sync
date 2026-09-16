import {
  DomainEvent,
  DomainEventType,
  ErrorClassification,
  JobState,
  OutboxEntry,
  ProcessedEvent,
  DeadLetterJob,
  ActorType,
} from './domain-events';

export type DomainEventHandler = (event: DomainEvent) => void | Promise<void>;

export interface EmitEventOptions {
  actorId?: string;
  actorType?: ActorType;
  aggregateType?: string;
  aggregateId?: string;
  correlationId?: string;
  causationId?: string;
}

export class EventBusService {
  private static instance: EventBusService;
  private handlers: Map<string, Set<DomainEventHandler>> = new Map();
  private eventHistory: DomainEvent[] = [];
  private outbox: OutboxEntry[] = [];
  private processedEvents: Map<string, ProcessedEvent> = new Map(); // key: `${consumer}:${eventId}`
  private deadLetterQueue: DeadLetterJob[] = [];
  private idempotencyRegistry: Set<string> = new Set(); // deduplicates incoming eventIds

  public static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService();
    }
    return EventBusService.instance;
  }

  public subscribe(eventType: string, handler: DomainEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Emits a standard DomainEvent into the system, persisting it in the outbox
   * and delivering it synchronously to in-memory subscribers.
   */
  public emit(
    eventType: string,
    projectId: string,
    payload: Record<string, unknown>,
    options?: EmitEventOptions
  ): DomainEvent {
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const correlationId = options?.correlationId || `corr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const domainEvent: DomainEvent = {
      eventId,
      eventType,
      projectId,
      actorId: options?.actorId || 'SYSTEM',
      actorType: options?.actorType || 'SYSTEM',
      aggregateType: options?.aggregateType || 'Project',
      aggregateId: options?.aggregateId || projectId,
      occurredAt: now,
      correlationId,
      causationId: options?.causationId,
      payload,
      // Backwards-compatible aliases
      id: eventId,
      type: eventType,
      timestamp: now,
    };

    return this.publishEvent(domainEvent);
  }

  /**
   * Publishes an already formed DomainEvent (idempotency guarded).
   */
  public publishEvent(event: DomainEvent): DomainEvent {
    // 1. Idempotency Check: Don't process duplicate eventIds
    if (this.idempotencyRegistry.has(event.eventId)) {
      const existing = this.eventHistory.find((e) => e.eventId === event.eventId);
      if (existing) return existing;
    }
    this.idempotencyRegistry.add(event.eventId);

    // 2. Outbox entry creation (ensures durability before delivery)
    const outboxEntry: OutboxEntry = {
      id: `outbox-${event.eventId}`,
      eventId: event.eventId,
      projectId: event.projectId,
      eventType: event.eventType,
      correlationId: event.correlationId,
      payload: JSON.stringify(event.payload),
      status: 'PENDING',
      retryCount: 0,
      maxRetries: 3,
      createdAt: event.occurredAt,
    };
    this.outbox.unshift(outboxEntry);
    if (this.outbox.length > 1000) this.outbox.pop();

    // 3. Store event in history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 1000) {
      this.eventHistory.pop();
    }

    // 4. Dispatch to subscribers
    const specificHandlers = this.handlers.get(event.eventType);
    if (specificHandlers) {
      specificHandlers.forEach(async (h) => {
        try {
          await h(event);
        } catch (err: any) {
          console.error(`[EventBus] Error in handler for ${event.eventType}:`, err);
          this.handleConsumerError(event, 'SpecificHandler', err);
        }
      });
    }

    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(async (h) => {
        try {
          await h(event);
        } catch (err: any) {
          console.error(`[EventBus] Error in wildcard handler for ${event.eventType}:`, err);
          this.handleConsumerError(event, 'WildcardHandler', err);
        }
      });
    }

    outboxEntry.status = 'DISPATCHED';
    outboxEntry.dispatchedAt = new Date().toISOString();

    return event;
  }

  /**
   * Check if a consumer has already processed this event (Consumer Deduplication).
   */
  public hasProcessed(consumer: string, eventId: string): boolean {
    return this.processedEvents.has(`${consumer}:${eventId}`);
  }

  /**
   * Mark an event as processed by a specific consumer.
   */
  public markProcessed(consumer: string, eventId: string, correlationId: string): void {
    this.processedEvents.set(`${consumer}:${eventId}`, {
      eventId,
      consumer,
      correlationId,
      processedAt: new Date().toISOString(),
    });
  }

  /**
   * Route failed processing to Dead Letter Queue if classified as permanent or retries exhausted.
   */
  public handleConsumerError(event: DomainEvent, consumer: string, error: any): void {
    const isValidationOrPermanent =
      error?.name === 'ValidationError' ||
      error?.message?.includes('Validation') ||
      error?.message?.includes('Unauthorized');

    const classification = isValidationOrPermanent
      ? ErrorClassification.VALIDATION
      : ErrorClassification.TRANSIENT;

    this.deadLetterQueue.unshift({
      jobId: `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      queueName: consumer,
      correlationId: event.correlationId,
      errorClassification: classification,
      errorMessage: error?.message || String(error),
      stackTrace: error?.stack,
      payload: event,
      attempts: 1,
      failedAt: new Date().toISOString(),
    });

    if (this.deadLetterQueue.length > 500) {
      this.deadLetterQueue.pop();
    }
  }

  public getDeadLetterQueue(): DeadLetterJob[] {
    return [...this.deadLetterQueue];
  }

  public getOutboxEntries(status?: 'PENDING' | 'DISPATCHED' | 'FAILED'): OutboxEntry[] {
    if (status) {
      return this.outbox.filter((e) => e.status === status);
    }
    return [...this.outbox];
  }

  public getHistory(projectId?: string): DomainEvent[] {
    if (projectId) {
      return this.eventHistory.filter((e) => e.projectId === projectId);
    }
    return [...this.eventHistory];
  }

  public clear(): void {
    this.eventHistory = [];
    this.outbox = [];
    this.processedEvents.clear();
    this.deadLetterQueue = [];
    this.idempotencyRegistry.clear();
  }
}

export * from './domain-events';
