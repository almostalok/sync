import { MATCHING_WEIGHTS, CONFIDENCE_POLICY } from '@sitesync/config';
import { MatchDecision } from '@sitesync/types';
import {
  ExtractedEventResult,
  ActivityContext,
  MatchCandidate,
  MatchResult,
  ConfidenceLevel,
  ComponentScoreBreakdown,
} from '../matching.types';
import { SemanticScorer } from './semantic-scorer';
import { DisciplineScorer } from './discipline-scorer';
import { LocationScorer } from './location-scorer';
import { WBSScorer } from './wbs-scorer';
import { TemporalScorer } from './temporal-scorer';
import { DependencyScorer } from './dependency-scorer';
import { EntityScorer } from './entity-scorer';
import { EmbeddingService } from '../embeddings/embedding.service';
import { MatchExplanationService } from '../explainability/match-explanation.service';

export class HybridMatchingService {
  private semanticScorer = new SemanticScorer();
  private disciplineScorer = new DisciplineScorer();
  private locationScorer = new LocationScorer();
  private wbsScorer = new WBSScorer();
  private temporalScorer = new TemporalScorer();
  private dependencyScorer = new DependencyScorer();
  private entityScorer = new EntityScorer();
  private embeddingService = new EmbeddingService();
  private explanationService = new MatchExplanationService();

  /**
   * Evaluates an extracted event against a candidate set of activities using the 7-feature hybrid model.
   */
  public matchEvent(
    event: ExtractedEventResult,
    candidateActivities: ActivityContext[],
    eventEmbedding?: number[]
  ): MatchResult {
    const embedding = eventEmbedding || this.embeddingService.computeEmbedding(
      this.embeddingService.generateEventCanonicalText({
        discipline: event.discipline,
        location: event.location,
        normalizedDescription: event.normalizedDescription,
        entities: event.entities,
      })
    );

    const candidates: MatchCandidate[] = [];

    for (const activity of candidateActivities) {
      const actEmbedding = activity.embedding || this.embeddingService.computeEmbedding(
        this.embeddingService.generateActivityCanonicalText({
          discipline: activity.discipline,
          location: activity.location,
          activityType: activity.activityType,
          name: activity.name,
          description: activity.description,
        })
      );

      // Compute 7 scoring components
      const semantic = this.semanticScorer.score(embedding, actEmbedding);
      const discipline = this.disciplineScorer.score(event.discipline, activity.discipline);
      const location = this.locationScorer.score(event.location, activity.location);
      const wbs = this.wbsScorer.score(activity.wbsPath, activity.wbsPath);
      const temporal = this.temporalScorer.score(event.eventDate, activity.plannedStart, activity.plannedFinish);
      const dependency = this.dependencyScorer.score(activity.status);
      const entity = this.entityScorer.score(event.entities, activity.name, activity.description, activity.activityCode);

      // Base Weighted Final Score
      let finalScore =
        semantic * MATCHING_WEIGHTS.semantic +
        discipline * MATCHING_WEIGHTS.discipline +
        location * MATCHING_WEIGHTS.location +
        wbs * MATCHING_WEIGHTS.wbs +
        temporal * MATCHING_WEIGHTS.temporal +
        dependency * MATCHING_WEIGHTS.dependency +
        entity * MATCHING_WEIGHTS.entity;

      // Semantic Gating: if semantic similarity is low, the activity is not a valid match
      if (semantic < 0.45) {
        finalScore = finalScore * Math.pow(semantic / 0.45, 1.5);
      } else if (semantic >= 0.80 && entity >= 0.70 && discipline === 1.0) {
        // High confidence boost for explicit entity + discipline + semantic alignment
        finalScore = Math.min(1.0, finalScore + 0.06);
      }

      finalScore = Math.round(finalScore * 1000) / 1000;

      const scores: ComponentScoreBreakdown = {
        semantic: Math.round(semantic * 1000) / 1000,
        discipline: Math.round(discipline * 1000) / 1000,
        location: Math.round(location * 1000) / 1000,
        wbs: Math.round(wbs * 1000) / 1000,
        temporal: Math.round(temporal * 1000) / 1000,
        dependency: Math.round(dependency * 1000) / 1000,
        entity: Math.round(entity * 1000) / 1000,
        final: finalScore,
      };

      const reasons = this.generateCandidateReasons(scores, activity, event);

      candidates.push({
        activityId: activity.id,
        activityCode: activity.activityCode,
        activityName: activity.name,
        discipline: activity.discipline,
        location: activity.location,
        wbsPath: activity.wbsPath,
        rank: 0,
        finalScore,
        scores,
        reasons,
      });
    }

    // Sort by final score descending
    candidates.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    candidates.forEach((c, idx) => {
      c.rank = idx + 1;
    });

    const top5 = candidates.slice(0, CONFIDENCE_POLICY.MAX_TOP_K_CANDIDATES);
    const topCandidate = top5[0];
    const top1Score = topCandidate ? topCandidate.finalScore : 0.0;
    const top2Score = top5[1] ? top5[1].finalScore : 0.0;
    const candidateMargin = Math.round((top1Score - top2Score) * 1000) / 1000;

    // Ambiguity and Granularity detection
    const isAmbiguous = top5.length >= 2 && candidateMargin < 0.05 && top1Score >= 0.70;
    const hasSectionEntity = event.entities.some((e) => e.type === 'SECTION');
    const granularityMismatch = Boolean(event.granularityMismatch || hasSectionEntity);

    // Match Decision Policy
    let decision = MatchDecision.UNMATCHED;
    let confidence = top1Score;
    let confidenceLevel: ConfidenceLevel = 'LOW';

    if (top1Score >= CONFIDENCE_POLICY.AUTO_LINK_THRESHOLD && !isAmbiguous && !granularityMismatch) {
      decision = MatchDecision.AUTO_LINKED;
      confidenceLevel = 'HIGH';
    } else if (top1Score >= CONFIDENCE_POLICY.REVIEW_REQUIRED_THRESHOLD || (isAmbiguous && top1Score >= 0.60) || (granularityMismatch && top1Score >= 0.60)) {
      decision = MatchDecision.REVIEW_REQUIRED;
      confidenceLevel = 'MEDIUM';
    } else {
      decision = MatchDecision.UNMATCHED;
      confidenceLevel = 'LOW';
    }

    // Explanation
    const explanation = this.explanationService.generateExplanation({
      decision,
      confidence,
      confidenceLevel,
      candidateMargin,
      isAmbiguous,
      granularityMismatch,
      topCandidate,
      event,
    });

    return {
      eventId: event.id,
      decision,
      confidence,
      confidenceLevel,
      candidateMargin,
      granularityMismatch,
      isAmbiguous,
      topCandidate,
      candidates: top5,
      explanation,
      matcherVersion: '1.0.0',
      embeddingModel: EmbeddingService.MODEL_NAME,
      embeddingVersion: EmbeddingService.MODEL_VERSION,
      matchedAt: new Date().toISOString(),
    };
  }

  private generateCandidateReasons(
    scores: ComponentScoreBreakdown,
    act: ActivityContext,
    evt: ExtractedEventResult
  ): string[] {
    const reasons: string[] = [];
    reasons.push(`Semantic similarity: ${(scores.semantic * 100).toFixed(0)}%`);

    if (scores.discipline === 1.0) {
      reasons.push(`Discipline verified: ${act.discipline}`);
    }
    if (scores.location >= 0.8) {
      reasons.push(`Location matched: ${act.location}`);
    }
    if (scores.entity >= 0.7) {
      reasons.push(`Entity overlap matched on ${evt.entities.map((e) => e.text).join(', ')}`);
    }
    if (scores.temporal >= 0.8) {
      reasons.push(`Event date overlaps planned window (${act.plannedStart.split('T')[0]})`);
    }
    return reasons;
  }
}
