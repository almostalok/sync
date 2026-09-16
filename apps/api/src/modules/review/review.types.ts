import { Discipline, MatchDecision, MatchStatus, ReviewAction, UserRole } from '@sitesync/types';

export interface ReviewQueueFilters {
  projectId: string;
  discipline?: Discipline;
  status?: string;
  minConfidence?: number;
  maxConfidence?: number;
  isAmbiguous?: boolean;
  isCritical?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export type ReviewSortOption =
  | 'PRIORITY_DESC'
  | 'CONFIDENCE_ASC'
  | 'AMBIGUITY_DESC'
  | 'DATE_DESC'
  | 'DATE_ASC'
  | 'DOWNSTREAM_IMPACT_DESC';

export interface ReviewItemModel {
  id: string;
  matchId: string;
  projectId: string;
  status: MatchStatus | string;
  decision: MatchDecision | string;
  event: {
    id: string;
    description: string;
    normalizedDescription: string;
    eventDate: string;
    discipline?: Discipline | null;
    location?: string | null;
    progress?: number | null;
    status: string;
    sourceReportId: string;
  };
  recommendedMatch: {
    activityId: string;
    activityCode: string;
    activityName: string;
    discipline: Discipline;
    location: string;
    wbsPath: string;
    finalScore: number;
    confidence: number;
    confidenceLevel: string;
    scores: Record<string, number>;
    reasons: string[];
    explanation?: string;
  };
  alternatives: Array<{
    activityId: string;
    activityCode: string;
    activityName: string;
    discipline: Discipline;
    finalScore: number;
    rank: number;
  }>;
  evidence: {
    id: string;
    sourceType: string;
    sourceLocator?: string | null;
    quotedText: string;
    pageNumber?: number | null;
    sheetName?: string | null;
    cellRange?: string | null;
    timestamp?: number | null;
    reportDate?: string;
  };
  reviewPriority: {
    score: number;
    reasons: string[];
    components: {
      uncertainty: number;
      ambiguity: number;
      scheduleCriticality: number;
      downstreamImpact: number;
      recency: number;
    };
  };
  downstreamImpact?: {
    downstreamCount: number;
    isCritical: boolean;
    directSuccessors: string[];
  };
  createdAt: string;
}

export interface ReviewActionRequest {
  projectId: string;
  reviewId: string;
  action: ReviewAction;
  selectedActivityId?: string;
  reason?: string;
  comment?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole | string;
  requestId?: string; // Idempotency key
}

export interface ReviewActionResult {
  success: boolean;
  decisionId: string;
  matchId: string;
  previousStatus: string;
  newStatus: string;
  selectedActivityId?: string;
  progressUpdateId?: string;
  scheduleSynced: boolean;
  auditLogId: string;
  message: string;
}
