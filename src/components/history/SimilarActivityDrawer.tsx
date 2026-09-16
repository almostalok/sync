'use client';

import React, { useState, useEffect } from 'react';
import { 
  HistoricalBenchmarkDTO, 
  SimilarActivityComparisonDTO 
} from '@sitesync/types';
import { 
  X, 
  Layers, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface Props {
  benchmark: HistoricalBenchmarkDTO | null;
  onClose: () => void;
  onSelectRecord?: (outcomeId: string) => void;
}

export const SimilarActivityDrawer: React.FC<Props> = ({
  benchmark,
  onClose,
  onSelectRecord,
}) => {
  const [data, setData] = useState<SimilarActivityComparisonDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!benchmark) return;

    const fetchComparisons = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/projects/PROJ-OIL-2026-01/activities/CIV-EXC-042/historical-comparisons`
        );
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch similar activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisons();
  }, [benchmark]);

  if (!benchmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-[#0d131f] border-l border-slate-800 p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  {benchmark.discipline}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {benchmark.activityType}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Similar Historical Work & Execution Comparisons</span>
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic structured-first matching against verified Oil India capital outcomes.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Benchmark Distribution Summary */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Historical Baseline
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {benchmark.sampleCount} Verified Samples
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-500">Median Duration</div>
                <div className="text-sm font-bold font-mono text-cyan-300">
                  {benchmark.durationDays.median} days
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-500">P25 – P75 Range</div>
                <div className="text-sm font-bold font-mono text-slate-200">
                  {benchmark.durationDays.p25}d – {benchmark.durationDays.p75}d
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-500">Median Variance</div>
                <div
                  className={`text-sm font-bold font-mono ${
                    benchmark.scheduleVarianceDays.median > 0
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {benchmark.scheduleVarianceDays.median > 0
                    ? `+${benchmark.scheduleVarianceDays.median}`
                    : benchmark.scheduleVarianceDays.median}d
                </div>
              </div>
            </div>
          </div>

          {/* List of Comparable Historical Activities with Similarity Explanations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Comparable Past Activities & Match Factors
              </span>
              <span className="text-[10px] text-slate-500">Sorted by similarity score</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-slate-900/40 rounded-xl animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {data?.comparableActivities.map((item) => (
                  <div
                    key={item.outcomeId}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-800/60 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                            {item.projectId}
                          </span>
                          <span className="text-xs font-bold text-slate-100">
                            {item.activityName}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.activityCode} • {item.projectName}
                        </div>
                      </div>

                      {/* Similarity Score Pill */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-xs font-bold flex-shrink-0">
                        <span>{Math.round(item.similarityScore * 100)}% Match</span>
                      </div>
                    </div>

                    {/* Duration comparison */}
                    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-center">
                      <div>
                        <span className="text-[9px] text-slate-500">Planned</span>
                        <div className="font-mono text-slate-300">{item.plannedDuration}d</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500">Actual</span>
                        <div className="font-mono font-bold text-cyan-300">{item.actualDuration}d</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500">Variance</span>
                        <div className={`font-mono font-bold ${item.variance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.variance > 0 ? `+${item.variance}` : item.variance}d
                        </div>
                      </div>
                    </div>

                    {/* Similarity Reasons / Match Explanations */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Deterministic Comparability Factors:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.similarityReasons.map((r, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{r}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Quote */}
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 italic">
                      {item.evidenceExcerpt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Comparisons
          </button>
        </div>
      </div>
    </div>
  );
};
