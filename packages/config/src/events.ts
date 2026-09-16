export const EVENT_NAMES = {
  REPORT_UPLOADED: 'report.uploaded',
  REPORT_PROCESSING_STARTED: 'report.processing.started',
  REPORT_TEXT_EXTRACTED: 'report.text.extracted',
  EVENTS_EXTRACTED: 'report.events.extracted',
  EMBEDDINGS_GENERATED: 'embeddings.generated',
  CANDIDATES_GENERATED: 'candidates.generated',
  MATCHING_COMPLETED: 'matching.completed',
  AUTO_LINKED: 'match.auto_linked',
  REVIEW_REQUIRED: 'review.required',
  MATCH_ACCEPTED: 'match.accepted',
  MATCH_REJECTED: 'match.rejected',
  PROGRESS_UPDATED: 'progress.updated',
  RISK_RECALCULATED: 'risk.recalculated',
} as const;

export const QUEUE_NAMES = {
  REPORT_PROCESSING: 'report-processing',
  EVENT_EXTRACTION: 'event-extraction',
  EMBEDDING_GENERATION: 'embedding-generation',
  ACTIVITY_MATCHING: 'activity-matching',
  RISK_CALCULATION: 'risk-calculation',
  COPILOT_QUERY: 'copilot-query',
} as const;
