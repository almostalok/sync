import { BenchmarkMetrics } from '../matching.types';

export interface EvaluationSample {
  groundTruthActivityId: string | null;
  predictedActivityId: string | null;
  topCandidateIds: string[];
  decision: string;
  isCorrect: boolean;
  latencyMs: number;
}

export class MetricsCalculator {
  public static calculate(samples: EvaluationSample[]): BenchmarkMetrics {
    if (samples.length === 0) {
      return {
        totalEvaluated: 0,
        top1Accuracy: 0,
        top3Recall: 0,
        top5Recall: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        unmatchedPrecision: 0,
        unmatchedRecall: 0,
        falseAutoLinkRate: 0,
        averageLatencyMs: 0,
      };
    }

    let top1Correct = 0;
    let top3Correct = 0;
    let top5Correct = 0;

    let truePositives = 0; // Matched correctly
    let falsePositives = 0; // Predicted a match when it was wrong or unmatched
    let falseNegatives = 0; // Ground truth had activity, but predicted unmatched

    let actualUnmatched = 0;
    let predictedUnmatched = 0;
    let correctUnmatched = 0;

    let autoLinkCount = 0;
    let falseAutoLinkCount = 0;
    let totalLatency = 0;

    for (const sample of samples) {
      totalLatency += sample.latencyMs;
      const isGroundUnmatched = sample.groundTruthActivityId === null;
      const isPredUnmatched = sample.predictedActivityId === null || sample.decision === 'UNMATCHED';

      if (isGroundUnmatched) {
        actualUnmatched++;
        if (isPredUnmatched) {
          correctUnmatched++;
          top1Correct++;
          top3Correct++;
          top5Correct++;
        } else {
          falsePositives++;
        }
      } else {
        // Ground truth has a target activity
        const top1 = sample.topCandidateIds[0] || null;
        if (top1 === sample.groundTruthActivityId) {
          top1Correct++;
          truePositives++;
        } else {
          if (isPredUnmatched) {
            falseNegatives++;
          } else {
            falsePositives++;
          }
        }

        if (sample.topCandidateIds.slice(0, 3).includes(sample.groundTruthActivityId!)) {
          top3Correct++;
        }
        if (sample.topCandidateIds.slice(0, 5).includes(sample.groundTruthActivityId!)) {
          top5Correct++;
        }
      }

      if (isPredUnmatched) {
        predictedUnmatched++;
      }

      // Check False Auto-Link Rate
      if (sample.decision === 'AUTO_LINKED') {
        autoLinkCount++;
        if (sample.predictedActivityId !== sample.groundTruthActivityId) {
          falseAutoLinkCount++;
        }
      }
    }

    const n = samples.length;
    const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    const unmatchedPrec = predictedUnmatched > 0 ? correctUnmatched / predictedUnmatched : 0;
    const unmatchedRec = actualUnmatched > 0 ? correctUnmatched / actualUnmatched : 0;
    const falseAutoLinkRate = autoLinkCount > 0 ? falseAutoLinkCount / autoLinkCount : 0;

    return {
      totalEvaluated: n,
      top1Accuracy: Math.round((top1Correct / n) * 1000) / 1000,
      top3Recall: Math.round((top3Correct / n) * 1000) / 1000,
      top5Recall: Math.round((top5Correct / n) * 1000) / 1000,
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
      f1Score: Math.round(f1Score * 1000) / 1000,
      unmatchedPrecision: Math.round(unmatchedPrec * 1000) / 1000,
      unmatchedRecall: Math.round(unmatchedRec * 1000) / 1000,
      falseAutoLinkRate: Math.round(falseAutoLinkRate * 1000) / 1000,
      averageLatencyMs: Math.round((totalLatency / n) * 10) / 10,
    };
  }
}
