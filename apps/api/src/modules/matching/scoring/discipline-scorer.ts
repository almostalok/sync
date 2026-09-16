import { Discipline } from '@sitesync/types';

export class DisciplineScorer {
  public score(eventDiscipline?: Discipline, activityDiscipline?: Discipline): number {
    if (!eventDiscipline || !activityDiscipline || eventDiscipline === Discipline.GENERAL || activityDiscipline === Discipline.GENERAL) {
      return 0.5; // Unknown / general fallback
    }
    return eventDiscipline === activityDiscipline ? 1.0 : 0.0;
  }
}
