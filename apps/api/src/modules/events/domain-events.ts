/**
 * SiteSync Canonical Domain Event Catalog & Standards (Master Prompt 11)
 *
 * All domain events emitted within SiteSync conform to the enterprise standard envelope,
 * ensuring complete auditability, correlation tracking, and outbox idempotency.
 */

export enum DomainEventType {
  // Project Lifecycle
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_CLOSING = 'PROJECT_CLOSING',
  PROJECT_COMPLETED = 'PROJECT_COMPLETED',
  PROJECT_ARCHIVED = 'PROJECT_ARCHIVED',

  // Schedule & WBS
  SCHEDULE_IMPORTED = 'SCHEDULE_IMPORTED',
  SCHEDULE_VERSION_CREATED = 'SCHEDULE_VERSION_CREATED',
  SCHEDULE_UPDATED = 'SCHEDULE_UPDATED',

  // Ingestion & Extraction
  FIELD_REPORT_CREATED = 'FIELD_REPORT_CREATED',
  VOICE_REPORT_CREATED = 'VOICE_REPORT_CREATED',
  EXTRACTED_EVENT_CREATED = 'EXTRACTED_EVENT_CREATED',

  // Hybrid Matching & Review
  ACTIVITY_MATCH_CREATED = 'ACTIVITY_MATCH_CREATED',
  MATCH_REVIEW_REQUIRED = 'MATCH_REVIEW_REQUIRED',
  MATCH_ACCEPTED = 'MATCH_ACCEPTED',
  MATCH_REJECTED = 'MATCH_REJECTED',
  MATCH_REASSIGNED = 'MATCH_REASSIGNED',

  // Verified Progress & Schedule Sync
  PROGRESS_VERIFIED = 'PROGRESS_VERIFIED',
  PROGRESS_CORRECTED = 'PROGRESS_CORRECTED',

  // Risk Engine
  RISK_CREATED = 'RISK_CREATED',
  RISK_UPDATED = 'RISK_UPDATED',
  RISK_RESOLVED = 'RISK_RESOLVED',

  // Forecasting
  FORECAST_CREATED = 'FORECAST_CREATED',
  FORECAST_SUPERSEDED = 'FORECAST_SUPERSEDED',
  FORECAST_INVALIDATED = 'FORECAST_INVALIDATED',

  // Historical Outcomes
  HISTORICAL_OUTCOME_CREATED = 'HISTORICAL_OUTCOME_CREATED',

  // Copilot Interactions
  COPILOT_QUERY_CREATED = 'COPILOT_QUERY_CREATED',
}

export type ActorType = 'USER' | 'SYSTEM' | 'AI';

export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  projectId: string;
  actorId?: string;
  actorType: ActorType;
  aggregateType: string;
  aggregateId: string;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  payload: T;

  // Backwards compatibility aliases
  id?: string;
  type?: string;
  timestamp?: string;
}

export enum JobState {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
  DEAD_LETTER = 'DEAD_LETTER',
  CANCELLED = 'CANCELLED',
}

export enum ErrorClassification {
  TRANSIENT = 'TRANSIENT',
  PERMANENT = 'PERMANENT',
  VALIDATION = 'VALIDATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DEPENDENCY = 'DEPENDENCY',
}

export interface OutboxEntry {
  id: string;
  eventId: string;
  projectId: string;
  eventType: string;
  correlationId: string;
  payload: string; // JSON serialized
  status: 'PENDING' | 'DISPATCHED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  createdAt: string;
  dispatchedAt?: string;
}

export interface ProcessedEvent {
  eventId: string;
  consumer: string;
  correlationId: string;
  processedAt: string;
}

export interface DeadLetterJob {
  jobId: string;
  queueName: string;
  correlationId: string;
  errorClassification: ErrorClassification;
  errorMessage: string;
  stackTrace?: string;
  payload: unknown;
  attempts: number;
  failedAt: string;
}
