import { ActivityStatus, AuditEventType, ActorType } from '@sitesync/types';
import { ProgressValidationService } from './progress-validation.service';
import { ProgressHistoryService } from './progress-history.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface CreateProgressParams {
  projectId: string;
  activityId: string;
  activityCode: string;
  previousProgress: number;
  newProgress: number;
  effectiveDate: string;
  sourceReportId: string;
  sourceEventId?: string;
  reviewDecisionId?: string;
  evidenceId?: string;
  verifiedBy: string;
  notes?: string;
}

export interface CorrectProgressParams {
  projectId: string;
  activityId: string;
  newProgress: number;
  reason: string;
  correctedBy: string;
  actorRole: string;
}

export class ProgressService {
  private validationService = new ProgressValidationService();
  private auditService = new AuditService();

  /**
   * Creates an authoritative verified progress update.
   */
  public async createVerifiedProgress(params: CreateProgressParams) {
    const validation = this.validationService.validateUpdate({
      previousProgress: params.previousProgress,
      newProgress: params.newProgress,
      effectiveDate: params.effectiveDate,
    });

    if (!validation.isValid) {
      throw new Error(`Progress update validation failed: ${validation.errors.join(', ')}`);
    }

    const id = `prog-${params.activityId}-${Date.now()}`;
    const verifiedAt = new Date().toISOString();

    const entry = {
      id,
      date: params.effectiveDate,
      previousProgress: params.previousProgress,
      newProgress: params.newProgress,
      status: validation.suggestedStatus || ActivityStatus.IN_PROGRESS,
      sourceReport: params.sourceReportId,
      verified: true,
      verifiedBy: params.verifiedBy,
      verifiedAt,
      notes: params.notes,
    };

    // 1. Record in history
    ProgressHistoryService.recordEntry(params.activityId, entry);

    // 2. Persist to Prisma if available
    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        await prisma.progressUpdate.create({
          data: {
            id,
            projectId: params.projectId,
            activityId: params.activityId,
            activityCode: params.activityCode,
            sourceEventId: params.sourceEventId,
            reviewDecisionId: params.reviewDecisionId,
            progress: params.newProgress,
            previousProgress: params.previousProgress,
            newProgress: params.newProgress,
            status: validation.suggestedStatus || ActivityStatus.IN_PROGRESS,
            effectiveDate: new Date(params.effectiveDate),
            reportedDate: new Date(params.effectiveDate),
            actualStartDate: validation.actualStartDate ? new Date(validation.actualStartDate) : undefined,
            actualEndDate: validation.actualEndDate ? new Date(validation.actualEndDate) : undefined,
            sourceReport: params.sourceReportId,
            verified: true,
            verifiedBy: params.verifiedBy,
            verifiedAt: new Date(verifiedAt),
            evidenceId: params.evidenceId,
            notes: params.notes,
          },
        });

        // Update Activity in DB
        await prisma.activity.update({
          where: { id: params.activityId },
          data: {
            actualProgress: params.newProgress,
            status: validation.suggestedStatus || ActivityStatus.IN_PROGRESS,
            actualStart: validation.actualStartDate ? new Date(validation.actualStartDate) : undefined,
            actualFinish: validation.actualEndDate ? new Date(validation.actualEndDate) : undefined,
            lastUpdateDate: new Date(),
          },
        });
      } catch {
        // In-memory fallback
      }
    }

    // 3. Audit trail
    await this.auditService.logEvent({
      projectId: params.projectId,
      actorId: params.verifiedBy,
      actorName: params.verifiedBy,
      actorType: ActorType.USER,
      action: AuditEventType.PROGRESS_CREATED,
      entityType: 'ProgressUpdate',
      entityId: id,
      beforeState: { actualProgress: params.previousProgress },
      afterState: { actualProgress: params.newProgress, status: validation.suggestedStatus },
      explanation: `Verified progress update applied: ${Math.round(params.previousProgress * 100)}% -> ${Math.round(
        params.newProgress * 100
      )}%`,
    });

    return entry;
  }

  /**
   * Executes an authorized progress correction workflow with justification.
   */
  public async correctProgress(params: CorrectProgressParams) {
    if (!['ADMIN', 'PROJECT_MANAGER', 'PLANNER'].includes(params.actorRole)) {
      throw new Error(`Role ${params.actorRole} is not authorized to perform progress corrections.`);
    }

    let currentProgress = 0.0;
    let activityCode = params.activityId;
    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        const act = await prisma.activity.findUnique({ where: { id: params.activityId } });
        if (act) {
          currentProgress = act.actualProgress;
          activityCode = act.activityCode;
        }
      } catch {
        // Fallback
      }
    }

    const validation = this.validationService.validateUpdate({
      previousProgress: currentProgress,
      newProgress: params.newProgress,
      effectiveDate: new Date().toISOString(),
      isCorrection: true,
      correctionReason: params.reason,
    });

    if (!validation.isValid) {
      throw new Error(`Correction validation failed: ${validation.errors.join(', ')}`);
    }

    const id = `prog-corr-${params.activityId}-${Date.now()}`;
    const verifiedAt = new Date().toISOString();

    const entry = {
      id,
      date: verifiedAt,
      previousProgress: currentProgress,
      newProgress: params.newProgress,
      status: validation.suggestedStatus || ActivityStatus.IN_PROGRESS,
      sourceReport: 'AUTHORIZED_CORRECTION',
      verified: true,
      verifiedBy: params.correctedBy,
      verifiedAt,
      notes: `CORRECTION: ${params.reason}`,
    };

    ProgressHistoryService.recordEntry(params.activityId, entry);

    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        await prisma.activity.update({
          where: { id: params.activityId },
          data: {
            actualProgress: params.newProgress,
            status: validation.suggestedStatus || ActivityStatus.IN_PROGRESS,
            lastUpdateDate: new Date(),
          },
        });
      } catch {
        // Fallback
      }
    }

    await this.auditService.logEvent({
      projectId: params.projectId,
      actorId: params.correctedBy,
      actorName: params.correctedBy,
      actorType: ActorType.USER,
      action: AuditEventType.PROGRESS_CORRECTED,
      entityType: 'Activity',
      entityId: params.activityId,
      beforeState: { actualProgress: currentProgress },
      afterState: { actualProgress: params.newProgress, status: validation.suggestedStatus },
      reason: params.reason,
      explanation: `Authorized progress correction applied by ${params.correctedBy}: ${Math.round(
        currentProgress * 100
      )}% -> ${Math.round(params.newProgress * 100)}%. Reason: ${params.reason}`,
    });

    return entry;
  }
}
