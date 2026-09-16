import { SyntheticDataEngine } from '../data/synthetic';

function parseArgs() {
  const args = process.argv.slice(2);
  let seed = 42;
  let activityCount = 1000;
  let dependencyCount = 5000;
  let reportCount = 2000;
  let eventCount = 1500;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed' && args[i + 1]) {
      seed = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--activities' && args[i + 1]) {
      activityCount = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--reports' && args[i + 1]) {
      reportCount = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--events' && args[i + 1]) {
      eventCount = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return { seed, activityCount, dependencyCount, reportCount, eventCount };
}

async function run() {
  console.log('🚀 Initializing SiteSync Synthetic Data Engine...');
  const options = parseArgs();
  console.log(`📊 Parameters: seed=${options.seed}, activities=${options.activityCount}, dependencies=${options.dependencyCount}, reports=${options.reportCount}, events=${options.eventCount}`);

  const dataset = SyntheticDataEngine.generate(options);
  const result = SyntheticDataEngine.exportAndValidate(dataset);

  if (!result.isValid) {
    console.error('❌ Dataset validation failed with issues:');
    result.issues.forEach((issue) => console.error(`  [${issue.type}] ${issue.entity} (${issue.id}): ${issue.message}`));
    process.exit(1);
  }

  console.log('\n✅ Synthetic dataset generated successfully.');
  console.log(`\nProject: ${dataset.project.name} (${dataset.project.code})`);
  console.log(`Activities: ${dataset.activities.length}`);
  console.log(`Dependencies: ${dataset.dependencies.length}`);
  console.log(`Field Reports: ${dataset.fieldReports.length}`);
  console.log(`Events: ${dataset.events.length}`);
  console.log(`\nBenchmark Splits:`);
  console.log(`  Train (train.jsonl): ${result.exportResult.trainCount}`);
  console.log(`  Validation (validation.jsonl): ${result.exportResult.valCount}`);
  console.log(`  Test (test.jsonl): ${result.exportResult.testCount}`);
  console.log(`\nOutput directories:`);
  console.log(`  - ${result.exportResult.outputDir}`);
  console.log(`  - ${result.exportResult.benchmarkDir}`);
}

run().catch((err) => {
  console.error('Fatal error generating synthetic dataset:', err);
  process.exit(1);
});
