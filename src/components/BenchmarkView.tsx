'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  BarChart3, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

export const BenchmarkView: React.FC = () => {
  const { state, runBenchmark } = useProject();
  const [isRunning, setIsRunning] = useState(false);

  const metrics = state.benchmarkMetrics;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      runBenchmark();
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200">
              Evaluation & Scientific Benchmark
            </span>
            <span className="text-xs text-slate-500 font-mono">Ground-Truth Synthetic Test Set</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Multi-Baseline Performance Comparison & Calibration
          </h1>
          <p className="text-xs text-slate-600">
            Empirical evaluation of 7-signal hybrid matching against exact string, fuzzy, and embedding baselines.
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition shrink-0 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Evaluating Test Sets...' : 'Run Benchmark'}</span>
        </button>
      </div>

      {metrics ? (
        <div className="space-y-5">
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Top-1 Accuracy</span>
              <div className="text-2xl font-bold font-mono text-slate-900">{metrics.top1Accuracy}%</div>
              <p className="text-[11px] text-slate-500">Correct activity ranked as #1 candidate</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Top-3 Recall</span>
              <div className="text-2xl font-bold font-mono text-emerald-700">{metrics.top3Recall}%</div>
              <p className="text-[11px] text-slate-500">Correct activity within Top-3 candidates</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-[11px]">False Auto-Link</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SAFETY CRITICAL
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700">{metrics.falseAutoLinkRate}%</div>
              <p className="text-[11px] text-slate-500">Percentage of incorrect auto-links (Target: 0%)</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Brier Score Calibration</span>
              <div className="text-2xl font-bold font-mono text-slate-900">{metrics.brierScore}</div>
              <p className="text-[11px] text-slate-500">Mean squared probability error (Lower is better)</p>
            </div>
          </div>

          {/* Baseline Comparison Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">4-Baseline Comparative Analysis</h3>
                <p className="text-xs text-slate-500">Testing why SiteSync&apos;s 7-Signal architecture outperforms naive algorithms</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                Held-out Split
              </span>
            </div>

            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Model Architecture</th>
                    <th className="py-2.5 px-3">Top-1 Accuracy</th>
                    <th className="py-2.5 px-3">Top-3 Recall</th>
                    <th className="py-2.5 px-3">F1 Score</th>
                    <th className="py-2.5 px-3">False Auto-Link Rate</th>
                    <th className="py-2.5 px-3">Safety Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">Baseline 1: Exact String Matching</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.exactString.top1}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.exactString.top3}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.exactString.f1}%</td>
                    <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">{metrics.baselineComparison.exactString.falseAuto}%</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">Fails on abbreviations & typos</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">Baseline 2: Fuzzy String Matching</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.fuzzyString.top1}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.fuzzyString.top3}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.fuzzyString.f1}%</td>
                    <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">{metrics.baselineComparison.fuzzyString.falseAuto}%</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">High false positive collisions</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">Baseline 3: Embedding-Only Vector Retrieval</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.embeddingOnly.top1}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.embeddingOnly.top3}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.embeddingOnly.f1}%</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">{metrics.baselineComparison.embeddingOnly.falseAuto}%</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">Lacks temporal/WBS discipline constraint</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2.5 px-3 text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-slate-700" />
                      <span>SiteSync 7-Signal Hybrid Matcher</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-900">{metrics.top1Accuracy}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-900">{metrics.top3Recall}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-900">{metrics.f1Score}%</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{metrics.falseAutoLinkRate}%</td>
                    <td className="py-2.5 px-3 text-emerald-700 text-[11px]">Safe, Explainable & Calibrated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Difficulty Level Breakdown */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Accuracy Across Difficulty Levels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(metrics.difficultyBreakdown).map(([diff, stats]) => (
                <div key={diff} className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold text-slate-800">{diff.replace('LEVEL_', 'L').replace('_', ' ')}</span>
                    <span className="font-bold font-mono text-slate-900">{stats.accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-900 h-1.5 rounded-full"
                      style={{ width: `${stats.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                    <span>{stats.correct} / {stats.total} correct</span>
                    <span>Held-out</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center space-y-3 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Benchmark Not Yet Executed</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Click below to run empirical evaluation across all 7 difficulty levels and 4 baseline architectures.
            </p>
          </div>
          <button
            onClick={handleRun}
            className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-xs"
          >
            Run Benchmark Now
          </button>
        </div>
      )}
    </div>
  );
};
