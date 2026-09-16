import { DisciplineType, EventStatus, MatchDecision } from '@/types/domain';

export interface FieldReportUploadInput {
  fileName: string;
  sourceType: 'PDF' | 'XLSX' | 'CSV' | 'TXT' | 'AUDIO';
  rawText: string;
  reportDate?: string;
  discipline?: DisciplineType;
  uploadedBy?: string;
}

export interface ReviewDecisionInput {
  eventId: string;
  matchId: string;
  decision: 'ACCEPTED' | 'REJECTED' | 'SELECTED_ALTERNATIVE' | 'MARKED_UNMATCHED';
  targetActivityId?: string;
  reviewerName?: string;
  reason?: string;
}

export interface CopilotQueryInput {
  question: string;
  projectId?: string;
  filterDiscipline?: DisciplineType;
}

export function validateReportInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Invalid request payload'] };
  }
  if (!input.rawText || typeof input.rawText !== 'string' || input.rawText.trim().length === 0) {
    errors.push('Report text content is required');
  }
  if (input.fileName && typeof input.fileName !== 'string') {
    errors.push('File name must be a string');
  }
  return { valid: errors.length === 0, errors };
}

export function validateReviewInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Invalid review payload'] };
  }
  if (!input.eventId) errors.push('Event ID is required');
  if (!input.matchId) errors.push('Match ID is required');
  if (!['ACCEPTED', 'REJECTED', 'SELECTED_ALTERNATIVE', 'MARKED_UNMATCHED'].includes(input.decision)) {
    errors.push('Invalid review decision type');
  }
  return { valid: errors.length === 0, errors };
}
