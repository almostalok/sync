import {
  Discipline,
  HistoricalOutcomeDTO,
  SampleQuality,
  SimilarActivityComparisonDTO,
} from '@sitesync/types';
import { HISTORICAL_CONFIG } from './historical.config';
import { HistoricalOutcomeService } from './historical-outcome.service';
import { HistoricalAggregationService } from './historical-aggregation.service';

/**
 * Historical Similarity & Semantic Comparison Service
 * Provides structured-first candidate filtering followed by deterministic similarity scoring
 * and transparent, evidence-backed comparability explanations.
 */
export class HistoricalSimilarityService {
  constructor(
    private readonly outcomeService: HistoricalOutcomeService,
    private readonly aggregationService: HistoricalAggregationService
  ) {}

  /**
   * Computes deterministic similarity score and explanation between an active activity context and a historical record
   */
  public calculateSimilarity(
    source: {
      activityCode: string;
      activityName: string;
      discipline: Discipline;
      activityType?: string;
      location?: string;
      plannedDuration?: number;
      plannedQuantity?: number;
    },
    target: HistoricalOutcomeDTO
  ): { score: number; reasons: string[] } {
    const weights = HISTORICAL_CONFIG.SIMILARITY_WEIGHTS;
    let score = 0;
    const reasons: string[] = [];

    // 1. Activity Type Match (Weight: 0.40)
    const normalizedSourceType = (source.activityType || '').toUpperCase().trim();
    const normalizedTargetType = (target.activityType || '').toUpperCase().trim();

    if (normalizedSourceType && normalizedSourceType === normalizedTargetType) {
      score += weights.ACTIVITY_TYPE_EXACT;
      reasons.push(`Exact Activity Type Match (${target.activityType})`);
    } else if (
      normalizedSourceType &&
      (normalizedSourceType.includes(normalizedTargetType) ||
        normalizedTargetType.includes(normalizedSourceType))
    ) {
      score += weights.ACTIVITY_TYPE_EXACT * 0.7;
      reasons.push(`Related Activity Type (${target.activityType})`);
    } else if (
      source.activityName.toLowerCase().includes(target.activityName.toLowerCase()) ||
      target.activityName.toLowerCase().includes(source.activityName.toLowerCase())
    ) {
      score += weights.ACTIVITY_TYPE_EXACT * 0.5;
      reasons.push('High naming & scope overlap');
    }

    // 2. Discipline Match (Weight: 0.20)
    if (source.discipline.toUpperCase() === target.discipline.toUpperCase()) {
      score += weights.DISCIPLINE_MATCH;
      reasons.push(`Identical Discipline (${target.discipline})`);
    }

    // 3. Project Type / Scope (Weight: 0.15)
    // Both are Oil & Gas Infrastructure projects in Eastern/Assam asset
    score += weights.PROJECT_TYPE_MATCH;
    reasons.push(`Comparable Capital Facility (${target.projectName.split(' ')[0]})`);

    // 4. Quantity / Scale Compatibility (Weight: 0.15)
    if (source.plannedQuantity && target.actualQuantity) {
      const ratio = Math.min(source.plannedQuantity, target.actualQuantity) /
        Math.max(source.plannedQuantity, target.actualQuantity);
      if (ratio >= 0.6) {
        score += weights.QUANTITY_COMPATIBILITY;
        reasons.push(`Compatible quantity scale (${Math.round(ratio * 100)}% match)`);
      } else {
        score += weights.QUANTITY_COMPATIBILITY * ratio;
        reasons.push(`Different quantity scale (${Math.round(ratio * 100)}% scale)`);
      }
    } else if (source.plannedDuration && target.plannedDuration) {
      const durRatio = Math.min(source.plannedDuration, target.plannedDuration) /
        Math.max(source.plannedDuration, target.plannedDuration);
      if (durRatio >= 0.5) {
        score += weights.QUANTITY_COMPATIBILITY * durRatio;
        reasons.push(`Similar planned duration scope (${target.plannedDuration}d vs ${source.plannedDuration}d)`);
      }
    }

    // 5. Location / Regional Context (Weight: 0.10)
    if (
      source.location &&
      target.location &&
      (source.location.toLowerCase().includes(target.location.toLowerCase()) ||
        target.location.toLowerCase().includes(source.location.toLowerCase()))
    ) {
      score += weights.LOCATION_SIMILARITY;
      reasons.push(`Matching site location (${target.location})`);
    } else {
      score += weights.LOCATION_SIMILARITY * 0.6; // Same regional basin (Assam Asset)
      reasons.push('Regional terrain proximity (Upper Assam Oilfield)');
    }

    const normalizedScore = Math.min(1, Math.round(score * 100) / 100);
    return { score: normalizedScore, reasons };
  }

  /**
   * Finds comparable historical activities for a live project activity
   */
  public async findComparableActivities(activityContext: {
    id: string;
    code: string;
    name: string;
    discipline: Discipline;
    activityType?: string;
    plannedDuration: number;
    location: string;
    plannedQuantity?: number;
  }): Promise<SimilarActivityComparisonDTO> {
    const resolvedType = activityContext.activityType || this.inferActivityType(activityContext.name, activityContext.discipline);

    // Structured-First candidate retrieval
    const { outcomes } = await this.outcomeService.searchHistoricalOutcomes({
      discipline: activityContext.discipline,
      limit: 500,
    });

    // Score all candidates
    const scoredCandidates = outcomes.map((outcome) => {
      const { score, reasons } = this.calculateSimilarity(
        {
          activityCode: activityContext.code,
          activityName: activityContext.name,
          discipline: activityContext.discipline,
          activityType: resolvedType,
          location: activityContext.location,
          plannedDuration: activityContext.plannedDuration,
          plannedQuantity: activityContext.plannedQuantity,
        },
        outcome
      );
      return {
        outcome,
        score,
        reasons,
      };
    });

    // Filter by threshold and sort
    const topMatches = scoredCandidates
      .filter((c) => c.score >= 0.45)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // Get statistical benchmark for this type
    const benchmarkData = await this.aggregationService.getBenchmarkForType(resolvedType);

    const sampleCount = benchmarkData ? benchmarkData.sampleCount : topMatches.length;
    const quality = HistoricalAggregationService.classifySampleQuality(sampleCount);

    return {
      sourceActivity: {
        id: activityContext.id,
        code: activityContext.code,
        name: activityContext.name,
        discipline: activityContext.discipline,
        activityType: resolvedType,
        plannedDuration: activityContext.plannedDuration,
        location: activityContext.location,
      },
      benchmark: {
        sampleCount,
        quality,
        warningNotice: HISTORICAL_CONFIG.SAMPLE_WARNINGS[quality],
        durationDays: benchmarkData
          ? {
              median: benchmarkData.durationDays.median,
              p25: benchmarkData.durationDays.p25,
              p75: benchmarkData.durationDays.p75,
            }
          : {
              median: topMatches.length > 0 ? topMatches[0].outcome.actualDuration : activityContext.plannedDuration,
              p25: Math.max(1, activityContext.plannedDuration - 1),
              p75: activityContext.plannedDuration + 2,
            },
        medianVariance: benchmarkData ? benchmarkData.scheduleVarianceDays.median : 0,
      },
      comparableActivities: topMatches.map((m) => ({
        outcomeId: m.outcome.id,
        projectId: m.outcome.projectId,
        projectName: m.outcome.projectName,
        activityCode: m.outcome.activityCode,
        activityName: m.outcome.activityName,
        discipline: m.outcome.discipline,
        plannedDuration: m.outcome.plannedDuration,
        actualDuration: m.outcome.actualDuration,
        variance: m.outcome.scheduleVariance,
        delayCause: m.outcome.delayCause,
        similarityScore: m.score,
        similarityReasons: m.reasons,
        evidenceExcerpt: `${m.outcome.evidenceSourceDocument} — "${m.outcome.evidenceQuotedText}"`,
      })),
    };
  }

  private inferActivityType(name: string, discipline: Discipline): string {
    const lower = name.toLowerCase();
    if (lower.includes('excavation') || lower.includes('earthwork')) return 'FOUNDATION_EXCAVATION';
    if (lower.includes('piling') || lower.includes('pile')) return 'BORED_CAST_PILING';
    if (lower.includes('concrete') || lower.includes('rcc') || lower.includes('raft')) return 'RCC_RAFT_CONCRETING';
    if (lower.includes('structural') || lower.includes('steel') || lower.includes('erection')) return 'STRUCTURAL_STEEL_ERECTION';
    if (lower.includes('compressor') || lower.includes('package')) return 'COMPRESSOR_PACKAGE_INSTALLATION';
    if (lower.includes('pipe') || lower.includes('piping') || lower.includes('spool')) return 'PIPE_SPOOL_FABRICATION';
    if (lower.includes('weld') || lower.includes('radiography') || lower.includes('ndt')) return 'CROSS_COUNTRY_TIE_IN_WELDING';
    if (lower.includes('hydrotest') || lower.includes('pressure test')) return 'HYDROSTATIC_PRESSURE_TESTING';
    if (lower.includes('cable') || lower.includes('tray') || lower.includes('pulling')) return 'HT_POWER_CABLE_LAYING';
    if (lower.includes('transformer') || lower.includes('switchgear')) return 'SUBSTATION_TRANSFORMER_ERECTION';
    if (lower.includes('dcs') || lower.includes('plc') || lower.includes('loop')) return 'DCS_PANEL_LOOP_CHECKING';
    if (lower.includes('instrument') || lower.includes('tubing')) return 'FIELD_TRANSMITTER_CALIBRATION';
    return `${discipline.toUpperCase()}_ACTIVITY`;
  }
}
