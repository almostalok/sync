export type DomainEventHandler = (event: DomainEvent) => void | Promise<void>;

export interface DomainEvent {
  id: string;
  type: string;
  projectId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export class EventBusService {
  private static instance: EventBusService;
  private handlers: Map<string, Set<DomainEventHandler>> = new Map();
  private eventHistory: DomainEvent[] = [];

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

  public emit(eventType: string, projectId: string, payload: Record<string, unknown>): DomainEvent {
    const event: DomainEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: eventType,
      projectId,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 500) {
      this.eventHistory.pop();
    }

    // Notify registered handlers
    const specificHandlers = this.handlers.get(eventType);
    if (specificHandlers) {
      specificHandlers.forEach((h) => {
        try {
          h(event);
        } catch (err) {
          console.error(`Error in event handler for ${eventType}:`, err);
        }
      });
    }

    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((h) => {
        try {
          h(event);
        } catch (err) {
          console.error(`Error in wildcard event handler for ${eventType}:`, err);
        }
      });
    }

    return event;
  }

  public getHistory(projectId?: string): DomainEvent[] {
    if (projectId) {
      return this.eventHistory.filter((e) => e.projectId === projectId);
    }
    return [...this.eventHistory];
  }

  public clear(): void {
    this.eventHistory = [];
  }
}
