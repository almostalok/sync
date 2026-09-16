import {
  DelayCause,
  Discipline,
  HistoricalBenchmarkDTO,
  HistoricalOutcomeDTO,
  HistoricalOverviewDTO,
  SampleQuality,
} from '@sitesync/types';
import { HISTORICAL_CONFIG } from './historical.config';
import { HistoricalOutcomeService } from './historical-outcome.service';

/**
 * Historical Aggregation Service
 * Calculates rigorous statistical metrics (median, P25, P75, sample quality, delay breakdowns)
 * across verified historical records.
 */
export class HistoricalAggregationService {
  constructor(private readonly outcomeService: HistoricalOutcomeService) {}

  /**
   * Helper to calculate percentile from a sorted numeric array (0 <= p <= 1)
   */
  public static calculatePercentile(sorted: number[], p: number): number {
    if (!sorted.length) return 0;
    if (sorted.length === 1) return sorted[0];
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (lower === upper) return sorted[lower];
    return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 10) / 10;
  }

  /**
   * Helper to calculate mean
   */
  public static calculateMean(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  /**
   * Computes sample quality classification based on Oil India baseline thresholds
   */
  public static classifySampleQuality(sampleCount: number): SampleQuality {
    if (sampleCount >= HISTORICAL_CONFIG.SAMPLE_THRESHOLDS.STRONGER_HISTORICAL_BASE_MIN) {
      return SampleQuality.STRONGER_HISTORICAL_BASE;
    }
    if (sampleCount >= HISTORICAL_CONFIG.SAMPLE_THRESHOLDS.LIMITED_MIN) {
      return SampleQuality.LIMITED;
    }
    if (sampleCount > 0) {
      return SampleQuality.LOW_SAMPLE;
    }
    return SampleQuality.INSUFFICIENT_HISTORY;
  }

  /**
   * Computes high-level institutional memory summary
   */
  public async getHistoricalOverview(): Promise<HistoricalOverviewDTO> {
    const { outcomes } = await this.outcomeService.searchHistoricalOutcomes({ limit: 10000 });
    const totalCompleted = outcomes.length;

    const projectSet = new Set(outcomes.map((o) => o.projectId));
    const totalProjects = projectSet.size;

    const delayedOutcomes = outcomes.filter((o) => o.scheduleVariance > 0 || o.delayDays > 0);
    const totalDelays = delayedOutcomes.length;

    const durations = outcomes.map((o) => o.actualDuration);
    const avgDuration = HistoricalAggregationService.calculateMean(durations);

    const variances = outcomes.map((o) => o.scheduleVariance).sort((a, b) => a - b);
    const medianVariance = HistoricalAggregationService.calculatePercentile(variances, 0.5);

    // Top delay categories
    const delayCounts: Record<string, number> = {};
    for (const d of delayedOutcomes) {
      delayCounts[d.delayCause] = (delayCounts[d.delayCause] || 0) + 1;
    }

    const topDelayCategories = Object.entries(delayCounts)
      .map(([cause, count]) => ({
        cause: cause as DelayCause,
        label: HISTORICAL_CONFIG.DELAY_TAXONOMY[cause as DelayCause]?.label || cause,
        count,
        percentage: totalDelays > 0 ? Math.round((count / totalDelays) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Discipline distribution
    const disciplineGroups: Record<string, HistoricalOutcomeDTO[]> = {};
    for (const o of outcomes) {
      if (!disciplineGroups[o.discipline]) disciplineGroups[o.discipline] = [];
      disciplineGroups[o.discipline].push(o);
    }

    const disciplineDistribution = Object.entries(disciplineGroups).map(([disc, items]) => {
      const discDurations = items.map((i) => i.actualDuration).sort((a, b) => a - b);
      const discVariances = items.map((i) => i.scheduleVariance).sort((a, b) => a - b);
      return {
        discipline: disc as Discipline,
        name: disc,
        count: items.length,
        medianDuration: HistoricalAggregationService.calculatePercentile(discDurations, 0.5),
        medianVariance: HistoricalAggregationService.calculatePercentile(discVariances, 0.5),
      };
    });

    return {
      totalCompletedActivities: totalCompleted,
      totalHistoricalProjects: totalProjects,
      totalDocumentedDelays: totalDelays,
      averageVerifiedDurationDays: avgDuration,
      medianScheduleVarianceDays: medianVariance,
      topDelayCategories,
      disciplineDistribution,
    };
  }

  /**
   * Computes activity-level benchmarks across all verified outcomes or filtered by discipline
   */
  public async getActivityBenchmarks(filter?: {
    discipline?: string;
    activityType?: string;
  }): Promise<HistoricalBenchmarkDTO[]> {
    const { outcomes } = await this.outcomeService.searchHistoricalOutcomes({
      discipline: filter?.discipline,
      activityType: filter?.activityType,
      limit: 10000,
    });

    // Group by activityType
    const groups: Record<string, HistoricalOutcomeDTO[]> = {};
    for (const o of outcomes) {
      const key = o.activityType;
      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    }

    const benchmarks: HistoricalBenchmarkDTO[] = [];

    for (const [activityType, records] of Object.entries(groups)) {
      const sampleCount = records.length;
      const quality = HistoricalAggregationService.classifySampleQuality(sampleCount);
      const warningNotice = HISTORICAL_CONFIG.SAMPLE_WARNINGS[quality];

      const first = records[0];
      const discipline = first.discipline;
      const activityName = first.activityCategory || activityType.replace(/_/g, ' ');

      // Durations
      const sortedDurations = records.map((r) => r.actualDuration).sort((a, b) => a - b);
      const durationDays = {
        median: HistoricalAggregationService.calculatePercentile(sortedDurations, 0.5),
        mean: HistoricalAggregationService.calculateMean(sortedDurations),
        p25: HistoricalAggregationService.calculatePercentile(sortedDurations, 0.25),
        p75: HistoricalAggregationService.calculatePercentile(sortedDurations, 0.75),
        min: sortedDurations[0] || 0,
        max: sortedDurations[sortedDurations.length - 1] || 0,
      };

      // Variances
      const sortedVariances = records.map((r) => r.scheduleVariance).sort((a, b) => a - b);
      const scheduleVarianceDays = {
        median: HistoricalAggregationService.calculatePercentile(sortedVariances, 0.5),
        mean: HistoricalAggregationService.calculateMean(sortedVariances),
      };

      // Productivity
      const prodRecords = records.filter(
        (r) => typeof r.productivityMetric === 'number' && !isNaN(r.productivityMetric)
      );
      let productivity = {
        median: null as number | null,
        p25: null as number | null,
        p75: null as number | null,
        unit: null as string | null,
      };

      if (prodRecords.length > 0) {
        const sortedProd = prodRecords
          .map((r) => Number(r.productivityMetric))
          .filter((v) => !isNaN(v))
          .sort((a, b) => a - b);
        productivity = {
          median: HistoricalAggregationService.calculatePercentile(sortedProd, 0.5),
          p25: HistoricalAggregationService.calculatePercentile(sortedProd, 0.25),
          p75: HistoricalAggregationService.calculatePercentile(sortedProd, 0.75),
          unit: prodRecords[0].productivityUnit || `${prodRecords[0].quantityUnit || 'units'}/day`,
        };
      }

      // Top delay causes
      const delayRecords = records.filter((r) => r.scheduleVariance > 0 || r.delayDays > 0);
      const delayCounts: Record<string, number> = {};
      for (const d of delayRecords) {
        delayCounts[d.delayCause] = (delayCounts[d.delayCause] || 0) + 1;
      }

      const topDelayCauses = Object.entries(delayCounts)
        .map(([cause, count]) => ({
          cause: cause as DelayCause,
          count,
          percentage: delayRecords.length > 0 ? Math.round((count / delayRecords.length) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      benchmarks.push({
        activityType,
        activityName,
        discipline,
        sampleCount,
        quality,
        warningNotice,
        durationDays,
        scheduleVarianceDays,
        productivity,
        topDelayCauses,
        sampleRecords: records.slice(0, 10),
      });
    }

    // Sort by sampleCount desc
    return benchmarks.sort((a, b) => b.sampleCount - a.sampleCount);
  }

  /**
   * Retrieves single benchmark for a specific activity type
   */
  public async getBenchmarkForType(activityType: string): Promise<HistoricalBenchmarkDTO | null> {
    const list = await this.getActivityBenchmarks({ activityType });
    return list.length > 0 ? list[0] : null;
  }
}
