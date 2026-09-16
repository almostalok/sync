import { Discipline, ActivityStatus, DependencyType } from '@sitesync/types';

export interface RawScheduleRow {
  wbsCode?: string;
  wbsName?: string;
  wbsLevel?: number;
  activityCode: string;
  activityName: string;
  description?: string;
  discipline: string;
  location?: string;
  plannedStart: string;
  plannedFinish: string;
  durationDays?: number;
  plannedProgress?: number;
  actualProgress?: number;
  status?: string;
  predecessors?: string; // e.g. "CIV-EXC-0001:FS:0, CIV-EXC-0002:SS:2" or comma-separated codes
  dependencyType?: string;
}

export interface CanonicalScheduleJson {
  project?: {
    code?: string;
    name?: string;
    description?: string;
    location?: string;
  };
  wbs?: Array<{
    code: string;
    name: string;
    level: number;
    discipline?: Discipline;
    parentId?: string | null;
  }>;
  activities: Array<{
    activityCode: string;
    wbsCode?: string;
    name: string;
    description?: string;
    discipline: Discipline;
    location?: string;
    plannedStart: string;
    plannedFinish: string;
    plannedDuration?: number;
    plannedProgress?: number;
    actualProgress?: number;
    status?: ActivityStatus;
  }>;
  dependencies?: Array<{
    predecessorCode: string;
    successorCode: string;
    type?: DependencyType;
    lag?: number;
  }>;
}

export interface ScheduleValidationError {
  code: string;
  row?: number;
  activityCode?: string;
  field?: string;
  value?: unknown;
  message: string;
}

export interface ScheduleValidationWarning {
  code: string;
  row?: number;
  activityCode?: string;
  message: string;
}

export interface ScheduleImportPreview {
  format: 'CSV' | 'JSON' | 'XLSX';
  fileChecksum: string;
  isDuplicateFile: boolean;
  activityCount: number;
  wbsCount: number;
  dependencyCount: number;
  warnings: ScheduleValidationWarning[];
  errors: ScheduleValidationError[];
  isValid: boolean;
  sampleActivities: Array<{
    activityCode: string;
    name: string;
    discipline: string;
    plannedStart: string;
    plannedFinish: string;
  }>;
}

export interface ScheduleImportResult {
  scheduleVersionId: string;
  version: number;
  isBaseline: boolean;
  importedActivitiesCount: number;
  importedWBSCount: number;
  importedDependenciesCount: number;
  message: string;
}
