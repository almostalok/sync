import { Discipline } from '@sitesync/types';

export interface CreateWBSNodeInput {
  projectId: string;
  parentId?: string | null;
  code: string;
  name: string;
  level: number;
  discipline?: Discipline;
}

export function validateCreateWBSNode(input: unknown): { valid: boolean; errors: string[]; data?: CreateWBSNodeInput } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['WBS payload must be an object'] };
  }

  const w = input as Record<string, unknown>;
  if (!w.projectId || typeof w.projectId !== 'string') {
    errors.push('projectId is required');
  }
  if (!w.code || typeof w.code !== 'string' || w.code.trim().length === 0) {
    errors.push('WBS code is required (e.g. 1.1.2)');
  }
  if (!w.name || typeof w.name !== 'string' || w.name.trim().length === 0) {
    errors.push('WBS name is required');
  }
  if (typeof w.level !== 'number' || w.level < 1 || w.level > 6) {
    errors.push('WBS level must be an integer between 1 and 6');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: w.projectId as string,
      parentId: typeof w.parentId === 'string' ? w.parentId : null,
      code: (w.code as string).trim(),
      name: (w.name as string).trim(),
      level: w.level as number,
      discipline: (w.discipline as Discipline) || Discipline.GENERAL,
    },
  };
}
