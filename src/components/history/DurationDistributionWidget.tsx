'use client';

import React from 'react';
import { HistoricalBenchmarkDTO, HistoricalOutcomeDTO, SampleQuality } from '@sitesync/types';
import { 
  BarChart2, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Layers, 
  Info,
  X
} from 'lucide-react';

interface Props {
  benchmark: HistoricalBenchmarkDTO;
  onClose?: () => void;
  onSelectRecord?: (record: HistoricalOutcomeDTO) => void;
}

export const DurationDistributionWidget: React.FC<Props> = ({
  benchmark,
  onClose,
  onSelectRecord,
}) => {
  const { durationDays, sampleCount, quality, warningNotice, activityName, discipline, sampleRecords } =
    benchmark;

  const maxChartVal = Math.max(durationDays.max + 2, 20);

  // Percentile bar calculations (0 to 100%)
  const minPct = (durationDays.min / maxChartVal) * 100;
  const p25Pct = (durationDays.p25 / maxChartVal) * 100;
  const medianPct = (durationDays.median / maxChartVal) * 100;
  const p75Pct = (durationDays.p75 / maxChartVal) * 100;
  const maxPct = (durationDays.max / maxChartVal) * 100;

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              {discipline}
            </span>
            <span className="text-xs font-mono text-slate-400">{benchmark.activityType}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>{activityName}</span>
            <span className="text-xs font-normal text-slate-400">
              — Historical Duration Distribution
            </span>
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Small Sample Warning Banner (if applicable) */}
      {quality === SampleQuality.LOW_SAMPLE && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-3 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <div className="font-bold">Low Historical Sample Size ({sampleCount} tasks)</div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">
              {warningNotice || 'Only a limited number of historical activities exist in this category. Use estimate cautiously.'}
            </div>
          </div>
        </div>
      )}

      {quality === SampleQuality.STRONGER_HISTORICAL_BASE && (
        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-2.5 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px]">
            Strong statistical baseline ({sampleCount} verified activities across completed Oil India capital assets).
          </span>
        </div>
      )}

      {/* Box Plot / Percentile Distribution Visualizer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Duration Range (Days)</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Sample N = {sampleCount} completed activities
          </span>
        </div>

        {/* Visual Box-Plot Bar */}
        <div className="relative pt-6 pb-8">
          {/* Axis Line */}
          <div className="h-2 w-full bg-slate-800 rounded-full relative">
            {/* Whiskers: Min to Max Range */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-slate-600"
              style={{
                left: `${minPct}%`,
                width: `${Math.max(1, maxPct - minPct)}%`,
              }}
            />

            {/* Middle 50% Box: P25 to P75 */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 bg-cyan-900/80 border border-cyan-400/80 rounded"
              style={{
                left: `${p25Pct}%`,
                width: `${Math.max(2, p75Pct - p25Pct)}%`,
              }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-300 uppercase tracking-tight">
                Middle 50%
              </span>
            </div>

            {/* Median Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-7 bg-amber-400 border border-amber-200 rounded-sm shadow-lg shadow-amber-500/20"
              style={{ left: `calc(${medianPct}% - 6px)` }}
            >
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono text-amber-300">
                {durationDays.median}d
              </span>
            </div>

            {/* Min Label */}
            <div
              className="absolute -bottom-5 text-[9px] font-mono text-slate-500"
              style={{ left: `${minPct}%` }}
            >
              Min: {durationDays.min}d
            </div>

            {/* Max Label */}
            <div
              className="absolute -bottom-5 text-[9px] font-mono text-slate-500"
              style={{ left: `${Math.min(92, maxPct)}%` }}
            >
              Max: {durationDays.max}d
            </div>
          </div>
        </div>

        {/* Statistical Interpretation Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
          <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-500">Median Duration</div>
            <div className="text-sm font-bold font-mono text-amber-400">{durationDays.median} days</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-500">Typical (P25–P75)</div>
            <div className="text-sm font-bold font-mono text-cyan-300">{durationDays.p25}d – {durationDays.p75}d</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-500">Mean Duration</div>
            <div className="text-sm font-bold font-mono text-slate-300">{durationDays.mean} days</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-500">Median Variance</div>
            <div className={`text-sm font-bold font-mono ${benchmark.scheduleVarianceDays.median > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {benchmark.scheduleVarianceDays.median > 0 ? `+${benchmark.scheduleVarianceDays.median}` : benchmark.scheduleVarianceDays.median}d
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span>
            Institutional note: Historical metrics represent verified empirical reality. No guarantee or certainty of future execution duration is implied.
          </span>
        </div>
      </div>

      {/* Supporting Historical Records Sample */}
      {sampleRecords && sampleRecords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Supporting Verified Records ({sampleRecords.length} inspected)
            </span>
            <span className="text-[10px] text-slate-500">Click row for evidence citation</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="py-2 px-3">Project</th>
                  <th className="py-2 px-3">Activity</th>
                  <th className="py-2 px-3 text-center">Plan</th>
                  <th className="py-2 px-3 text-center">Actual</th>
                  <th className="py-2 px-3 text-center">Variance</th>
                  <th className="py-2 px-3">Delay Cause</th>
                  <th className="py-2 px-3">Evidence Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {sampleRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-900/60 cursor-pointer transition"
                    onClick={() => onSelectRecord && onSelectRecord(rec)}
                  >
                    <td className="py-2 px-3 font-mono font-bold text-cyan-400 text-[11px]">
                      {rec.projectId}
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      <div>{rec.activityName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rec.activityCode}</div>
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{rec.plannedDuration}d</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-200">{rec.actualDuration}d</td>
                    <td className="py-2 px-3 text-center font-mono">
                      <span className={rec.scheduleVariance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {rec.scheduleVariance > 0 ? `+${rec.scheduleVariance}` : rec.scheduleVariance}d
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">
                        {rec.delayCause}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">
                      {rec.evidenceReference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
