/**
 * SiteSync — Master Prompt 8: Grounded Project Copilot & RAG Types
 * Strict typed contracts for project-intelligence conversational assistant.
 */

export type CopilotIntent =
  | 'PROJECT_STATUS'
  | 'SCHEDULE_VARIANCE'
  | 'ACTIVITY_STATUS'
  | 'DISCIPLINE_PROGRESS'
  | 'DELAY_ANALYSIS'
  | 'PROGRESS_LAG'
  | 'STALE_UPDATE'
  | 'DEPENDENCY_IMPACT'
  | 'RISK_ANALYSIS'
  | 'REVIEW_QUEUE'
  | 'EVIDENCE_LOOKUP'
  | 'HISTORICAL_BENCHMARK'
  | 'HISTORICAL_DELAY'
  | 'PRODUCTIVITY_ANALYSIS'
  | 'REPORT_SEARCH'
  | 'ACTIVITY_SEARCH'
  | 'CHANGE_ANALYSIS'
  | 'GENERAL_PROJECT_QUERY';

export type GroundingStatus = 'GROUNDED' | 'PARTIAL' | 'INSUFFICIENT';

export type CitationSourceType =
  | 'FIELD_REPORT'
  | 'EVIDENCE'
  | 'ACTIVITY'
  | 'PROGRESS_UPDATE'
  | 'REVIEW_DECISION'
  | 'HISTORICAL_OUTCOME'
  | 'DEPENDENCY'
  | 'RISK'
  | 'SCHEDULE';

export interface CitationLocator {
  page?: number;
  sheet?: string;
  cell?: string;
  line?: number;
  timestamp?: string | number;
}

export interface CopilotCitation {
  sourceType: CitationSourceType;
  sourceId: string;
  title: string;
  locator?: CitationLocator;
  excerpt?: string;
  relevanceScore: number;
  verifiedBy?: string;
  verifiedAt?: string;
  discipline?: string;
  metadata?: Record<string, any>;
}

export interface CopilotCalculation {
  name: string;
  value: number | string;
  unit?: string;
  formula: string;
  sourceActivityIds?: string[];
  description?: string;
}

export interface CopilotQuery {
  projectId: string;
  userId: string;
  question: string;
  conversationId?: string;
}

export interface CopilotResponse {
  answer: string;
  confidence: number;
  groundingStatus: GroundingStatus;
  citations: CopilotCitation[];
  calculations?: CopilotCalculation[];
  relatedActivities?: string[];
  relatedReports?: string[];
  warnings?: string[];
  intent: CopilotIntent;
  suggestedActions?: string[];
  latencyMs?: number;
  dataVersion?: number;
}

export interface ExtractedEntities {
  activityId?: string;
  activityCode?: string;
  activityName?: string;
  discipline?: string;
  location?: string;
  contractor?: string;
  date?: string;
  dateRange?: { start?: string; end?: string };
  wbsCode?: string;
  status?: string;
  reportId?: string;
  delayCause?: string;
  historicalProject?: string;
  keywords: string[];
}

export interface CopilotContextPacket {
  project: {
    id: string;
    name: string;
    plannedProgress: number;
    actualProgress: number;
    varianceDays: number;
    dataVersion: number;
  };
  activities: any[];
  progressUpdates: any[];
  reports: any[];
  evidence: any[];
  dependencies: any[];
  risks: any[];
  historicalOutcomes: any[];
  calculations: CopilotCalculation[];
  retrievalMetadata: {
    intent: CopilotIntent;
    entities: ExtractedEntities;
    budgetUsage: {
      activitiesCount: number;
      reportsCount: number;
      evidenceCount: number;
      dependenciesCount: number;
      risksCount: number;
      historicalCount: number;
    };
    retrievalLatencyMs: number;
  };
}

export interface CopilotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: CopilotIntent;
  citations?: CopilotCitation[];
  calculations?: CopilotCalculation[];
  groundingStatus?: GroundingStatus;
  warnings?: string[];
  createdAt: string;
}

export interface CopilotConversation {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: CopilotMessage[];
}

export interface SuggestedQuestion {
  question: string;
  category: 'SCHEDULE' | 'REVIEW' | 'RISK' | 'HISTORICAL' | 'CHANGE' | 'EVIDENCE';
  reason: string;
}
