import {
  ActivityStatus,
  DependencyGraphDTO,
  DependencyType,
  Discipline,
} from '@sitesync/types';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export class DependencyImpactService {
  /**
   * Evaluates the complete dependency graph and downstream cascade impact for a given activity.
   */
  public async getDependencyGraph(
    projectId: string,
    activityId: string
  ): Promise<DependencyGraphDTO | null> {
    const synthetic = generateSyntheticProject();
    const act = synthetic.activities.find((a) => a.id === activityId || a.activityCode === activityId);

    if (!act) return null;

    const confirmedDelayDays = Math.max(0, act.varianceDays || 0);

    // Predecessors
    const preds = synthetic.dependencies
      .filter((d) => d.successorId === act.id)
      .map((d) => {
        const pAct = synthetic.activities.find((a) => a.id === d.predecessorId);
        return {
          activityId: d.predecessorId,
          activityCode: pAct?.activityCode || d.predecessorId,
          name: pAct?.name || 'Predecessor',
          status: (pAct?.status as ActivityStatus) || ActivityStatus.COMPLETED,
          varianceDays: pAct?.varianceDays || 0,
          dependencyType: d.dependencyType as unknown as DependencyType,
        };
      });

    // Direct Successors
    const directSuccessors = synthetic.dependencies
      .filter((d) => d.predecessorId === act.id)
      .map((d) => {
        const sAct = synthetic.activities.find((a) => a.id === d.successorId);
        const potentialDelay = Math.max(0, confirmedDelayDays - d.lag);
        return {
          activityId: d.successorId,
          activityCode: sAct?.activityCode || d.successorId,
          name: sAct?.name || 'Successor',
          status: (sAct?.status as ActivityStatus) || ActivityStatus.NOT_STARTED,
          isCritical: sAct?.criticalPath || false,
          dependencyType: d.dependencyType as unknown as DependencyType,
          lag: d.lag,
          potentialStartDelayDays: potentialDelay,
        };
      });

    // Downstream multi-level cascade traversal (BFS up to depth 4)
    const downstreamCascade: Array<{
      depth: number;
      activityId: string;
      activityCode: string;
      name: string;
      discipline: Discipline;
      isCritical: boolean;
      potentialStartDelayDays: number;
      path: string[];
    }> = [];

    const visited = new Set<string>([act.id]);
    const queue: Array<{ id: string; depth: number; currentDelay: number; path: string[] }> = [];

    for (const ds of directSuccessors) {
      queue.push({
        id: ds.activityId,
        depth: 1,
        currentDelay: ds.potentialStartDelayDays,
        path: [act.activityCode, ds.activityCode],
      });
      visited.add(ds.activityId);
    }

    while (queue.length > 0) {
      const item = queue.shift()!;
      const sAct = synthetic.activities.find((a) => a.id === item.id);
      if (sAct) {
        downstreamCascade.push({
          depth: item.depth,
          activityId: sAct.id,
          activityCode: sAct.activityCode,
          name: sAct.name,
          discipline: sAct.discipline as unknown as Discipline,
          isCritical: sAct.criticalPath || false,
          potentialStartDelayDays: item.currentDelay,
          path: item.path,
        });

        if (item.depth < 3) {
          const nextDeps = synthetic.dependencies.filter((d) => d.predecessorId === item.id);
          for (const nd of nextDeps) {
            if (!visited.has(nd.successorId)) {
              visited.add(nd.successorId);
              const nextAct = synthetic.activities.find((a) => a.id === nd.successorId);
              const nextDelay = Math.max(0, item.currentDelay - nd.lag);
              queue.push({
                id: nd.successorId,
                depth: item.depth + 1,
                currentDelay: nextDelay,
                path: [...item.path, nextAct?.activityCode || nd.successorId],
              });
            }
          }
        }
      }
    }

    return {
      activityId: act.id,
      activityCode: act.activityCode,
      activityName: act.name,
      discipline: act.discipline as unknown as Discipline,
      status: act.status as ActivityStatus,
      isCritical: act.criticalPath || false,
      varianceDays: act.varianceDays || 0,
      confirmedDelayDays,
      predecessors: preds,
      directSuccessors,
      downstreamCascade,
    };
  }
}
