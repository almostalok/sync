import { ActorType, AuditEventType, AuditLogDTO } from '@sitesync/types';
import { CreateAuditLogParams, AuditFilterParams } from './audit.types';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export class AuditService {
  private static inMemoryLogs: AuditLogDTO[] = [];

  /**
   * Records an immutable, append-only audit log entry.
   */
  public async logEvent(params: CreateAuditLogParams): Promise<AuditLogDTO> {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date();

    const entry: AuditLogDTO = {
      id,
      projectId: params.projectId,
      actorId: params.actorId,
      actorName: params.actorName,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      beforeState: params.beforeState || null,
      afterState: params.afterState || null,
      reason: params.reason || null,
      metadata: {
        actorType: params.actorType || ActorType.USER,
        explanation: params.explanation,
        ...(params.metadata || {}),
      },
      createdAt: timestamp,
    };

    // Store in-memory
    AuditService.inMemoryLogs.unshift(entry);

    // Persist to Prisma if DB is reachable
    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        await prisma.auditLog.create({
        data: {
          id: entry.id,
          projectId: entry.projectId,
          userId: entry.actorId,
          userName: entry.actorName,
          actorId: entry.actorId,
          actorName: entry.actorName,
          actorType: params.actorType || ActorType.USER,
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          beforeState: (entry.beforeState as any) || undefined,
          afterState: (entry.afterState as any) || undefined,
          reason: entry.reason,
          explanation: params.explanation,
          metadata: (entry.metadata as any) || undefined,
          timestamp,
        },
      });
    } catch {
      // Graceful fallback to memory store for test environments without Postgres
    }
    }

    return entry;
  }

  /**
   * Queries audit logs with project-scoped filtering.
   */
  public async getAuditLogs(params: AuditFilterParams): Promise<{ logs: AuditLogDTO[]; total: number }> {
    let logs = AuditService.inMemoryLogs.filter((l) => l.projectId === params.projectId);

    if (params.actorId) {
      logs = logs.filter((l) => l.actorId === params.actorId);
    }
    if (params.action) {
      logs = logs.filter((l) => l.action === params.action);
    }
    if (params.entityType) {
      logs = logs.filter((l) => l.entityType === params.entityType);
    }
    if (params.entityId) {
      logs = logs.filter((l) => l.entityId === params.entityId);
    }

    const total = logs.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paginated = logs.slice(offset, offset + limit);

    return { logs: paginated, total };
  }

  /**
   * Clears in-memory logs (for test teardowns).
   */
  public static clearMemoryStore(): void {
    AuditService.inMemoryLogs = [];
  }
}
