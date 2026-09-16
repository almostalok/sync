import { BenchmarkRunnerService } from '../apps/api/src/modules/matching/benchmark/benchmark-runner.service';

async function run() {
  console.log('🚀 Running SiteSync Intelligent Matcher Benchmark on Held-out Test Split...\n');

  const runner = new BenchmarkRunnerService();
  const startTime = Date.now();
  const { results, errorAnalysis } = await runner.runBenchmark();
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('========================================================================================================');
  console.log('SITESYNC BENCHMARK EVALUATION RESULTS (Test Set n=' + errorAnalysis.totalEvaluated + ')');
  console.log('========================================================================================================\n');

  console.log('1. BASELINE 1 — EXACT STRING MATCHING:');
  console.log(`   Top-1 Accuracy: ${(results.exact.top1Accuracy * 100).toFixed(1)}% | Precision: ${(results.exact.precision * 100).toFixed(1)}% | Recall: ${(results.exact.recall * 100).toFixed(1)}% | F1: ${(results.exact.f1Score * 100).toFixed(1)}%`);

  console.log('\n2. BASELINE 2 — FUZZY TOKEN STRING MATCHING:');
  console.log(`   Top-1 Accuracy: ${(results.fuzzy.top1Accuracy * 100).toFixed(1)}% | Precision: ${(results.fuzzy.precision * 100).toFixed(1)}% | Recall: ${(results.fuzzy.recall * 100).toFixed(1)}% | F1: ${(results.fuzzy.f1Score * 100).toFixed(1)}%`);

  console.log('\n3. BASELINE 3 — EMBEDDING ONLY (NO METADATA):');
  console.log(`   Top-1 Accuracy: ${(results.embeddingOnly.top1Accuracy * 100).toFixed(1)}% | Precision: ${(results.embeddingOnly.precision * 100).toFixed(1)}% | Recall: ${(results.embeddingOnly.recall * 100).toFixed(1)}% | F1: ${(results.embeddingOnly.f1Score * 100).toFixed(1)}%`);

  console.log('\n4. SITESYNC 7-FEATURE HYBRID MATCHING ENGINE:');
  console.log(`   ★ Top-1 Accuracy:       ${(results.hybrid.top1Accuracy * 100).toFixed(1)}%`);
  console.log(`   ★ Top-3 Recall:         ${(results.hybrid.top3Recall * 100).toFixed(1)}%`);
  console.log(`   ★ Top-5 Recall:         ${(results.hybrid.top5Recall * 100).toFixed(1)}%`);
  console.log(`   ★ Precision:            ${(results.hybrid.precision * 100).toFixed(1)}%`);
  console.log(`   ★ Recall:               ${(results.hybrid.recall * 100).toFixed(1)}%`);
  console.log(`   ★ F1 Score:             ${(results.hybrid.f1Score * 100).toFixed(1)}%`);
  console.log(`   ★ Unmatched Recall:     ${(results.hybrid.unmatchedRecall * 100).toFixed(1)}%`);
  console.log(`   ★ False Auto-Link Rate: ${(results.hybrid.falseAutoLinkRate * 100).toFixed(1)}%`);
  console.log(`   ★ Avg Latency / Event:  ${results.hybrid.averageLatencyMs}ms`);

  console.log('\n========================================================================================================');
  console.log(`Benchmark completed in ${elapsedSec}s. Reports generated in reports/evaluation/errors.json and errors.md.`);
  console.log('========================================================================================================\n');
}

run().catch((err) => {
  console.error('Fatal error during benchmark run:', err);
  process.exit(1);
});
