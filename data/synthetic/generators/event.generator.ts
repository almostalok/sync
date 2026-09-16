import { Discipline, EventStatus } from '@sitesync/types';
import { SyntheticActivity, SyntheticGroundTruthEvent, DifficultyLevel, DifficultyDistribution } from '../types';
import { PRNG } from '../noise/prng';
import { NoiseEngine } from '../noise/noise-engine';
import { PROJECT_LOCATIONS } from '../dictionaries/locations';

export class EventGenerator {
  private noiseEngine: NoiseEngine;

  constructor(private prng: PRNG) {
    this.noiseEngine = new NoiseEngine(prng);
  }

  public generate(
    projectId: string,
    activities: SyntheticActivity[],
    targetCount: number = 1500,
    distribution: DifficultyDistribution
  ): SyntheticGroundTruthEvent[] {
    const events: SyntheticGroundTruthEvent[] = [];

    // Group activities by discipline and activityType for candidate matching
    const activityMapByDiscipline: Record<string, SyntheticActivity[]> = {};
    for (const act of activities) {
      if (!activityMapByDiscipline[act.discipline]) activityMapByDiscipline[act.discipline] = [];
      activityMapByDiscipline[act.discipline].push(act);
    }

    for (let i = 0; i < targetCount; i++) {
      const difficultyLevel = this.pickDifficulty(distribution);
      const eventId = `evt-${projectId}-${String(i + 1).padStart(5, '0')}`;
      const reportNum = Math.floor(i / 1.5) + 1;
      const fieldReportId = `rep-${projectId}-${String(reportNum).padStart(5, '0')}`;

      if (difficultyLevel === DifficultyLevel.UNMATCHED) {
        // Unmatched event (No corresponding schedule activity)
        const locationObj = this.prng.pick(PROJECT_LOCATIONS);
        const discipline = this.prng.pick([
          Discipline.CIVIL,
          Discipline.HSE,
          Discipline.GENERAL,
          Discipline.PIPING,
        ]);

        const { rawText, normalizedText } = this.noiseEngine.generateEventText({
          action: 'Temporary Field Maintenance',
          objectName: 'Site Facility',
          location: locationObj.name,
          progress: 1.0,
          difficultyLevel,
        });

        events.push({
          id: eventId,
          fieldReportId,
          eventDate: '2026-06-15T12:00:00.000Z',
          discipline,
          location: locationObj.name,
          text: rawText,
          normalizedText,
          progress: 1.0,
          status: EventStatus.COMPLETED,
          difficultyLevel,
          groundTruthActivityId: null,
          confidenceThreshold: 0.85,
          metadata: {
            generatorVersion: '1.0.0',
            seed: 42,
            scenario: 'compressor-station-expansion',
            action: 'Ad-hoc Maintenance',
            location: locationObj.name,
          },
        });
        continue;
      }

      // Pick target ground truth activity
      const activity = this.prng.pick(activities);
      let candidateIds: string[] | undefined = undefined;
      let parentActivityId: string | null = null;
      let subScope: string | null = null;

      if (difficultyLevel === DifficultyLevel.AMBIGUOUS) {
        // Find 2-4 similar activities in the same discipline / activityType
        const sameDiscipline = activityMapByDiscipline[activity.discipline] || [activity];
        const candidates = sameDiscipline
          .filter((a) => a.activityType === activity.activityType)
          .slice(0, 3);
        if (candidates.length < 2) {
          candidates.push(activity);
        }
        candidateIds = candidates.map((c) => c.id);
      } else if (difficultyLevel === DifficultyLevel.GRANULARITY_MISMATCH) {
        parentActivityId = activity.id;
        subScope = this.prng.pick(['North Section / Bay 1', 'South Section / Bay 2', 'Block A Level 1', 'Zone East']);
      }

      // Progress calculation
      const progress = activity.actualProgress > 0 ? activity.actualProgress : (this.prng.chance(0.5) ? 0.25 : 0.75);
      const status = progress >= 1.0 ? EventStatus.COMPLETED : (progress > 0 ? EventStatus.IN_PROGRESS : EventStatus.PLANNED);

      const { rawText, normalizedText } = this.noiseEngine.generateEventText({
        action: activity.activityType,
        objectName: activity.name.split(' - ')[1] || activity.name,
        location: activity.location,
        progress,
        equipmentTag: activity.equipmentTag,
        activityCode: activity.activityCode,
        subScope: subScope || undefined,
        difficultyLevel,
      });

      events.push({
        id: eventId,
        fieldReportId,
        eventDate: activity.actualStart || activity.plannedStart,
        discipline: activity.discipline,
        location: activity.location,
        text: rawText,
        normalizedText,
        progress,
        status,
        difficultyLevel,
        groundTruthActivityId: activity.id,
        groundTruthCandidateActivityIds: candidateIds,
        parentActivityId,
        subScope,
        confidenceThreshold: difficultyLevel <= DifficultyLevel.PARAPHRASE ? 0.85 : 0.65,
        metadata: {
          generatorVersion: '1.0.0',
          seed: 42,
          scenario: 'compressor-station-expansion',
          action: activity.activityType,
          equipmentTag: activity.equipmentTag,
          location: activity.location,
        },
      });
    }

    return events;
  }

  private pickDifficulty(dist: DifficultyDistribution): DifficultyLevel {
    const roll = this.prng.next();
    let cumulative = 0;

    cumulative += dist.exact;
    if (roll < cumulative) return DifficultyLevel.EXACT;

    cumulative += dist.paraphrase;
    if (roll < cumulative) return this.prng.chance(0.5) ? DifficultyLevel.MINOR_VARIATION : DifficultyLevel.PARAPHRASE;

    cumulative += dist.noisy;
    if (roll < cumulative) return DifficultyLevel.NOISY;

    cumulative += dist.ambiguous;
    if (roll < cumulative) return DifficultyLevel.AMBIGUOUS;

    cumulative += dist.granularityMismatch;
    if (roll < cumulative) return DifficultyLevel.GRANULARITY_MISMATCH;

    return DifficultyLevel.UNMATCHED;
  }
}
