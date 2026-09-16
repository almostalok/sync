import { ExtractedEventResult, ActivityContext } from '../matching.types';
import { EmbeddingService } from '../embeddings/embedding.service';

export class EmbeddingOnlyMatcher {
  private embeddingService = new EmbeddingService();

  public match(event: ExtractedEventResult, activities: ActivityContext[]): { topActivityId: string | null; score: number } {
    const eventEmb = this.embeddingService.computeEmbedding(event.normalizedDescription);

    let bestScore = 0.0;
    let bestActivityId: string | null = null;

    for (const act of activities) {
      const actEmb = act.embedding || this.embeddingService.computeEmbedding(`${act.name} ${act.description}`);
      const sim = this.embeddingService.cosineSimilarity(eventEmb, actEmb);

      if (sim > bestScore) {
        bestScore = sim;
        bestActivityId = act.id;
      }
    }

    if (bestScore < 0.40) {
      return { topActivityId: null, score: 0.0 };
    }

    return { topActivityId: bestActivityId, score: bestScore };
  }
}
