import { ExtractedEventResult, ActivityContext } from '../matching.types';
import { EmbeddingService } from '../embeddings/embedding.service';

export class CandidateRetrievalService {
  private embeddingService = new EmbeddingService();

  /**
   * Retrieves Top-K candidates for an extracted event from project activity context.
   */
  public retrieveCandidates(
    event: ExtractedEventResult,
    activities: ActivityContext[],
    topK: number = 10
  ): { candidates: ActivityContext[]; eventEmbedding: number[] } {
    const eventText = this.embeddingService.generateEventCanonicalText({
      discipline: event.discipline,
      location: event.location,
      normalizedDescription: event.normalizedDescription,
      entities: event.entities,
    });

    const eventEmbedding = this.embeddingService.computeEmbedding(eventText);

    // Rank all activities by semantic similarity
    const scored = activities.map((act) => {
      const actEmbedding = act.embedding || this.embeddingService.computeEmbedding(
        this.embeddingService.generateActivityCanonicalText({
          discipline: act.discipline,
          location: act.location,
          activityType: act.activityType,
          name: act.name,
          description: act.description,
        })
      );

      const sim = this.embeddingService.cosineSimilarity(eventEmbedding, actEmbedding);
      // Soft discipline bonus for retrieval ordering (safe filter)
      const discBonus = act.discipline === event.discipline ? 0.15 : 0.0;
      const retrievalScore = sim + discBonus;

      return {
        activity: { ...act, embedding: actEmbedding },
        score: retrievalScore,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return {
      candidates: scored.slice(0, topK).map((s) => s.activity),
      eventEmbedding,
    };
  }
}
