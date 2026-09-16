import { ActorType, AuditEventType } from '@sitesync/types';

export interface CreateAuditLogParams {
  projectId: string;
  actorId: string;
  actorName: string;
  actorType?: ActorType;
  action: AuditEventType | string;
  entityType: string;
  entityId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  reason?: string | null;
  explanation: string;
  metadata?: Record<string, unknown> | null;
}

export interface AuditFilterParams {
  projectId: string;
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
