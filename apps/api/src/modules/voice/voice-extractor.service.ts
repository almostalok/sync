import {
  ExtractedEvent,
  Activity,
  Dependency,
  ActivityMatch,
} from '@/types/domain';
import { VoiceReport, VoiceTranscript } from '@sitesync/types';
import { VoiceNormalizerService } from './voice-normalizer.service';
import { matchEventToActivities } from '@/lib/ai/hybridMatcher';

export interface VoiceExtractionResult {
  events: ExtractedEvent[];
  matches: ActivityMatch[];
  negationsDetected: number;
  selfCorrectionsResolved: number;
}

export class VoiceExtractorService {
  constructor(private normalizer = new VoiceNormalizerService()) {}

  /**
   * Extract canonical domain events from a voice transcript, preserving evidence timestamps.
   */
  extractEvents(params: {
    report: VoiceReport;
    transcript: VoiceTranscript;
    activities: Activity[];
    dependencies?: Dependency[];
  }): VoiceExtractionResult {
    const { report, transcript, activities, dependencies = [] } = params;
    const events: ExtractedEvent[] = [];
    const matches: ActivityMatch[] = [];

    let negationsDetected = 0;
    let selfCorrectionsResolved = 0;

    // Process each transcript segment (sentence or phrase clause)
    const segments =
      transcript.segments.length > 0
        ? transcript.segments
        : [
            {
              id: 'SEG-01',
              text: transcript.text,
              startSeconds: 0,
              endSeconds: transcript.durationSeconds || 15,
              confidence: transcript.confidence || 0.9,
            },
          ];

    segments.forEach((seg, idx) => {
      const norm = this.normalizer.normalizeStatement(seg.text, report.createdAt.slice(0, 10));

      if (norm.isNegated) negationsDetected++;
      if (norm.isSelfCorrected) selfCorrectionsResolved++;

      // Filter out pure conversational filler
      if (
        !norm.detectedDiscipline &&
        norm.extractedProgress === undefined &&
        norm.status === 'UNKNOWN' &&
        !norm.detectedLocation &&
        !norm.quantity
      ) {
        if (!/foundation|excavation|concrete|pipe|weld|cable|valve|pump|skid|panel|tray|steel|rebar/i.test(seg.text)) {
          return;
        }
      }

      const eventId = `EVT-VOICE-${report.id.replace(/\D/g, '').slice(-4) || '2000'}-${(idx + 1).toString().padStart(2, '0')}`;

      // Build descriptive work title
      let description = norm.normalizedText;
      if (description.length > 70) {
        description = description.slice(0, 70).trim() + '...';
      }
      description = description.replace(/\b\w/g, (l) => l.toUpperCase());

      // If statement was an explicit negation, annotate title
      if (norm.isNegated) {
        description = `[NON-EVENT / PENDING] ${description}`;
      }

      // Voice evidence locator attaches precise start and end seconds
      const event: ExtractedEvent = {
        id: eventId,
        fieldReportId: report.id,
        reportFileName: `Voice_${report.id}.webm`,
        description,
        normalizedDescription: norm.normalizedText,
        eventDate: norm.resolvedDate || report.createdAt.slice(0, 10),
        discipline: norm.detectedDiscipline,
        location: norm.detectedLocation,
        progress: norm.extractedProgress,
        status: norm.status,
        quantity: norm.quantity?.value,
        unit: norm.quantity?.unit,
        sourceText: seg.text,
        sourcePage: 1, // Voice recording page equivalent
        characterStart: Math.round(seg.startSeconds),
        characterEnd: Math.round(seg.endSeconds),
        extractionConfidence: seg.confidence,
        createdAt: new Date().toISOString(),
      };

      // Run hybrid matcher against schedule activities
      let match: ActivityMatch;
      if (norm.isNegated) {
        // Negated events are flagged as UNMATCHED to prevent schedule corruption (Section 61)
        match = {
          id: `MATCH-${event.id}`,
          eventId: event.id,
          activityId: 'UNMATCHED',
          activityCode: 'NONE',
          activityName: 'Negated Event (Hold)',
          rank: 1,
          signals: {
            semanticScore: 0,
            disciplineScore: 0,
            locationScore: 0,
            wbsScore: 0,
            temporalScore: 0,
            dependencyScore: 0,
            entityScore: 0,
          },
          finalScore: 0,
          confidence: 0,
          decision: 'UNMATCHED',
          decisionReason: `Negation detected: ${norm.negationReason || 'Statement indicates work did not happen.'}`,
          candidates: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        match = matchEventToActivities(event, activities, 5);
      }

      event.match = match;
      events.push(event);
      matches.push(match);
    });

    return {
      events,
      matches,
      negationsDetected,
      selfCorrectionsResolved,
    };
  }
}
