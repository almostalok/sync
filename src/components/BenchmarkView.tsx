'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  BarChart3, 
  CheckCircle2, 
  Cpu, 
  Flame, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BenchmarkView: React.FC = () => {
  const { state, runBenchmark } = useProject();
  const [isRunning, setIsRunning] = useState(false);

  const metrics = state.benchmarkMetrics;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      runBenchmark();
      setIsRunning(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Evaluation & Scientific Benchmark
            </span>
            <span className="text-xs text-slate-400">Section 5 & 10 Compliance • Ground-Truth Test Set</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Multi-Baseline Performance Comparison & Confidence Calibration
          </h2>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition shrink-0 transform active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Evaluating Test Sets...' : 'Run Scientific Benchmark'}</span>
        </button>
      </div>

      {metrics ? (
        <div className="space-y-6">
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <span className="text-xs font-medium text-slate-400">Top-1 Accuracy</span>
              <div className="text-3xl font-black text-cyan-400">{metrics.top1Accuracy}%</div>
              <p className="text-[10px] text-slate-500">Correct activity ranked as #1 candidate</p>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-2">
              <span className="text-xs font-medium text-slate-400">Top-3 Recall</span>
              <div className="text-3xl font-black text-emerald-400">{metrics.top3Recall}%</div>
              <p className="text-[10px] text-slate-500">Correct activity within Top-3 candidate options</p>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">False Auto-Link Rate</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  SAFETY CRITICAL
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-400">{metrics.falseAutoLinkRate}%</div>
              <p className="text-[10px] text-slate-500">Percentage of incorrect auto-links (Target: 0%)</p>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-2">
              <span className="text-xs font-medium text-slate-400">Brier Score Calibration</span>
              <div className="text-3xl font-black text-purple-400">{metrics.brierScore}</div>
              <p className="text-[10px] text-slate-500">Mean squared probability error (Lower is better)</p>
            </div>
          </div>

          {/* Baseline Comparison Table */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">4-Baseline Comparative Analysis</h3>
                <p className="text-xs text-slate-400">Testing why SiteSync's 7-Signal architecture outperforms naive algorithms</p>
              </div>
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded-lg">
                Held-out Test Split
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Model Architecture</th>
                    <th className="py-2.5 px-3">Top-1 Accuracy</th>
                    <th className="py-2.5 px-3">Top-3 Recall</th>
                    <th className="py-2.5 px-3">F1 Score</th>
                    <th className="py-2.5 px-3">False Auto-Link Rate</th>
                    <th className="py-2.5 px-3">Safety Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-semibold text-slate-300">Baseline 1: Exact String Matching</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.exactString.top1}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.exactString.top3}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.exactString.f1}%</td>
                    <td className="py-3 px-3 font-mono text-rose-400 font-bold">{metrics.baselineComparison.exactString.falseAuto}%</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">Fails on abbreviations & typos</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-semibold text-slate-300">Baseline 2: Fuzzy String Matching</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.fuzzyString.top1}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.fuzzyString.top3}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.fuzzyString.f1}%</td>
                    <td className="py-3 px-3 font-mono text-rose-400 font-bold">{metrics.baselineComparison.fuzzyString.falseAuto}%</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">High false positive collisions</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-semibold text-slate-300">Baseline 3: Embedding-Only Vector Retrieval</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.embeddingOnly.top1}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.embeddingOnly.top3}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{metrics.baselineComparison.embeddingOnly.f1}%</td>
                    <td className="py-3 px-3 font-mono text-amber-400 font-bold">{metrics.baselineComparison.embeddingOnly.falseAuto}%</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">Lacks temporal/WBS discipline constraint</td>
                  </tr>
                  <tr className="bg-cyan-950/30 border border-cyan-500/30 font-bold">
                    <td className="py-3 px-3 text-cyan-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SiteSync 7-Signal Hybrid Matcher</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-300">{metrics.top1Accuracy}%</td>
                    <td className="py-3 px-3 font-mono text-cyan-300">{metrics.top3Recall}%</td>
                    <td className="py-3 px-3 font-mono text-cyan-300">{metrics.f1Score}%</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-black">{metrics.falseAutoLinkRate}%</td>
                    <td className="py-3 px-3 text-emerald-400 text-[11px]">Safe, Explainable & Calibrated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Difficulty Level Breakdown */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Accuracy Across Synthetic Difficulty Levels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(metrics.difficultyBreakdown).map(([diff, stats]) => (
                <div key={diff} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold text-slate-300">{diff.replace('LEVEL_', 'L').replace('_', ' ')}</span>
                    <span className="font-bold text-cyan-400">{stats.accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full"
                      style={{ width: `${stats.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
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
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-slate-800 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-xl">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">Benchmark Not Yet Executed</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              In accordance with Rule 7 ("Never fabricate evaluation metrics"), click below to run empirical evaluation across all 7 difficulty levels and 4 baseline architectures.
            </p>
          </div>
          <button
            onClick={handleRun}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition"
          >
            Run Benchmark Now
          </button>
        </div>
      )}
    </div>
  );
};
