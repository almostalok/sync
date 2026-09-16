import { ScheduleVarianceService } from './schedule-variance.service';
import { DependencyImpactService } from './dependency-impact.service';
import { AuditService } from '../audit/audit.service';
import { EventBusService } from '../events/event-bus.service';
import { ActorType, AuditEventType } from '@sitesync/types';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export class ScheduleSyncService {
  private varianceService = new ScheduleVarianceService();
  private impactService = new DependencyImpactService();
  private auditService = new AuditService();
  private eventBus = EventBusService.getInstance();

  /**
   * Synchronizes activity schedule variance and triggers downstream impact calculations.
   */
  public async syncActivitySchedule(params: {
    projectId: string;
    activityId: string;
    actorId?: string;
  }) {
    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        const act = await prisma.activity.findUnique({
          where: { id: params.activityId },
        });

        if (!act) return null;

        const variance = this.varianceService.calculateVariance({
          activityId: act.id,
          activityCode: act.activityCode,
          plannedStart: act.plannedStart,
          plannedFinish: act.plannedFinish,
          actualStart: act.actualStart,
          actualFinish: act.actualFinish,
          plannedDuration: act.plannedDuration,
          actualDuration: act.actualDuration,
          plannedProgress: act.plannedProgress,
          actualProgress: act.actualProgress,
          status: act.status,
        });

        // Update variance on Activity
        await prisma.activity.update({
          where: { id: act.id },
          data: {
            varianceDays: variance.startVarianceDays,
          },
        });

        const impact = await this.impactService.calculateDownstreamImpact({
          projectId: params.projectId,
          activityId: act.id,
          activityCode: act.activityCode,
          activityName: act.name,
          status: act.status,
          isCritical: act.criticalPath,
          varianceDays: variance.startVarianceDays,
        });

        // Audit and Event emission
        await this.auditService.logEvent({
          projectId: params.projectId,
          actorId: params.actorId || 'SYSTEM',
          actorName: params.actorId || 'SiteSync Scheduler',
          actorType: params.actorId ? ActorType.USER : ActorType.SYSTEM,
          action: AuditEventType.SCHEDULE_SYNCHRONIZED,
          entityType: 'Activity',
          entityId: act.id,
          afterState: { varianceDays: variance.startVarianceDays, status: act.status },
          explanation: `Schedule synchronization completed for ${act.activityCode}. Start Variance: ${variance.startVarianceDays}d, Downstream affected: ${impact.affectedSuccessorCount}.`,
        });

        this.eventBus.emit('schedule.updated', params.projectId, {
          activityId: act.id,
          activityCode: act.activityCode,
          variance,
          impact,
        });

        return { variance, impact };
      } catch {
        return null;
      }
    }

    return null;
  }
}
