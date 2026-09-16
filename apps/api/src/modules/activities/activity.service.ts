import { ActivityDTO, Discipline, ActivityStatus } from '@sitesync/types';
import { CreateActivityInput, validateCreateActivity } from '@sitesync/validation';
import { calculateDurationDays, generateId } from '@sitesync/utils';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export class ActivityRepository {
  private inMemoryActivities = new Map<string, ActivityDTO>();

  constructor() {
    const synthetic = generateSyntheticProject();
    synthetic.activities.forEach(a => {
      this.inMemoryActivities.set(a.id, {
        id: a.id,
        projectId: a.projectId,
        wbsNodeId: a.wbsNodeId,
        activityCode: a.activityCode,
        name: a.name,
        description: a.description,
        discipline: a.discipline as Discipline,
        location: a.location,
        wbsPath: a.wbsPath,
        plannedStart: new Date(a.plannedStart),
        plannedEnd: new Date(a.plannedFinish),
        actualStart: a.actualStart ? new Date(a.actualStart) : null,
        actualEnd: a.actualFinish ? new Date(a.actualFinish) : null,
        plannedProgress: a.plannedProgress,
        actualProgress: a.actualProgress,
        status: a.status as ActivityStatus,
        plannedDuration: a.plannedDuration,
        actualDuration: a.actualDuration || null,
        varianceDays: a.varianceDays,
        criticalPath: !!a.criticalPath,
        aliases: a.aliases || [],
        lastUpdateDate: a.lastUpdateDate ? new Date(a.lastUpdateDate) : null,
        isStale: !!a.isStale,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async findByProjectId(
    projectId: string,
    filters?: { discipline?: Discipline; status?: ActivityStatus; page?: number; limit?: number }
  ): Promise<{ data: ActivityDTO[]; total: number }> {
    let list = Array.from(this.inMemoryActivities.values()).filter(a => a.projectId === projectId);

    if (filters?.discipline && filters.discipline !== Discipline.GENERAL) {
      list = list.filter(a => a.discipline === filters.discipline);
    }
    if (filters?.status) {
      list = list.filter(a => a.status === filters.status);
    }

    const total = list.length;
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(100, filters?.limit || 50));
    const offset = (page - 1) * limit;

    return {
      data: list.slice(offset, offset + limit),
      total,
    };
  }

  async findById(id: string): Promise<ActivityDTO | null> {
    return this.inMemoryActivities.get(id) || null;
  }

  async findByCode(projectId: string, activityCode: string): Promise<ActivityDTO | null> {
    for (const a of this.inMemoryActivities.values()) {
      if (a.projectId === projectId && a.activityCode === activityCode) {
        return a;
      }
    }
    return null;
  }

  async create(activity: ActivityDTO): Promise<ActivityDTO> {
    this.inMemoryActivities.set(activity.id, activity);
    return activity;
  }

  async update(id: string, partial: Partial<ActivityDTO>): Promise<ActivityDTO | null> {
    const existing = this.inMemoryActivities.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...partial, updatedAt: new Date() };
    this.inMemoryActivities.set(id, updated);
    return updated;
  }
}

export class ActivityService {
  constructor(private readonly activityRepo: ActivityRepository = new ActivityRepository()) {}

  async getActivitiesByProject(
    projectId: string,
    filters?: { discipline?: Discipline; status?: ActivityStatus; page?: number; limit?: number }
  ): Promise<{ data: ActivityDTO[]; total: number }> {
    return this.activityRepo.findByProjectId(projectId, filters);
  }

  async getActivityById(id: string): Promise<ActivityDTO | null> {
    return this.activityRepo.findById(id);
  }

  async createActivity(input: unknown): Promise<{ success: boolean; data?: ActivityDTO; errors?: string[] }> {
    const validation = validateCreateActivity(input);
    if (!validation.valid || !validation.data) {
      return { success: false, errors: validation.errors };
    }

    const d = validation.data;

    // Check unique constraint: unique(projectId, activityCode)
    const existing = await this.activityRepo.findByCode(d.projectId, d.activityCode);
    if (existing) {
      return { success: false, errors: [`Activity with code '${d.activityCode}' already exists in this project`] };
    }

    const plannedDuration = calculateDurationDays(d.plannedStart, d.plannedEnd);

    const activity: ActivityDTO = {
      id: generateId(d.activityCode.slice(0, 3)),
      projectId: d.projectId,
      wbsNodeId: d.wbsNodeId,
      activityCode: d.activityCode,
      name: d.name,
      description: d.description || '',
      discipline: d.discipline,
      location: d.location,
      wbsPath: d.location,
      plannedStart: new Date(d.plannedStart),
      plannedEnd: new Date(d.plannedEnd),
      actualStart: null,
      actualEnd: null,
      plannedProgress: d.plannedProgress || 0,
      actualProgress: d.actualProgress || 0,
      status: d.status || ActivityStatus.NOT_STARTED,
      plannedDuration,
      actualDuration: null,
      varianceDays: 0,
      criticalPath: !!d.criticalPath,
      aliases: d.aliases || [],
      lastUpdateDate: null,
      isStale: false,
      metadata: d.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.activityRepo.create(activity);
    return { success: true, data: saved };
  }
}
