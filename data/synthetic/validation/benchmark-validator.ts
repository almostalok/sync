import { SyntheticActivity, SyntheticGroundTruthEvent, DifficultyLevel, BenchmarkRecord } from '../types';
import { ValidationIssue } from './schedule-validator';

export class BenchmarkValidator {
  public validate(activities: SyntheticActivity[], events: SyntheticGroundTruthEvent[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const actIdSet = new Set<string>(activities.map((a) => a.id));

    let unmatchedCount = 0;
    let ambiguousCount = 0;
    let exactCount = 0;

    for (const evt of events) {
      if (evt.difficultyLevel === DifficultyLevel.UNMATCHED) {
        unmatchedCount++;
        if (evt.groundTruthActivityId !== null) {
          issues.push({
            type: 'ERROR',
            entity: 'GroundTruthEvent',
            id: evt.id,
            message: `Unmatched event '${evt.id}' must have null groundTruthActivityId, but has '${evt.groundTruthActivityId}'`,
          });
        }
      } else {
        if (!evt.groundTruthActivityId) {
          issues.push({
            type: 'ERROR',
            entity: 'GroundTruthEvent',
            id: evt.id,
            message: `Matched event '${evt.id}' is missing groundTruthActivityId`,
          });
        } else if (!actIdSet.has(evt.groundTruthActivityId)) {
          issues.push({
            type: 'ERROR',
            entity: 'GroundTruthEvent',
            id: evt.id,
            message: `Ground truth activity '${evt.groundTruthActivityId}' not found in activity roster`,
          });
        }

        if (evt.difficultyLevel === DifficultyLevel.AMBIGUOUS) {
          ambiguousCount++;
          if (!evt.groundTruthCandidateActivityIds || evt.groundTruthCandidateActivityIds.length < 2) {
            issues.push({
              type: 'WARNING',
              entity: 'GroundTruthEvent',
              id: evt.id,
              message: `Ambiguous event '${evt.id}' should define at least 2 candidate activity IDs`,
            });
          }
        }

        if (evt.difficultyLevel === DifficultyLevel.EXACT) {
          exactCount++;
        }
      }
    }

    return issues;
  }

  /**
   * Asserts strict isolation between train, validation, and test splits with zero data leakage.
   */
  public validateSplitsIsolation(
    train: BenchmarkRecord[],
    val: BenchmarkRecord[],
    test: BenchmarkRecord[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const trainIds = new Set(train.map((r) => r.eventId));
    const valIds = new Set(val.map((r) => r.eventId));
    const testIds = new Set(test.map((r) => r.eventId));

    // 1. Event ID Leakage
    for (const record of test) {
      if (trainIds.has(record.eventId)) {
        issues.push({
          type: 'ERROR',
          entity: 'DataLeakage',
          id: record.eventId,
          message: `Test event '${record.eventId}' leaked into Training set`,
        });
      }
      if (valIds.has(record.eventId)) {
        issues.push({
          type: 'ERROR',
          entity: 'DataLeakage',
          id: record.eventId,
          message: `Test event '${record.eventId}' leaked into Validation set`,
        });
      }
    }

    for (const record of val) {
      if (trainIds.has(record.eventId)) {
        issues.push({
          type: 'ERROR',
          entity: 'DataLeakage',
          id: record.eventId,
          message: `Validation event '${record.eventId}' leaked into Training set`,
        });
      }
    }

    return issues;
  }
}
