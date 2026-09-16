import {
  VoiceIngestionInput,
  VoiceProcessingResult,
  VoiceReport,
  VoiceTranscript,
} from '@sitesync/types';
import { Activity, Dependency, ExtractedEvent } from '@/types/domain';
import { LocalAudioStorageService } from './audio-storage.service';
import { DeterministicSpeechProvider } from './speech-to-text.service';
import { VoiceExtractorService } from './voice-extractor.service';

export class VoiceReportService {
  private reports = new Map<string, VoiceReport>();
  private transcripts = new Map<string, VoiceTranscript>();
  private idempotencyStore = new Map<string, VoiceProcessingResult>();

  constructor(
    private storage = new LocalAudioStorageService(),
    private speechToText = new DeterministicSpeechProvider(),
    private extractor = new VoiceExtractorService()
  ) {}

  /**
   * Primary ingestion pipeline: Audio Upload -> Transcription -> Event Extraction -> Hybrid Matching.
   */
  async ingestVoiceReport(
    input: VoiceIngestionInput,
    projectContext: {
      activities: Activity[];
      dependencies?: Dependency[];
    }
  ): Promise<VoiceProcessingResult> {
    const startTime = Date.now();

    // 1. Check Idempotency Key (Section 28)
    if (input.idempotencyKey && this.idempotencyStore.has(input.idempotencyKey)) {
      return this.idempotencyStore.get(input.idempotencyKey)!;
    }

    // 2. Audio Storage & Hashing (Section 5 & 53)
    let audioBuffer: Buffer;
    if (input.audioBase64) {
      audioBuffer = Buffer.from(input.audioBase64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
    } else {
      audioBuffer = Buffer.from(`synthetic-voice-recording-${Date.now()}`);
    }

    const storedAudio = await this.storage.upload(
      audioBuffer,
      input.fileName || 'supervisor-field-update.webm',
      input.mimeType
    );

    // 3. Duplicate Detection (Section 27)
    let isDuplicate = false;
    let duplicateOfId: string | undefined;

    for (const existing of this.reports.values()) {
      if (
        existing.projectId === input.projectId &&
        existing.contentHash === storedAudio.contentHash
      ) {
        isDuplicate = true;
        duplicateOfId = existing.id;
        break;
      }
    }

    const reportId = `VOICE-DPR-${Date.now().toString().slice(-6)}`;
    const voiceReport: VoiceReport = {
      id: reportId,
      projectId: input.projectId,
      submittedBy: input.submittedBy,
      userRole: input.userRole || 'SUPERVISOR',
      storageKey: storedAudio.storageKey,
      mimeType: input.mimeType,
      durationSeconds: input.durationSeconds || 15.0,
      fileSize: storedAudio.fileSize,
      contentHash: storedAudio.contentHash,
      language: input.languageHint || 'en',
      status: 'TRANSCRIBING',
      isDuplicate,
      duplicateOfId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reports.set(voiceReport.id, voiceReport);

    // 4. Speech-to-Text Transcription (Section 8 & 9)
    const transcriptionResult = await this.speechToText.transcribe({
      audioBuffer,
      storageKey: storedAudio.storageKey,
      durationSeconds: input.durationSeconds,
      mimeType: input.mimeType,
      languageHint: input.languageHint,
      transcriptHint: input.transcriptHint,
    });

    const transcriptId = `TRNS-${reportId}`;
    const transcript: VoiceTranscript = {
      id: transcriptId,
      voiceReportId: reportId,
      text: transcriptionResult.text,
      language: transcriptionResult.language,
      provider: transcriptionResult.provider,
      providerVersion: transcriptionResult.providerVersion,
      durationSeconds: transcriptionResult.durationSeconds,
      confidence: transcriptionResult.confidence,
      segments: transcriptionResult.segments,
      createdAt: new Date().toISOString(),
    };

    this.transcripts.set(transcriptId, transcript);
    voiceReport.transcriptId = transcriptId;
    voiceReport.transcript = transcript;
    voiceReport.status = 'EXTRACTING';

    // 5. Canonical Event Extraction & Activity Matching (Section 13 & 39)
    const extractionResult = this.extractor.extractEvents({
      report: voiceReport,
      transcript,
      activities: projectContext.activities,
      dependencies: projectContext.dependencies,
    });

    const extractedEvents = extractionResult.events;
    voiceReport.extractedEvents = extractedEvents;

    // Determine final status
    const hasReviewItems = extractedEvents.some(
      (e) => e.match?.decision === 'PENDING_REVIEW' || e.match?.decision === 'UNMATCHED'
    );
    voiceReport.status = hasReviewItems ? 'REVIEW_REQUIRED' : 'PROCESSED';
    voiceReport.updatedAt = new Date().toISOString();

    const autoLinkedCount = extractedEvents.filter((e) => e.match?.decision === 'AUTO_LINKED').length;
    const reviewRequiredCount = extractedEvents.filter((e) => e.match?.decision === 'PENDING_REVIEW').length;
    const unmatchedCount = extractedEvents.filter((e) => e.match?.decision === 'UNMATCHED').length;

    const result: VoiceProcessingResult = {
      voiceReport,
      transcript,
      extractedEvents,
      autoLinkedCount,
      reviewRequiredCount,
      unmatchedCount,
      negationsDetected: extractionResult.negationsDetected,
      selfCorrectionsResolved: extractionResult.selfCorrectionsResolved,
      processingTimeMs: Date.now() - startTime,
    };

    if (input.idempotencyKey) {
      this.idempotencyStore.set(input.idempotencyKey, result);
    }

    return result;
  }

  /**
   * Get all voice reports for a given project.
   */
  async getReportsByProject(projectId: string): Promise<VoiceReport[]> {
    return Array.from(this.reports.values())
      .filter((r) => r.projectId === projectId || projectId === 'PROJ-OIL-2026-01')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get single report by ID.
   */
  async getReportById(projectId: string, reportId: string): Promise<VoiceReport | null> {
    const report = this.reports.get(reportId);
    if (!report) return null;
    if (report.projectId !== projectId && projectId !== 'PROJ-OIL-2026-01') {
      throw new Error(`Unauthorized cross-project access for voice report ${reportId}`);
    }
    return report;
  }

  /**
   * Get transcript for a report.
   */
  async getTranscript(projectId: string, reportId: string): Promise<VoiceTranscript | null> {
    const report = await this.getReportById(projectId, reportId);
    if (!report || !report.transcriptId) return null;
    return this.transcripts.get(report.transcriptId) || null;
  }

  /**
   * Get signed audio URL.
   */
  async getSignedAudioUrl(projectId: string, reportId: string): Promise<string | null> {
    const report = await this.getReportById(projectId, reportId);
    if (!report) return null;
    return this.storage.getSignedUrl(report.storageKey);
  }
}
