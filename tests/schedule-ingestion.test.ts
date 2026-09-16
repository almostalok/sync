import * as fs from 'fs';
import * as path from 'path';
import { ScheduleParser } from '../apps/api/src/modules/schedules/schedule-parser';
import { ScheduleValidatorService } from '../apps/api/src/modules/schedules/schedule-validator';
import { ScheduleService } from '../apps/api/src/modules/schedules/schedule.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Running Schedule Ingestion & Validation Tests...\n');

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => void | Promise<void>) => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${name}: ${msg}`);
      failed++;
    }
  };

  const fixturesDir = path.join(process.cwd(), 'data', 'fixtures');

  // Test 1: Valid CSV Schedule Parsing
  await test('CSV Parser: Correctly extracts 10 activities and headers from valid CSV fixture', () => {
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'valid-schedule.csv'), 'utf-8');
    const rows = ScheduleParser.parseCsv(csvContent);

    assert(rows.length === 10, `Expected 10 rows, got ${rows.length}`);
    assert(rows[0].activityCode === 'CIV-EXC-0010', 'First code match');
    assert(rows[0].discipline === 'CIVIL', 'Discipline match');
    assert(rows[1].predecessors === 'CIV-EXC-0010', 'Predecessor match');
  });

  // Test 2: Valid JSON Schedule Parsing
  await test('JSON Parser: Correctly extracts canonical JSON schedule structure', () => {
    const jsonContent = fs.readFileSync(path.join(fixturesDir, 'valid-schedule.json'), 'utf-8');
    const canonical = ScheduleParser.parseJson(jsonContent);

    assert(canonical.activities.length === 2, `Expected 2 activities, got ${canonical.activities.length}`);
    assert(canonical.activities[0].activityCode === 'CIV-JSON-0001', 'Activity code match');
    assert(canonical.dependencies?.length === 1, 'Dependency length match');
  });

  // Test 3: Schedule Validator on Valid CSV
  await test('Validator: Passes valid schedule with 0 errors', () => {
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'valid-schedule.csv'), 'utf-8');
    const rows = ScheduleParser.parseCsv(csvContent);
    const result = ScheduleValidatorService.validateRows(rows);

    assert(result.isValid === true, 'Validation must be valid');
    assert(result.errors.length === 0, `Expected 0 errors, got ${result.errors.length}`);
  });

  // Test 4: Rejection of Duplicate Activity Codes
  await test('Validator: Detects DUPLICATE_ACTIVITY_CODE error', () => {
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'duplicate-activities.csv'), 'utf-8');
    const rows = ScheduleParser.parseCsv(csvContent);
    const result = ScheduleValidatorService.validateRows(rows);

    assert(result.isValid === false, 'Must fail validation on duplicate codes');
    const hasDupError = result.errors.some((e) => e.code === 'DUPLICATE_ACTIVITY_CODE');
    assert(hasDupError, 'Must contain DUPLICATE_ACTIVITY_CODE error');
  });

  // Test 5: Rejection of Invalid Dates and Missing Names
  await test('Validator: Detects INVALID_START_DATE and MISSING_ACTIVITY_NAME', () => {
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'invalid-schedule.csv'), 'utf-8');
    const rows = ScheduleParser.parseCsv(csvContent);
    const result = ScheduleValidatorService.validateRows(rows);

    assert(result.isValid === false, 'Must fail validation on invalid fields');
    const hasDateErr = result.errors.some((e) => e.code === 'INVALID_START_DATE');
    const hasNameErr = result.errors.some((e) => e.code === 'MISSING_ACTIVITY_NAME');
    assert(hasDateErr, 'Must contain INVALID_START_DATE');
    assert(hasNameErr, 'Must contain MISSING_ACTIVITY_NAME');
  });

  // Test 6: Detection of Circular and Self Dependencies
  await test('Validator: Detects CIRCULAR_DEPENDENCY and SELF_DEPENDENCY', () => {
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'invalid-dependencies.csv'), 'utf-8');
    const rows = ScheduleParser.parseCsv(csvContent);
    const result = ScheduleValidatorService.validateRows(rows);

    assert(result.isValid === false, 'Must fail validation on cycles');
    const hasCycleErr = result.errors.some((e) => e.code === 'CIRCULAR_DEPENDENCY');
    const hasSelfErr = result.errors.some((e) => e.code === 'SELF_DEPENDENCY');
    assert(hasCycleErr, 'Must detect circular dependency loop');
    assert(hasSelfErr, 'Must detect self dependency');
  });

  // Test 7: Preview Generation
  await test('Schedule Service: Generates preview with SHA256 checksum and sample rows', async () => {
    const mockPrisma = {
      scheduleVersion: {
        findFirst: async () => null,
      },
    };
    const scheduleService = new ScheduleService(mockPrisma);
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'valid-schedule.csv'), 'utf-8');
    const preview = await scheduleService.previewSchedule('proj-cse-2026', csvContent, 'CSV');

    assert(preview.isValid === true, 'Preview must be valid');
    assert(preview.activityCount === 10, 'Activity count 10');
    assert(preview.fileChecksum.length === 64, 'SHA256 checksum length 64');
    assert(preview.sampleActivities.length === 5, '5 sample activities');
  });

  console.log('\n========================================');
  console.log(`Schedule Ingestion Tests: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during schedule ingestion tests:', err);
  process.exit(1);
});
