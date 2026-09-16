import { ExtractedEntity } from '../matching.types';

export class EntityScorer {
  /**
   * Scores entity overlap between extracted event entities and activity metadata.
   */
  public score(
    entities: ExtractedEntity[],
    activityName: string,
    activityDescription: string,
    activityCode: string
  ): number {
    if (!entities || entities.length === 0) {
      return 0.5; // Neutral
    }

    const activityText = `${activityCode} ${activityName} ${activityDescription}`.toLowerCase();
    let matches = 0;

    for (const ent of entities) {
      const cleanEntity = ent.text.toLowerCase().trim();
      if (cleanEntity.length <= 2) continue;

      if (activityText.includes(cleanEntity)) {
        matches++;
      }
    }

    if (matches === 0) return 0.2;
    const ratio = matches / Math.min(entities.length, 3);
    return Math.min(1.0, 0.4 + ratio * 0.6);
  }
}
