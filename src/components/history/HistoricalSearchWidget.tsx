'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DelayCause, 
  Discipline, 
  HistoricalOutcomeDTO 
} from '@sitesync/types';
import { 
  Search, 
  AlertTriangle, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface Props {
  onSelectRecord: (record: HistoricalOutcomeDTO) => void;
}

export const HistoricalSearchWidget: React.FC<Props> = ({ onSelectRecord }) => {
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string>('ALL');
  const [delayCause, setDelayCause] = useState<string>('ALL');
  const [results, setResults] = useState<HistoricalOutcomeDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query.trim());
      if (discipline !== 'ALL') params.append('discipline', discipline);
      if (delayCause !== 'ALL') params.append('delayCause', delayCause);
      params.append('limit', '30');

      const res = await fetch(`/api/v1/history/search?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data.outcomes);
        setTotal(json.data.total);
      }
    } catch (err) {
      console.error('Failed to search historical records:', err);
    } finally {
      setLoading(false);
    }
  }, [query, discipline, delayCause]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const handleReset = () => {
    setQuery('');
    setDiscipline('ALL');
    setDelayCause('ALL');
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Search Bar & Filter Controls */}
      <form onSubmit={handleSearchSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Structured Historical Activity Search
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Text Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search past activities (e.g. 'compressor foundation', 'welding', 'hydrotest')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Discipline Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Disciplines</option>
              <option value="CIVIL">Civil</option>
              <option value="MECHANICAL">Mechanical</option>
              <option value="PIPING">Piping</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="INSTRUMENTATION">Instrumentation</option>
            </select>
          </div>

          {/* Delay Cause Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={delayCause}
              onChange={(e) => setDelayCause(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Delay Causes</option>
              {Object.values(DelayCause).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Submit / Reset */}
          <div className="sm:col-span-1 flex gap-1">
            <button
              type="submit"
              className="flex-1 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
            >
              Go
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
        <span>
          Showing <strong>{results.length}</strong> of <strong>{total}</strong> historical records
        </span>
        <span className="text-[11px] text-slate-400">
          Click any card to inspect full evidence lineage
        </span>
      </div>

      {/* Results Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-slate-50 rounded animate-pulse border border-slate-200" />
          ))
        ) : results.length === 0 ? (
          <div className="col-span-3 text-center py-10 text-slate-500 text-xs">
            No historical records matched your query parameters.
          </div>
        ) : (
          results.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelectRecord(rec)}
              className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between space-y-2.5 shadow-xs group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {rec.projectId}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {rec.discipline}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-800 transition">
                    {rec.activityName}
                  </h4>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {rec.activityCode} • {rec.projectName}
                  </div>
                </div>

                {/* Duration & Variance Matrix */}
                <div className="grid grid-cols-3 gap-1 p-2 rounded bg-slate-50 border border-slate-200 text-center text-xs">
                  <div>
                    <div className="text-[9px] text-slate-500">Plan</div>
                    <div className="font-mono text-slate-700">{rec.plannedDuration}d</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500">Actual</div>
                    <div className="font-mono font-bold text-slate-900">{rec.actualDuration}d</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500">Variance</div>
                    <div
                      className={`font-mono font-bold ${
                        rec.scheduleVariance > 0
                          ? 'text-rose-700'
                          : rec.scheduleVariance < 0
                          ? 'text-emerald-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {rec.scheduleVariance > 0 ? `+${rec.scheduleVariance}` : rec.scheduleVariance}d
                    </div>
                  </div>
                </div>

                {/* Delay & Productivity */}
                <div className="space-y-0.5 text-[11px]">
                  {rec.delayCause !== DelayCause.UNKNOWN && (
                    <div className="flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                      <span className="truncate">Cause: {rec.delayCause}</span>
                    </div>
                  )}
                  {rec.productivityMetric && (
                    <div className="text-[10px] font-mono text-slate-600">
                      Productivity: <strong className="text-slate-800">{rec.productivityMetric} {rec.productivityUnit}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[170px] font-mono">
                  {rec.evidenceReference}
                </span>
                <span className="text-slate-700 flex items-center gap-0.5 font-semibold">
                  <span>Inspect</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
