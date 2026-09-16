export interface BaseEvent<T = Record<string, unknown>> {
  id: string;
  name: string;
  projectId: string;
  timestamp: string;
  payload: T;
}

export interface ReportUploadedPayload {
  reportId: string;
  filename: string;
  sourceType: string;
  uploadedBy: string;
  checksum: string;
}

export interface ProcessingStartedPayload {
  jobId: string;
  reportId: string;
}

export interface EventsExtractedPayload {
  reportId: string;
  extractedEventCount: number;
  eventIds: string[];
}

export interface MatchingCompletedPayload {
  reportId: string;
  matchedCount: number;
  autoLinkedCount: number;
  reviewRequiredCount: number;
  unmatchedCount: number;
}

export interface ProgressUpdatedPayload {
  activityId: string;
  activityCode: string;
  previousProgress: number;
  newProgress: number;
  verifiedBy: string;
  sourceReportId: string;
}

export interface RiskRecalculatedPayload {
  highRiskCount: number;
  overallScheduleVarianceDays: number;
  criticalPathBottlenecks: string[];
}
