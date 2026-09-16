/**
 * SiteSync Data Freshness & Pipeline Health Monitor (Master Prompt 12 Section 25)
 *
 * Distinguishes between normal field inactivity (STALE_DATA)
 * versus infrastructure pipeline breakdowns (SYSTEM_FAILURE).
 */

export enum FreshnessStatus {
  FRESH = 'FRESH',
  STALE_DATA = 'STALE_DATA',
  SYSTEM_FAILURE = 'SYSTEM_FAILURE',
}

export interface ProjectFreshnessReport {
  projectId: string;
  status: FreshnessStatus;
  lastReportDate?: string;
  lastVerifiedProgressDate?: string;
  lastForecastDate?: string;
  daysSinceLastReport: number;
  daysSinceLastVerification: number;
  unprocessedQueueBacklog: number;
  consecutiveWorkerFailures: number;
  explanation: string;
}

export class DataFreshnessService {
  private static projectStates: Map<
    string,
    {
      lastReportDate?: string;
      lastVerifiedProgressDate?: string;
      lastForecastDate?: string;
      unprocessedQueueBacklog: number;
      consecutiveWorkerFailures: number;
    }
  > = new Map([
    [
      'PROJ-OIL-2026-01',
      {
        lastReportDate: '2026-09-16T18:00:00.000Z',
        lastVerifiedProgressDate: '2026-09-16T18:30:00.000Z',
        lastForecastDate: '2026-09-16T19:00:00.000Z',
        unprocessedQueueBacklog: 0,
        consecutiveWorkerFailures: 0,
      },
    ],
  ]);

  /**
   * Records an update for a project's operational timeline.
   */
  public recordActivity(params: {
    projectId: string;
    reportDate?: string;
    verifiedProgressDate?: string;
    forecastDate?: string;
    queueBacklog?: number;
    workerFailure?: boolean;
  }): void {
    const existing = DataFreshnessService.projectStates.get(params.projectId) || {
      unprocessedQueueBacklog: 0,
      consecutiveWorkerFailures: 0,
    };

    if (params.reportDate) existing.lastReportDate = params.reportDate;
    if (params.verifiedProgressDate) existing.lastVerifiedProgressDate = params.verifiedProgressDate;
    if (params.forecastDate) existing.lastForecastDate = params.forecastDate;
    if (params.queueBacklog !== undefined) existing.unprocessedQueueBacklog = params.queueBacklog;

    if (params.workerFailure) {
      existing.consecutiveWorkerFailures++;
    } else {
      existing.consecutiveWorkerFailures = 0;
    }

    DataFreshnessService.projectStates.set(params.projectId, existing);
  }

  /**
   * Assesses project data freshness and pipeline operational health.
   */
  public evaluateFreshness(projectId: string, asOfDate: Date = new Date()): ProjectFreshnessReport {
    const state = DataFreshnessService.projectStates.get(projectId) || {
      unprocessedQueueBacklog: 0,
      consecutiveWorkerFailures: 0,
    };

    const now = asOfDate.getTime();
    const lastReportMs = state.lastReportDate ? new Date(state.lastReportDate).getTime() : now;
    const lastVerifMs = state.lastVerifiedProgressDate ? new Date(state.lastVerifiedProgressDate).getTime() : now;

    const daysSinceLastReport = Math.max(0, Math.floor((now - lastReportMs) / (1000 * 60 * 60 * 24)));
    const daysSinceLastVerification = Math.max(0, Math.floor((now - lastVerifMs) / (1000 * 60 * 60 * 24)));

    // Infrastructure breakdown: queue is backed up OR repeated worker failures
    if (state.unprocessedQueueBacklog > 10 || state.consecutiveWorkerFailures >= 3) {
      return {
        projectId,
        status: FreshnessStatus.SYSTEM_FAILURE,
        lastReportDate: state.lastReportDate,
        lastVerifiedProgressDate: state.lastVerifiedProgressDate,
        lastForecastDate: state.lastForecastDate,
        daysSinceLastReport,
        daysSinceLastVerification,
        unprocessedQueueBacklog: state.unprocessedQueueBacklog,
        consecutiveWorkerFailures: state.consecutiveWorkerFailures,
        explanation: `CRITICAL: Ingestion worker pipeline failure detected. Queue backlog is ${state.unprocessedQueueBacklog} with ${state.consecutiveWorkerFailures} consecutive job failures.`,
      };
    }

    // Normal field inactivity: no reports filed recently, but workers are healthy
    if (daysSinceLastReport >= 3) {
      return {
        projectId,
        status: FreshnessStatus.STALE_DATA,
        lastReportDate: state.lastReportDate,
        lastVerifiedProgressDate: state.lastVerifiedProgressDate,
        lastForecastDate: state.lastForecastDate,
        daysSinceLastReport,
        daysSinceLastVerification,
        unprocessedQueueBacklog: state.unprocessedQueueBacklog,
        consecutiveWorkerFailures: 0,
        explanation: `Field Inactivity: No daily progress reports filed for ${daysSinceLastReport} days. Ingestion infrastructure is healthy.`,
      };
    }

    return {
      projectId,
      status: FreshnessStatus.FRESH,
      lastReportDate: state.lastReportDate,
      lastVerifiedProgressDate: state.lastVerifiedProgressDate,
      lastForecastDate: state.lastForecastDate,
      daysSinceLastReport,
      daysSinceLastVerification,
      unprocessedQueueBacklog: state.unprocessedQueueBacklog,
      consecutiveWorkerFailures: 0,
      explanation: 'Authoritative data is fresh and synchronized with active field execution.',
    };
  }
}
