import { ExtractedEventResult, ActivityContext } from '../matching.types';

export class FuzzyStringMatcher {
  public match(event: ExtractedEventResult, activities: ActivityContext[]): { topActivityId: string | null; score: number } {
    const eventWords = new Set(event.normalizedDescription.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
    let bestScore = 0.0;
    let bestActivityId: string | null = null;

    for (const act of activities) {
      const actWords = new Set(`${act.name} ${act.description}`.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
      let intersection = 0;
      for (const word of eventWords) {
        if (actWords.has(word)) {
          intersection++;
        }
      }
      const union = new Set([...eventWords, ...actWords]).size;
      const jaccard = union > 0 ? intersection / union : 0;

      if (jaccard > bestScore) {
        bestScore = jaccard;
        bestActivityId = act.id;
      }
    }

    if (bestScore < 0.25) {
      return { topActivityId: null, score: 0.0 };
    }

    return { topActivityId: bestActivityId, score: bestScore };
  }
}
