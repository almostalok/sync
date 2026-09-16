import { DependencyType } from '@sitesync/types';

export interface CreateDependencyInput {
  projectId: string;
  predecessorId: string;
  successorId: string;
  type?: DependencyType;
  lag?: number;
}

export function validateCreateDependency(input: unknown): { valid: boolean; errors: string[]; data?: CreateDependencyInput } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Dependency payload must be an object'] };
  }

  const d = input as Record<string, unknown>;
  if (!d.projectId || typeof d.projectId !== 'string') {
    errors.push('projectId is required');
  }
  if (!d.predecessorId || typeof d.predecessorId !== 'string') {
    errors.push('predecessorId is required');
  }
  if (!d.successorId || typeof d.successorId !== 'string') {
    errors.push('successorId is required');
  }
  if (d.predecessorId === d.successorId) {
    errors.push('Activity cannot depend on itself (self-dependency prohibited)');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: d.projectId as string,
      predecessorId: d.predecessorId as string,
      successorId: d.successorId as string,
      type: (d.type as DependencyType) || DependencyType.FS,
      lag: typeof d.lag === 'number' ? d.lag : 0,
    },
  };
}
