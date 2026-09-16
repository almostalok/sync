import { Discipline, ActivityStatus } from '@sitesync/types';

export interface CreateActivityInput {
  projectId: string;
  wbsNodeId: string;
  activityCode: string;
  name: string;
  description?: string;
  discipline: Discipline;
  location: string;
  plannedStart: string;
  plannedEnd: string;
  plannedProgress?: number;
  actualProgress?: number;
  status?: ActivityStatus;
  criticalPath?: boolean;
  aliases?: string[];
  metadata?: Record<string, unknown>;
}

export function validateCreateActivity(input: unknown): { valid: boolean; errors: string[]; data?: CreateActivityInput } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Activity payload must be an object'] };
  }

  const a = input as Record<string, unknown>;
  if (!a.projectId || typeof a.projectId !== 'string') {
    errors.push('projectId is required');
  }
  if (!a.wbsNodeId || typeof a.wbsNodeId !== 'string') {
    errors.push('wbsNodeId is required');
  }
  if (!a.activityCode || typeof a.activityCode !== 'string' || a.activityCode.trim().length === 0) {
    errors.push('activityCode is required (e.g. CIV-EXC-001)');
  }
  if (!a.name || typeof a.name !== 'string' || a.name.trim().length === 0) {
    errors.push('Activity name is required');
  }
  if (!a.discipline || typeof a.discipline !== 'string') {
    errors.push('Discipline is required');
  }
  if (!a.location || typeof a.location !== 'string') {
    errors.push('Location is required');
  }
  if (!a.plannedStart || isNaN(Date.parse(a.plannedStart as string))) {
    errors.push('Valid plannedStart is required');
  }
  if (!a.plannedEnd || isNaN(Date.parse(a.plannedEnd as string))) {
    errors.push('Valid plannedEnd is required');
  }

  if (a.plannedStart && a.plannedEnd && Date.parse(a.plannedStart as string) > Date.parse(a.plannedEnd as string)) {
    errors.push('plannedEnd must be at or after plannedStart');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: a.projectId as string,
      wbsNodeId: a.wbsNodeId as string,
      activityCode: (a.activityCode as string).trim().toUpperCase(),
      name: (a.name as string).trim(),
      description: typeof a.description === 'string' ? a.description.trim() : '',
      discipline: a.discipline as Discipline,
      location: (a.location as string).trim(),
      plannedStart: a.plannedStart as string,
      plannedEnd: a.plannedEnd as string,
      plannedProgress: typeof a.plannedProgress === 'number' ? a.plannedProgress : 0,
      actualProgress: typeof a.actualProgress === 'number' ? a.actualProgress : 0,
      status: (a.status as ActivityStatus) || ActivityStatus.NOT_STARTED,
      criticalPath: typeof a.criticalPath === 'boolean' ? a.criticalPath : false,
      aliases: Array.isArray(a.aliases) ? a.aliases.map(x => String(x).trim()) : [],
      metadata: typeof a.metadata === 'object' && a.metadata !== null ? (a.metadata as Record<string, unknown>) : {},
    },
  };
}
