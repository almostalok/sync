import { ExtractedEventResult, ActivityContext } from '../matching.types';

export class ExactStringMatcher {
  public match(event: ExtractedEventResult, activities: ActivityContext[]): { topActivityId: string | null; score: number } {
    const cleanEvent = event.normalizedDescription.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const act of activities) {
      const cleanAct = `${act.name} ${act.description}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanAct.includes(cleanEvent) || cleanEvent.includes(cleanAct)) {
        return { topActivityId: act.id, score: 1.0 };
      }
    }

    return { topActivityId: null, score: 0.0 };
  }
}
