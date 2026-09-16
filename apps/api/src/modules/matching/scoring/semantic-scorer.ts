import { EmbeddingService } from '../embeddings/embedding.service';

export class SemanticScorer {
  private embeddingService = new EmbeddingService();

  public score(eventEmbedding: number[], activityEmbedding: number[]): number {
    if (!eventEmbedding || !activityEmbedding) return 0.0;
    return this.embeddingService.cosineSimilarity(eventEmbedding, activityEmbedding);
  }
}
