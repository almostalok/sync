/**
 * SiteSync — Master Prompt 10: Forecasting & Scenario Validation
 */

import { ScenarioAssumption } from '@sitesync/types';

export interface RunScenarioInput {
  projectId: string;
  title?: string;
  assumptions: ScenarioAssumption[];
}

export interface ForecastFilter {
  discipline?: string;
  riskBand?: 'LOW' | 'MEDIUM' | 'HIGH';
  isCritical?: boolean;
  minVarianceDays?: number;
  asOfDate?: string;
}

export function validateRunScenario(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: RunScenarioInput;
} {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Payload must be an object'] };
  }

  const p = input as Record<string, unknown>;
  if (!p.projectId || typeof p.projectId !== 'string' || p.projectId.trim().length === 0) {
    errors.push('Project ID is required');
  }

  if (!Array.isArray(p.assumptions) || p.assumptions.length === 0) {
    errors.push('At least one scenario assumption is required');
  } else {
    p.assumptions.forEach((a, idx) => {
      if (!a || typeof a !== 'object') {
        errors.push(`Assumption #${idx + 1} must be an object`);
        return;
      }
      const item = a as Record<string, unknown>;
      if (!item.activityId || typeof item.activityId !== 'string') {
        errors.push(`Assumption #${idx + 1} requires a valid activityId`);
      }
      if (typeof item.delayDays !== 'number' || item.delayDays < 1 || item.delayDays > 365) {
        errors.push(`Assumption #${idx + 1} delayDays must be an integer between 1 and 365`);
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: p.projectId as string,
      title: typeof p.title === 'string' ? p.title : 'What-If Delay Simulation',
      assumptions: p.assumptions as ScenarioAssumption[],
    },
  };
}

export function validateForecastFilter(input: unknown): {
  valid: boolean;
  errors: string[];
  data: ForecastFilter;
} {
  if (!input || typeof input !== 'object') {
    return { valid: true, errors: [], data: { asOfDate: '2026-09-16' } };
  }

  const p = input as Record<string, unknown>;
  const data: ForecastFilter = {
    discipline: typeof p.discipline === 'string' ? p.discipline : undefined,
    riskBand:
      typeof p.riskBand === 'string' && ['LOW', 'MEDIUM', 'HIGH'].includes(p.riskBand)
        ? (p.riskBand as 'LOW' | 'MEDIUM' | 'HIGH')
        : undefined,
    isCritical: typeof p.isCritical === 'boolean' ? p.isCritical : undefined,
    asOfDate: typeof p.asOfDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.asOfDate)
      ? p.asOfDate
      : '2026-09-16',
  };

  return { valid: true, errors: [], data };
}
