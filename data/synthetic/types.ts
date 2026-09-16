import { Discipline, ActivityStatus, DependencyType, EventStatus } from '@sitesync/types';

export enum DifficultyLevel {
  EXACT = 1,
  MINOR_VARIATION = 2,
  PARAPHRASE = 3,
  NOISY = 4,
  AMBIGUOUS = 5,
  GRANULARITY_MISMATCH = 6,
  UNMATCHED = 7,
}

export interface DifficultyDistribution {
  exact: number; // 0.20
  paraphrase: number; // 0.20
  noisy: number; // 0.20
  ambiguous: number; // 0.15
  granularityMismatch: number; // 0.15
  unmatched: number; // 0.10
}

export interface SyntheticDatasetConfig {
  seed: number;
  projectCode: string;
  projectName: string;
  startDate: string; // ISO date string
  durationDays: number;
  activityCount: number;
  dependencyCount: number;
  reportCount: number;
  eventCount: number;
  difficultyDistribution: DifficultyDistribution;
}

export interface SyntheticWBSNode {
  id: string;
  code: string;
  name: string;
  level: number;
  discipline: Discipline;
  parentId: string | null;
  path: string;
}

export interface SyntheticActivity {
  id: string;
  wbsNodeId: string;
  activityCode: string;
  name: string;
  description: string;
  discipline: Discipline;
  activityType: string;
  location: string;
  equipmentTag?: string;
  wbsPath: string;
  plannedStart: string;
  plannedFinish: string;
  plannedDuration: number;
  actualStart?: string | null;
  actualFinish?: string | null;
  actualDuration?: number | null;
  plannedProgress: number;
  actualProgress: number;
  status: ActivityStatus;
  criticalPath: boolean;
  aliases: string[];
}

export interface SyntheticDependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: DependencyType;
  lag: number;
}

export interface SyntheticFieldReport {
  id: string;
  reportNumber: string;
  reportDate: string;
  uploadDate: string; // May differ from reportDate for delayed reporting tests
  discipline: Discipline;
  sourceType: 'STRUCTURED_DPR' | 'SEMI_STRUCTURED' | 'SITE_DIARY' | 'BULLET_POINTS' | 'SUPERVISOR_NOTE' | 'SPREADSHEET';
  author: string;
  rawText: string;
  fileName: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
}

export interface SyntheticGroundTruthEvent {
  id: string;
  fieldReportId: string;
  eventDate: string;
  discipline: Discipline;
  location: string;
  text: string;
  normalizedText: string;
  progress: number;
  status: EventStatus;
  difficultyLevel: DifficultyLevel;
  groundTruthActivityId: string | null;
  groundTruthCandidateActivityIds?: string[];
  parentActivityId?: string | null;
  subScope?: string | null;
  confidenceThreshold: number;
  metadata: {
    generatorVersion: string;
    seed: number;
    scenario: string;
    action: string;
    equipmentTag?: string;
    location: string;
  };
}

export interface SyntheticHistoricalOutcome {
  id: string;
  activityType: string;
  discipline: Discipline;
  plannedDuration: number;
  actualDuration: number;
  delayDays: number;
  delayCause: string;
  contractor: string;
  productivity: string;
  lessonsLearned: string;
}

export interface SyntheticProjectDataset {
  project: {
    id: string;
    code: string;
    name: string;
    description: string;
    location: string;
    status: string;
    plannedStart: string;
    plannedFinish: string;
    plannedProgress: number;
    actualProgress: number;
  };
  wbs: SyntheticWBSNode[];
  activities: SyntheticActivity[];
  dependencies: SyntheticDependency[];
  fieldReports: SyntheticFieldReport[];
  events: SyntheticGroundTruthEvent[];
  historicalOutcomes: SyntheticHistoricalOutcome[];
  metadata: {
    generatedAt: string;
    generatorVersion: string;
    seed: number;
    scenario: string;
  };
}

export interface BenchmarkRecord {
  eventId: string;
  text: string;
  discipline: Discipline;
  location: string;
  date: string;
  progress: number;
  status: string;
  difficultyLevel: DifficultyLevel;
  groundTruthActivityId: string | null;
  groundTruthCandidateActivityIds?: string[];
  subScope?: string | null;
}
