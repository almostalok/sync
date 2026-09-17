'use client';

import React, { useState, useEffect } from 'react';
import { 
  HistoricalBenchmarkDTO, 
  SimilarActivityComparisonDTO 
} from '@sitesync/types';
import { 
  X, 
  Layers, 
  CheckCircle2, 
  Search
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50">
      <div className="w-full max-w-2xl h-full bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-5 shadow-xl flex flex-col justify-between">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {benchmark.discipline}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {benchmark.activityType}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-1">
                <Search className="w-4 h-4 text-slate-600" />
                <span>Similar Historical Work & Execution Comparisons</span>
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic structured matching against verified Oil India capital project outcomes.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Benchmark Distribution Summary */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Historical Baseline
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {benchmark.sampleCount} Verified Samples
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500">Median Duration</div>
                <div className="text-sm font-bold font-mono text-slate-900">
                  {benchmark.durationDays.median} days
                </div>
              </div>

              <div className="p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500">P25 – P75 Range</div>
                <div className="text-sm font-bold font-mono text-slate-800">
                  {benchmark.durationDays.p25}d – {benchmark.durationDays.p75}d
                </div>
              </div>

              <div className="p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500">Median Variance</div>
                <div
                  className={`text-sm font-bold font-mono ${
                    benchmark.scheduleVarianceDays.median > 0
                      ? 'text-rose-700'
                      : 'text-emerald-700'
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
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Comparable Past Activities & Match Factors
              </span>
              <span className="text-[10px] text-slate-500">Sorted by similarity score</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-slate-50 rounded animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {data?.comparableActivities.map((item) => (
                  <div
                    key={item.outcomeId}
                    className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.projectId}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {item.activityName}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.activityCode} • {item.projectName}
                        </div>
                      </div>

                      {/* Similarity Score Pill */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold shrink-0">
                        <span>{Math.round(item.similarityScore * 100)}% Match</span>
                      </div>
                    </div>

                    {/* Duration comparison */}
                    <div className="grid grid-cols-3 gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs text-center">
                      <div>
                        <span className="text-[9px] text-slate-500">Planned</span>
                        <div className="font-mono text-slate-700">{item.plannedDuration}d</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500">Actual</span>
                        <div className="font-mono font-bold text-slate-900">{item.actualDuration}d</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500">Variance</span>
                        <div className={`font-mono font-bold ${item.variance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {item.variance > 0 ? `+${item.variance}` : item.variance}d
                        </div>
                      </div>
                    </div>

                    {/* Similarity Reasons */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
                        Comparability Factors:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.similarityReasons.map((r, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{r}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Quote */}
                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic">
                      {item.evidenceExcerpt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Close Comparisons
          </button>
        </div>
      </div>
    </div>
  );
};
