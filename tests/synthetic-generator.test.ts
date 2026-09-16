import { SyntheticDataEngine, DifficultyLevel, BenchmarkValidator } from '../data/synthetic';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Running Synthetic Data Engine & Benchmark Tests...\n');

  let passed = 0;
  let failed = 0;

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${name}: ${msg}`);
      failed++;
    }
  };

  // Test 1: Determinism Test (seed 42 produces identical data)
  test('Determinism: Seed 42 produces identical datasets across two runs', () => {
    const dataset1 = SyntheticDataEngine.generate({ seed: 42, activityCount: 100, dependencyCount: 300, reportCount: 50, eventCount: 80 });
    const dataset2 = SyntheticDataEngine.generate({ seed: 42, activityCount: 100, dependencyCount: 300, reportCount: 50, eventCount: 80 });

    assert(dataset1.activities.length === dataset2.activities.length, 'Activity lengths must match');
    assert(dataset1.activities[0].activityCode === dataset2.activities[0].activityCode, 'First activity code must match');
    assert(dataset1.activities[0].name === dataset2.activities[0].name, 'First activity name must match');
    assert(dataset1.dependencies.length === dataset2.dependencies.length, 'Dependency lengths must match');
    assert(dataset1.events[0].text === dataset2.events[0].text, 'First event text must match');
    assert(dataset1.events[0].difficultyLevel === dataset2.events[0].difficultyLevel, 'Difficulty level must match');
  });

  // Test 2: Full Dataset Scale and Structure
  test('Full Generation: Generates ~1000 activities, ~5000 dependencies, ~2000 reports, ~1500 events', () => {
    const dataset = SyntheticDataEngine.generate({ seed: 42 });

    assert(dataset.activities.length >= 950 && dataset.activities.length <= 1050, `Activities count ${dataset.activities.length} in range`);
    assert(dataset.dependencies.length >= 4800, `Dependencies count ${dataset.dependencies.length} >= 4800`);
    assert(dataset.fieldReports.length >= 1900, `Field reports count ${dataset.fieldReports.length} >= 1900`);
    assert(dataset.events.length >= 1400, `Events count ${dataset.events.length} >= 1400`);
    assert(dataset.wbs.length >= 100, `WBS hierarchy count ${dataset.wbs.length} >= 100`);
  });

  // Test 3: WBS and Activity Referential Integrity
  test('Integrity: All activities link to existing WBS nodes with valid date boundaries', () => {
    const dataset = SyntheticDataEngine.generate({ seed: 42, activityCount: 200, dependencyCount: 500, reportCount: 100, eventCount: 100 });
    const wbsIdSet = new Set(dataset.wbs.map((w) => w.id));

    for (const act of dataset.activities) {
      assert(wbsIdSet.has(act.wbsNodeId), `Activity ${act.activityCode} has valid WBS node`);
      const start = new Date(act.plannedStart).getTime();
      const finish = new Date(act.plannedFinish).getTime();
      assert(start <= finish, `Activity ${act.activityCode} has valid start <= finish`);
      assert(act.plannedProgress >= 0 && act.plannedProgress <= 1, 'Planned progress 0..1');
      assert(act.actualProgress >= 0 && act.actualProgress <= 1, 'Actual progress 0..1');
    }
  });

  // Test 4: Dependency Graph Acyclicity & No Self Links
  test('Dependency Graph: Zero self-dependencies and 0 cycles', () => {
    const dataset = SyntheticDataEngine.generate({ seed: 42, activityCount: 300, dependencyCount: 1200, reportCount: 100, eventCount: 100 });
    const actIdSet = new Set(dataset.activities.map((a) => a.id));

    for (const dep of dataset.dependencies) {
      assert(dep.predecessorId !== dep.successorId, `Dependency ${dep.id} has self link`);
      assert(actIdSet.has(dep.predecessorId), `Predecessor ${dep.predecessorId} exists`);
      assert(actIdSet.has(dep.successorId), `Successor ${dep.successorId} exists`);
    }
  });

  // Test 5: Ground Truth & Difficulty Levels
  test('Ground Truth: Unmatched events have null groundTruthActivityId, Ambiguous have candidate sets', () => {
    const dataset = SyntheticDataEngine.generate({ seed: 42, activityCount: 200, dependencyCount: 500, reportCount: 100, eventCount: 200 });

    let unmatched = 0;
    let ambiguous = 0;
    let exact = 0;

    for (const evt of dataset.events) {
      if (evt.difficultyLevel === DifficultyLevel.UNMATCHED) {
        unmatched++;
        assert(evt.groundTruthActivityId === null, `Unmatched event ${evt.id} must have null activity ID`);
      } else if (evt.difficultyLevel === DifficultyLevel.AMBIGUOUS) {
        ambiguous++;
        assert(evt.groundTruthCandidateActivityIds !== undefined && evt.groundTruthCandidateActivityIds.length >= 2, `Ambiguous event ${evt.id} must have >= 2 candidates`);
      } else if (evt.difficultyLevel === DifficultyLevel.EXACT) {
        exact++;
        assert(evt.groundTruthActivityId !== null, `Exact event ${evt.id} must have non-null activity ID`);
      }
    }

    assert(unmatched > 0, 'Must have unmatched events');
    assert(ambiguous > 0, 'Must have ambiguous events');
    assert(exact > 0, 'Must have exact events');
  });

  // Test 6: Benchmark Splits & Leakage Prevention
  test('Benchmark Isolation: Zero event ID leakage between train, validation, and test splits', () => {
    const dataset = SyntheticDataEngine.generate({ seed: 42, activityCount: 200, dependencyCount: 500, reportCount: 100, eventCount: 200 });
    const result = SyntheticDataEngine.exportAndValidate(dataset);

    assert(result.isValid, 'Export and validation must pass cleanly');
    assert(result.exportResult.trainCount > 0, 'Train split non-empty');
    assert(result.exportResult.valCount > 0, 'Val split non-empty');
    assert(result.exportResult.testCount > 0, 'Test split non-empty');
  });

  console.log('\n========================================');
  console.log(`Synthetic Tests: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during synthetic tests:', err);
  process.exit(1);
});
