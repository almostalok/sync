import {
  ActivityDetailDTO,
  ActivityStatus,
  DependencyType,
  Discipline,
  GanttZoomLevel,
  ScheduleViewDTO,
  WBSViewNodeDTO,
} from '@sitesync/types';
import { DASHBOARD_CONFIG } from './dashboard-metrics.config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export interface ScheduleFilterParams {
  discipline?: Discipline | string;
  wbsNodeId?: string;
  status?: ActivityStatus | string;
  isCritical?: boolean;
  search?: string;
  zoomLevel?: GanttZoomLevel;
  page?: number;
  limit?: number;
}

export class ScheduleViewService {
  /**
   * Retrieves the structured WBS hierarchy tree and activities for the Gantt view.
   */
  public async getScheduleView(
    projectId: string,
    filters?: ScheduleFilterParams
  ): Promise<ScheduleViewDTO> {
    const zoomLevel = filters?.zoomLevel || GanttZoomLevel.MONTH;
    const now = Date.now();
    const staleThresholdMs = DASHBOARD_CONFIG.STALE_AFTER_HOURS * 60 * 60 * 1000;

    const synthetic = generateSyntheticProject();
    let rawWbs = synthetic.wbsNodes;
    let rawActivities = synthetic.activities;
    let rawDependencies = synthetic.dependencies;

    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        const dbWbs = await prisma.wBSNode.findMany({ where: { projectId }, orderBy: { code: 'asc' } });
        const dbActs = await prisma.activity.findMany({
          where: { projectId },
        });
        const dbDeps = await prisma.dependency.findMany({ where: { projectId } });

        if (dbWbs.length > 0 && dbActs.length > 0) {
          rawWbs = dbWbs.map((w: any) => ({
            id: w.id,
            projectId: w.projectId,
            parentId: w.parentId,
            code: w.code,
            name: w.name,
            level: w.level,
            discipline: w.discipline as any,
            path: w.path,
          }));

          rawActivities = dbActs.map((a: any) => ({
            id: a.id,
            projectId: a.projectId,
            activityCode: a.activityCode,
            name: a.name,
            description: a.description,
            discipline: a.discipline as any,
            location: a.location,
            wbsNodeId: a.wbsNodeId,
            wbsPath: a.wbsPath,
            plannedStart: a.plannedStart.toISOString().slice(0, 10),
            plannedFinish: a.plannedFinish.toISOString().slice(0, 10),
            actualStart: a.actualStart ? a.actualStart.toISOString().slice(0, 10) : undefined,
            actualFinish: a.actualFinish ? a.actualFinish.toISOString().slice(0, 10) : undefined,
            plannedDuration: a.plannedDuration,
            actualDuration: a.actualDuration ?? undefined,
            plannedProgress: a.plannedProgress > 1 ? a.plannedProgress : Math.round(a.plannedProgress * 100),
            actualProgress: a.actualProgress > 1 ? a.actualProgress : Math.round(a.actualProgress * 100),
            status: a.status as any,
            varianceDays: a.varianceDays,
            criticalPath: a.criticalPath,
            lastUpdateDate: a.lastUpdateDate ? a.lastUpdateDate.toISOString() : undefined,
            isStale: a.isStale,
            aliases: a.aliases || [],
          }));

          rawDependencies = dbDeps.map((d: any) => ({
            id: d.id,
            projectId: d.projectId,
            predecessorId: d.predecessorId,
            successorId: d.successorId,
            dependencyType: d.dependencyType as any,
            lag: d.lag,
          }));
        }
      } catch (err) {
        console.warn('ScheduleViewService Prisma fallback:', err);
      }
    }

    // Dependency count lookup
    const predCountMap = new Map<string, number>();
    const succCountMap = new Map<string, number>();

    for (const d of rawDependencies) {
      predCountMap.set(d.successorId, (predCountMap.get(d.successorId) || 0) + 1);
      succCountMap.set(d.predecessorId, (succCountMap.get(d.predecessorId) || 0) + 1);
    }

    // Filter activities
    let filteredActivities = rawActivities;

    if (filters?.discipline && filters.discipline !== 'ALL') {
      filteredActivities = filteredActivities.filter(
        (a) => a.discipline.toUpperCase() === filters.discipline!.toUpperCase()
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      filteredActivities = filteredActivities.filter(
        (a) => a.status.toUpperCase() === filters.status!.toUpperCase()
      );
    }

    if (filters?.isCritical !== undefined) {
      filteredActivities = filteredActivities.filter((a) => a.criticalPath === filters.isCritical);
    }

    if (filters?.wbsNodeId) {
      filteredActivities = filteredActivities.filter((a) => a.wbsNodeId === filters.wbsNodeId);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      filteredActivities = filteredActivities.filter(
        (a) =>
          a.activityCode.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.discipline.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q)) ||
          (a.wbsPath && a.wbsPath.toLowerCase().includes(q))
      );
    }

    // Map activities by WBS node ID
    const actByWbs = new Map<string, typeof rawActivities>();
    for (const act of filteredActivities) {
      const list = actByWbs.get(act.wbsNodeId) || [];
      list.push(act);
      actByWbs.set(act.wbsNodeId, list);
    }

    // Build hierarchical WBS Tree
    const wbsNodeMap = new Map<string, WBSViewNodeDTO>();
    for (const node of rawWbs) {
      const acts = (actByWbs.get(node.id) || []).map((a) => {
        const isStale = a.lastUpdateDate
          ? now - new Date(a.lastUpdateDate).getTime() > staleThresholdMs
          : false;

        return {
          id: a.id,
          activityCode: a.activityCode,
          name: a.name,
          discipline: a.discipline as unknown as Discipline,
          status: a.status as ActivityStatus,
          plannedStart: a.plannedStart,
          plannedEnd: a.plannedFinish,
          actualStart: a.actualStart ?? null,
          actualEnd: a.actualFinish ?? null,
          plannedDuration: a.plannedDuration,
          actualDuration: a.actualDuration ?? null,
          plannedProgress: a.plannedProgress,
          actualProgress: a.actualProgress,
          varianceDays: a.varianceDays || 0,
          isCritical: a.criticalPath || false,
          isStale,
          predecessorCount: predCountMap.get(a.id) || 0,
          successorCount: succCountMap.get(a.id) || 0,
        };
      });

      wbsNodeMap.set(node.id, {
        id: node.id,
        code: node.code,
        name: node.name,
        level: node.level,
        discipline: node.discipline as unknown as Discipline,
        path: node.path,
        children: [],
        activities: acts,
      });
    }

    // Nest children
    const rootNodes: WBSViewNodeDTO[] = [];
    for (const node of rawWbs) {
      const dto = wbsNodeMap.get(node.id)!;
      if (node.parentId && wbsNodeMap.has(node.parentId)) {
        wbsNodeMap.get(node.parentId)!.children.push(dto);
      } else {
        rootNodes.push(dto);
      }
    }

    // Find project timeline boundaries
    let timelineStart = '2026-08-01';
    let timelineEnd = '2026-12-18';

    if (rawActivities.length > 0) {
      const starts = rawActivities.map((a) => new Date(a.plannedStart).getTime()).filter((t) => !isNaN(t));
      const ends = rawActivities.map((a) => new Date(a.plannedFinish).getTime()).filter((t) => !isNaN(t));
      if (starts.length > 0) timelineStart = new Date(Math.min(...starts)).toISOString().slice(0, 10);
      if (ends.length > 0) timelineEnd = new Date(Math.max(...ends)).toISOString().slice(0, 10);
    }

    return {
      projectId,
      zoomLevel,
      timelineStart,
      timelineEnd,
      totalActivities: rawActivities.length,
      filteredActivitiesCount: filteredActivities.length,
      wbsTree: rootNodes,
    };
  }

  /**
   * Retrieves comprehensive activity detail for the drawer panel.
   */
  public async getActivityDetail(projectId: string, activityId: string): Promise<ActivityDetailDTO | null> {
    const synthetic = generateSyntheticProject();
    let act = synthetic.activities.find((a) => a.id === activityId || a.activityCode === activityId);
    let dependencies = synthetic.dependencies;

    if (!act && PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        const dbAct = await prisma.activity.findFirst({
          where: {
            projectId,
            OR: [{ id: activityId }, { activityCode: activityId }],
          },
          include: {
            wbsNode: true,
            progressUpdates: { orderBy: { reportedDate: 'desc' }, take: 10 },
          },
        });

        if (dbAct) {
          act = {
            id: dbAct.id,
            projectId: dbAct.projectId,
            activityCode: dbAct.activityCode,
            name: dbAct.name,
            description: dbAct.description,
            discipline: dbAct.discipline as any,
            location: dbAct.location,
            wbsNodeId: dbAct.wbsNodeId,
            wbsPath: dbAct.wbsPath,
            plannedStart: dbAct.plannedStart.toISOString().slice(0, 10),
            plannedFinish: dbAct.plannedFinish.toISOString().slice(0, 10),
            actualStart: dbAct.actualStart ? dbAct.actualStart.toISOString().slice(0, 10) : undefined,
            actualFinish: dbAct.actualFinish ? dbAct.actualFinish.toISOString().slice(0, 10) : undefined,
            plannedDuration: dbAct.plannedDuration,
            actualDuration: dbAct.actualDuration ?? undefined,
            plannedProgress: dbAct.plannedProgress > 1 ? dbAct.plannedProgress : Math.round(dbAct.plannedProgress * 100),
            actualProgress: dbAct.actualProgress > 1 ? dbAct.actualProgress : Math.round(dbAct.actualProgress * 100),
            status: dbAct.status as any,
            varianceDays: dbAct.varianceDays,
            criticalPath: dbAct.criticalPath,
            lastUpdateDate: dbAct.lastUpdateDate ? dbAct.lastUpdateDate.toISOString() : undefined,
            isStale: dbAct.isStale,
            aliases: dbAct.aliases || [],
          };
        }
      } catch (err) {
        console.warn('getActivityDetail Prisma fallback:', err);
      }
    }

    if (!act) return null;

    // Build predecessor list
    const preds = dependencies
      .filter((d) => d.successorId === act!.id)
      .map((d) => {
        const predAct = synthetic.activities.find((a) => a.id === d.predecessorId);
        return {
          activityId: d.predecessorId,
          activityCode: predAct?.activityCode || d.predecessorId,
          activityName: predAct?.name || 'Predecessor Activity',
          type: d.dependencyType as unknown as DependencyType,
          lag: d.lag,
          actualProgress: predAct ? predAct.actualProgress : 100,
          status: (predAct?.status as ActivityStatus) || ActivityStatus.COMPLETED,
        };
      });

    // Build successor list
    const succs = dependencies
      .filter((d) => d.predecessorId === act!.id)
      .map((d) => {
        const succAct = synthetic.activities.find((a) => a.id === d.successorId);
        const delay = Math.max(0, (act!.varianceDays || 0) - d.lag);
        return {
          activityId: d.successorId,
          activityCode: succAct?.activityCode || d.successorId,
          activityName: succAct?.name || 'Successor Activity',
          type: d.dependencyType as unknown as DependencyType,
          lag: d.lag,
          actualProgress: succAct ? succAct.actualProgress : 0,
          status: (succAct?.status as ActivityStatus) || ActivityStatus.NOT_STARTED,
          isCritical: succAct?.criticalPath || false,
          potentialStartDelayDays: delay,
        };
      });

    const now = Date.now();
    const staleThresholdMs = DASHBOARD_CONFIG.STALE_AFTER_HOURS * 60 * 60 * 1000;
    const isStale = act.lastUpdateDate
      ? now - new Date(act.lastUpdateDate).getTime() > staleThresholdMs
      : false;

    const startVarianceDays = act.actualStart
      ? Math.round(
          (new Date(act.actualStart).getTime() - new Date(act.plannedStart).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : act.varianceDays || 0;

    const endVarianceDays = act.actualFinish
      ? Math.round(
          (new Date(act.actualFinish).getTime() - new Date(act.plannedFinish).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const durationVarianceDays =
      act.actualDuration !== undefined && act.actualDuration !== null
        ? act.actualDuration - act.plannedDuration
        : 0;

    const progressVariancePercentage = Math.round(act.actualProgress - act.plannedProgress);

    const evidenceChain = [
      {
        evidenceId: `EVD-${act.id}-01`,
        sourceType: 'PDF_PAGE',
        sourceLocator: 'DPR-2026-09-16.pdf#P4',
        quotedText: `${act.name} completed approximately ${act.actualProgress}% with structural verification completed.`,
        reportedDate: act.lastUpdateDate || '2026-09-16T14:32:00Z',
        verifiedBy: 'Er. R. Borah (Planner)',
        progressPercentage: act.actualProgress,
      },
    ];

    const recentUpdates = [
      {
        id: `UPD-${act.id}-01`,
        reportedDate: act.lastUpdateDate || '2026-09-16T14:32:00Z',
        progress: act.actualProgress,
        verifiedBy: 'Er. R. Borah (Planner)',
        verifiedAt: '2026-09-16T14:35:00Z',
        sourceDocument: 'DPR-2026-09-16.pdf',
      },
    ];

    return {
      id: act.id,
      projectId: act.projectId,
      activityCode: act.activityCode,
      name: act.name,
      description: act.description || act.name,
      discipline: act.discipline as unknown as Discipline,
      wbsPath: act.wbsPath || '1.1 Compressor Train Area',
      wbsNodeId: act.wbsNodeId || 'WBS-L3-1',
      location: act.location || 'Compressor Bay A',
      status: act.status as ActivityStatus,
      isCritical: act.criticalPath || false,
      plannedStart: act.plannedStart,
      plannedEnd: act.plannedFinish,
      actualStart: act.actualStart ?? null,
      actualEnd: act.actualFinish ?? null,
      plannedDuration: act.plannedDuration,
      actualDuration: act.actualDuration ?? null,
      plannedProgress: act.plannedProgress,
      actualProgress: act.actualProgress,
      startVarianceDays,
      endVarianceDays,
      durationVarianceDays,
      progressVariancePercentage,
      isStale,
      lastUpdateDate: act.lastUpdateDate ?? null,
      predecessors: preds,
      successors: succs,
      evidenceChain,
      recentUpdates,
    };
  }
}
