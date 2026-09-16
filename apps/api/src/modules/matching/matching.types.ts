import { Discipline, EventStatus, MatchDecision } from '@sitesync/types';

export enum EntityType {
  EQUIPMENT = 'EQUIPMENT',
  LOCATION = 'LOCATION',
  ACTIVITY_TYPE = 'ACTIVITY_TYPE',
  WBS = 'WBS',
  TAG = 'TAG',
  SECTION = 'SECTION',
  MATERIAL = 'MATERIAL',
}

export interface ExtractedEntity {
  text: string;
  type: EntityType;
  confidence: number;
}

export interface RawReportInput {
  reportId: string;
  projectId: string;
  reportDate: string;
  discipline?: Discipline;
  author?: string;
  text: string;
  page?: number;
  section?: string;
}

export interface ExtractedEventResult {
  id: string;
  reportId: string;
  description: string;
  normalizedDescription: string;
  eventDate: string;
  discipline: Discipline;
  location: string;
  progress: number;
  status: EventStatus;
  entities: ExtractedEntity[];
  sourceText: string;
  sourcePage?: number;
  sourceSection?: string;
  characterStart?: number;
  characterEnd?: number;
  extractionConfidence: number;
  isAmbiguous?: boolean;
  granularityMismatch?: boolean;
}

export interface ComponentScoreBreakdown {
  semantic: number;
  discipline: number;
  location: number;
  wbs: number;
  temporal: number;
  dependency: number;
  entity: number;
  final: number;
}

export interface MatchCandidate {
  activityId: string;
  activityCode: string;
  activityName: string;
  discipline: Discipline;
  location: string;
  wbsPath: string;
  rank: number;
  finalScore: number;
  scores: ComponentScoreBreakdown;
  reasons: string[];
}

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MatchResult {
  eventId: string;
  decision: MatchDecision;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  candidateMargin: number;
  granularityMismatch: boolean;
  isAmbiguous: boolean;
  topCandidate?: MatchCandidate;
  candidates: MatchCandidate[];
  explanation: string;
  matcherVersion: string;
  embeddingModel: string;
  embeddingVersion: string;
  matchedAt: string;
}

export interface ActivityContext {
  id: string;
  activityCode: string;
  name: string;
  description: string;
  discipline: Discipline;
  activityType: string;
  location: string;
  wbsPath: string;
  plannedStart: string;
  plannedFinish: string;
  plannedProgress: number;
  actualProgress: number;
  status: string;
  predecessorCodes?: string[];
  embedding?: number[];
}

export interface BenchmarkMetrics {
  totalEvaluated: number;
  top1Accuracy: number;
  top3Recall: number;
  top5Recall: number;
  precision: number;
  recall: number;
  f1Score: number;
  unmatchedPrecision: number;
  unmatchedRecall: number;
  falseAutoLinkRate: number;
  averageLatencyMs: number;
}

export interface BaselineComparisonResult {
  exact: BenchmarkMetrics;
  fuzzy: BenchmarkMetrics;
  embeddingOnly: BenchmarkMetrics;
  hybrid: BenchmarkMetrics;
}
