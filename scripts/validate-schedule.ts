import * as fs from 'fs';
import * as path from 'path';
import { ScheduleParser } from '../apps/api/src/modules/schedules/schedule-parser';
import { ScheduleValidatorService } from '../apps/api/src/modules/schedules/schedule-validator';
import { RawScheduleRow } from '../apps/api/src/modules/schedules/schedule.types';

function run() {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error('Usage: pnpm schedule:validate <file-path>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const isJson = targetFile.endsWith('.json');

  console.log(`🔍 Validating schedule file: ${targetFile} (Format: ${isJson ? 'JSON' : 'CSV'})...`);

  let rows: RawScheduleRow[] = [];
  try {
    if (isJson) {
      const canonical = ScheduleParser.parseJson(content);
      rows = canonical.activities.map((a) => ({
        activityCode: a.activityCode,
        activityName: a.name,
        description: a.description,
        discipline: a.discipline,
        location: a.location,
        plannedStart: a.plannedStart,
        plannedFinish: a.plannedFinish,
        durationDays: a.plannedDuration,
        plannedProgress: a.plannedProgress,
        actualProgress: a.actualProgress,
        status: a.status,
      }));
    } else {
      rows = ScheduleParser.parseCsv(content);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Parse Error: ${msg}`);
    process.exit(1);
  }

  const validation = ScheduleValidatorService.validateRows(rows);

  console.log(`\nResults:`);
  console.log(`  Activities detected: ${rows.length}`);
  console.log(`  Warnings: ${validation.warnings.length}`);
  console.log(`  Errors: ${validation.errors.length}`);

  if (validation.warnings.length > 0) {
    console.log(`\n⚠️ Warnings:`);
    validation.warnings.forEach((w) => console.log(`  - [Row ${w.row || '?'}] ${w.message}`));
  }

  if (validation.errors.length > 0) {
    console.error(`\n❌ Validation Errors:`);
    validation.errors.forEach((e) => console.error(`  - [${e.code}] [Row ${e.row || '?'}] ${e.message}`));
    console.error('\nSchedule validation: FAILED');
    process.exit(1);
  }

  console.log('\nSchedule validation: PASS');
}

run();
