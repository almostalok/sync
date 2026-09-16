import * as fs from 'fs';
import * as path from 'path';
import { ScheduleValidator, DependencyValidator, BenchmarkValidator, BenchmarkRecord } from '../data/synthetic';
import { ScheduleParser } from '../apps/api/src/modules/schedules/schedule-parser';

async function validate() {
  console.log('🔍 Running SiteSync Data Validation Suite...');

  const outputDir = path.join(process.cwd(), 'data', 'synthetic', 'output');
  const benchmarkDir = path.join(process.cwd(), 'data', 'benchmark');

  if (!fs.existsSync(outputDir) || !fs.existsSync(benchmarkDir)) {
    console.error('❌ Data directories not found. Run `pnpm data:generate` first.');
    process.exit(1);
  }

  // 1. Load generated files
  const wbs = JSON.parse(fs.readFileSync(path.join(outputDir, 'wbs.json'), 'utf-8'));
  const events = JSON.parse(fs.readFileSync(path.join(outputDir, 'events.json'), 'utf-8'));

  // Load activities from CSV using proper CSV parser
  const csvContent = fs.readFileSync(path.join(outputDir, 'activities.csv'), 'utf-8');
  const rows = ScheduleParser.parseCsv(csvContent);
  const activities = rows.map((r, idx) => ({
    id: `proj-cse-2026-act-${r.activityCode.toLowerCase()}`,
    wbsNodeId: wbs[0]?.id || 'wbs-1',
    activityCode: r.activityCode,
    name: r.activityName,
    description: r.description || r.activityName,
    discipline: r.discipline as any,
    activityType: 'WORK',
    location: r.location || 'Site',
    wbsPath: r.wbsCode || '1.0',
    plannedStart: r.plannedStart,
    plannedFinish: r.plannedFinish,
    plannedDuration: r.durationDays || 10,
    plannedProgress: r.plannedProgress || 0,
    actualProgress: r.actualProgress || 0,
    status: (r.status as any) || 'NOT_STARTED',
    criticalPath: false,
    aliases: [],
  }));

  // Load dependencies from CSV
  const depLines = fs.readFileSync(path.join(outputDir, 'dependencies.csv'), 'utf-8').split('\n').filter(Boolean);
  const actCodeToId = new Map(activities.map((a) => [a.activityCode, a.id]));
  const dependencies = depLines.slice(1).map((line) => {
    const parts = line.split(',');
    const predCode = parts[1]?.replace(/"/g, '');
    const succCode = parts[2]?.replace(/"/g, '');
    return {
      id: parts[0]?.replace(/"/g, ''),
      predecessorId: actCodeToId.get(predCode) || predCode,
      successorId: actCodeToId.get(succCode) || succCode,
      type: parts[3]?.replace(/"/g, '') as any,
      lag: parseInt(parts[4] || '0', 10),
    };
  });

  // 2. Validate Schedule, Dependencies, Ground Truth
  const schedValidator = new ScheduleValidator();
  const depValidator = new DependencyValidator();
  const benchValidator = new BenchmarkValidator();

  const schedIssues = schedValidator.validate(wbs, activities);
  const depIssues = depValidator.validate(activities, dependencies);
  const benchIssues = benchValidator.validate(activities, events);

  // 3. Validate Benchmark Splits & Data Leakage
  const parseJsonl = (filePath: string): BenchmarkRecord[] => {
    if (!fs.existsSync(filePath)) return [];
    return fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  };

  const trainSet = parseJsonl(path.join(benchmarkDir, 'train.jsonl'));
  const valSet = parseJsonl(path.join(benchmarkDir, 'validation.jsonl'));
  const testSet = parseJsonl(path.join(benchmarkDir, 'test.jsonl'));

  const leakageIssues = benchValidator.validateSplitsIsolation(trainSet, valSet, testSet);

  const allIssues = [...schedIssues, ...depIssues, ...benchIssues, ...leakageIssues];
  const errors = allIssues.filter((i) => i.type === 'ERROR');

  if (errors.length > 0) {
    console.error(`❌ Validation Failed: ${errors.length} error(s) found:`);
    errors.forEach((e) => console.error(`  - [${e.entity}] ${e.message}`));
    process.exit(1);
  }

  console.log(`\nValidation Statistics:`);
  console.log(`  ✓ WBS Nodes Checked: ${wbs.length}`);
  console.log(`  ✓ Activities Checked: ${activities.length}`);
  console.log(`  ✓ Dependencies Checked: ${dependencies.length} (0 cycles detected)`);
  console.log(`  ✓ Ground Truth Events Checked: ${events.length}`);
  console.log(`  ✓ Benchmark Splits Isolated: Train=${trainSet.length}, Val=${valSet.length}, Test=${testSet.length} (0 leaks)`);
  console.log('\nDataset validation: PASS');
}

validate().catch((err) => {
  console.error('Validation script encountered fatal error:', err);
  process.exit(1);
});
