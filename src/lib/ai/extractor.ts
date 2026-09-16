import { ExtractedEvent, FieldReport } from '@/types/domain';
import { normalizeFieldText } from './normalizer';

export function extractEventsFromReport(
  report: { id: string; fileName: string; rawText: string; reportDate: string }
): ExtractedEvent[] {
  const text = report.rawText;
  const events: ExtractedEvent[] = [];

  // Split text into semantic statements (by periods, newlines, semicolons)
  const rawSegments = text
    .split(/(?<=[.!?\n;])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  let currentOffset = 0;

  for (let idx = 0; idx < rawSegments.length; idx++) {
    const segment = rawSegments[idx];
    const charStart = text.indexOf(segment, currentOffset);
    const charEnd = charStart >= 0 ? charStart + segment.length : currentOffset + segment.length;
    currentOffset = charEnd;

    const norm = normalizeFieldText(segment);

    // Filter out purely conversational filler without any activity signals
    if (
      !norm.detectedDiscipline &&
      norm.extractedProgress === undefined &&
      norm.extractedStatus === 'UNKNOWN' &&
      !norm.detectedLocation
    ) {
      // Check if it mentions known engineering terms anyway
      if (!/foundation|excavation|concrete|pipe|weld|cable|valve|pump|skid|panel|tray|earthwork/i.test(segment)) {
        continue;
      }
    }

    // Determine descriptive title
    let description = norm.normalized;
    // Clean up descriptive text to focus on the work unit
    if (description.length > 80) {
      const parts = description.split(/,| - |—|\band\b/);
      description = parts[0].trim();
    }
    // Capitalize words
    description = description.replace(/\b\w/g, l => l.toUpperCase());

    // Compute extraction confidence
    let extractionConfidence = 0.75;
    if (norm.extractedProgress !== undefined) extractionConfidence += 0.1;
    if (norm.detectedDiscipline) extractionConfidence += 0.08;
    if (norm.detectedLocation) extractionConfidence += 0.07;
    extractionConfidence = Math.min(0.99, Number(extractionConfidence.toFixed(2)));

    // Estimate page number from rough text index (e.g. 1500 chars per page)
    const pageEst = Math.floor(charStart / 1500) + 1;

    events.push({
      id: `EVT-${report.id.replace(/\D/g, '').slice(-4) || '1000'}-${(idx + 1).toString().padStart(2, '0')}`,
      fieldReportId: report.id,
      reportFileName: report.fileName,
      description: description,
      normalizedDescription: norm.normalized,
      eventDate: report.reportDate,
      discipline: norm.detectedDiscipline,
      location: norm.detectedLocation,
      progress: norm.extractedProgress,
      status: norm.extractedStatus,
      sourceText: segment,
      sourcePage: pageEst,
      characterStart: charStart >= 0 ? charStart : undefined,
      characterEnd: charEnd,
      extractionConfidence,
      createdAt: new Date().toISOString(),
    });
  }

  // If no granular events were extracted, treat the whole text as single event
  if (events.length === 0 && text.trim().length > 0) {
    const norm = normalizeFieldText(text);
    events.push({
      id: `EVT-${report.id.replace(/\D/g, '').slice(-4) || '1000'}-01`,
      fieldReportId: report.id,
      reportFileName: report.fileName,
      description: norm.normalized.slice(0, 60).replace(/\b\w/g, l => l.toUpperCase()),
      normalizedDescription: norm.normalized,
      eventDate: report.reportDate,
      discipline: norm.detectedDiscipline || 'GENERAL',
      location: norm.detectedLocation || 'Site Area',
      progress: norm.extractedProgress,
      status: norm.extractedStatus,
      sourceText: text.trim(),
      sourcePage: 1,
      characterStart: 0,
      characterEnd: text.length,
      extractionConfidence: 0.70,
      createdAt: new Date().toISOString(),
    });
  }

  return events;
}
