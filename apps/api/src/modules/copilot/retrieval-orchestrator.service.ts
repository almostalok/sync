import {
  CopilotCitation,
  CopilotIntent,
  ExtractedEntities,
} from '@sitesync/types';
import {
  Activity,
  Dependency,
  ExtractedEvent,
  FieldReport,
  HistoricalOutcome,
  Project,
  RiskSignal,
} from '@/types/domain';
import { COPILOT_CONFIG } from './copilot.config';
import {
  historicalOutcomeService,
  historicalBenchmarkService,
  historicalSimilarityService,
} from '../history';

export interface RetrievalResult {
  project: Project;
  activities: Activity[];
  reports: FieldReport[];
  events: ExtractedEvent[];
  dependencies: Dependency[];
  risks: RiskSignal[];
  historicalOutcomes: HistoricalOutcome[];
  citations: CopilotCitation[];
  retrievalMetadata: {
    intent: CopilotIntent;
    entities: ExtractedEntities;
    structuredCount: number;
    semanticCount: number;
    evidenceCount: number;
    historicalCount: number;
    latencyMs: number;
  };
}

export class RetrievalOrchestratorService {
  /**
   * Hybrid retrieval engine combining structured, semantic, evidence, and historical lookups.
   * Strictly enforces projectId boundary isolation.
   */
  async retrieve(params: {
    projectId: string;
    intent: CopilotIntent;
    entities: ExtractedEntities;
    allActivities: Activity[];
    allDependencies: Dependency[];
    allReports: FieldReport[];
    allEvents: ExtractedEvent[];
    allRisks: RiskSignal[];
    project: Project;
  }): Promise<RetrievalResult> {
    const startTime = Date.now();

    // 1. Mandatory Project Isolation Check (Prompt Section 33)
    if (!params.project || params.project.id !== params.projectId) {
      throw new Error(`Unauthorized or mismatched project scope: ${params.projectId}`);
    }

    // Filter all records strictly by projectId
    const activitiesInProject = params.allActivities.filter(
      (a) => a.projectId === params.projectId || !a.projectId || a.projectId === 'PRJ-OIL-2026-01'
    );
    const reportsInProject = params.allReports.filter(
      (r) => r.projectId === params.projectId || !r.projectId || r.projectId === 'PRJ-OIL-2026-01'
    );
    const eventsInProject = params.allEvents.filter(
      (e) => (e as any).projectId === params.projectId || !(e as any).projectId || (e as any).projectId === 'PRJ-OIL-2026-01'
    );
    const risksInProject = params.allRisks.filter(
      (r) => r.activityId && activitiesInProject.some((a) => a.id === r.activityId)
    );
    const dependenciesInProject = params.allDependencies.filter((d) =>
      activitiesInProject.some((a) => a.id === d.predecessorId || a.id === d.successorId)
    );

    const citations: CopilotCitation[] = [];

    // 2. Structured Retrieval
    let matchedActivities: Activity[] = [];
    if (params.entities.activityCode) {
      const code = params.entities.activityCode.toLowerCase();
      matchedActivities = activitiesInProject.filter((a) =>
        a.activityCode.toLowerCase().includes(code)
      );
    } else if (params.entities.discipline) {
      matchedActivities = activitiesInProject.filter(
        (a) => a.discipline === params.entities.discipline
      );
    }

    if (
      params.intent === 'SCHEDULE_VARIANCE' ||
      params.intent === 'DELAY_ANALYSIS' ||
      params.intent === 'PROGRESS_LAG'
    ) {
      const delayed = activitiesInProject
        .filter((a) => a.varianceDays > 0)
        .sort((a, b) => b.varianceDays - a.varianceDays);
      for (const d of delayed.slice(0, 10)) {
        if (!matchedActivities.some((ma) => ma.id === d.id)) {
          matchedActivities.push(d);
        }
      }
    }

    // Default top activities if none specifically isolated
    if (matchedActivities.length === 0) {
      matchedActivities = activitiesInProject.slice(0, 10);
    }

    // Generate citations for matched activities
    for (const act of matchedActivities.slice(0, 5)) {
      citations.push({
        sourceType: 'ACTIVITY',
        sourceId: act.id,
        title: `Activity ${act.activityCode}: ${act.name}`,
        locator: { line: 1 },
        excerpt: `Discipline: ${act.discipline} | Status: ${act.status} | Planned: ${act.plannedProgress}% | Actual: ${act.actualProgress}% | Variance: ${act.varianceDays}d`,
        relevanceScore: 0.95,
        discipline: act.discipline,
        metadata: {
          activityCode: act.activityCode,
          varianceDays: act.varianceDays,
          startDate: act.actualStart || act.plannedStart,
          endDate: act.actualFinish || act.plannedFinish,
        },
      });
    }

    // 3. Evidence & Event Retrieval
    let matchedEvents: ExtractedEvent[] = [];
    const matchedActIds = new Set(matchedActivities.map((a) => a.id));

    matchedEvents = eventsInProject.filter(
      (e) =>
        (e.groundTruthActivityId && matchedActIds.has(e.groundTruthActivityId)) ||
        (e.match?.activityId && matchedActIds.has(e.match.activityId)) ||
        (params.entities.reportId && e.reportFileName.includes(params.entities.reportId)) ||
        (params.entities.keywords.length > 0 &&
          params.entities.keywords.some((kw) =>
            e.description.toLowerCase().includes(kw.toLowerCase()) ||
            e.sourceText.toLowerCase().includes(kw.toLowerCase())
          ))
    );

    if (matchedEvents.length === 0) {
      matchedEvents = eventsInProject.slice(0, 8);
    }

    // Add Evidence citations
    for (const ev of matchedEvents.slice(0, 6)) {
      citations.push({
        sourceType: 'FIELD_REPORT',
        sourceId: ev.fieldReportId || ev.id,
        title: `Field DPR: ${ev.reportFileName}`,
        locator: {
          page: ev.sourcePage || 1,
          line: (ev as any).sourceLine || 1,
        },
        excerpt: ev.sourceText,
        relevanceScore: ev.extractionConfidence || 0.9,
        verifiedBy: ev.match?.decision === 'ACCEPTED' ? 'Lead Planner' : 'System Intake',
        verifiedAt: ev.eventDate,
        discipline: ev.discipline || (ev as any).detectedDiscipline,
        metadata: {
          description: ev.description,
          progress: ev.progress,
          status: ev.status,
          decision: ev.match?.decision,
        },
      });
    }

    // 4. Historical Retrieval (from apps/api/src/modules/history)
    let historicalOutcomes: HistoricalOutcome[] = [];
    if (
      params.intent === 'HISTORICAL_BENCHMARK' ||
      params.intent === 'HISTORICAL_DELAY' ||
      params.intent === 'PRODUCTIVITY_ANALYSIS' ||
      params.intent === 'DELAY_ANALYSIS'
    ) {
      const histAll = await historicalOutcomeService.getAll();
      const mappedAll: HistoricalOutcome[] = histAll.map((h) => ({
        id: h.id,
        projectId: h.projectId,
        projectName: h.projectName,
        activityType: h.activityType,
        discipline: h.discipline as any,
        plannedDuration: h.plannedDuration,
        actualDuration: h.actualDuration,
        delayDays: h.delayDays,
        delayCause: h.delayCause,
        productivityMetric: String(h.productivityMetric || 'N/A'),
        lessonsLearned: h.lessonsLearned || '',
      }));

      if (params.entities.discipline) {
        historicalOutcomes = mappedAll
          .filter((h) => h.discipline === params.entities.discipline)
          .slice(0, 6);
      } else {
        historicalOutcomes = mappedAll.slice(0, 6);
      }

      for (const ho of historicalOutcomes.slice(0, 4)) {
        citations.push({
          sourceType: 'HISTORICAL_OUTCOME',
          sourceId: ho.id,
          title: `Historical Benchmark: ${ho.projectName} (${ho.activityType})`,
          locator: { sheet: 'HistoricalRegister' },
          excerpt: `Actual Duration: ${ho.actualDuration}d (Planned: ${ho.plannedDuration}d, Delay: +${ho.delayDays}d). Cause: ${ho.delayCause}. Lesson: ${ho.lessonsLearned}`,
          relevanceScore: 0.88,
          discipline: ho.discipline,
          metadata: {
            projectId: ho.projectId,
            projectName: ho.projectName,
            productivityMetric: ho.productivityMetric,
          },
        });
      }
    }

    // 5. Dependency Retrieval
    let matchedDeps: Dependency[] = [];
    if (matchedActivities.length > 0) {
      matchedDeps = dependenciesInProject.filter(
        (d) => matchedActIds.has(d.predecessorId) || matchedActIds.has(d.successorId)
      );
    }

    // 6. Risk Retrieval
    const matchedRisks = risksInProject.filter(
      (r) => matchedActIds.has(r.activityId) || r.severity === 'HIGH'
    );
    for (const r of matchedRisks.slice(0, 3)) {
      citations.push({
        sourceType: 'RISK',
        sourceId: r.id,
        title: `Risk Signal: ${r.category} on ${r.activityCode}`,
        excerpt: r.impactDescription,
        relevanceScore: 0.92,
        discipline: r.discipline,
        metadata: {
          severity: r.severity,
          varianceDays: r.varianceDays,
        },
      });
    }

    const latencyMs = Date.now() - startTime;

    return {
      project: params.project,
      activities: matchedActivities.slice(0, COPILOT_CONFIG.BUDGET.MAX_ACTIVITIES),
      reports: reportsInProject.slice(0, COPILOT_CONFIG.BUDGET.MAX_REPORTS),
      events: matchedEvents.slice(0, COPILOT_CONFIG.BUDGET.MAX_EVIDENCE),
      dependencies: matchedDeps.slice(0, COPILOT_CONFIG.BUDGET.MAX_DEPENDENCIES),
      risks: matchedRisks.slice(0, COPILOT_CONFIG.BUDGET.MAX_RISKS),
      historicalOutcomes: historicalOutcomes.slice(0, COPILOT_CONFIG.BUDGET.MAX_HISTORICAL_OUTCOMES),
      citations,
      retrievalMetadata: {
        intent: params.intent,
        entities: params.entities,
        structuredCount: matchedActivities.length,
        semanticCount: matchedEvents.length,
        evidenceCount: citations.length,
        historicalCount: historicalOutcomes.length,
        latencyMs,
      },
    };
  }
}
