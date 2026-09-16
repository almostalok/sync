import { RawReportInput, ExtractedEventResult } from '../matching.types';
import { PromptSafetyGuard } from './prompt-safety';
import { TextNormalizerService } from '../normalization/text-normalizer.service';
import { EntityExtractorService } from '../normalization/entity-extractor.service';
import { Discipline, EventStatus } from '@sitesync/types';

export class EventExtractorService {
  private normalizer = new TextNormalizerService();
  private entityExtractor = new EntityExtractorService();

  /**
   * Extracts structured, normalized execution events from raw report text.
   */
  public extractEventsFromReport(report: RawReportInput): ExtractedEventResult[] {
    const { sanitizedText } = PromptSafetyGuard.sanitizeReportText(report.text);

    // Split report text into logical event statements (by lines or bullet points)
    const rawLines = sanitizedText
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => {
        // Filter out non-event headers or short separators
        if (l.length < 5) return false;
        if (/^={3,}|^-{3,}|^\*{3,}/.test(l)) return false;
        if (/^(daily progress report|date:|superintendent:|weather:|site constraints:)/i.test(l)) return false;
        return true;
      });

    const events: ExtractedEventResult[] = [];

    rawLines.forEach((rawStatement, index) => {
      // Strip leading bullet markers e.g. "1. ", "- ", "* "
      const cleanStatement = rawStatement.replace(/^(\d+[\.\)]|\*|\-|\>|\[ACT_LOG\]\s*>>)\s*/i, '').trim();
      if (cleanStatement.length < 5) return;

      const { normalizedText, extractedProgress, extractedDate } = this.normalizer.normalize(
        cleanStatement,
        report.reportDate
      );

      const entities = this.entityExtractor.extractEntities(cleanStatement);

      // Infer location from entities or default
      const locEntity = entities.find((e) => e.type === 'LOCATION');
      const location = locEntity?.text || 'Compressor Area';

      // Infer discipline from action verbs and objects
      let discipline = report.discipline || Discipline.GENERAL;
      if (report.discipline) {
        discipline = report.discipline;
      } else if (/\b(excavat\w*|earthwork\w*|pcc|rebar\w*|reinforc\w*|formwork\w*|shutter\w*|concret\w*|backfill\w*|grout\w*|civil\w*|pit\w*|plinth\w*|foundation\w*)\b/i.test(normalizedText)) {
        discipline = Discipline.CIVIL;
      } else if (/\b(weld\w*|pip\w*|spool\w*|fit-?up\w*|flange\w*|hydrotest\w*|hydro\w*|flushing\w*)\b/i.test(normalizedText)) {
        discipline = Discipline.PIPING;
      } else if (/\b(cable\w*|tray\w*|switchgear\w*|transformer\w*|mcc|substation\w*|earthing\w*|grounding\w*|energiz\w*|electr\w*)\b/i.test(normalizedText)) {
        discipline = Discipline.ELECTRICAL;
      } else if (/\b(transmitt\w*|calibrat\w*|loop\s*check\w*|tubing\w*|junction\s*box\w*|jb-?\w*|dcs|esd|instrument\w*)\b/i.test(normalizedText)) {
        discipline = Discipline.INSTRUMENTATION;
      } else if (/\b(turbine\w*|compressor\s+package|compressor\s+skid|pump\w*|skid\w*|align\w*|position\w*|rotor\w*|mechanical\w*)\b/i.test(normalizedText)) {
        discipline = Discipline.MECHANICAL;
      } else if (/\b(safety\w*|scaffold\w*|fire\w*|permit\w*|ptw|inspect\w*|hse|fence\w*|housekeep\w*)\b/i.test(normalizedText)) {
        discipline = Discipline.HSE;
      }

      // Progress and Status
      const progress = extractedProgress !== undefined ? extractedProgress : (normalizedText.includes('started') ? 0.2 : 0.5);
      let status = EventStatus.IN_PROGRESS;
      if (progress >= 1.0) status = EventStatus.COMPLETED;
      else if (progress === 0.0) status = EventStatus.PLANNED;
      else if (normalizedText.includes('started')) status = EventStatus.STARTED;

      const eventId = `evt-${report.reportId}-${String(index + 1).padStart(3, '0')}`;

      events.push({
        id: eventId,
        reportId: report.reportId,
        description: cleanStatement,
        normalizedDescription: normalizedText,
        eventDate: extractedDate || report.reportDate,
        discipline,
        location,
        progress,
        status,
        entities,
        sourceText: rawStatement,
        sourcePage: report.page || 1,
        sourceSection: report.section || 'EXECUTION_LOG',
        characterStart: report.text.indexOf(rawStatement),
        characterEnd: report.text.indexOf(rawStatement) + rawStatement.length,
        extractionConfidence: 0.92,
      });
    });

    return events;
  }
}
