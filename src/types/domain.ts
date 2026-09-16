export type DisciplineType = 
  | 'CIVIL' 
  | 'PIPING' 
  | 'MECHANICAL' 
  | 'ELECTRICAL' 
  | 'INSTRUMENTATION' 
  | 'HSE' 
  | 'GENERAL';

export type ActivityStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'DELAYED' 
  | 'BLOCKED' 
  | 'EXPECTED';

export type EventStatus = 
  | 'PLANNED' 
  | 'STARTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'BLOCKED' 
  | 'EXPECTED' 
  | 'UNKNOWN';

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export type MatchDecision = 
  | 'AUTO_LINKED' 
  | 'PENDING_REVIEW' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'UNMATCHED';

export type DifficultyLevel = 
  | 'LEVEL_1_EXACT' 
  | 'LEVEL_2_PARAPHRASE' 
  | 'LEVEL_3_NOISY' 
  | 'LEVEL_4_CONTEXTUAL' 
  | 'LEVEL_5_AMBIGUOUS' 
  | 'LEVEL_6_GRANULARITY' 
  | 'LEVEL_7_UNMATCHED';

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description: string;
  location: string;
  plannedStart: string;
  plannedFinish: string;
  actualStart?: string;
  actualFinish?: string;
  status: 'ACTIVE' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';
  plannedProgress: number; // 0 - 100
  actualProgress: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export interface WBSNode {
  id: string;
  projectId: string;
  parentId?: string;
  code: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  discipline: DisciplineType;
  path: string; // e.g. "Civil Works > Foundations > Compressor"
}

export interface Activity {
  id: string;
  projectId: string;
  wbsNodeId: string;
  activityCode: string; // e.g. "CIV-EXC-042"
  name: string; // e.g. "Compressor Foundation Excavation"
  description: string;
  discipline: DisciplineType;
  location: string; // e.g. "Compressor Area - North"
  wbsPath: string;
  plannedStart: string;
  plannedFinish: string;
  actualStart?: string;
  actualFinish?: string;
  plannedDuration: number; // days
  actualDuration?: number; // days
  plannedProgress: number; // 0 - 100
  actualProgress: number; // 0 - 100
  status: ActivityStatus;
  varianceDays: number; // positive = behind schedule, negative = ahead
  criticalPath?: boolean;
  totalFloat?: number;
  freeFloat?: number;
  isMilestone?: boolean;
  aliases?: string[];
  lastUpdateDate?: string;
  isStale?: boolean;
  predecessorIds?: string[];
  successorIds?: string[];
  updatedAt?: string;
}

export interface Dependency {
  id: string;
  projectId: string;
  predecessorId: string;
  successorId: string;
  dependencyType: DependencyType;
  lag: number; // days
}

export interface FieldReport {
  id: string;
  projectId: string;
  sourceType: 'PDF' | 'XLSX' | 'CSV' | 'TXT' | 'AUDIO';
  fileName: string;
  storageKey: string;
  reportDate: string;
  discipline?: DisciplineType;
  uploadedBy: string;
  uploadedAt: string;
  processingStatus: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  rawText: string;
  pageCount?: number;
  extractedEventCount: number;
  matchedEventCount: number;
}

export interface ExtractedEvent {
  id: string;
  fieldReportId: string;
  reportFileName: string;
  description: string;
  normalizedDescription: string;
  eventDate: string;
  discipline?: DisciplineType;
  location?: string;
  progress?: number; // 0 - 100
  status: EventStatus;
  quantity?: number;
  unit?: string;
  sourceText: string;
  sourcePage?: number;
  characterStart?: number;
  characterEnd?: number;
  extractionConfidence: number; // 0.0 - 1.0
  difficulty?: DifficultyLevel;
  groundTruthActivityId?: string;
  match?: ActivityMatch;
  createdAt: string;
}

export interface SignalBreakdown {
  semanticScore: number; // 0 - 1.0 (weight: 0.40)
  disciplineScore: number; // 0 - 1.0 (weight: 0.15)
  locationScore: number; // 0 - 1.0 (weight: 0.10)
  wbsScore: number; // 0 - 1.0 (weight: 0.10)
  temporalScore: number; // 0 - 1.0 (weight: 0.10)
  dependencyScore: number; // 0 - 1.0 (weight: 0.10)
  entityScore: number; // 0 - 1.0 (weight: 0.05)
}

export interface ActivityCandidate {
  activityId: string;
  activityCode: string;
  activityName: string;
  discipline: DisciplineType;
  location: string;
  wbsPath: string;
  plannedStart: string;
  plannedFinish: string;
  rank: number;
  signals: SignalBreakdown;
  finalScore: number; // 0.0 - 1.0
  confidence: number; // 0.0 - 1.0
  decision: MatchDecision;
  explanation: string[];
}

export interface ActivityMatch {
  id: string;
  eventId: string;
  activityId: string;
  activityCode: string;
  activityName: string;
  rank: number;
  signals: SignalBreakdown;
  finalScore: number;
  confidence: number;
  decision: MatchDecision;
  decisionReason: string;
  candidates: ActivityCandidate[];
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceSnippet {
  id: string;
  eventId: string;
  fieldReportId: string;
  reportFileName: string;
  sourceText: string;
  page?: number;
  section?: string;
  characterStart?: number;
  characterEnd?: number;
  highlightText: string;
  timestamp: string;
}

export interface ProgressUpdate {
  id: string;
  activityId: string;
  activityCode: string;
  eventId: string;
  progress: number;
  status: ActivityStatus;
  effectiveDate: string;
  sourceReport: string;
  verifiedBy: string;
  verifiedAt: string;
  previousProgress: number;
  notes?: string;
}

export interface ReviewDecision {
  id: string;
  matchId: string;
  eventId: string;
  activityId?: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'ACCEPTED' | 'REJECTED' | 'SELECTED_ALTERNATIVE' | 'MARKED_UNMATCHED' | 'CREATED_ACTIVITY';
  reason?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  entityType: 'ACTIVITY' | 'MATCH' | 'REPORT' | 'SCHEDULE' | 'PROGRESS';
  entityId: string;
  action: 'AUTO_LINKED' | 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'INGESTED' | 'UNMATCHED';
  beforeState?: any;
  afterState?: any;
  explanation: string;
  timestamp: string;
}

export interface RiskSignal {
  id: string;
  activityId: string;
  activityCode: string;
  activityName: string;
  discipline: DisciplineType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'SCHEDULE_SLIPPAGE' | 'STALE_UPDATE' | 'DEPENDENCY_BLOCK' | 'LOW_CONFIDENCE' | 'DOWNSTREAM_IMPACT';
  varianceDays: number;
  impactDescription: string;
  downstreamAffectedActivities: string[];
  evidenceText?: string;
  sourceReport?: string;
}

export interface HistoricalOutcome {
  id: string;
  projectId: string;
  projectName: string;
  activityType: string;
  discipline: DisciplineType;
  plannedDuration: number;
  actualDuration: number;
  delayDays: number;
  delayCause: string;
  productivityMetric: string;
  lessonsLearned: string;
}

export interface BenchmarkMetrics {
  totalEvents: number;
  top1Accuracy: number;
  top3Recall: number;
  top5Recall: number;
  precision: number;
  recall: number;
  f1Score: number;
  falseAutoLinkRate: number;
  humanOverrideRate: number;
  brierScore: number;
  difficultyBreakdown: Record<DifficultyLevel, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  baselineComparison: {
    exactString: { top1: number; top3: number; f1: number; falseAuto: number };
    fuzzyString: { top1: number; top3: number; f1: number; falseAuto: number };
    embeddingOnly: { top1: number; top3: number; f1: number; falseAuto: number };
    sitesyncHybrid: { top1: number; top3: number; f1: number; falseAuto: number };
  };
}

export * from '../../packages/types/src/copilot';
export * from '../../packages/types/src/voice';
export * from '../../packages/types/src/forecasting';
