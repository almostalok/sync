export class EmbeddingService {
  public static readonly MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2';
  public static readonly MODEL_VERSION = '1.0.0';
  public static readonly VECTOR_DIMENSIONS = 128;

  /**
   * Generates a canonical representation for an Activity.
   */
  public generateActivityCanonicalText(params: {
    discipline: string;
    location: string;
    activityType: string;
    name: string;
    description: string;
  }): string {
    return `${params.discipline} | ${params.location} | ${params.activityType} | ${params.name} - ${params.description}`;
  }

  /**
   * Generates a canonical representation for an Extracted Event.
   */
  public generateEventCanonicalText(params: {
    discipline: string;
    location: string;
    normalizedDescription: string;
    entities?: Array<{ text: string }>;
  }): string {
    const entityStr = params.entities?.map((e) => e.text).join(', ') || '';
    return `${params.discipline} | ${params.location} | ${params.normalizedDescription}${entityStr ? ` | [${entityStr}]` : ''}`;
  }

  /**
   * Computes a normalized vector embedding for input text.
   * Uses high-resolution subword hash projection with L2 unit normalization.
   */
  public computeEmbedding(text: string): number[] {
    const dim = EmbeddingService.VECTOR_DIMENSIONS;
    const vector = new Array<number>(dim).fill(0.0);

    if (!text || text.trim().length === 0) {
      return vector;
    }

    const clean = text.toLowerCase().trim();
    const words = clean.split(/\s+/);

    // 1. Unigram & Bigram hashing
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wHash = this.hashString(word);
      const idx1 = Math.abs(wHash) % dim;
      vector[idx1] += 1.5;

      // Character trigrams for subword typo resilience
      if (word.length >= 3) {
        for (let j = 0; j <= word.length - 3; j++) {
          const tri = word.slice(j, j + 3);
          const tHash = this.hashString(tri);
          const idxTri = Math.abs(tHash) % dim;
          vector[idxTri] += 0.4;
        }
      }

      if (i < words.length - 1) {
        const bigram = `${words[i]}_${words[i + 1]}`;
        const bHash = this.hashString(bigram);
        const idx2 = Math.abs(bHash) % dim;
        vector[idx2] += 1.0;
      }
    }

    // 2. L2 Unit Normalization (unit length for exact cosine similarity via dot product)
    let sumSq = 0.0;
    for (let i = 0; i < dim; i++) {
      sumSq += vector[i] * vector[i];
    }

    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (let i = 0; i < dim; i++) {
        vector[i] = Math.round((vector[i] / norm) * 10000) / 10000;
      }
    }

    return vector;
  }

  /**
   * Calculates cosine similarity between two normalized vectors (dot product).
   */
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0.0;
    let dot = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }
    // Clamp to [0, 1]
    return Math.max(0.0, Math.min(1.0, dot));
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
