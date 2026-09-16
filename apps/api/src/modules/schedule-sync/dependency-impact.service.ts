import { DependencyImpactDTO, Discipline } from '@sitesync/types';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export class DependencyImpactService {
  /**
   * Traverses the project dependency graph to calculate potential downstream schedule impacts.
   */
  public async calculateDownstreamImpact(params: {
    projectId: string;
    activityId: string;
    activityCode: string;
    activityName: string;
    status: string;
    isCritical?: boolean;
    varianceDays?: number;
  }): Promise<DependencyImpactDTO> {
    const varianceDays = params.varianceDays || 0;
    const isCritical = params.isCritical || false;

    const successors: Array<{
      activityId: string;
      activityCode: string;
      activityName: string;
      discipline: Discipline;
      dependencyType: string;
      lag: number;
      isCritical: boolean;
      potentialStartDelayDays: number;
    }> = [];

    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        // Find direct downstream dependencies where activityId is predecessor
        const deps = await prisma.dependency.findMany({
          where: { predecessorId: params.activityId },
        });

        if (deps.length > 0) {
          const successorIds = deps.map((d) => d.successorId);
          const succActs = await prisma.activity.findMany({
            where: { id: { in: successorIds } },
          });

          const actMap = new Map(succActs.map((a) => [a.id, a]));

          for (const dep of deps) {
            const succ = actMap.get(dep.successorId);
            if (succ) {
              const potentialDelay = Math.max(0, varianceDays - dep.lag);
              successors.push({
                activityId: succ.id,
                activityCode: succ.activityCode,
                activityName: succ.name,
                discipline: succ.discipline as unknown as Discipline,
                dependencyType: dep.dependencyType,
                lag: dep.lag,
                isCritical: succ.criticalPath,
                potentialStartDelayDays: potentialDelay,
              });
            }
          }
        }
      } catch {
        // In-memory or test environment fallback
      }
    }

    return {
      activityId: params.activityId,
      activityCode: params.activityCode,
      activityName: params.activityName,
      status: params.status,
      isCritical,
      varianceDays,
      affectedSuccessorCount: successors.length,
      successors,
    };
  }
}
