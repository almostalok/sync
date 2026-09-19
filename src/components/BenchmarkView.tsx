'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  BarChart3, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Zap,
  RotateCcw
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
    <div className="space-y-5 pb-12 font-mono">
      {/* Top Banner */}
      <div className="bg-white border-[1.5px] border-slate-900 border-t-4 border-t-slate-900 rounded-none p-4 shadow-[2px_2px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold tracking-wider uppercase bg-stone-100 text-slate-950 border border-slate-900">
              [04 // BENCHMARK_EVALUATION]
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-xs text-slate-600 font-mono">GROUND-TRUTH SYNTHETIC TEST SET</span>
          </div>
          <h1 className="text-base md:text-lg font-black text-slate-950 tracking-tight uppercase">
            MULTI-BASELINE PERFORMANCE COMPARISON & CALIBRATION
          </h1>
          <p className="text-xs text-slate-700 font-sans">
            Empirical evaluation of 7-signal hybrid matching against exact string, fuzzy, and embedding baselines.
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-none bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] transition shrink-0 disabled:opacity-50 border border-black"
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>[EVALUATING...]</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>[RUN_BENCHMARK]</span>
            </>
          )}
        </button>
      </div>

      {metrics ? (
        <div className="space-y-5">
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-none border-[1.5px] border-slate-900 border-l-4 border-l-sky-500 p-3.5 shadow-[2px_2px_0px_#0f172a] space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">TOP-1 ACCURACY</span>
              <div className="text-2xl font-black font-mono text-slate-950">{metrics.top1Accuracy}%</div>
              <p className="text-[10px] text-slate-600 font-sans">Correct activity ranked as #1 candidate</p>
            </div>

            <div className="bg-white rounded-none border-[1.5px] border-slate-900 border-l-4 border-l-emerald-600 p-3.5 shadow-[2px_2px_0px_#0f172a] space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">TOP-3 RECALL</span>
              <div className="text-2xl font-black font-mono text-emerald-800">{metrics.top3Recall}%</div>
              <p className="text-[10px] text-slate-600 font-sans">Correct activity within Top-3 candidates</p>
            </div>

            <div className="bg-white rounded-none border-[1.5px] border-slate-900 border-l-4 border-l-rose-600 p-3.5 shadow-[2px_2px_0px_#0f172a] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">FALSE AUTO-LINK</span>
                <span className="px-1 py-0.2 rounded-none text-[8px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-900">
                  SAFETY CRITICAL
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-800">{metrics.falseAutoLinkRate}%</div>
              <p className="text-[10px] text-slate-600 font-sans">Incorrect auto-links rate (Target: 0%)</p>
            </div>

            <div className="bg-white rounded-none border-[1.5px] border-slate-900 border-l-4 border-l-purple-600 p-3.5 shadow-[2px_2px_0px_#0f172a] space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">BRIER CALIBRATION</span>
              <div className="text-2xl font-black font-mono text-slate-950">{metrics.brierScore}</div>
              <p className="text-[10px] text-slate-600 font-sans">Mean squared prob error (Lower is better)</p>
            </div>
          </div>

          {/* Baseline Comparison Table */}
          <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2">
              <div>
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">{'// 4-BASELINE_COMPARATIVE_ANALYSIS'}</h3>
                <p className="text-[11px] text-slate-600 font-mono">Empirical proof of 7-Signal architecture vs naive baselines</p>
              </div>
              <span className="text-[9px] font-bold text-slate-950 bg-stone-100 border border-slate-900 px-2 py-0.5 rounded-none font-mono">
                [HELD-OUT TEST SPLIT]
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-900">
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="bg-stone-100 border-b border-slate-900 text-slate-950 font-black uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">MODEL ARCHITECTURE</th>
                    <th className="py-2.5 px-3">TOP-1 ACC</th>
                    <th className="py-2.5 px-3">TOP-3 RECALL</th>
                    <th className="py-2.5 px-3">F1 SCORE</th>
                    <th className="py-2.5 px-3">FALSE AUTO-LINK</th>
                    <th className="py-2.5 px-3">SAFETY ASSESSMENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr className="hover:bg-stone-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">BASELINE 1: EXACT STRING</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.exactString.top1}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.exactString.top3}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.exactString.f1}%</td>
                    <td className="py-2.5 px-3 font-mono text-rose-800 font-bold bg-rose-50">{metrics.baselineComparison.exactString.falseAuto}%</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[10px] font-sans">Fails on abbreviations & typos</td>
                  </tr>
                  <tr className="hover:bg-stone-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">BASELINE 2: FUZZY STRING</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.fuzzyString.top1}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.fuzzyString.top3}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.fuzzyString.f1}%</td>
                    <td className="py-2.5 px-3 font-mono text-rose-800 font-bold bg-rose-50">{metrics.baselineComparison.fuzzyString.falseAuto}%</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[10px] font-sans">High false positive collisions</td>
                  </tr>
                  <tr className="hover:bg-stone-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">BASELINE 3: EMBEDDING VECTOR</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.embeddingOnly.top1}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.embeddingOnly.top3}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{metrics.baselineComparison.embeddingOnly.f1}%</td>
                    <td className="py-2.5 px-3 font-mono text-amber-800 font-bold bg-amber-50">{metrics.baselineComparison.embeddingOnly.falseAuto}%</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[10px] font-sans">Lacks WBS & temporal constraint</td>
                  </tr>
                  <tr className="bg-emerald-50/70 border-l-4 border-l-emerald-600 font-bold">
                    <td className="py-2.5 px-3 text-slate-950 font-black flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-800" />
                      <span>SITESYNC 7-SIGNAL HYBRID</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-950 font-black">{metrics.top1Accuracy}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-950 font-black">{metrics.top3Recall}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-950 font-black">{metrics.f1Score}%</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-800 font-black bg-emerald-100">{metrics.falseAutoLinkRate}%</td>
                    <td className="py-2.5 px-3 text-emerald-950 font-bold text-[10px] font-mono">[SAFE_CALIBRATED]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Difficulty Level Breakdown */}
          <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] space-y-3">
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">{'// ACCURACY_BY_DIFFICULTY_TIER'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(metrics.difficultyBreakdown).map(([diff, stats]) => (
                <div key={diff} className="p-3 rounded-none bg-stone-50 border border-slate-900 space-y-1.5 text-xs shadow-[1px_1px_0px_#000]">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-bold text-slate-950 uppercase text-[11px]">{diff.replace('LEVEL_', 'L').replace('_', ' ')}</span>
                    <span className="font-black font-mono text-slate-950">{stats.accuracy}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 border border-slate-900 overflow-hidden">
                    <div
                      className="bg-black h-full"
                      style={{ width: `${stats.accuracy}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-600 flex justify-between font-mono pt-0.5">
                    <span>{stats.correct} / {stats.total} PASSED</span>
                    <span className="font-bold">[HELD-OUT]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-10 text-center space-y-3 max-w-lg mx-auto shadow-[2px_2px_0px_#0f172a]">
          <div className="w-12 h-12 rounded-none bg-stone-100 border border-slate-900 flex items-center justify-center mx-auto text-slate-900">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-950 uppercase">BENCHMARK NOT YET EXECUTED</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-sans leading-relaxed">
              Click below to run empirical evaluation across all 7 difficulty levels and 4 baseline architectures.
            </p>
          </div>
          <button
            onClick={handleRun}
            className="px-4 py-2 rounded-none bg-black hover:bg-slate-800 text-white font-black text-xs uppercase transition shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] border border-black"
          >
            [RUN_BENCHMARK_NOW]
          </button>
        </div>
      )}
    </div>
  );
};
