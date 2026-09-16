/**
 * SiteSync Enterprise Observability & Telemetry Service (Master Prompt 12)
 *
 * Implements centralized metrics tracking across the three pillars:
 * 1. API & System Metrics (Latency, throughput, errors)
 * 2. Worker & Queue Metrics (Job throughput, retries, DLQ depth)
 * 3. AI Quality & Cost Metrics (Token usage, latency, grounding failures, review rate)
 */

export interface LatencyMetric {
  operation: string;
  durationMs: number;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
  correlationId?: string;
}

export interface AIQualityMetrics {
  totalMatchesEvaluated: number;
  autoLinkedCount: number;
  reviewRequiredCount: number;
  unmatchedCount: number;
  humanOverridesCount: number;
  groundingFailuresCount: number;
  autoLinkRate: number;
  reviewRequiredRate: number;
  unmatchedRate: number;
  humanOverrideRate: number;
}

export interface SystemTelemetrySummary {
  uptimeSeconds: number;
  api: {
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
  };
  database: {
    totalQueries: number;
    slowQueriesCount: number;
    avgQueryLatencyMs: number;
  };
  queues: {
    jobsProcessed: number;
    jobsFailed: number;
    dlqCount: number;
  };
  ai: {
    totalInferences: number;
    totalTokensUsed: number;
    estimatedCostUsd: number;
    fallbackCount: number;
    quality: AIQualityMetrics;
  };
}

export class TelemetryService {
  private static instance: TelemetryService;

  private latencies: LatencyMetric[] = [];
  private totalRequests = 0;
  private totalErrors = 0;

  private totalDbQueries = 0;
  private dbSlowQueries = 0;
  private dbLatenciesMs: number[] = [];

  private jobsProcessed = 0;
  private jobsFailed = 0;
  private dlqCount = 0;

  // AI Quality
  private totalInferences = 0;
  private totalTokens = 0;
  private estimatedCostUsd = 0.0;
  private fallbackCount = 0;

  private autoLinked = 0;
  private reviewRequired = 0;
  private unmatched = 0;
  private humanOverrides = 0;
  private groundingFailures = 0;

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Record API request latency and outcome.
   */
  public recordApiRequest(operation: string, durationMs: number, success: boolean, correlationId?: string): void {
    this.totalRequests++;
    if (!success) this.totalErrors++;

    this.latencies.push({
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
      status: success ? 'SUCCESS' : 'ERROR',
      correlationId,
    });

    if (this.latencies.length > 2000) this.latencies.shift();
  }

  /**
   * Record database query duration.
   */
  public recordDatabaseQuery(durationMs: number): void {
    this.totalDbQueries++;
    this.dbLatenciesMs.push(durationMs);
    if (durationMs > 100) this.dbSlowQueries++;
    if (this.dbLatenciesMs.length > 2000) this.dbLatenciesMs.shift();
  }

  /**
   * Record worker background queue execution.
   */
  public recordQueueJob(success: boolean, sentToDlq = false): void {
    this.jobsProcessed++;
    if (!success) this.jobsFailed++;
    if (sentToDlq) this.dlqCount++;
  }

  /**
   * Record AI execution telemetry (tokens, cost, fallback).
   */
  public recordAIInference(params: {
    operation: string;
    tokens?: number;
    durationMs: number;
    usedFallback?: boolean;
    costUsd?: number;
  }): void {
    this.totalInferences++;
    if (params.tokens) this.totalTokens += params.tokens;
    if (params.usedFallback) this.fallbackCount++;
    if (params.costUsd) this.estimatedCostUsd += params.costUsd;
  }

  /**
   * Record match classification outcome for model quality tracking.
   */
  public recordMatchOutcome(outcome: 'AUTO_LINK' | 'REVIEW_REQUIRED' | 'UNMATCHED'): void {
    if (outcome === 'AUTO_LINK') this.autoLinked++;
    else if (outcome === 'REVIEW_REQUIRED') this.reviewRequired++;
    else if (outcome === 'UNMATCHED') this.unmatched++;
  }

  public recordHumanOverride(): void {
    this.humanOverrides++;
  }

  public recordGroundingFailure(): void {
    this.groundingFailures++;
  }

  /**
   * Computes a comprehensive telemetry summary.
   */
  public getSummary(): SystemTelemetrySummary {
    const sortedApiLatencies = this.latencies.map((l) => l.durationMs).sort((a, b) => a - b);
    const avgLatencyMs =
      sortedApiLatencies.length > 0
        ? Math.round(sortedApiLatencies.reduce((a, b) => a + b, 0) / sortedApiLatencies.length)
        : 0;
    const p95LatencyMs =
      sortedApiLatencies.length > 0
        ? sortedApiLatencies[Math.floor(sortedApiLatencies.length * 0.95)]
        : 0;

    const avgDbLatencyMs =
      this.dbLatenciesMs.length > 0
        ? Math.round(this.dbLatenciesMs.reduce((a, b) => a + b, 0) / this.dbLatenciesMs.length)
        : 0;

    const totalMatches = this.autoLinked + this.reviewRequired + this.unmatched;

    return {
      uptimeSeconds: Math.round(process.uptime()),
      api: {
        totalRequests: this.totalRequests,
        errorCount: this.totalErrors,
        errorRate: this.totalRequests > 0 ? Number((this.totalErrors / this.totalRequests).toFixed(4)) : 0,
        avgLatencyMs,
        p95LatencyMs,
      },
      database: {
        totalQueries: this.totalDbQueries,
        slowQueriesCount: this.dbSlowQueries,
        avgQueryLatencyMs: avgDbLatencyMs,
      },
      queues: {
        jobsProcessed: this.jobsProcessed,
        jobsFailed: this.jobsFailed,
        dlqCount: this.dlqCount,
      },
      ai: {
        totalInferences: this.totalInferences,
        totalTokensUsed: this.totalTokens,
        estimatedCostUsd: Number(this.estimatedCostUsd.toFixed(4)),
        fallbackCount: this.fallbackCount,
        quality: {
          totalMatchesEvaluated: totalMatches,
          autoLinkedCount: this.autoLinked,
          reviewRequiredCount: this.reviewRequired,
          unmatchedCount: this.unmatched,
          humanOverridesCount: this.humanOverrides,
          groundingFailuresCount: this.groundingFailures,
          autoLinkRate: totalMatches > 0 ? Number((this.autoLinked / totalMatches).toFixed(3)) : 0,
          reviewRequiredRate: totalMatches > 0 ? Number((this.reviewRequired / totalMatches).toFixed(3)) : 0,
          unmatchedRate: totalMatches > 0 ? Number((this.unmatched / totalMatches).toFixed(3)) : 0,
          humanOverrideRate:
            this.reviewRequired > 0 ? Number((this.humanOverrides / this.reviewRequired).toFixed(3)) : 0,
        },
      },
    };
  }

  public clear(): void {
    this.latencies = [];
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.totalDbQueries = 0;
    this.dbSlowQueries = 0;
    this.dbLatenciesMs = [];
    this.jobsProcessed = 0;
    this.jobsFailed = 0;
    this.dlqCount = 0;
    this.totalInferences = 0;
    this.totalTokens = 0;
    this.estimatedCostUsd = 0;
    this.fallbackCount = 0;
    this.autoLinked = 0;
    this.reviewRequired = 0;
    this.unmatched = 0;
    this.humanOverrides = 0;
    this.groundingFailures = 0;
  }
}
