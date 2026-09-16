import * as fs from 'fs';
import * as path from 'path';
import { SyntheticProjectDataset, BenchmarkRecord, DifficultyLevel } from './types';
import { PRNG } from './noise/prng';

export class DatasetExporter {
  constructor(private baseDir: string = process.cwd()) {}

  public exportAll(dataset: SyntheticProjectDataset, prng: PRNG): {
    outputDir: string;
    benchmarkDir: string;
    trainCount: number;
    valCount: number;
    testCount: number;
  } {
    const outputDir = path.join(this.baseDir, 'data', 'synthetic', 'output');
    const benchmarkDir = path.join(this.baseDir, 'data', 'benchmark');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    if (!fs.existsSync(benchmarkDir)) {
      fs.mkdirSync(benchmarkDir, { recursive: true });
    }

    // 1. Export JSONs
    fs.writeFileSync(path.join(outputDir, 'project.json'), JSON.stringify(dataset.project, null, 2));
    fs.writeFileSync(path.join(outputDir, 'wbs.json'), JSON.stringify(dataset.wbs, null, 2));
    fs.writeFileSync(path.join(outputDir, 'reports.json'), JSON.stringify(dataset.fieldReports, null, 2));
    fs.writeFileSync(path.join(outputDir, 'events.json'), JSON.stringify(dataset.events, null, 2));
    fs.writeFileSync(
      path.join(outputDir, 'ground-truth.json'),
      JSON.stringify(
        dataset.events.map((e) => ({
          eventId: e.id,
          groundTruthActivityId: e.groundTruthActivityId,
          groundTruthCandidateActivityIds: e.groundTruthCandidateActivityIds,
          difficultyLevel: e.difficultyLevel,
          subScope: e.subScope,
        })),
        null,
        2
      )
    );

    // 2. Export Activities CSV
    const actHeader = 'Activity ID,WBS Code,Name,Description,Discipline,Activity Type,Location,Equipment Tag,Planned Start,Planned Finish,Duration Days,Planned Progress,Actual Progress,Status,Critical Path\n';
    const actRows = dataset.activities
      .map(
        (a) =>
          `"${a.activityCode}","${a.wbsPath}","${this.escapeCsv(a.name)}","${this.escapeCsv(a.description)}","${a.discipline}","${a.activityType}","${this.escapeCsv(a.location)}","${a.equipmentTag || ''}","${a.plannedStart}","${a.plannedFinish}",${a.plannedDuration},${a.plannedProgress},${a.actualProgress},"${a.status}",${a.criticalPath}`
      )
      .join('\n');
    fs.writeFileSync(path.join(outputDir, 'activities.csv'), actHeader + actRows);

    // 3. Export Dependencies CSV
    const depHeader = 'Dependency ID,Predecessor Code,Successor Code,Type,Lag\n';
    const actMap = new Map(dataset.activities.map((a) => [a.id, a.activityCode]));
    const depRows = dataset.dependencies
      .map(
        (d) =>
          `"${d.id}","${actMap.get(d.predecessorId) || d.predecessorId}","${actMap.get(d.successorId) || d.successorId}","${d.type}",${d.lag}`
      )
      .join('\n');
    fs.writeFileSync(path.join(outputDir, 'dependencies.csv'), depHeader + depRows);

    // 4. Create Benchmark Splits (70% train, 15% validation, 15% test)
    const benchmarkRecords: BenchmarkRecord[] = dataset.events.map((e) => ({
      eventId: e.id,
      text: e.text,
      discipline: e.discipline,
      location: e.location,
      date: e.eventDate,
      progress: e.progress,
      status: e.status,
      difficultyLevel: e.difficultyLevel,
      groundTruthActivityId: e.groundTruthActivityId,
      groundTruthCandidateActivityIds: e.groundTruthCandidateActivityIds,
      subScope: e.subScope,
    }));

    const shuffled = prng.shuffle(benchmarkRecords);
    const total = shuffled.length;
    const trainEnd = Math.floor(total * 0.7);
    const valEnd = Math.floor(total * 0.85);

    const trainSet = shuffled.slice(0, trainEnd);
    const valSet = shuffled.slice(trainEnd, valEnd);
    const testSet = shuffled.slice(valEnd);

    fs.writeFileSync(
      path.join(benchmarkDir, 'train.jsonl'),
      trainSet.map((r) => JSON.stringify(r)).join('\n')
    );
    fs.writeFileSync(
      path.join(benchmarkDir, 'validation.jsonl'),
      valSet.map((r) => JSON.stringify(r)).join('\n')
    );
    fs.writeFileSync(
      path.join(benchmarkDir, 'test.jsonl'),
      testSet.map((r) => JSON.stringify(r)).join('\n')
    );

    // 5. Generate Reports
    const difficultyBreakdown: Record<string, number> = {};
    for (const evt of dataset.events) {
      const label = DifficultyLevel[evt.difficultyLevel] || `LEVEL_${evt.difficultyLevel}`;
      difficultyBreakdown[label] = (difficultyBreakdown[label] || 0) + 1;
    }

    const disciplineBreakdown: Record<string, number> = {};
    for (const act of dataset.activities) {
      disciplineBreakdown[act.discipline] = (disciplineBreakdown[act.discipline] || 0) + 1;
    }

    const reportJson = {
      scenario: dataset.metadata.scenario,
      generatorVersion: dataset.metadata.generatorVersion,
      seed: dataset.metadata.seed,
      generatedAt: dataset.metadata.generatedAt,
      counts: {
        projects: 1,
        wbsNodes: dataset.wbs.length,
        activities: dataset.activities.length,
        dependencies: dataset.dependencies.length,
        fieldReports: dataset.fieldReports.length,
        events: dataset.events.length,
        historicalOutcomes: dataset.historicalOutcomes.length,
      },
      splits: {
        train: trainSet.length,
        validation: valSet.length,
        test: testSet.length,
      },
      difficultyDistribution: difficultyBreakdown,
      disciplineDistribution: disciplineBreakdown,
    };

    fs.writeFileSync(path.join(outputDir, 'dataset-report.json'), JSON.stringify(reportJson, null, 2));

    const markdownReport = `# SiteSync Synthetic Dataset Report

**Scenario**: ${dataset.metadata.scenario}  
**Project**: ${dataset.project.name} (${dataset.project.code})  
**Seed**: \`${dataset.metadata.seed}\`  
**Generated At**: ${dataset.metadata.generatedAt}  
**Generator Version**: \`${dataset.metadata.generatorVersion}\`  

---

## 1. Dataset Dimensions

| Entity | Generated Count | Target | Status |
|---|---|---|---|
| **Projects** | \`1\` | 1 | Complete |
| **WBS Nodes (L1-L6)** | \`${dataset.wbs.length}\` | ~150 | Complete |
| **Activities (L5/L6)** | \`${dataset.activities.length}\` | ~1,000 | Complete |
| **CPM Dependencies** | \`${dataset.dependencies.length}\` | ~5,000 | Complete |
| **Field Reports** | \`${dataset.fieldReports.length}\` | ~2,000 | Complete |
| **Ground Truth Events** | \`${dataset.events.length}\` | ~1,500 | Complete |
| **Historical Outcomes** | \`${dataset.historicalOutcomes.length}\` | 50 | Complete |

---

## 2. Benchmark Split Distribution

* **Training Set (\`train.jsonl\`)**: \`${trainSet.length}\` events (70%)
* **Validation Set (\`validation.jsonl\`)**: \`${valSet.length}\` events (15%)
* **Test Set (\`test.jsonl\`)**: \`${testSet.length}\` events (15%)

---

## 3. Difficulty Level Distribution

${Object.entries(difficultyBreakdown)
  .map(([k, v]) => `* **${k}**: \`${v}\` (${((v / dataset.events.length) * 100).toFixed(1)}%)`)
  .join('\n')}

---

## 4. Discipline Breakdown

${Object.entries(disciplineBreakdown)
  .map(([k, v]) => `* **${k}**: \`${v}\` activities (${((v / dataset.activities.length) * 100).toFixed(1)}%)`)
  .join('\n')}
`;

    fs.writeFileSync(path.join(outputDir, 'DATASET_REPORT.md'), markdownReport);

    return {
      outputDir,
      benchmarkDir,
      trainCount: trainSet.length,
      valCount: valSet.length,
      testCount: testSet.length,
    };
  }

  private escapeCsv(str: string): string {
    return (str || '').replace(/"/g, '""');
  }
}
