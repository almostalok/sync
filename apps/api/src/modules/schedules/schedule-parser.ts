import { RawScheduleRow, CanonicalScheduleJson } from './schedule.types';
import { Discipline } from '@sitesync/types';

export class ScheduleParser {
  /**
   * Parses CSV string into raw schedule row objects.
   */
  public static parseCsv(csvContent: string): RawScheduleRow[] {
    const lines = csvContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      throw new Error('CSV file must contain a header row and at least one data row');
    }

    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';
    const rawHeaders = this.parseCsvLine(headerLine, delimiter).map((h) =>
      h.trim().toLowerCase().replace(/[\s_-]+/g, '')
    );

    const rows: RawScheduleRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);
      if (values.length === 0 || values.every((v) => v.trim() === '')) continue;

      const record: Record<string, string> = {};
      rawHeaders.forEach((header, index) => {
        record[header] = values[index] ? values[index].trim() : '';
      });

      const activityCode =
        record['activityid'] ||
        record['activitycode'] ||
        record['activity'] ||
        record['id'] ||
        record['actcode'] ||
        '';

      const activityName =
        record['activityname'] ||
        record['name'] ||
        record['activitydescription'] ||
        record['taskname'] ||
        '';

      const wbsCode =
        record['wbscode'] ||
        record['wbs'] ||
        record['wbsid'] ||
        record['wbspath'] ||
        '';

      const discipline =
        record['discipline'] ||
        record['dept'] ||
        record['trade'] ||
        'GENERAL';

      const location = record['location'] || record['area'] || '';
      const plannedStart = record['plannedstart'] || record['startdate'] || record['start'] || '';
      const plannedFinish = record['plannedfinish'] || record['plannedend'] || record['finishdate'] || record['end'] || '';
      const durationDays = record['durationdays'] || record['duration'] ? parseInt(record['durationdays'] || record['duration'], 10) : undefined;
      const plannedProgress = record['plannedprogress'] ? parseFloat(record['plannedprogress']) : undefined;
      const actualProgress = record['actualprogress'] || record['progress'] ? parseFloat(record['actualprogress'] || record['progress']) : undefined;
      const status = record['status'] || 'NOT_STARTED';
      const predecessors = record['predecessor'] || record['predecessors'] || record['preds'] || '';
      const dependencyType = record['dependencytype'] || record['type'] || 'FS';

      rows.push({
        wbsCode,
        wbsName: record['wbsname'] || wbsCode,
        wbsLevel: record['level'] ? parseInt(record['level'], 10) : undefined,
        activityCode,
        activityName,
        description: record['description'] || activityName,
        discipline,
        location,
        plannedStart,
        plannedFinish,
        durationDays,
        plannedProgress,
        actualProgress,
        status,
        predecessors,
        dependencyType,
      });
    }

    return rows;
  }

  /**
   * Parses JSON string into canonical schedule format.
   */
  public static parseJson(jsonContent: string): CanonicalScheduleJson {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed)) {
        // Plain array of activities
        return {
          activities: parsed,
        };
      }
      if (parsed.activities && Array.isArray(parsed.activities)) {
        return parsed as CanonicalScheduleJson;
      }
      throw new Error("JSON schedule must include an 'activities' array");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse JSON schedule: ${msg}`);
    }
  }

  /**
   * RFC 4180 CSV line parser with quotes and commas support.
   */
  private static parseCsvLine(line: string, delimiter: string = ','): string[] {
    const values: string[] = [];
    let curVal = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          curVal += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        values.push(curVal);
        curVal = '';
      } else {
        curVal += c;
      }
    }
    values.push(curVal);
    return values;
  }
}
