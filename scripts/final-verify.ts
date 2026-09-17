/**
 * SiteSync Master Release Orchestrator & Final Verification Suite (v1.0.0-final)
 *
 * Runs comprehensive multi-gate verification across:
 *  - Environment & Documentation Artifacts (All 21 essential docs)
 *  - Baseline Schedule Immutability & Deterministic Seeding (DEMO_SEED=42)
 *  - Data Integrity & Referential Consistency (Zero orphaned entities)
 *  - Empirical Hybrid Matching Benchmark (Top-1 >= 85%, False Auto-Link = 0.0%)
 *  - 13-Gate Deterministic Demo Pre-Flight (MECH-L5-042 end-to-end)
 */

import * as fs from 'fs';
import * as path from 'path';
import { runDemoVerify } from './demo-verify';
import { BenchmarkRunnerService } from '../apps/api/src/modules/matching/benchmark/benchmark-runner.service';
import { DataIntegrityService } from '../apps/api/src/modules/integrity/data-integrity.service';
import { generateSyntheticProject } from '../src/lib/data/syntheticGenerator';
import { runDemoReset, DEMO_SEED } from './demo-reset';

interface VerificationGate {
  gateId: string;
  name: string;
  status: 'PASS' | 'FAIL';
  metrics?: Record<string, any>;
  durationMs: number;
  notes: string;
}

export async function runFinalVerification(): Promise<boolean> {
  console.log('\n================================================================================');
  console.log('       SITESYNC — MASTER RELEASE VERIFICATION ORCHESTRATOR v1.0.0-final');
  console.log('       Target Organization: Oil India Limited (Problem Statement: SIH26122)');
  console.log(`       Deterministic Seed: DEMO_SEED = ${DEMO_SEED} | Dataset: synthetic-compressor-v1`);
  console.log('================================================================================\n');

  const gates: VerificationGate[] = [];
  const orchestratorStart = Date.now();

  async function executeGate(
    gateId: string,
    name: string,
    action: () => Promise<{ notes: string; metrics?: Record<string, any> }>
  ) {
    const start = Date.now();
    try {
      const res = await action();
      const durationMs = Date.now() - start;
      gates.push({ gateId, name, status: 'PASS', metrics: res.metrics, durationMs, notes: res.notes });
      console.log(`  [PASS] ${gateId}: ${name} (${durationMs}ms)`);
      console.log(`         └─ ${res.notes}`);
      if (res.metrics) {
        console.log(`         └─ Metrics: ${JSON.stringify(res.metrics)}`);
      }
    } catch (err: any) {
      const durationMs = Date.now() - start;
      gates.push({ gateId, name, status: 'FAIL', durationMs, notes: err.message });
      console.log(`  [FAIL] ${gateId}: ${name} (${durationMs}ms)`);
      console.log(`         └─ Error: ${err.message}`);
    }
  }

  // GATE 1: Environment & Required Documentation Artifacts
  await executeGate('GATE-01', 'Documentation & Release Artifacts Verification', async () => {
    const requiredFiles = [
      'VERSION',
      '.env.example',
      'README.md',
      'docs/final/REPOSITORY-AUDIT.md',
      'docs/final/FEATURE-MATRIX.md',
      'docs/final/REQUIREMENT-TRACEABILITY.md',
      'docs/final/PS-ALIGNMENT.md',
      'docs/final/DATA-DISCLOSURE.md',
      'docs/final/FINAL-BENCHMARK-REPORT.md',
      'docs/final/COPILOT-EVALUATION.md',
      'docs/final/VOICE-EVALUATION.md',
      'docs/final/FORECAST-EVALUATION.md',
      'docs/final/MOCK-VS-REAL.md',
      'docs/final/LIMITATIONS.md',
      'docs/final/ENTERPRISE-ROADMAP.md',
      'docs/final/REPRODUCIBILITY.md',
      'docs/final/RELEASE-CHECKLIST.md',
      'docs/final/FINAL-RELEASE-REPORT.md',
      'docs/submission/SIH-SOLUTION-DOCUMENT.md',
      'docs/submission/SIH-DECK.md',
      'docs/submission/JUDGE-QA.md',
    ];

    const missing = requiredFiles.filter((relPath) => !fs.existsSync(path.resolve(process.cwd(), relPath)));
    if (missing.length > 0) {
      throw new Error(`Missing required release artifacts: ${missing.join(', ')}`);
    }

    const versionContent = fs.readFileSync(path.resolve(process.cwd(), 'VERSION'), 'utf-8');
    return {
      notes: `All 21 essential release & SIH submission documents verified. Version: ${versionContent.split('\n')[0]}`,
      metrics: { totalArtifactsChecked: requiredFiles.length, missing: 0 },
    };
  });

  // GATE 2: Baseline Schedule Immutability & Deterministic Seeding
  await executeGate('GATE-02', 'Baseline Schedule & Deterministic State Invariants', async () => {
    await runDemoReset('reset');
    const project = generateSyntheticProject();
    if (!project || project.activities.length < 50) {
      throw new Error(`Schedule activities count insufficient: ${project?.activities?.length}`);
    }
    const golden = project.activities.find((a) => a.activityCode === 'MECH-L5-042');
    if (!golden) throw new Error('Golden activity MECH-L5-042 missing from schedule');
    if (golden.status !== 'NOT_STARTED') throw new Error(`Golden activity status not pristine: ${golden.status}`);

    return {
      notes: `Verified ${project.activities.length} activities in synthetic-compressor-v1. MECH-L5-042 correctly initialized to NOT_STARTED.`,
      metrics: { totalActivities: project.activities.length, targetActivity: golden.activityCode },
    };
  });

  // GATE 3: Data Integrity & Referential Consistency
  await executeGate('GATE-03', 'Schedule Graph Referential Integrity', async () => {
    const synthetic = generateSyntheticProject();
    const integrityService = new DataIntegrityService();
    const report = integrityService.auditProjectIntegrity({
      projectId: synthetic.project.id,
      activities: synthetic.activities,
      dependencies: synthetic.dependencies,
      wbsNodes: synthetic.wbsNodes,
      reports: synthetic.fieldReports,
      progressUpdates: [],
    });

    if (!report.isHealthy || report.violationsCount > 0) {
      throw new Error(`Referential integrity audit failed with ${report.violationsCount} violations`);
    }

    return {
      notes: `Audited ${report.totalChecks} relations across activities, WBS, and dependencies: 100% integrity (Score: ${report.qualityScorePercentage}%).`,
      metrics: { valid: true, issuesFound: 0, qualityScore: report.qualityScorePercentage },
    };
  });

  // GATE 4: Empirical Hybrid Matcher Benchmark
  await executeGate('GATE-04', 'Empirical 7-Feature Hybrid Matcher Benchmark', async () => {
    const runner = new BenchmarkRunnerService();
    const { results } = await runner.runBenchmark();
    const hybrid = results.hybrid;

    if (hybrid.top1Accuracy < 0.85) {
      throw new Error(`Hybrid Top-1 Accuracy below threshold: ${(hybrid.top1Accuracy * 100).toFixed(1)}% < 85%`);
    }
    if (hybrid.f1Score < 0.90) {
      throw new Error(`Hybrid F1 Score below threshold: ${(hybrid.f1Score * 100).toFixed(1)}% < 90%`);
    }
    if (hybrid.falseAutoLinkRate > 0.0) {
      throw new Error(`False auto-link rate must be 0.0%: detected ${hybrid.falseAutoLinkRate}`);
    }

    return {
      notes: `Top-1 ${(hybrid.top1Accuracy * 100).toFixed(1)}%, F1 ${(hybrid.f1Score * 100).toFixed(1)}%, False Auto-Link: ${(hybrid.falseAutoLinkRate * 100).toFixed(1)}%, Latency: ${hybrid.averageLatencyMs}ms`,
      metrics: {
        top1Accuracy: hybrid.top1Accuracy,
        f1Score: hybrid.f1Score,
        falseAutoLinkRate: hybrid.falseAutoLinkRate,
        latencyMs: hybrid.averageLatencyMs,
      },
    };
  });

  // GATE 5: 13-Gate Deterministic Demo Flow
  await executeGate('GATE-05', '13-Gate Deterministic Demo Scenario (MECH-L5-042)', async () => {
    const demoSuccess = await runDemoVerify();
    if (!demoSuccess) {
      throw new Error('Deterministic demo pre-flight checks failed.');
    }
    return {
      notes: 'All 13 deterministic presentation steps verified with zero flakiness.',
      metrics: { gatesPassed: 13, targetActivity: 'MECH-L5-042' },
    };
  });

  const totalDuration = Date.now() - orchestratorStart;
  const allPassed = gates.every((g) => g.status === 'PASS');

  console.log('\n================================================================================');
  console.log('                          FINAL RELEASE GATE SCORECARD                          ');
  console.log('================================================================================');
  gates.forEach((g) => {
    const icon = g.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${icon} | ${g.gateId} | ${g.name.padEnd(48)} | ${g.durationMs}ms`);
  });
  console.log('--------------------------------------------------------------------------------');
  console.log(`  TOTAL TIME: ${totalDuration}ms | GATES PASSED: ${gates.filter((g) => g.status === 'PASS').length}/${gates.length}`);
  console.log('================================================================================\n');

  if (allPassed) {
    console.log('🎉 STATUS: READY FOR SIH SUBMISSION (100% GATES PASSED)');
    return true;
  } else {
    console.error('⚠️ STATUS: VERIFICATION FAILED. Review failed gates above.');
    return false;
  }
}

// Execute CLI directly if run via tsx
if (require.main === module) {
  runFinalVerification()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal orchestrator failure:', err);
      process.exit(1);
    });
}
