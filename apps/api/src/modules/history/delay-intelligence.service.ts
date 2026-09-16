import { DelayCause, DelayIntelligenceDTO, HistoricalOutcomeDTO } from '@sitesync/types';
import { HISTORICAL_CONFIG } from './historical.config';
import { HistoricalOutcomeService } from './historical-outcome.service';
import { HistoricalAggregationService } from './historical-aggregation.service';

/**
 * Delay Intelligence & Root-Cause Service
 * Aggregates verified delay occurrences, calculates median impact, identifies common affected
 * activity types, and extracts evidence citations directly from field reports.
 */
export class DelayIntelligenceService {
  constructor(private readonly outcomeService: HistoricalOutcomeService) {}

  /**
   * Retrieves high-level and detailed intelligence for all delay categories
   */
  public async getDelayIntelligence(filter?: {
    discipline?: string;
    projectId?: string;
  }): Promise<{
    summary: {
      totalDelays: number;
      topCause: DelayCause;
      topCauseLabel: string;
      medianDelayDaysAcrossAll: number;
    };
    categories: DelayIntelligenceDTO[];
  }> {
    const { outcomes } = await this.outcomeService.searchHistoricalOutcomes({
      discipline: filter?.discipline,
      projectId: filter?.projectId,
      limit: 10000,
    });

    const delayedOutcomes = outcomes.filter(
      (o) => o.scheduleVariance > 0 || o.delayDays > 0
    );
    const totalDelays = delayedOutcomes.length;

    // Group by delay cause
    const causeGroups: Record<string, HistoricalOutcomeDTO[]> = {};
    for (const d of delayedOutcomes) {
      if (!causeGroups[d.delayCause]) {
        causeGroups[d.delayCause] = [];
      }
      causeGroups[d.delayCause].push(d);
    }

    const allCauses = Object.values(DelayCause);
    const categories: DelayIntelligenceDTO[] = [];

    for (const cause of allCauses) {
      const records = causeGroups[cause] || [];
      if (records.length === 0) continue;

      const occurrences = records.length;
      const percentage = totalDelays > 0 ? Math.round((occurrences / totalDelays) * 100) : 0;
      const uniqueActivities = new Set(records.map((r) => r.activityCode)).size;

      const variances = records.map((r) => r.delayDays || r.scheduleVariance).sort((a, b) => a - b);
      const medianDelayDays = HistoricalAggregationService.calculatePercentile(variances, 0.5);

      const uniqueProjects = new Set(records.map((r) => r.projectId)).size;

      // Common activity types
      const typeCounts: Record<string, number> = {};
      for (const r of records) {
        typeCounts[r.activityType] = (typeCounts[r.activityType] || 0) + 1;
      }
      const commonActivityTypes = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([t]) => t.replace(/_/g, ' '));

      // Evidence excerpts
      const evidenceExcerpts = records.slice(0, 8).map((r) => {
        const pageMatch = r.evidenceReference?.match(/#P(\d+)/);
        const pageNumber = pageMatch ? parseInt(pageMatch[1], 10) : 1;
        return {
          activityCode: r.activityCode,
          activityName: r.activityName,
          projectName: r.projectName,
          delayDays: r.delayDays || r.scheduleVariance,
          documentName: r.evidenceSourceDocument,
          pageNumber,
          quotedText: r.evidenceQuotedText,
        };
      });

      categories.push({
        cause,
        label: HISTORICAL_CONFIG.DELAY_TAXONOMY[cause]?.label || cause,
        occurrences,
        percentage,
        affectedActivitiesCount: uniqueActivities,
        medianDelayDays,
        projectsCount: uniqueProjects,
        commonActivityTypes,
        evidenceExcerpts,
      });
    }

    // Sort categories by occurrences descending
    categories.sort((a, b) => b.occurrences - a.occurrences);

    const topCategory = categories[0];
    const allVariances = delayedOutcomes.map((o) => o.delayDays || o.scheduleVariance).sort((a, b) => a - b);

    return {
      summary: {
        totalDelays,
        topCause: topCategory?.cause || DelayCause.UNKNOWN,
        topCauseLabel: topCategory?.label || 'Undocumented',
        medianDelayDaysAcrossAll: HistoricalAggregationService.calculatePercentile(allVariances, 0.5),
      },
      categories,
    };
  }

  /**
   * Retrieves single delay category detail with all evidence citations
   */
  public async getDelayDetail(cause: DelayCause): Promise<DelayIntelligenceDTO | null> {
    const { categories } = await this.getDelayIntelligence();
    return categories.find((c) => c.cause === cause) || null;
  }
}
