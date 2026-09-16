import * as fs from 'fs';
import * as path from 'path';
import {
  ActivityContext,
  ExtractedEventResult,
  BaselineComparisonResult,
} from '../matching.types';
import { ExactStringMatcher } from '../baselines/exact-matcher';
import { FuzzyStringMatcher } from '../baselines/fuzzy-matcher';
import { EmbeddingOnlyMatcher } from '../baselines/embedding-matcher';
import { HybridMatchingService } from '../scoring/hybrid-matching.service';
import { CandidateRetrievalService } from '../retrieval/candidate-retrieval.service';
import { MetricsCalculator, EvaluationSample } from './metrics-calculator';
import { TextNormalizerService } from '../normalization/text-normalizer.service';
import { EntityExtractorService } from '../normalization/entity-extractor.service';
import { ScheduleParser } from '../../schedules/schedule-parser';

export class BenchmarkRunnerService {
  private normalizer = new TextNormalizerService();
  private entityExtractor = new EntityExtractorService();
  private exactMatcher = new ExactStringMatcher();
  private fuzzyMatcher = new FuzzyStringMatcher();
  private embeddingMatcher = new EmbeddingOnlyMatcher();
  private hybridMatcher = new HybridMatchingService();
  private retrievalService = new CandidateRetrievalService();

  /**
   * Runs complete benchmark comparison across all 4 matchers on the held-out test split.
   */
  public async runBenchmark(
    testSetPath?: string,
    activitiesPath?: string
  ): Promise<{ results: BaselineComparisonResult; errorAnalysis: any }> {
    const baseDir = process.cwd();
    const testFile = testSetPath || path.join(baseDir, 'data', 'benchmark', 'test.jsonl');
    const actFile = activitiesPath || path.join(baseDir, 'data', 'synthetic', 'output', 'activities.csv');

    if (!fs.existsSync(testFile) || !fs.existsSync(actFile)) {
      throw new Error(`Benchmark data files not found. Expected ${testFile} and ${actFile}. Run 'pnpm data:generate' first.`);
    }

    // 1. Load Activities
    const actCsv = fs.readFileSync(actFile, 'utf-8');
    const actRows = ScheduleParser.parseCsv(actCsv);
    const activities: ActivityContext[] = actRows.map((r) => ({
      id: `proj-cse-2026-act-${r.activityCode.toLowerCase()}`,
      activityCode: r.activityCode,
      name: r.activityName,
      description: r.description || r.activityName,
      discipline: r.discipline as any,
      activityType: 'WORK',
      location: r.location || 'Site',
      wbsPath: r.wbsCode || '1.0',
      plannedStart: r.plannedStart,
      plannedFinish: r.plannedFinish,
      plannedProgress: r.plannedProgress || 0,
      actualProgress: r.actualProgress || 0,
      status: r.status || 'NOT_STARTED',
    }));

    // 2. Load Test Records
    const testLines = fs.readFileSync(testFile, 'utf-8').split('\n').filter(Boolean);
    const testRecords = testLines.map((line) => JSON.parse(line));

    const exactSamples: EvaluationSample[] = [];
    const fuzzySamples: EvaluationSample[] = [];
    const embeddingSamples: EvaluationSample[] = [];
    const hybridSamples: EvaluationSample[] = [];
    const errorRecords: any[] = [];

    for (const rec of testRecords) {
      const { normalizedText, extractedProgress } = this.normalizer.normalize(rec.text, rec.date);
      const entities = this.entityExtractor.extractEntities(rec.text);

      const event: ExtractedEventResult = {
        id: rec.eventId,
        reportId: 'rep-test',
        description: rec.text,
        normalizedDescription: normalizedText,
        eventDate: rec.date,
        discipline: rec.discipline,
        location: rec.location,
        progress: extractedProgress !== undefined ? extractedProgress : rec.progress,
        status: rec.status,
        entities,
        sourceText: rec.text,
        extractionConfidence: 0.9,
      };

      const groundTruthId = rec.groundTruthActivityId || null;

      // 1. Exact Matcher Evaluation
      const t0 = Date.now();
      const exactRes = this.exactMatcher.match(event, activities);
      exactSamples.push({
        groundTruthActivityId: groundTruthId,
        predictedActivityId: exactRes.topActivityId,
        topCandidateIds: exactRes.topActivityId ? [exactRes.topActivityId] : [],
        decision: exactRes.topActivityId ? 'AUTO_LINKED' : 'UNMATCHED',
        isCorrect: exactRes.topActivityId === groundTruthId,
        latencyMs: Date.now() - t0,
      });

      // 2. Fuzzy Matcher Evaluation
      const t1 = Date.now();
      const fuzzyRes = this.fuzzyMatcher.match(event, activities);
      fuzzySamples.push({
        groundTruthActivityId: groundTruthId,
        predictedActivityId: fuzzyRes.topActivityId,
        topCandidateIds: fuzzyRes.topActivityId ? [fuzzyRes.topActivityId] : [],
        decision: fuzzyRes.topActivityId ? 'AUTO_LINKED' : 'UNMATCHED',
        isCorrect: fuzzyRes.topActivityId === groundTruthId,
        latencyMs: Date.now() - t1,
      });

      // 3. Embedding Only Matcher Evaluation
      const t2 = Date.now();
      const embRes = this.embeddingMatcher.match(event, activities);
      embeddingSamples.push({
        groundTruthActivityId: groundTruthId,
        predictedActivityId: embRes.topActivityId,
        topCandidateIds: embRes.topActivityId ? [embRes.topActivityId] : [],
        decision: embRes.topActivityId ? 'AUTO_LINKED' : 'UNMATCHED',
        isCorrect: embRes.topActivityId === groundTruthId,
        latencyMs: Date.now() - t2,
      });

      // 4. SiteSync Hybrid Matcher Evaluation
      const t3 = Date.now();
      const { candidates: topCandidates, eventEmbedding } = this.retrievalService.retrieveCandidates(event, activities, 10);
      const hybridRes = this.hybridMatcher.matchEvent(event, topCandidates, eventEmbedding);
      const topCandId = hybridRes.topCandidate?.activityId || null;
      const hybridDecision = hybridRes.decision;
      const isCorrect = (groundTruthId === null && hybridDecision === 'UNMATCHED') ||
        (groundTruthId !== null && topCandId === groundTruthId);

      hybridSamples.push({
        groundTruthActivityId: groundTruthId,
        predictedActivityId: topCandId,
        topCandidateIds: hybridRes.candidates.map((c) => c.activityId),
        decision: hybridDecision,
        isCorrect,
        latencyMs: Date.now() - t3,
      });

      if (!isCorrect) {
        errorRecords.push({
          eventId: event.id,
          text: event.description,
          difficultyLevel: rec.difficultyLevel,
          groundTruthActivityId: groundTruthId,
          predictedActivityId: topCandId,
          predictedDecision: hybridDecision,
          confidence: hybridRes.confidence,
          reasons: hybridRes.explanation,
        });
      }
    }

    const comparisonResult: BaselineComparisonResult = {
      exact: MetricsCalculator.calculate(exactSamples),
      fuzzy: MetricsCalculator.calculate(fuzzySamples),
      embeddingOnly: MetricsCalculator.calculate(embeddingSamples),
      hybrid: MetricsCalculator.calculate(hybridSamples),
    };

    // 5. Export Error Reports
    const evalDir = path.join(baseDir, 'reports', 'evaluation');
    if (!fs.existsSync(evalDir)) {
      fs.mkdirSync(evalDir, { recursive: true });
    }

    fs.writeFileSync(path.join(evalDir, 'errors.json'), JSON.stringify(errorRecords, null, 2));

    const markdownErrorDoc = `# SiteSync Matcher Benchmark & Error Analysis

## Baseline Performance Comparison

| Model | Top-1 Accuracy | Top-3 Recall | Top-5 Recall | Precision | Recall | F1 Score | False Auto-Link Rate | Avg Latency |
|---|---|---|---|---|---|---|---|---|
| **Baseline 1 (Exact String)** | ${(comparisonResult.exact.top1Accuracy * 100).toFixed(1)}% | ${(comparisonResult.exact.top3Recall * 100).toFixed(1)}% | ${(comparisonResult.exact.top5Recall * 100).toFixed(1)}% | ${(comparisonResult.exact.precision * 100).toFixed(1)}% | ${(comparisonResult.exact.recall * 100).toFixed(1)}% | ${(comparisonResult.exact.f1Score * 100).toFixed(1)}% | ${(comparisonResult.exact.falseAutoLinkRate * 100).toFixed(1)}% | ${comparisonResult.exact.averageLatencyMs}ms |
| **Baseline 2 (Fuzzy Token)** | ${(comparisonResult.fuzzy.top1Accuracy * 100).toFixed(1)}% | ${(comparisonResult.fuzzy.top3Recall * 100).toFixed(1)}% | ${(comparisonResult.fuzzy.top5Recall * 100).toFixed(1)}% | ${(comparisonResult.fuzzy.precision * 100).toFixed(1)}% | ${(comparisonResult.fuzzy.recall * 100).toFixed(1)}% | ${(comparisonResult.fuzzy.f1Score * 100).toFixed(1)}% | ${(comparisonResult.fuzzy.falseAutoLinkRate * 100).toFixed(1)}% | ${comparisonResult.fuzzy.averageLatencyMs}ms |
| **Baseline 3 (Embedding Only)** | ${(comparisonResult.embeddingOnly.top1Accuracy * 100).toFixed(1)}% | ${(comparisonResult.embeddingOnly.top3Recall * 100).toFixed(1)}% | ${(comparisonResult.embeddingOnly.top5Recall * 100).toFixed(1)}% | ${(comparisonResult.embeddingOnly.precision * 100).toFixed(1)}% | ${(comparisonResult.embeddingOnly.recall * 100).toFixed(1)}% | ${(comparisonResult.embeddingOnly.f1Score * 100).toFixed(1)}% | ${(comparisonResult.embeddingOnly.falseAutoLinkRate * 100).toFixed(1)}% | ${comparisonResult.embeddingOnly.averageLatencyMs}ms |
| **SiteSync Hybrid Engine** | **${(comparisonResult.hybrid.top1Accuracy * 100).toFixed(1)}%** | **${(comparisonResult.hybrid.top3Recall * 100).toFixed(1)}%** | **${(comparisonResult.hybrid.top5Recall * 100).toFixed(1)}%** | **${(comparisonResult.hybrid.precision * 100).toFixed(1)}%** | **${(comparisonResult.hybrid.recall * 100).toFixed(1)}%** | **${(comparisonResult.hybrid.f1Score * 100).toFixed(1)}%** | **${(comparisonResult.hybrid.falseAutoLinkRate * 100).toFixed(1)}%** | **${comparisonResult.hybrid.averageLatencyMs}ms** |

---

## Error Analysis Summary
* **Total Evaluated**: ${testRecords.length}
* **Errors / Misclassifications**: ${errorRecords.length}
* **Unmatched Recall**: ${(comparisonResult.hybrid.unmatchedRecall * 100).toFixed(1)}%
* **False Auto-Link Rate**: ${(comparisonResult.hybrid.falseAutoLinkRate * 100).toFixed(1)}% (Guarded by candidate margin and review policy)
`;

    fs.writeFileSync(path.join(evalDir, 'errors.md'), markdownErrorDoc);

    return {
      results: comparisonResult,
      errorAnalysis: {
        totalEvaluated: testRecords.length,
        totalErrors: errorRecords.length,
        errors: errorRecords.slice(0, 10),
      },
    };
  }
}
