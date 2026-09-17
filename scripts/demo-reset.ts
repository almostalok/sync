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

export const DEMO_SEED = 42;

export async function runDemoReset(mode: 'reset' | 'seed' | 'clean' = 'reset') {
  console.log(`\n🔄 [SiteSync Demo Lifecycle] Executing mode: '${mode.toUpperCase()}' (DEMO_SEED=${DEMO_SEED})...`);
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

  // 2. Deterministically generate 1,000-activity Project
  console.log('  ⏳ Generating canonical Golden Demo Project: Compressor Station Expansion (DEMO_SEED=42)...');
  const synthetic = generateSyntheticProject();
  console.log(`  ✓ Generated ${synthetic.activities.length} activities across L1-L6 WBS (Civil, Piping, Mechanical, Electrical, Instrumentation, HSE)`);
  console.log(`  ✓ Generated ${synthetic.dependencies.length} schedule dependencies`);
  console.log(`  ✓ Generated ${synthetic.fieldReports.length} DPR & inspection records`);
  console.log(`  ✓ Generated ${synthetic.historicalOutcomes.length} historical project outcomes`);

  // 3. Reset Review Queue to canonical benchmark state
  ReviewService.clear();
  SEEDED_REVIEW_CASES.forEach((c) => {
    ReviewService.registerReviewItem(JSON.parse(JSON.stringify(c)));
  });
  console.log(`  ✓ Restored ${SEEDED_REVIEW_CASES.length} canonical review queue items (including golden case MECH-L5-042)`);

  // 4. Reset in-memory schedule sync states & ensure MECH-L5-042 baseline
  synthetic.activities.forEach((act) => {
    ScheduleSyncService.setInMemoryActivity(act.id, {
      ...act,
      plannedStart: new Date(act.plannedStart),
      plannedFinish: new Date(act.plannedFinish),
      actualStart: act.actualStart ? new Date(act.actualStart) : null,
      actualFinish: act.actualFinish ? new Date(act.actualFinish) : null,
    });
  });

  // Explicitly ensure golden demo baseline activity MECH-L5-042 is NOT_STARTED
  ScheduleSyncService.setInMemoryActivity('MECH-L5-042', {
    id: 'MECH-L5-042',
    activityCode: 'MECH-L5-042',
    name: 'Compressor Foundation Grouting',
    discipline: 'MECHANICAL',
    plannedStart: new Date('2026-09-14'),
    plannedFinish: new Date('2026-09-16'),
    actualStart: null,
    actualFinish: null,
    plannedProgress: 100,
    actualProgress: 0,
    status: 'NOT_STARTED',
    varianceDays: 0,
    criticalPath: true,
  });
  console.log(`  ✓ Synchronized canonical schedule state for project ${synthetic.project.id}`);
  console.log(`  ✓ Golden Demo Scenario baseline initialized: MECH-L5-042 [NOT_STARTED]`);

  const durationMs = Date.now() - startTime;
  console.log(`\n======================================================`);
  console.log(`🎉 Demo Reset Completed in ${durationMs}ms`);
  console.log(`   Canonical Project: '${synthetic.project.name}' (${synthetic.project.projectCode})`);
  console.log(`   Dataset Status: Synthetic demonstration dataset created for prototype evaluation`);
  console.log(`   DEMO_SEED: ${DEMO_SEED} (100% Deterministic)`);
  console.log(`   Golden Activity: MECH-L5-042 ready for live supervisor ingestion`);
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
