import {
  UserRole,
  Discipline,
  ActivityStatus,
  EventStatus,
  DependencyType,
  ReportType,
  ProcessingStatus,
  MatchDecision,
  ReviewDecisionType,
  EvidenceType,
  RiskLevel,
  RiskType,
  RiskSeverity,
  RiskStatus,
  ProjectStatus,
  ScheduleHealthStatus,
  GanttZoomLevel,
  DelayCause,
  SampleQuality,
  ProjectClosureStatus,
} from './enums';



export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDTO {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  startDate: Date;
  plannedEndDate: Date;
  actualEndDate?: Date | null;
  plannedProgress: number;
  actualProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemberDTO {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
}

export interface WBSNodeDTO {
  id: string;
  projectId: string;
  parentId?: string | null;
  code: string;
  name: string;
  level: number; // 1..6
  path: string;
  discipline: Discipline;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDTO {
  id: string;
  projectId: string;
  wbsNodeId: string;
  activityCode: string;
  name: string;
  description: string;
  discipline: Discipline;
  location: string;
  wbsPath: string;
  plannedStart: Date;
  plannedEnd: Date;
  actualStart?: Date | null;
  actualEnd?: Date | null;
  plannedProgress: number;
  actualProgress: number;
  status: ActivityStatus;
  plannedDuration: number;
  actualDuration?: number | null;
  varianceDays: number;
  criticalPath: boolean;
  aliases: string[];
  lastUpdateDate?: Date | null;
  isStale: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DependencyDTO {
  id: string;
  projectId: string;
  predecessorId: string;
  successorId: string;
  type: DependencyType;
  lag: number;
  createdAt: Date;
}

export interface FieldReportDTO {
  id: string;
  projectId: string;
  uploadedBy: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  checksum: string;
  reportDate: Date;
  discipline?: Discipline | null;
  sourceType: ReportType;
  storageKey: string;
  processingStatus: ProcessingStatus;
  rawText: string;
  pageCount: number;
  extractedEventCount: number;
  matchedEventCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractedEventDTO {
  id: string;
  projectId: string;
  fieldReportId: string;
  eventDate: Date;
  discipline?: Discipline | null;
  description: string;
  status: EventStatus;
  progress?: number | null;
  location?: string | null;
  normalizedDescription: string;
  entities: string[];
  extractionConfidence: number;
  sourceText: string;
  sourcePage?: number | null;
  characterStart?: number | null;
  characterEnd?: number | null;
  difficulty?: string | null;
  groundTruthActivityId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityMatchDTO {
  id: string;
  projectId: string;
  extractedEventId: string;
  activityId: string;
  rank: number;
  semanticScore: number;
  disciplineScore: number;
  locationScore: number;
  wbsScore: number;
  temporalScore: number;
  dependencyScore: number;
  entityScore: number;
  finalScore: number;
  confidenceLevel: number;
  decision: MatchDecision;
  matchExplanation: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenceDTO {
  id: string;
  projectId: string;
  fieldReportId: string;
  extractedEventId: string;
  type: EvidenceType;
  pageNumber?: number | null;
  sheetName?: string | null;
  cellReference?: string | null;
  textSnippet: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ProgressUpdateDTO {
  id: string;
  projectId: string;
  activityId: string;
  extractedEventId: string;
  sourceMatchId?: string | null;
  previousProgress: number;
  newProgress: number;
  actualStart?: Date | null;
  actualEnd?: Date | null;
  source: string;
  verifiedBy: string;
  verifiedAt: Date;
  createdAt: Date;
}

export interface ReviewDecisionDTO {
  id: string;
  projectId: string;
  matchId: string;
  reviewerId: string;
  decision: ReviewDecisionType;
  previousDecision?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export interface LegacyHistoricalOutcomeRecord {
  id: string;
  projectId: string;
  projectName: string;
  activityType: string;
  discipline: Discipline;
  plannedDuration: number;
  actualDuration: number;
  delayDays: number;
  delayCause: string;
  contractor?: string | null;
  productivityMetric?: string | null;
  lessonsLearned: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AuditLogDTO {
  id: string;
  projectId: string;
  actorId: string;
  actorName: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ReviewPriorityDTO {
  score: number; // 0..100
  reasons: string[];
  components: {
    uncertainty: number;
    ambiguity: number;
    scheduleCriticality: number;
    downstreamImpact: number;
    recency: number;
  };
}

export interface ReviewItemDTO {
  id: string;
  projectId: string;
  matchId: string;
  status: string;
  event: {
    id: string;
    description: string;
    normalizedDescription: string;
    progress?: number | null;
    status: string;
    discipline?: Discipline | null;
    location?: string | null;
    eventDate: string;
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
  reviewPriority: ReviewPriorityDTO;
  downstreamImpact?: {
    downstreamCount: number;
    isCritical: boolean;
    directSuccessors: string[];
  };
  createdAt: string;
}

export interface EvidenceChainDTO {
  progressUpdateId?: string;
  reviewDecisionId?: string;
  matchId: string;
  eventId: string;
  fieldReportId: string;
  sourceType: string;
  sourceLocator?: string;
  pageNumber?: number;
  sheetName?: string;
  cellRange?: string;
  quotedText: string;
  timestamp?: string;
}

export interface ProgressHistoryEntryDTO {
  id: string;
  date: string;
  previousProgress: number;
  newProgress: number;
  status: string;
  sourceReport: string;
  verified: boolean;
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
}

export interface ScheduleVarianceDTO {
  activityId: string;
  activityCode: string;
  plannedStart: string;
  plannedFinish: string;
  actualStart?: string | null;
  actualFinish?: string | null;
  plannedDuration: number;
  actualDuration?: number | null;
  startVarianceDays: number;
  endVarianceDays: number;
  durationVarianceDays: number;
  progressVariance: number;
  status: string;
  isDelayed: boolean;
}

export interface DependencyImpactDTO {
  activityId: string;
  activityCode: string;
  activityName: string;
  status: string;
  isCritical: boolean;
  varianceDays: number;
  affectedSuccessorCount: number;
  successors: Array<{
    activityId: string;
    activityCode: string;
    activityName: string;
    discipline: Discipline;
    dependencyType: string;
    lag: number;
    isCritical: boolean;
    potentialStartDelayDays: number;
  }>;
}

export interface RiskSignalDTO {
  id: string;
  projectId: string;
  activityId: string;
  level: RiskLevel;
  type: string;
  title: string;
  description: string;
  source: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  resolvedAt?: Date | null;
}

// Master Prompt 6: Command Center DTOs

export interface ProjectHeaderDTO {
  projectId: string;
  projectCode: string;
  projectName: string;
  description: string;
  projectManager: string;
  startDate: string;
  plannedCompletion: string;
  currentStatus: ProjectStatus;
  statusReason: string;
  lastVerifiedUpdate: string | null;
  totalActivitiesCount: number;
}

export interface ExecutiveMetricsDTO {
  overallProgress: number; // 0..100 (duration-weighted)
  overallProgressFraction: number; // 0..1
  plannedProgress: number; // 0..100
  scheduleVarianceDays: number; // e.g. +6.4 days
  totalActivities: number;
  verifiedUpdates: number;
  reviewRequired: number;
  unmatchedEvents: number;
  dataFreshnessPercentage: number; // 0..100
  criticalActivitiesAtRisk: number;
  calculationMethodology: string;
}

export interface ScheduleHealthDTO {
  completed: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
  notStarted: number;
  total: number;
}

export interface ProgressDataPointDTO {
  date: string; // YYYY-MM-DD
  plannedProgress: number; // 0..1
  actualProgress: number; // 0..1
  variance: number;
}

export interface ProgressTimeSeriesDTO {
  projectId: string;
  currentDate: string;
  asOfDate: string;
  series: ProgressDataPointDTO[];
  methodology: string;
}

export interface DisciplinePerformanceItemDTO {
  discipline: Discipline;
  name: string;
  activityCount: number;
  actualProgress: number; // 0..100
  plannedProgress: number; // 0..100
  variancePercentage: number; // actual - planned in %
  openReviews: number;
  staleActivitiesCount: number;
}

export interface DisciplinePerformanceDTO {
  projectId: string;
  disciplines: DisciplinePerformanceItemDTO[];
}

export interface AttentionRequiredDTO {
  projectId: string;
  totalReviewCount: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  unmatchedCount: number;
  unmatchedBreakdown: {
    potentialNewActivities: number;
    insufficientInformation: number;
    outOfScope: number;
    duplicate: number;
  };
  staleActivitiesCount: number;
  staleThresholdHours: number;
}

export interface DataFreshnessDTO {
  projectId: string;
  lastFieldUpdate: string | null;
  lastFieldUpdateMinutesAgo: number | null;
  reportsToday: number;
  verifiedToday: number;
  pendingVerification: number;
  freshnessPercentage: number;
  isLive: boolean;
  statusLabel: string;
}

export interface RiskFactorDTO {
  type: string;
  label: string;
  value: number | string | boolean;
  weight: number;
  impactScore: number;
}

export interface RiskExplanationDTO {
  whatHappened: string;
  whyItMatters: string;
  evidence: string;
  evidenceSourceLocator?: string | null;
  affectedDownstreamCount: number;
  recommendedAction: string;
}

export interface RiskDTO {
  id: string;
  projectId: string;
  activityId: string;
  activityCode: string;
  activityName: string;
  discipline: Discipline;
  riskType: RiskType;
  severity: RiskSeverity;
  status: RiskStatus;
  score: number; // 0..100 explainable score
  confidence: number;
  trigger: string;
  factors: RiskFactorDTO[];
  explanation: RiskExplanationDTO;
  evidenceSources: Array<{
    documentName: string;
    pageOrLocation: string;
    excerpt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export interface RiskOverviewDTO {
  projectId: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  risks: RiskDTO[];
}

export interface ActivityDetailDTO {
  id: string;
  projectId: string;
  activityCode: string;
  name: string;
  description: string;
  discipline: Discipline;
  wbsPath: string;
  wbsNodeId: string;
  location: string;
  status: ActivityStatus;
  isCritical: boolean;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  plannedDuration: number;
  actualDuration: number | null;
  plannedProgress: number; // 0..100
  actualProgress: number; // 0..100
  startVarianceDays: number;
  endVarianceDays: number;
  durationVarianceDays: number;
  progressVariancePercentage: number;
  isStale: boolean;
  lastUpdateDate: string | null;
  predecessors: Array<{
    activityId: string;
    activityCode: string;
    activityName: string;
    type: DependencyType;
    lag: number;
    actualProgress: number;
    status: ActivityStatus;
  }>;
  successors: Array<{
    activityId: string;
    activityCode: string;
    activityName: string;
    type: DependencyType;
    lag: number;
    actualProgress: number;
    status: ActivityStatus;
    isCritical: boolean;
    potentialStartDelayDays: number;
  }>;
  evidenceChain: Array<{
    evidenceId: string;
    sourceType: string;
    sourceLocator: string;
    quotedText: string;
    reportedDate: string;
    verifiedBy: string;
    progressPercentage: number;
  }>;
  recentUpdates: Array<{
    id: string;
    reportedDate: string;
    progress: number;
    verifiedBy: string;
    verifiedAt: string;
    sourceDocument: string;
  }>;
}

export interface WBSViewNodeDTO {
  id: string;
  code: string;
  name: string;
  level: number;
  discipline: Discipline;
  path: string;
  children: WBSViewNodeDTO[];
  activities: Array<{
    id: string;
    activityCode: string;
    name: string;
    discipline: Discipline;
    status: ActivityStatus;
    plannedStart: string;
    plannedEnd: string;
    actualStart: string | null;
    actualEnd: string | null;
    plannedDuration: number;
    actualDuration: number | null;
    plannedProgress: number;
    actualProgress: number;
    varianceDays: number;
    isCritical: boolean;
    isStale: boolean;
    predecessorCount: number;
    successorCount: number;
  }>;
}

export interface ScheduleViewDTO {
  projectId: string;
  zoomLevel: GanttZoomLevel;
  timelineStart: string;
  timelineEnd: string;
  totalActivities: number;
  filteredActivitiesCount: number;
  wbsTree: WBSViewNodeDTO[];
}

export interface DependencyGraphDTO {
  activityId: string;
  activityCode: string;
  activityName: string;
  discipline: Discipline;
  status: ActivityStatus;
  isCritical: boolean;
  varianceDays: number;
  confirmedDelayDays: number;
  predecessors: Array<{
    activityId: string;
    activityCode: string;
    name: string;
    status: ActivityStatus;
    varianceDays: number;
    dependencyType: DependencyType;
  }>;
  directSuccessors: Array<{
    activityId: string;
    activityCode: string;
    name: string;
    status: ActivityStatus;
    isCritical: boolean;
    dependencyType: DependencyType;
    lag: number;
    potentialStartDelayDays: number;
  }>;
  downstreamCascade: Array<{
    depth: number;
    activityId: string;
    activityCode: string;
    name: string;
    discipline: Discipline;
    isCritical: boolean;
    potentialStartDelayDays: number;
    path: string[];
  }>;
}

// Master Prompt 7: Historical Intelligence & Institutional Memory DTOs

export interface HistoricalQualityMetadataDTO {
  startVerified: boolean;
  endVerified: boolean;
  sourceCount: number;
  reviewed: boolean;
  isEligible: boolean;
  ineligibilityReason?: string;
}

export interface HistoricalOutcomeDTO {
  id: string;
  projectId: string;
  projectName: string;
  activityId: string;
  activityCode: string;
  activityName: string;
  discipline: Discipline;
  activityType: string;
  activityCategory: string;
  wbsPath: string;
  location: string;
  contractorName?: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string;
  actualEnd: string;
  plannedDuration: number;
  actualDuration: number;
  scheduleVariance: number;
  plannedQuantity?: number;
  actualQuantity?: number;
  quantityUnit?: string;
  productivityMetric?: number;
  productivityUnit?: string;
  delayCause: DelayCause;
  delayCategory: string;
  delayDays: number;
  lessonsLearned?: string;
  evidenceReference: string;
  evidenceSourceDocument: string;
  evidenceQuotedText: string;
  completionStatus: string;
  confidence: number;
  quality: HistoricalQualityMetadataDTO;
  createdAt: string;
}

export interface HistoricalBenchmarkDTO {
  activityType: string;
  activityName: string;
  discipline: Discipline;
  sampleCount: number;
  quality: SampleQuality;
  warningNotice?: string;
  durationDays: {
    median: number;
    mean: number;
    p25: number;
    p75: number;
    min: number;
    max: number;
  };
  scheduleVarianceDays: {
    median: number;
    mean: number;
  };
  productivity: {
    median: number | null;
    p25: number | null;
    p75: number | null;
    unit: string | null;
  };
  topDelayCauses: Array<{
    cause: DelayCause;
    count: number;
    percentage: number;
  }>;
  sampleRecords: HistoricalOutcomeDTO[];
}

export interface DelayIntelligenceDTO {
  cause: DelayCause;
  label: string;
  occurrences: number;
  percentage: number;
  affectedActivitiesCount: number;
  medianDelayDays: number;
  projectsCount: number;
  commonActivityTypes: string[];
  evidenceExcerpts: Array<{
    activityCode: string;
    activityName: string;
    projectName: string;
    delayDays: number;
    documentName: string;
    pageNumber: number;
    quotedText: string;
  }>;
}

export interface ProductivityIntelligenceDTO {
  activityType: string;
  discipline: Discipline;
  unit: string;
  sampleCount: number;
  p25: number;
  median: number;
  p75: number;
  topProject: string;
}

export interface HistoricalOverviewDTO {
  totalCompletedActivities: number;
  totalHistoricalProjects: number;
  totalDocumentedDelays: number;
  averageVerifiedDurationDays: number;
  medianScheduleVarianceDays: number;
  topDelayCategories: Array<{
    cause: DelayCause;
    label: string;
    count: number;
    percentage: number;
  }>;
  disciplineDistribution: Array<{
    discipline: Discipline;
    name: string;
    count: number;
    medianDuration: number;
    medianVariance: number;
  }>;
}

export interface SimilarActivityComparisonDTO {
  sourceActivity: {
    id: string;
    code: string;
    name: string;
    discipline: Discipline;
    activityType: string;
    plannedDuration: number;
    location: string;
  };
  benchmark: {
    sampleCount: number;
    quality: SampleQuality;
    warningNotice?: string;
    durationDays: {
      median: number;
      p25: number;
      p75: number;
    };
    medianVariance: number;
  };
  comparableActivities: Array<{
    outcomeId: string;
    projectId: string;
    projectName: string;
    activityCode: string;
    activityName: string;
    discipline: Discipline;
    plannedDuration: number;
    actualDuration: number;
    variance: number;
    delayCause: DelayCause;
    similarityScore: number;
    similarityReasons: string[];
    evidenceExcerpt: string;
  }>;
}

export interface ProjectComparisonItemDTO {
  projectId: string;
  projectCode: string;
  projectName: string;
  location: string;
  activityCount: number;
  completedActivities: number;
  averageDurationDays: number;
  medianVarianceDays: number;
  delayRatePercentage: number;
  topDelayCause: DelayCause;
  disciplineMix: Record<string, number>;
}

export interface ProjectComparisonDTO {
  projects: ProjectComparisonItemDTO[];
}

export interface HistoricalQualityReportDTO {
  projectId: string;
  totalActivities: number;
  activitiesCompleted: number;
  eligibleForHistory: number;
  missingActualStart: number;
  missingActualEnd: number;
  missingQuantity: number;
  unknownDelayCause: number;
  lowQualityRecords: number;
  closureStatus: ProjectClosureStatus;
  generatedAt: string;
}

export interface HistoricalSearchFilterDTO {
  projectId?: string;
  discipline?: Discipline | string;
  activityType?: string;
  location?: string;
  contractor?: string;
  delayCause?: DelayCause | string;
  sampleQuality?: SampleQuality | string;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
  page?: number;
  limit?: number;
}


