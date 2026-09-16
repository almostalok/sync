import { Discipline, HistoricalOutcomeDTO, ProductivityIntelligenceDTO } from '@sitesync/types';
import { HistoricalOutcomeService } from './historical-outcome.service';
import { HistoricalAggregationService } from './historical-aggregation.service';

/**
 * Productivity Intelligence Service
 * Computes verifiable daily production rates (e.g. m³/day, MT/day, joints/day, meters/day)
 * strictly when both actual quantities and verified durations exist.
 */
export class ProductivityIntelligenceService {
  constructor(private readonly outcomeService: HistoricalOutcomeService) {}

  /**
   * Retrieves productivity distribution benchmarks across disciplines and activity types
   */
  public async getProductivityIntelligence(filter?: {
    discipline?: string;
    projectId?: string;
  }): Promise<ProductivityIntelligenceDTO[]> {
    const { outcomes } = await this.outcomeService.searchHistoricalOutcomes({
      discipline: filter?.discipline,
      projectId: filter?.projectId,
      limit: 10000,
    });

    // Filter to outcomes that have valid productivity metrics and units
    const validOutcomes = outcomes.filter(
      (o) =>
        typeof o.productivityMetric === 'number' &&
        !isNaN(o.productivityMetric) &&
        o.productivityMetric > 0 &&
        o.quantityUnit &&
        o.actualDuration > 0
    );

    // Group by activityType + quantityUnit
    const groups: Record<string, HistoricalOutcomeDTO[]> = {};
    for (const o of validOutcomes) {
      const key = `${o.activityType}___${o.quantityUnit}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(o);
    }

    const results: ProductivityIntelligenceDTO[] = [];

    for (const [key, records] of Object.entries(groups)) {
      const [activityType, unit] = key.split('___');
      const first = records[0];
      const discipline = first.discipline;

      const sampleCount = records.length;
      const sortedValues = records
        .map((r) => Number(r.productivityMetric))
        .filter((v) => !isNaN(v))
        .sort((a, b) => a - b);

      const p25 = HistoricalAggregationService.calculatePercentile(sortedValues, 0.25);
      const median = HistoricalAggregationService.calculatePercentile(sortedValues, 0.5);
      const p75 = HistoricalAggregationService.calculatePercentile(sortedValues, 0.75);

      // Find project with highest productivity sample
      const maxRecord = [...records].sort(
        (a, b) => Number(b.productivityMetric || 0) - Number(a.productivityMetric || 0)
      )[0];
      const topProject = maxRecord?.projectName || 'Duliajan Terminal Expansion';

      results.push({
        activityType,
        discipline,
        unit: `${unit}/day`,
        sampleCount,
        p25,
        median,
        p75,
        topProject,
      });
    }

    // Sort by sample count descending
    return results.sort((a, b) => b.sampleCount - a.sampleCount);
  }
}
