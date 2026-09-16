import {
  CopilotCalculation,
  CopilotContextPacket,
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

export class ContextAssemblerService {
  /**
   * Assemble a normalized, budget-bounded context packet adhering to evidence hierarchy.
   */
  assembleContext(params: {
    project: Project;
    activities: Activity[];
    dependencies: Dependency[];
    reports: FieldReport[];
    events: ExtractedEvent[];
    risks: RiskSignal[];
    historicalOutcomes: HistoricalOutcome[];
    calculations: CopilotCalculation[];
    intent: CopilotIntent;
    entities: ExtractedEntities;
    retrievalLatencyMs: number;
  }): CopilotContextPacket {
    // 1. Sort activities by relevance and evidence weight
    const sortedActivities = [...params.activities]
      .sort((a, b) => {
        // Boost entity match
        if (params.entities.activityCode) {
          const aMatch = a.activityCode.toLowerCase().includes(params.entities.activityCode.toLowerCase());
          const bMatch = b.activityCode.toLowerCase().includes(params.entities.activityCode.toLowerCase());
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
        }
        // Then variance
        return Math.abs(b.varianceDays) - Math.abs(a.varianceDays);
      })
      .slice(0, COPILOT_CONFIG.BUDGET.MAX_ACTIVITIES);

    // 2. Sort events by Evidence Hierarchy:
    // Level 1: Verified/Accepted > Level 2: Extracted > Level 3: Raw
    const sortedEvents = [...params.events]
      .sort((a, b) => {
        const aLevel =
          a.match?.decision === 'ACCEPTED'
            ? COPILOT_CONFIG.EVIDENCE_PRIORITY.LEVEL_1_VERIFIED
            : a.match?.decision === 'AUTO_LINKED'
            ? COPILOT_CONFIG.EVIDENCE_PRIORITY.LEVEL_2_ACCEPTED_EVENT
            : COPILOT_CONFIG.EVIDENCE_PRIORITY.LEVEL_3_FIELD_REPORT;
        const bLevel =
          b.match?.decision === 'ACCEPTED'
            ? COPILOT_CONFIG.EVIDENCE_PRIORITY.LEVEL_1_VERIFIED
            : b.match?.decision === 'AUTO_LINKED'
            ? COPILOT_CONFIG.EVIDENCE_PRIORITY.LEVEL_2_ACCEPTED_EVENT
            : COPILOT_CONFIG.EVIDENCE_PRIORITY.LEVEL_3_FIELD_REPORT;
        return aLevel - bLevel;
      })
      .slice(0, COPILOT_CONFIG.BUDGET.MAX_EVIDENCE);

    // 3. Assemble normalized packet
    return {
      project: {
        id: params.project.id,
        name: params.project.name,
        plannedProgress: params.project.plannedProgress,
        actualProgress: params.project.actualProgress,
        varianceDays: Math.round((params.project.plannedProgress - params.project.actualProgress) * 0.8),
        dataVersion: 182, // Deterministic state snapshot version
      },
      activities: sortedActivities.map((a) => ({
        id: a.id,
        code: a.activityCode,
        name: a.name,
        discipline: a.discipline,
        status: a.status,
        plannedProgress: a.plannedProgress,
        actualProgress: a.actualProgress,
        varianceDays: a.varianceDays,
        isCritical: a.criticalPath || (a as any).isCritical || false,
        plannedStartDate: a.plannedStart,
        plannedEndDate: a.plannedFinish,
        actualStartDate: a.actualStart,
        actualEndDate: a.actualFinish,
      })),
      progressUpdates: sortedEvents
        .filter((e) => e.progress !== undefined)
        .map((e) => ({
          eventId: e.id,
          activityId: e.groundTruthActivityId || e.match?.activityId,
          progress: e.progress,
          status: e.status,
          verifiedDate: e.eventDate,
          sourceReport: e.reportFileName,
          isVerified: e.match?.decision === 'ACCEPTED' || e.match?.decision === 'AUTO_LINKED',
        })),
      reports: params.reports.slice(0, COPILOT_CONFIG.BUDGET.MAX_REPORTS).map((r) => ({
        id: r.id,
        fileName: r.fileName,
        reportDate: r.reportDate,
        uploadedBy: r.uploadedBy,
        sourceType: r.sourceType,
      })),
      evidence: sortedEvents.map((e) => ({
        id: e.id,
        reportName: e.reportFileName,
        page: e.sourcePage || 1,
        line: (e as any).sourceLine || 1,
        sourceText: e.sourceText,
        confidence: e.extractionConfidence,
        hierarchyLevel:
          e.match?.decision === 'ACCEPTED'
            ? 'LEVEL_1_VERIFIED'
            : e.match?.decision === 'AUTO_LINKED'
            ? 'LEVEL_2_ACCEPTED'
            : 'LEVEL_3_FIELD_REPORT',
      })),
      dependencies: params.dependencies.slice(0, COPILOT_CONFIG.BUDGET.MAX_DEPENDENCIES).map((d) => ({
        id: d.id,
        predecessorId: d.predecessorId,
        successorId: d.successorId,
        type: d.dependencyType || (d as any).type,
        lag: d.lag,
      })),
      risks: params.risks.slice(0, COPILOT_CONFIG.BUDGET.MAX_RISKS).map((r) => ({
        id: r.id,
        activityCode: r.activityCode,
        category: r.category,
        severity: r.severity,
        varianceDays: r.varianceDays,
        description: r.impactDescription,
      })),
      historicalOutcomes: params.historicalOutcomes
        .slice(0, COPILOT_CONFIG.BUDGET.MAX_HISTORICAL_OUTCOMES)
        .map((h) => ({
          id: h.id,
          projectName: h.projectName,
          activityType: h.activityType,
          discipline: h.discipline,
          plannedDuration: h.plannedDuration,
          actualDuration: h.actualDuration,
          delayDays: h.delayDays,
          delayCause: h.delayCause,
          productivityMetric: h.productivityMetric,
          lessonsLearned: h.lessonsLearned,
        })),
      calculations: params.calculations.slice(0, COPILOT_CONFIG.BUDGET.MAX_CALCULATIONS),
      retrievalMetadata: {
        intent: params.intent,
        entities: params.entities,
        budgetUsage: {
          activitiesCount: sortedActivities.length,
          reportsCount: params.reports.length,
          evidenceCount: sortedEvents.length,
          dependenciesCount: params.dependencies.length,
          risksCount: params.risks.length,
          historicalCount: params.historicalOutcomes.length,
        },
        retrievalLatencyMs: params.retrievalLatencyMs,
      },
    };
  }
}
