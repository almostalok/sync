import { Discipline } from '@sitesync/types';
import { SyntheticFieldReport, SyntheticGroundTruthEvent } from '../types';
import { PRNG } from '../noise/prng';

export class ReportGenerator {
  constructor(private prng: PRNG) {}

  public generate(
    projectId: string,
    events: SyntheticGroundTruthEvent[],
    targetCount: number = 2000,
    projectStartDateStr: string = '2026-03-01T08:00:00.000Z'
  ): SyntheticFieldReport[] {
    const reports: SyntheticFieldReport[] = [];
    const baseDate = new Date(projectStartDateStr);

    const authors = [
      'Er. R. Borah (Lead Site Engineer)',
      'Er. M. Sarma (Civil Construction Manager)',
      'Er. D. Gogoi (Piping Superintendent)',
      'Er. T. Kalita (Electrical Lead)',
      'Er. N. Saikia (Instrumentation Engineer)',
      'Er. P. Dutta (Senior QA/QC Inspector)',
    ];

    const sourceTypes: Array<SyntheticFieldReport['sourceType']> = [
      'STRUCTURED_DPR',
      'SEMI_STRUCTURED',
      'SITE_DIARY',
      'BULLET_POINTS',
      'SUPERVISOR_NOTE',
      'SPREADSHEET',
    ];

    // Group events by fieldReportId
    const eventsByReport: Record<string, SyntheticGroundTruthEvent[]> = {};
    for (const evt of events) {
      if (!eventsByReport[evt.fieldReportId]) eventsByReport[evt.fieldReportId] = [];
      eventsByReport[evt.fieldReportId].push(evt);
    }

    for (let i = 1; i <= targetCount; i++) {
      const reportId = `rep-${projectId}-${String(i).padStart(5, '0')}`;
      const reportSeq = String(i).padStart(4, '0');
      const reportNumber = `DPR-CSE-${reportSeq}`;

      const dayOffset = Math.floor((i / targetCount) * 180);
      const repDate = new Date(baseDate);
      repDate.setDate(repDate.getDate() + dayOffset);

      // Delayed upload modeling (10% of reports uploaded 1-3 days late)
      const isDelayed = this.prng.chance(0.1);
      const uploadDate = new Date(repDate);
      if (isDelayed) {
        uploadDate.setDate(uploadDate.getDate() + this.prng.nextInt(1, 3));
      }

      const discipline = this.prng.pick([
        Discipline.CIVIL,
        Discipline.PIPING,
        Discipline.MECHANICAL,
        Discipline.ELECTRICAL,
        Discipline.INSTRUMENTATION,
        Discipline.HSE,
      ]);

      const author = this.prng.pick(authors);
      const sourceType = this.prng.pick(sourceTypes);

      // Associated events or fallback statement
      const repEvents = eventsByReport[reportId] || [];
      const rawText = this.constructReportBody(reportNumber, repDate, discipline, author, sourceType, repEvents);

      // Duplicate report modeling (2% duplicates)
      const isDuplicate = i > 1 && this.prng.chance(0.02);
      const duplicateOfId = isDuplicate ? reports[this.prng.nextInt(0, reports.length - 1)].id : undefined;

      reports.push({
        id: reportId,
        reportNumber: isDuplicate ? `${reportNumber}-REV1` : reportNumber,
        reportDate: repDate.toISOString(),
        uploadDate: uploadDate.toISOString(),
        discipline,
        sourceType,
        author,
        rawText,
        fileName: `${reportNumber}.${sourceType === 'SPREADSHEET' ? 'xlsx' : 'pdf'}`,
        isDuplicate,
        duplicateOfId,
      });
    }

    return reports;
  }

  private constructReportBody(
    reportNum: string,
    date: Date,
    discipline: Discipline,
    author: string,
    sourceType: SyntheticFieldReport['sourceType'],
    events: SyntheticGroundTruthEvent[]
  ): string {
    const dateStr = date.toISOString().split('T')[0];
    const eventBullets = events.length > 0
      ? events.map((e, idx) => `  ${idx + 1}. ${e.text}`).join('\n')
      : `  1. Routine surveillance and site housekeeping in progress.`;

    switch (sourceType) {
      case 'STRUCTURED_DPR':
        return `=====================================================
OIL INDIA LIMITED - COMPRESSOR STATION EXPANSION
DAILY PROGRESS REPORT: ${reportNum}
DATE: ${dateStr} | DISCIPLINE: ${discipline}
SUPERINTENDENT: ${author}
=====================================================
1. EXECUTION HIGHLIGHTS:
${eventBullets}

2. SITE CONSTRAINTS / WEATHER:
  - Weather: Clear skies, ambient temp 32°C. No work stoppages reported.

3. TOMORROW'S TARGETS:
  - Continue priority schedule path activities.`;

      case 'SITE_DIARY':
        return `SITE DIARY ENTRY - ${dateStr} (${author})
Discipline: ${discipline}
Work carried out during Day & Night shifts:
${events.map((e) => `- ${e.text}`).join('\n')}
Resource deployment: 18 skilled fitters, 24 helpers, 2 hydra cranes.`;

      case 'BULLET_POINTS':
        return `* [${dateStr}] DPR Update (${discipline}):\n` +
          events.map((e) => `* ${e.text}`).join('\n');

      case 'SUPERVISOR_NOTE':
        return `Supervisor Log (${author}) - ${dateStr}: ${events.map((e) => e.text).join(' ')}`;

      case 'SPREADSHEET':
      case 'SEMI_STRUCTURED':
      default:
        return `REPORT_ID: ${reportNum} | DATE: ${dateStr} | DISCIPLINE: ${discipline}
ACTIVITY_LOG:
${events.map((e) => `[ACT_LOG] >> ${e.text}`).join('\n')}`;
    }
  }
}
