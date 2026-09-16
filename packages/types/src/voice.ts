/**
 * SiteSync — Master Prompt 9: Supervisor Voice Agent Types
 * Strict typed contracts for voice audio ingestion, transcription, Hinglish normalization,
 * evidence timestamps, and canonical event pipeline integration.
 */

import { Discipline, EventStatus } from './enums';
import { ExtractedEventDTO } from './domain';

export type VoiceReportStatus =
  | 'UPLOADED'
  | 'TRANSCRIBING'
  | 'TRANSCRIBED'
  | 'EXTRACTING'
  | 'PROCESSED'
  | 'REVIEW_REQUIRED'
  | 'FAILED';

export type EpistemicModality =
  | 'FACT'
  | 'PLAN'
  | 'ESTIMATE'
  | 'HEARSAY'
  | 'UNCERTAINTY'
  | 'NEGATION';

export interface VoiceEvidenceLocator {
  startSeconds: number;
  endSeconds: number;
  audioUrl?: string;
  transcriptExcerpt?: string;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
  confidence: number;
  speakerId?: string;
}

export interface VoiceTranscript {
  id: string;
  voiceReportId: string;
  text: string;
  normalizedText?: string;
  language: string; // 'en' | 'hi' | 'hinglish'
  provider: string; // 'whisper' | 'mock-stt'
  providerVersion?: string;
  durationSeconds: number;
  confidence: number;
  segments: TranscriptSegment[];
  supersedesId?: string;
  createdAt: string;
}

export interface VoiceReport {
  id: string;
  projectId: string;
  submittedBy: string;
  userRole?: string;
  storageKey: string;
  mimeType: string;
  durationSeconds: number;
  fileSize: number;
  contentHash: string; // SHA-256 for idempotency & duplicate detection
  language: string;
  status: VoiceReportStatus;
  transcriptId?: string;
  transcript?: VoiceTranscript;
  extractedEvents?: any[];
  isDuplicate?: boolean;
  duplicateOfId?: string;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceIngestionInput {
  projectId: string;
  submittedBy: string;
  userRole?: string;
  mimeType: string;
  durationSeconds: number;
  audioBase64?: string;
  fileName?: string;
  idempotencyKey?: string;
  languageHint?: string;
  transcriptHint?: string;
  shift?: string;
  siteLocation?: string;
}

export interface VoiceProcessingResult {
  voiceReport: VoiceReport;
  transcript: VoiceTranscript;
  extractedEvents: any[];
  autoLinkedCount: number;
  reviewRequiredCount: number;
  unmatchedCount: number;
  negationsDetected: number;
  selfCorrectionsResolved: number;
  processingTimeMs: number;
}

export interface VoiceAnalytics {
  totalVoiceReports: number;
  totalDurationMinutes: number;
  transcriptionSuccessRate: number;
  averageConfidence: number;
  autoLinkRate: number;
  reviewRequiredRate: number;
  duplicateRate: number;
  languageBreakdown: Record<string, number>;
  averageProcessingTimeMs: number;
}
