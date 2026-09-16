'use client';

import React, { useState } from 'react';
import { Discipline, HistoricalBenchmarkDTO, SampleQuality } from '@sitesync/types';
import { 
  Search, 
  Filter, 
  HelpCircle, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight, 
  BarChart2, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface Props {
  benchmarks: HistoricalBenchmarkDTO[];
  loading: boolean;
  onSelectBenchmark: (benchmark: HistoricalBenchmarkDTO) => void;
  onOpenSimilar: (benchmark: HistoricalBenchmarkDTO) => void;
}

export const ActivityBenchmarkTable: React.FC<Props> = ({
  benchmarks,
  loading,
  onSelectBenchmark,
  onOpenSimilar,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');

  const filtered = benchmarks.filter((b) => {
    const matchSearch =
      b.activityName.toLowerCase().includes(search.toLowerCase()) ||
      b.activityType.toLowerCase().includes(search.toLowerCase()) ||
      b.discipline.toLowerCase().includes(search.toLowerCase());
    const matchDisc =
      selectedDiscipline === 'ALL' || b.discipline.toUpperCase() === selectedDiscipline.toUpperCase();
    return matchSearch && matchDisc;
  });

  const getQualityBadge = (quality: SampleQuality, count: number) => {
    switch (quality) {
      case SampleQuality.STRONGER_HISTORICAL_BASE:
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            title={`Strong baseline (${count} verified samples)`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Strong Base ({count})</span>
          </span>
        );
      case SampleQuality.LIMITED:
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
            title={`Limited sample size (${count} samples). Moderate confidence.`}
          >
            <span>Limited ({count})</span>
          </span>
        );
      case SampleQuality.LOW_SAMPLE:
      default:
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30"
            title="Low sample (< 5 samples). Treat estimate cautiously."
          >
            <AlertCircle className="w-3 h-3" />
            <span>Low Sample ({count})</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-5">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Activity Duration & Productivity Benchmarks
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical percentiles derived strictly from verified completed Oil India project activities.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* Discipline Dropdown */}
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Disciplines</option>
            <option value="CIVIL">Civil</option>
            <option value="MECHANICAL">Mechanical</option>
            <option value="PIPING">Piping</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="INSTRUMENTATION">Instrumentation</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Activity Type & Name</th>
              <th className="py-3 px-3">Discipline</th>
              <th className="py-3 px-3">Sample Quality</th>
              <th className="py-3 px-3 text-center">Median Duration</th>
              <th className="py-3 px-3 text-center">P25 – P75 Range</th>
              <th className="py-3 px-3 text-center">Median Variance</th>
              <th className="py-3 px-3">Productivity</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-3 px-4 h-10 bg-slate-900/30" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No benchmarks matching current filters.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr
                  key={b.activityType}
                  className="hover:bg-slate-900/60 transition group cursor-pointer"
                  onClick={() => onSelectBenchmark(b)}
                >
                  {/* Activity Name */}
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition">
                      {b.activityName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {b.activityType}
                    </div>
                  </td>

                  {/* Discipline */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                      {b.discipline}
                    </span>
                  </td>

                  {/* Sample Quality */}
                  <td className="py-3 px-3">
                    {getQualityBadge(b.quality, b.sampleCount)}
                  </td>

                  {/* Median Duration */}
                  <td className="py-3 px-3 text-center font-mono font-bold text-cyan-300 text-sm">
                    {b.durationDays.median}d
                  </td>

                  {/* P25-P75 */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      {b.durationDays.p25}d – {b.durationDays.p75}d
                    </span>
                  </td>

                  {/* Median Variance */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-mono font-bold ${
                        b.scheduleVarianceDays.median > 0
                          ? 'text-rose-400'
                          : b.scheduleVarianceDays.median < 0
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {b.scheduleVarianceDays.median > 0 ? `+${b.scheduleVarianceDays.median}` : b.scheduleVarianceDays.median}d
                    </span>
                  </td>

                  {/* Productivity */}
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {b.productivity.median !== null
                      ? `${b.productivity.median} ${b.productivity.unit}`
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectBenchmark(b)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-semibold flex items-center gap-1 transition"
                        title="View Duration Distribution"
                      >
                        <span>Distribution</span>
                      </button>
                      <button
                        onClick={() => onOpenSimilar(b)}
                        className="p-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/50 text-[10px] font-semibold flex items-center gap-1 transition"
                        title="Find Similar Historical Tasks"
                      >
                        <span>Similar</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
