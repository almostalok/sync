import { HistoricalOutcomeService } from './historical-outcome.service';
import { HistoricalAggregationService } from './historical-aggregation.service';
import { HistoricalSimilarityService } from './historical-similarity.service';
import { DelayIntelligenceService } from './delay-intelligence.service';
import { ProductivityIntelligenceService } from './productivity-intelligence.service';
import { ProjectClosureService } from './project-closure.service';
import { HistoricalBenchmarkService } from './historical-benchmark.service';

export * from './historical.config';
export * from './synthetic-historical-dataset';
export * from './historical-outcome.service';
export * from './historical-aggregation.service';
export * from './historical-similarity.service';
export * from './delay-intelligence.service';
export * from './productivity-intelligence.service';
export * from './project-closure.service';
export * from './historical-benchmark.service';

// Singletons for runtime injection
export const historicalOutcomeService = new HistoricalOutcomeService();
export const historicalAggregationService = new HistoricalAggregationService(historicalOutcomeService);
export const historicalSimilarityService = new HistoricalSimilarityService(historicalOutcomeService, historicalAggregationService);
export const delayIntelligenceService = new DelayIntelligenceService(historicalOutcomeService);
export const productivityIntelligenceService = new ProductivityIntelligenceService(historicalOutcomeService);
export const projectClosureService = new ProjectClosureService(historicalOutcomeService, historicalAggregationService);
export const historicalBenchmarkService = new HistoricalBenchmarkService(historicalAggregationService);
