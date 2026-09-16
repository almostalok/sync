import { Discipline, HistoricalBenchmarkDTO, SampleQuality } from '@sitesync/types';
import { HistoricalAggregationService } from './historical-aggregation.service';
import { HISTORICAL_CONFIG } from './historical.config';

export interface HistoricalBenchmarkQueryContext {
  question?: string;
  discipline?: Discipline | string;
  activityType?: string;
  projectType?: string;
}

export interface HistoricalCopilotContractResponse {
  question: string;
  filters: {
    discipline?: string;
    activityType?: string;
  };
  sampleCount: number;
  statistics: {
    medianDays: number;
    meanDays: number;
    p25Days: number;
    p75Days: number;
    minDays: number;
    maxDays: number;
    medianVarianceDays: number;
  };
  quality: SampleQuality;
  qualityWarning: string;
  evidence: Array<{
    projectId: string;
    projectName: string;
    activityCode: string;
    activityName: string;
    actualDuration: number;
    scheduleVariance: number;
    delayCause: string;
    documentExcerpt: string;
  }>;
}

/**
 * Historical Benchmark Service
 * Exposes a structured contract for downstream Copilot, natural-language query resolution,
 * and future duration estimation systems without fabricating probabilistic certainty.
 */
export class HistoricalBenchmarkService {
  constructor(private readonly aggregationService: HistoricalAggregationService) {}

  /**
   * Evaluates a natural language or structured benchmark query against verified institutional memory
   */
  public async getBenchmark(
    context: HistoricalBenchmarkQueryContext
  ): Promise<HistoricalCopilotContractResponse> {
    const resolvedType = context.activityType || this.inferActivityTypeFromQuery(context.question || '') || 'FOUNDATION_EXCAVATION';
    const benchmark = await this.aggregationService.getBenchmarkForType(resolvedType);

    if (!benchmark) {
      return {
        question: context.question || `Historical benchmarks for ${resolvedType}`,
        filters: {
          discipline: context.discipline?.toString(),
          activityType: resolvedType,
        },
        sampleCount: 0,
        statistics: {
          medianDays: 0,
          meanDays: 0,
          p25Days: 0,
          p75Days: 0,
          minDays: 0,
          maxDays: 0,
          medianVarianceDays: 0,
        },
        quality: SampleQuality.INSUFFICIENT_HISTORY,
        qualityWarning: HISTORICAL_CONFIG.SAMPLE_WARNINGS[SampleQuality.INSUFFICIENT_HISTORY],
        evidence: [],
      };
    }

    return {
      question: context.question || `What is the historical verified duration for ${benchmark.activityName}?`,
      filters: {
        discipline: benchmark.discipline,
        activityType: benchmark.activityType,
      },
      sampleCount: benchmark.sampleCount,
      statistics: {
        medianDays: benchmark.durationDays.median,
        meanDays: benchmark.durationDays.mean,
        p25Days: benchmark.durationDays.p25,
        p75Days: benchmark.durationDays.p75,
        minDays: benchmark.durationDays.min,
        maxDays: benchmark.durationDays.max,
        medianVarianceDays: benchmark.scheduleVarianceDays.median,
      },
      quality: benchmark.quality,
      qualityWarning: benchmark.warningNotice || HISTORICAL_CONFIG.SAMPLE_WARNINGS[benchmark.quality],
      evidence: benchmark.sampleRecords.slice(0, 6).map((r) => ({
        projectId: r.projectId,
        projectName: r.projectName,
        activityCode: r.activityCode,
        activityName: r.activityName,
        actualDuration: r.actualDuration,
        scheduleVariance: r.scheduleVariance,
        delayCause: r.delayCause,
        documentExcerpt: `${r.evidenceSourceDocument} (${r.evidenceReference}) — "${r.evidenceQuotedText}"`,
      })),
    };
  }

  private inferActivityTypeFromQuery(q: string): string | null {
    const lower = q.toLowerCase();
    if (lower.includes('excavation') || lower.includes('earthwork')) return 'FOUNDATION_EXCAVATION';
    if (lower.includes('piling') || lower.includes('pile')) return 'BORED_CAST_PILING';
    if (lower.includes('concrete') || lower.includes('raft') || lower.includes('rcc')) return 'RCC_RAFT_CONCRETING';
    if (lower.includes('steel') || lower.includes('erection') || lower.includes('structure')) return 'STRUCTURAL_STEEL_ERECTION';
    if (lower.includes('compressor') || lower.includes('package') || lower.includes('skid')) return 'COMPRESSOR_PACKAGE_INSTALLATION';
    if (lower.includes('pipe') || lower.includes('piping') || lower.includes('spool')) return 'PIPE_SPOOL_FABRICATION';
    if (lower.includes('tie-in') || lower.includes('tie in') || lower.includes('weld')) return 'CROSS_COUNTRY_TIE_IN_WELDING';
    if (lower.includes('hydrotest') || lower.includes('pressure test')) return 'HYDROSTATIC_PRESSURE_TESTING';
    if (lower.includes('cable') || lower.includes('tray') || lower.includes('pulling')) return 'HT_POWER_CABLE_LAYING';
    if (lower.includes('transformer') || lower.includes('switchgear')) return 'SUBSTATION_TRANSFORMER_ERECTION';
    if (lower.includes('dcs') || lower.includes('plc') || lower.includes('loop')) return 'DCS_PANEL_LOOP_CHECKING';
    if (lower.includes('transmitter') || lower.includes('calibration')) return 'FIELD_TRANSMITTER_CALIBRATION';
    return null;
  }
}
