import { SyntheticDatasetConfig, SyntheticProjectDataset } from './types';
import { PRNG } from './noise/prng';
import { ProjectGenerator } from './generators/project.generator';
import { WBSGenerator } from './generators/wbs.generator';
import { ActivityGenerator } from './generators/activity.generator';
import { DependencyGenerator } from './generators/dependency.generator';
import { EventGenerator } from './generators/event.generator';
import { ReportGenerator } from './generators/report.generator';
import { HistoricalGenerator } from './generators/historical.generator';
import { COMPRESSOR_STATION_SCENARIO } from './scenarios/compressor-station';
import { DatasetExporter } from './exporter';
import { ScheduleValidator } from './validation/schedule-validator';
import { DependencyValidator } from './validation/dependency-validator';
import { BenchmarkValidator } from './validation/benchmark-validator';

export * from './types';
export * from './noise';
export * from './dictionaries';
export * from './scenarios';
export * from './generators';
export * from './validation';
export * from './exporter';

export class SyntheticDataEngine {
  public static generate(customConfig?: Partial<SyntheticDatasetConfig>): SyntheticProjectDataset {
    const config: SyntheticDatasetConfig = {
      ...COMPRESSOR_STATION_SCENARIO,
      ...customConfig,
    };

    const prng = new PRNG(config.seed);

    const projectGen = new ProjectGenerator();
    const wbsGen = new WBSGenerator();
    const actGen = new ActivityGenerator(prng);
    const depGen = new DependencyGenerator(prng);
    const evtGen = new EventGenerator(prng);
    const repGen = new ReportGenerator(prng);
    const histGen = new HistoricalGenerator(prng);

    // 1. Generate Core Project
    const project = projectGen.generate(config);

    // 2. Generate WBS Hierarchy
    const wbs = wbsGen.generate(project.id);

    // 3. Generate Activities (~1,000)
    const activities = actGen.generate(project.id, wbs, config.activityCount, config.startDate);

    // 4. Generate CPM Dependencies (~5,000)
    const dependencies = depGen.generate(project.id, activities, config.dependencyCount);

    // 5. Generate Ground Truth Events (~1,500 across 7 difficulty levels)
    const events = evtGen.generate(project.id, activities, config.eventCount, config.difficultyDistribution);

    // 6. Generate Field Reports (~2,000)
    const fieldReports = repGen.generate(project.id, events, config.reportCount, config.startDate);

    // 7. Generate Historical Outcomes
    const historicalOutcomes = histGen.generate(project.id, 50);

    return {
      project,
      wbs,
      activities,
      dependencies,
      fieldReports,
      events,
      historicalOutcomes,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatorVersion: '1.0.0',
        seed: config.seed,
        scenario: 'compressor-station-expansion',
      },
    };
  }

  public static exportAndValidate(
    dataset: SyntheticProjectDataset,
    baseDir: string = process.cwd()
  ) {
    const prng = new PRNG(dataset.metadata.seed);
    const exporter = new DatasetExporter(baseDir);
    const scheduleValidator = new ScheduleValidator();
    const depValidator = new DependencyValidator();
    const benchValidator = new BenchmarkValidator();

    // 1. Validate Schedule & WBS
    const schedIssues = scheduleValidator.validate(dataset.wbs, dataset.activities);

    // 2. Validate Dependencies & Cycles
    const depIssues = depValidator.validate(dataset.activities, dataset.dependencies);

    // 3. Validate Benchmark & Ground Truth
    const benchIssues = benchValidator.validate(dataset.activities, dataset.events);

    const allIssues = [...schedIssues, ...depIssues, ...benchIssues];

    // 4. Export to files & benchmark splits
    const exportResult = exporter.exportAll(dataset, prng);

    return {
      exportResult,
      issues: allIssues,
      isValid: allIssues.filter((i) => i.type === 'ERROR').length === 0,
    };
  }
}
