export interface CreateProjectInput {
  name: string;
  code: string;
  description?: string;
  location: string;
  startDate: string;
  plannedEndDate: string;
}

export function validateCreateProject(input: unknown): { valid: boolean; errors: string[]; data?: CreateProjectInput } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Project payload must be an object'] };
  }

  const p = input as Record<string, unknown>;
  if (!p.name || typeof p.name !== 'string' || p.name.trim().length === 0) {
    errors.push('Project name is required');
  }
  if (!p.code || typeof p.code !== 'string' || p.code.trim().length === 0) {
    errors.push('Project code is required');
  }
  if (!p.location || typeof p.location !== 'string' || p.location.trim().length === 0) {
    errors.push('Location is required');
  }
  if (!p.startDate || isNaN(Date.parse(p.startDate as string))) {
    errors.push('Valid startDate is required');
  }
  if (!p.plannedEndDate || isNaN(Date.parse(p.plannedEndDate as string))) {
    errors.push('Valid plannedEndDate is required');
  }

  if (p.startDate && p.plannedEndDate && Date.parse(p.startDate as string) > Date.parse(p.plannedEndDate as string)) {
    errors.push('plannedEndDate must be after startDate');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      name: (p.name as string).trim(),
      code: (p.code as string).trim().toUpperCase(),
      description: typeof p.description === 'string' ? p.description.trim() : '',
      location: (p.location as string).trim(),
      startDate: p.startDate as string,
      plannedEndDate: p.plannedEndDate as string,
    },
  };
}
