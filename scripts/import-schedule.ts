import * as fs from 'fs';
import * as path from 'path';
import { ScheduleService } from '../apps/api/src/modules/schedules/schedule.service';

async function run() {
  const targetFile = process.argv[2];
  const projectIdArg = process.argv[3];

  if (!targetFile) {
    console.error('Usage: pnpm schedule:import <file-path> [projectId]');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const format = targetFile.endsWith('.json') ? 'JSON' : 'CSV';
  const projectId = projectIdArg || 'proj-cse-2026';

  console.log(`📥 Importing schedule into project '${projectId}' from ${targetFile}...`);

  const scheduleService = new ScheduleService();
  try {
    const result = await scheduleService.importSchedule(projectId, content, format, {
      versionName: `Imported from ${path.basename(targetFile)}`,
    });

    console.log(`\n✅ Schedule Import Successful:`);
    console.log(`  Schedule Version: v${result.version} (Baseline: ${result.isBaseline})`);
    console.log(`  Activities Imported: ${result.importedActivitiesCount}`);
    console.log(`  Dependencies Imported: ${result.importedDependenciesCount}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Import Failed: ${msg}`);
    process.exit(1);
  }
}

run();
