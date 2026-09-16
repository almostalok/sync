import { Discipline, ReportType, ReviewDecisionType } from '@sitesync/types';

export interface UploadFieldReportInput {
  projectId: string;
  filename: string;
  sourceType: ReportType;
  rawText: string;
  reportDate?: string;
  discipline?: Discipline;
  uploadedBy: string;
}

export function validateUploadFieldReport(input: unknown): { valid: boolean; errors: string[]; data?: UploadFieldReportInput } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Report payload must be an object'] };
  }

  const r = input as Record<string, unknown>;
  if (!r.projectId || typeof r.projectId !== 'string') {
    errors.push('projectId is required');
  }
  if (!r.rawText || typeof r.rawText !== 'string' || r.rawText.trim().length === 0) {
    errors.push('rawText is required');
  }
  if (!r.uploadedBy || typeof r.uploadedBy !== 'string') {
    errors.push('uploadedBy is required');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: r.projectId as string,
      filename: typeof r.filename === 'string' && r.filename.trim().length > 0 ? r.filename.trim() : `DPR-${Date.now()}.txt`,
      sourceType: (r.sourceType as ReportType) || ReportType.TEXT,
      rawText: (r.rawText as string).trim(),
      reportDate: typeof r.reportDate === 'string' ? r.reportDate : new Date().toISOString().split('T')[0],
      discipline: (r.discipline as Discipline) || Discipline.GENERAL,
      uploadedBy: (r.uploadedBy as string).trim(),
    },
  };
}

export interface ReviewDecisionInput {
  projectId: string;
  matchId: string;
  reviewerId: string;
  decision: ReviewDecisionType;
  targetActivityId?: string;
  notes?: string;
}

export function validateReviewDecision(input: unknown): { valid: boolean; errors: string[]; data?: ReviewDecisionInput } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Review decision payload must be an object'] };
  }

  const rv = input as Record<string, unknown>;
  if (!rv.projectId || typeof rv.projectId !== 'string') {
    errors.push('projectId is required');
  }
  if (!rv.matchId || typeof rv.matchId !== 'string') {
    errors.push('matchId is required');
  }
  if (!rv.reviewerId || typeof rv.reviewerId !== 'string') {
    errors.push('reviewerId is required');
  }
  if (!rv.decision || !Object.values(ReviewDecisionType).includes(rv.decision as ReviewDecisionType)) {
    errors.push('Valid review decision is required (ACCEPTED, REJECTED, SELECTED_ALTERNATIVE, MARKED_UNMATCHED)');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: rv.projectId as string,
      matchId: rv.matchId as string,
      reviewerId: rv.reviewerId as string,
      decision: rv.decision as ReviewDecisionType,
      targetActivityId: typeof rv.targetActivityId === 'string' ? rv.targetActivityId : undefined,
      notes: typeof rv.notes === 'string' ? rv.notes : undefined,
    },
  };
}
