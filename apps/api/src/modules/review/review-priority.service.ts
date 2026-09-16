export interface PriorityCalculationInput {
  confidence: number;
  candidateMargin: number;
  isCritical?: boolean;
  downstreamCount?: number;
  granularityMismatch?: boolean;
  reportDate?: string;
}

export interface ReviewPriorityResult {
  score: number; // 0..100
  reasons: string[];
  components: {
    uncertainty: number;
    ambiguity: number;
    scheduleCriticality: number;
    downstreamImpact: number;
    recency: number;
  };
}

export class ReviewPriorityService {
  /**
   * Calculates a deterministic review-priority score and human-readable reasons.
   */
  public calculatePriority(input: PriorityCalculationInput): ReviewPriorityResult {
    const reasons: string[] = [];

    // 1. Uncertainty Component (0..35 points)
    // Higher uncertainty (lower confidence) increases priority
    const uncertaintyRaw = Math.max(0, 1.0 - input.confidence);
    const uncertainty = Math.round(uncertaintyRaw * 35);
    if (input.confidence < 0.85) {
      reasons.push(`Moderate AI confidence score (${Math.round(input.confidence * 100)}%) requires planner verification`);
    }

    // 2. Ambiguity Component (0..25 points)
    let ambiguity = 0;
    if (input.candidateMargin < 0.03) {
      ambiguity = 25;
      reasons.push('High candidate ambiguity: Top 2 schedule activities have nearly identical scores');
    } else if (input.candidateMargin < 0.06) {
      ambiguity = 18;
      reasons.push('Low candidate margin: Alternative activities are close in semantic relevance');
    } else if (input.candidateMargin < 0.10) {
      ambiguity = 10;
    }

    if (input.granularityMismatch) {
      ambiguity = Math.min(25, ambiguity + 10);
      reasons.push('Granularity mismatch: Field update mentions localized bay/section mapping to broader package');
    }

    // 3. Schedule Criticality Component (0..20 points)
    let scheduleCriticality = 0;
    if (input.isCritical) {
      scheduleCriticality = 20;
      reasons.push('Activity is on the Project Critical Path (zero float)');
    }

    // 4. Downstream Dependency Impact (0..15 points)
    const succCount = input.downstreamCount || 0;
    let downstreamImpact = 0;
    if (succCount >= 4) {
      downstreamImpact = 15;
      reasons.push(`High operational leverage: Blocks ${succCount} downstream successor activities`);
    } else if (succCount > 0) {
      downstreamImpact = succCount * 3;
      reasons.push(`Predecessor activity: Directly influences ${succCount} downstream task${succCount > 1 ? 's' : ''}`);
    }

    // 5. Freshness / Recency Component (0..5 points)
    const recency = 5;

    const totalScore = Math.min(100, Math.max(0, uncertainty + ambiguity + scheduleCriticality + downstreamImpact + recency));

    if (reasons.length === 0) {
      reasons.push('Routine verification of medium-confidence execution event');
    }

    return {
      score: totalScore,
      reasons,
      components: {
        uncertainty,
        ambiguity,
        scheduleCriticality,
        downstreamImpact,
        recency,
      },
    };
  }
}
