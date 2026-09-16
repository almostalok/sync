import { EpistemicModality } from '@sitesync/types';
import { DisciplineType, EventStatus } from '@/types/domain';
import { VOICE_CONFIG } from './voice.config';

export interface NormalizedVoiceStatement {
  rawText: string;
  normalizedText: string;
  epistemicModality: EpistemicModality;
  isNegated: boolean;
  negationReason?: string;
  isSelfCorrected: boolean;
  selfCorrectionOriginal?: string;
  extractedProgress?: number;
  status: EventStatus;
  detectedDiscipline?: DisciplineType;
  detectedLocation?: string;
  temporalExpression?: string;
  resolvedDate?: string;
  quantity?: { value: number; unit: string; type: string };
}

export class VoiceNormalizerService {
  /**
   * Normalize an audio transcript clause/sentence into a structured semantic statement.
   */
  normalizeStatement(rawSentence: string, submissionDate = '2026-09-16'): NormalizedVoiceStatement {
    let text = rawSentence.trim();
    let isSelfCorrected = false;
    let selfCorrectionOriginal: string | undefined;

    // 1. Handle Self-Corrections (Section 62: "Progress is 80—sorry, 70 percent")
    for (const pattern of VOICE_CONFIG.SELF_CORRECTION_PATTERNS) {
      if (pattern.test(text)) {
        const parts = text.split(pattern);
        if (parts.length >= 2 && parts[1].trim().length > 0) {
          isSelfCorrected = true;
          selfCorrectionOriginal = parts[0].trim();
          // Extract the corrected portion
          text = parts[1].trim();
          break;
        }
      }
    }

    // 2. Multilingual & Hinglish Translation & Jargon Expansion (Section 10 & 11)
    let normalized = text;
    for (const [hinglishTerm, englishEquivalent] of Object.entries(VOICE_CONFIG.HINGLISH_DICTIONARY)) {
      const regex = new RegExp(`\\b${hinglishTerm}\\b`, 'gi');
      normalized = normalized.replace(regex, englishEquivalent);
    }

    // 3. Negation Detection (Section 61)
    // "Concrete pour has NOT started", "no material received", "abhi tak shuru nahi hua"
    const isNegated =
      /\b(not|no|never|nahi|nahin|na|hasn't|didn't|couldn't|cannot|incomplete|pending|unfulfilled)\b/i.test(text) &&
      !/\b(not delayed|no delay|without delay)\b/i.test(text);

    const negationReason = isNegated
      ? `Explicit negative clause detected in voice report ("${text}")`
      : undefined;

    // 4. Epistemic Modality Classification (Section 60)
    let epistemicModality: EpistemicModality = 'FACT';
    if (isNegated) {
      epistemicModality = 'NEGATION';
    } else if (VOICE_CONFIG.EPISTEMIC_PATTERNS.PLAN.test(normalized)) {
      epistemicModality = 'PLAN';
    } else if (VOICE_CONFIG.EPISTEMIC_PATTERNS.ESTIMATE.test(normalized)) {
      epistemicModality = 'ESTIMATE';
    } else if (VOICE_CONFIG.EPISTEMIC_PATTERNS.HEARSAY.test(normalized)) {
      epistemicModality = 'HEARSAY';
    } else if (VOICE_CONFIG.EPISTEMIC_PATTERNS.UNCERTAINTY.test(normalized)) {
      epistemicModality = 'UNCERTAINTY';
    }

    // 5. Quantity Extraction (Section 16: "120 meters", "85 percent", "2 cranes", "1 day")
    let extractedProgress: number | undefined;
    let quantity: { value: number; unit: string; type: string } | undefined;

    // Progress percentage
    const pctMatch = text.match(/(\d{1,3})\s*(?:percent|%|pratisat)/i);
    if (pctMatch) {
      const val = parseInt(pctMatch[1], 10);
      if (val >= 0 && val <= 100) extractedProgress = val;
    }

    // Distance / Length (meters, m)
    const meterMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:meters?|mtrs?|m)\b/i);
    if (meterMatch) {
      quantity = { value: parseFloat(meterMatch[1]), unit: 'meters', type: 'LENGTH' };
    }

    // Concrete volume (cubic meters, m3, cum)
    const cumMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:cubic meters?|m3|cum)\b/i);
    if (cumMatch) {
      quantity = { value: parseFloat(cumMatch[1]), unit: 'm3', type: 'VOLUME' };
    }

    // Delay duration (e.g. "delayed by one day", "2 days")
    const dayMatch = text.match(/(\d+|one|two|three)\s*(?:days?|din)\b/i);
    if (dayMatch && /\b(delay|late|slip|der)\b/i.test(normalized)) {
      const numMap: Record<string, number> = { one: 1, two: 2, three: 3 };
      const days = numMap[dayMatch[1].toLowerCase()] || parseInt(dayMatch[1], 10) || 1;
      quantity = { value: days, unit: 'days', type: 'DELAY' };
    }

    // 6. Temporal Resolution (Section 15: "today", "yesterday", "tomorrow")
    let temporalExpression: string | undefined;
    let resolvedDate = submissionDate;

    if (/\byesterday\b/i.test(normalized)) {
      temporalExpression = 'yesterday';
      const d = new Date(submissionDate);
      d.setDate(d.getDate() - 1);
      resolvedDate = d.toISOString().slice(0, 10);
    } else if (/\btomorrow\b/i.test(normalized)) {
      temporalExpression = 'tomorrow';
      const d = new Date(submissionDate);
      d.setDate(d.getDate() + 1);
      resolvedDate = d.toISOString().slice(0, 10);
    } else if (/\btoday\b/i.test(normalized)) {
      temporalExpression = 'today';
      resolvedDate = submissionDate;
    }

    // 7. Status Resolution
    let status: EventStatus = 'UNKNOWN';
    if (isNegated) {
      status = 'BLOCKED'; // Negated activity represents a non-started or blocked state
    } else if (epistemicModality === 'PLAN') {
      status = 'EXPECTED';
    } else if (
      /\b(completed|finished|done|khatam|ho gaya)\b/i.test(normalized) ||
      extractedProgress === 100
    ) {
      status = 'COMPLETED';
      if (extractedProgress === undefined) extractedProgress = 100;
    } else if (/\b(started|commenced|shuru)\b/i.test(normalized)) {
      status = 'STARTED';
      if (extractedProgress === undefined) extractedProgress = 10;
    } else if (/\b(delay|delayed|der|late|blocked|ruk)\b/i.test(normalized)) {
      status = 'BLOCKED';
    } else if (extractedProgress !== undefined || /\b(progress|chalu|working)\b/i.test(normalized)) {
      status = 'IN_PROGRESS';
    }

    // 8. Discipline Detection
    let detectedDiscipline: DisciplineType | undefined;
    if (/\b(foundation|excavation|concrete|reinforcement|rebar|pcc|rcc|civil|khudai|dhalai|sariya)\b/i.test(normalized)) {
      detectedDiscipline = 'CIVIL';
    } else if (/\b(pipe|piping|weld|welding|valve|flange|hydrotest|spool)\b/i.test(normalized)) {
      detectedDiscipline = 'PIPING';
    } else if (/\b(compressor|pump|skid|turbine|mechanical|motor|crane)\b/i.test(normalized)) {
      detectedDiscipline = 'MECHANICAL';
    } else if (/\b(cable|electrical|tray|switchgear|transformer|taar)\b/i.test(normalized)) {
      detectedDiscipline = 'ELECTRICAL';
    } else if (/\b(instrument|sensor|transmitter|plc|dcs|calibration)\b/i.test(normalized)) {
      detectedDiscipline = 'INSTRUMENTATION';
    }

    // 9. Location Detection
    let detectedLocation: string | undefined;
    const locMatch = normalized.match(
      /\b(compressor (station|foundation|yard|area)|area [a-z0-9]|substation|pipe rack|north side|south side)\b/i
    );
    if (locMatch) {
      detectedLocation = locMatch[0].replace(/\b\w/g, (l) => l.toUpperCase());
    }

    return {
      rawText: rawSentence,
      normalizedText: normalized,
      epistemicModality,
      isNegated,
      negationReason,
      isSelfCorrected,
      selfCorrectionOriginal,
      extractedProgress,
      status,
      detectedDiscipline,
      detectedLocation,
      temporalExpression,
      resolvedDate,
      quantity,
    };
  }
}
