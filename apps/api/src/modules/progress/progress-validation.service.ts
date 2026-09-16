import { ActivityStatus } from '@sitesync/types';

export interface ProgressValidationResult {
  isValid: boolean;
  errors: string[];
  suggestedStatus?: ActivityStatus;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
}

export class ProgressValidationService {
  /**
   * Validates proposed progress updates against domain business rules.
   */
  public validateUpdate(params: {
    previousProgress: number;
    newProgress: number;
    effectiveDate: string;
    existingActualStart?: string | null;
    existingActualEnd?: string | null;
    isCorrection?: boolean;
    correctionReason?: string;
  }): ProgressValidationResult {
    const errors: string[] = [];
    const { previousProgress, newProgress, effectiveDate, existingActualStart, existingActualEnd, isCorrection, correctionReason } = params;

    // 1. Numerical bounds validation [0.0, 1.0]
    if (typeof newProgress !== 'number' || isNaN(newProgress)) {
      errors.push('Progress must be a valid number');
    } else if (newProgress < 0.0 || newProgress > 1.0) {
      errors.push(`Progress must be between 0.0 and 1.0 (received ${newProgress})`);
    }

    // 2. Monotonic progression validation
    if (!isCorrection && newProgress < previousProgress) {
      errors.push(
        `Regressive progress (${Math.round(previousProgress * 100)}% -> ${Math.round(
          newProgress * 100
        )}%) is forbidden without an authorized correction workflow.`
      );
    }

    if (isCorrection && !correctionReason) {
      errors.push('Authorized progress correction requires an explicit justification reason.');
    }

    // 3. Status derivation and actual dates calculation
    let suggestedStatus = ActivityStatus.NOT_STARTED;
    let actualStartDate = existingActualStart || null;
    let actualEndDate = existingActualEnd || null;

    if (newProgress === 0.0) {
      suggestedStatus = ActivityStatus.NOT_STARTED;
    } else if (newProgress > 0.0 && newProgress < 1.0) {
      suggestedStatus = ActivityStatus.IN_PROGRESS;
      if (!actualStartDate) {
        actualStartDate = effectiveDate;
      }
    } else if (newProgress >= 1.0) {
      suggestedStatus = ActivityStatus.COMPLETED;
      if (!actualStartDate) {
        actualStartDate = effectiveDate;
      }
      actualEndDate = effectiveDate;
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestedStatus,
      actualStartDate,
      actualEndDate,
    };
  }
}
