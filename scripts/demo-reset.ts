/**
 * SiteSync Golden Demo Reset & State Restoration (Master Prompt 11 Section 32, 33, 34)
 *
 * Restores the canonical 1,000-activity "Compressor Station Expansion" (Oil India Limited)
 * demo state deterministically with fixed seed.
 */

import { generateSyntheticProject } from '../src/lib/data/syntheticGenerator';
import { EventBusService } from '../apps/api/src/modules/events/event-bus.service';
import { ReviewService } from '../apps/api/src/modules/review/review.service';
import { ScheduleSyncService } from '../apps/api/src/modules/schedule-sync/schedule-sync.service';
import { SEEDED_REVIEW_CASES } from '../data/synthetic/review-cases';

export async function runDemoReset(mode: 'reset' | 'seed' | 'clean' = 'reset') {
  console.log(`\n🔄 [SiteSync Demo Lifecycle] Executing mode: '${mode.toUpperCase()}'...`);
  const startTime = Date.now();

  const eventBus = EventBusService.getInstance();

  if (mode === 'clean') {
    console.log('🧹 Clearing ephemeral caches, review queues, and outbox...');
    eventBus.clear();
    ReviewService.clear();
    console.log('✅ Demo state cleaned successfully.');
    return;
  }

  // 1. Reset event bus & outbox
  eventBus.clear();
  console.log('  ✓ Outbox & event history cleared');

  // 2. Deterministically generate 1,000-activity Oil India Project
  console.log('  ⏳ Generating canonical 1,000-activity Oil India dataset (fixed seed)...');
  const synthetic = generateSyntheticProject();
  console.log(`  ✓ Generated ${synthetic.activities.length} activities across L1-L6 WBS`);
  console.log(`  ✓ Generated ${synthetic.dependencies.length} schedule dependencies`);
  console.log(`  ✓ Generated ${synthetic.fieldReports.length} DPR & inspection records`);
  console.log(`  ✓ Generated ${synthetic.historicalOutcomes.length} historical project outcomes`);

  // 3. Reset Review Queue to canonical benchmark state
  ReviewService.clear();
  SEEDED_REVIEW_CASES.forEach((c) => {
    ReviewService.registerReviewItem(JSON.parse(JSON.stringify(c)));
  });
  console.log(`  ✓ Restored ${SEEDED_REVIEW_CASES.length} canonical review queue items`);

  // 4. Reset in-memory schedule sync states
  synthetic.activities.forEach((act) => {
    ScheduleSyncService.setInMemoryActivity(act.id, {
      ...act,
      plannedStart: new Date(act.plannedStart),
      plannedFinish: new Date(act.plannedFinish),
      actualStart: act.actualStart ? new Date(act.actualStart) : null,
      actualFinish: act.actualFinish ? new Date(act.actualFinish) : null,
    });
  });
  console.log(`  ✓ Synchronized canonical schedule state for project ${synthetic.project.id}`);

  const durationMs = Date.now() - startTime;
  console.log(`\n======================================================`);
  console.log(`🎉 Demo Reset Completed in ${durationMs}ms`);
  console.log(`   Canonical Project: '${synthetic.project.name}' (${synthetic.project.projectCode})`);
  console.log(`   Operator: Oil India Limited (Duliajan Terminal)`);
  console.log(`   WBS Levels: L1 to L6`);
  console.log(`   Authoritative State: 100% Deterministic`);
  console.log(`======================================================\n`);
}

// Execute directly if run as CLI script
if (require.main === module) {
  const arg = process.argv[2] || 'reset';
  const validModes = ['reset', 'seed', 'clean'];
  const mode = validModes.includes(arg) ? (arg as 'reset' | 'seed' | 'clean') : 'reset';
  runDemoReset(mode).catch((err) => {
    console.error('❌ Demo reset failed:', err);
    process.exit(1);
  });
}
