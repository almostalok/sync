'use client';

import React, { useState } from 'react';
import { Discipline, HistoricalBenchmarkDTO, SampleQuality } from '@sitesync/types';
import { 
  Search, 
  ChevronRight, 
  BarChart2, 
  ShieldCheck,
  AlertCircle
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
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            title={`Strong baseline (${count} verified samples)`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Strong Base ({count})</span>
          </span>
        );
      case SampleQuality.LIMITED:
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
            title={`Limited sample size (${count} samples). Moderate confidence.`}
          >
            <span>Limited ({count})</span>
          </span>
        );
      case SampleQuality.LOW_SAMPLE:
      default:
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
            title="Low sample (< 5 samples). Treat estimate cautiously."
          >
            <AlertCircle className="w-3 h-3" />
            <span>Low Sample ({count})</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Activity Duration & Productivity Benchmarks
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
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
              className="pl-8 pr-3 py-1.5 rounded border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 w-44"
            />
          </div>

          {/* Discipline Dropdown */}
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500"
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
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Activity Type & Name</th>
              <th className="py-2.5 px-3">Discipline</th>
              <th className="py-2.5 px-3">Sample Quality</th>
              <th className="py-2.5 px-3 text-center">Median Duration</th>
              <th className="py-2.5 px-3 text-center">P25 – P75 Range</th>
              <th className="py-2.5 px-3 text-center">Median Variance</th>
              <th className="py-2.5 px-3">Productivity</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-3 px-4 h-10 bg-slate-50" />
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
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => onSelectBenchmark(b)}
                >
                  {/* Activity Name */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 group-hover:text-slate-800 transition">
                      {b.activityName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {b.activityType}
                    </div>
                  </td>

                  {/* Discipline */}
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {b.discipline}
                    </span>
                  </td>

                  {/* Sample Quality */}
                  <td className="py-2.5 px-3">
                    {getQualityBadge(b.quality, b.sampleCount)}
                  </td>

                  {/* Median Duration */}
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 text-sm">
                    {b.durationDays.median}d
                  </td>

                  {/* P25-P75 */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {b.durationDays.p25}d – {b.durationDays.p75}d
                    </span>
                  </td>

                  {/* Median Variance */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`font-mono font-bold ${
                        b.scheduleVarianceDays.median > 0
                          ? 'text-rose-700'
                          : b.scheduleVarianceDays.median < 0
                          ? 'text-emerald-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {b.scheduleVarianceDays.median > 0 ? `+${b.scheduleVarianceDays.median}` : b.scheduleVarianceDays.median}d
                    </span>
                  </td>

                  {/* Productivity */}
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {b.productivity.median !== null
                      ? `${b.productivity.median} ${b.productivity.unit}`
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectBenchmark(b)}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-medium transition-colors"
                        title="View Duration Distribution"
                      >
                        Distribution
                      </button>
                      <button
                        onClick={() => onOpenSimilar(b)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 text-[11px] font-medium flex items-center gap-1 transition-colors"
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
