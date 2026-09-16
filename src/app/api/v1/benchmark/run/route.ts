import { NextRequest, NextResponse } from 'next/server';
import { BenchmarkRunnerService } from '@sitesync/api/modules/matching/benchmark/benchmark-runner.service';

export async function POST(_request: NextRequest) {
  try {
    const runner = new BenchmarkRunnerService();
    const benchmarkResult = await runner.runBenchmark();

    return NextResponse.json({
      data: benchmarkResult.results,
      errorAnalysis: benchmarkResult.errorAnalysis,
      meta: {
        executedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Benchmark execution failed';
    return NextResponse.json(
      {
        error: {
          code: 'BENCHMARK_EXECUTION_ERROR',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  return POST(_request);
}
