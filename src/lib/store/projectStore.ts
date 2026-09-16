'use client';

import { 
  Activity, 
  ActivityMatch, 
  AuditLog, 
  BenchmarkMetrics, 
  Dependency, 
  ExtractedEvent, 
  FieldReport, 
  HistoricalOutcome, 
  ProgressUpdate, 
  Project, 
  ReviewDecision, 
  RiskSignal, 
  WBSNode 
} from '@/types/domain';
import { generateSyntheticProject } from '../data/syntheticGenerator';
import { extractEventsFromReport } from '../ai/extractor';
import { matchEventToActivities } from '../ai/hybridMatcher';
import { calculateScheduleMetrics, ScheduleMetrics } from '../schedule/graphEngine';
import { runBenchmarkEvaluation } from '../evaluation/benchmarkEngine';

export interface ProjectState {
  project: Project;
  wbsNodes: WBSNode[];
  activities: Activity[];
  dependencies: Dependency[];
  fieldReports: FieldReport[];
  events: ExtractedEvent[];
  matches: Map<string, ActivityMatch>;
  progressUpdates: ProgressUpdate[];
  reviewDecisions: ReviewDecision[];
  auditLogs: AuditLog[];
  historicalOutcomes: HistoricalOutcome[];
  risks: RiskSignal[];
  staleActivities: Activity[];
  scheduleMetrics: ScheduleMetrics;
  benchmarkMetrics: BenchmarkMetrics | null;
  activeView: 'dashboard' | 'gantt' | 'review' | 'reports' | 'evidence' | 'risks' | 'copilot' | 'voice' | 'benchmark' | 'history' | 'audit';
  selectedActivityId: string | null;
  selectedReportId: string | null;
  selectedEventId: string | null;
}

// Initial state builder
export function createInitialState(): ProjectState {
  const synthetic = generateSyntheticProject();
  const matches = new Map<string, ActivityMatch>();

  // Run initial matching for initial pre-seeded events
  synthetic.initialEvents.forEach(ev => {
    const match = matchEventToActivities(ev, synthetic.activities, 5);
    ev.match = match;
    matches.set(ev.id, match);
  });

  const { metrics, risks, staleActivities } = calculateScheduleMetrics(
    synthetic.activities,
    synthetic.dependencies
  );

  const initialAudit: AuditLog[] = [
    {
      id: 'AUDIT-INIT-01',
      projectId: synthetic.project.id,
      userId: 'SYSTEM',
      userName: 'SiteSync Ingestion Engine',
      entityType: 'SCHEDULE',
      entityId: synthetic.project.id,
      action: 'INGESTED',
      explanation: 'Ingested baseline schedule with 100+ L5/L6 activities and dependency networks.',
      timestamp: '2026-09-16T12:00:00Z',
    },
    {
      id: 'AUDIT-INIT-02',
      projectId: synthetic.project.id,
      userId: 'AUTO_LINK_ENGINE',
      userName: 'SiteSync AI Matcher',
      entityType: 'MATCH',
      entityId: 'EVT-0916-01',
      action: 'AUTO_LINKED',
      explanation: 'Auto-linked CIV-EXC-042 (Compressor Foundation Excavation) with 94.2% calibrated confidence.',
      timestamp: '2026-09-16T17:31:05Z',
    }
  ];

  return {
    project: synthetic.project,
    wbsNodes: synthetic.wbsNodes,
    activities: synthetic.activities,
    dependencies: synthetic.dependencies,
    fieldReports: synthetic.fieldReports,
    events: synthetic.initialEvents,
    matches,
    progressUpdates: [],
    reviewDecisions: [],
    auditLogs: initialAudit,
    historicalOutcomes: synthetic.historicalOutcomes,
    risks,
    staleActivities,
    scheduleMetrics: metrics,
    benchmarkMetrics: null,
    activeView: 'dashboard',
    selectedActivityId: 'CIV-EXC-042',
    selectedReportId: 'REP-2026-09-16-01',
    selectedEventId: 'EVT-0916-01',
  };
}
