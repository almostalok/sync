/**
 * SiteSync — Master Prompt 10: Forecasting Internal Types
 */

export interface HistoricalRecord {
  id?: string;
  projectId?: string;
  activityCode?: string;
  discipline: string;
  plannedDurationDays?: number;
  actualDurationDays?: number;
  scheduleVarianceDays?: number;
  closedAt?: string;
  completedAt?: string;
}
