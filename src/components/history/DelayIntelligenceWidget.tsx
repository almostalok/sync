'use client';

import React, { useState } from 'react';
import { DelayCause, DelayIntelligenceDTO } from '@sitesync/types';
import { 
  AlertTriangle, 
  FileText, 
  Layers, 
  Building2, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';

interface Props {
  data: {
    summary: {
      totalDelays: number;
      topCause: DelayCause;
      topCauseLabel: string;
      medianDelayDaysAcrossAll: number;
    };
    categories: DelayIntelligenceDTO[];
  } | null;
  loading: boolean;
}

export const DelayIntelligenceWidget: React.FC<Props> = ({ data, loading }) => {
  const [selectedCause, setSelectedCause] = useState<DelayCause | null>(null);

  if (loading || !data) {
    return (
      <div className="glass-card rounded-2xl border border-slate-800 p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-900 rounded" />
        <div className="h-48 bg-slate-900/60 rounded-xl" />
      </div>
    );
  }

  const activeCategory =
    data.categories.find((c) => c.cause === selectedCause) || data.categories[0];

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Delay Intelligence & Documented Root Causes
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical delay root-causes extracted and verified against daily progress reports and site logs.
          </p>
        </div>

        {/* High-level stats */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Total Delays: <strong className="text-amber-300">{data.summary.totalDelays}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Median Delay: <strong className="text-rose-400">+{data.summary.medianDelayDaysAcrossAll}d</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Categories List on Left, Drilldown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Ranked Categories List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Ranked Delay Categories
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {data.categories.map((cat) => {
              const isSelected = activeCategory?.cause === cat.cause;
              return (
                <div
                  key={cat.cause}
                  onClick={() => setSelectedCause(cat.cause)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        {cat.cause}
                      </span>
                      {cat.cause === DelayCause.UNKNOWN && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          Undocumented
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {cat.occurrences} events ({cat.percentage}%)
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelected ? 'bg-amber-400' : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(4, cat.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span>{cat.affectedActivitiesCount} activities | {cat.projectsCount} projects</span>
                    <span className="font-mono text-rose-400 font-semibold">
                      Med: +{cat.medianDelayDays}d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Category Detail & Evidence Citations */}
        {activeCategory && (
          <div className="lg:col-span-7 glass-card rounded-xl border border-slate-800 p-4 space-y-4 bg-slate-900/50 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category Title & Meta */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeCategory.cause}
                    </span>
                    <span className="text-xs text-slate-400">{activeCategory.label}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">
                    Documented Impact & Evidence Chain
                  </h4>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Median Delay</div>
                  <div className="text-base font-bold font-mono text-rose-400">
                    +{activeCategory.medianDelayDays} days
                  </div>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Occurrences</div>
                  <div className="font-mono font-bold text-amber-300 text-sm">
                    {activeCategory.occurrences}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Affected Activities</div>
                  <div className="font-mono font-bold text-cyan-300 text-sm">
                    {activeCategory.affectedActivitiesCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Historical Projects</div>
                  <div className="font-mono font-bold text-slate-300 text-sm">
                    {activeCategory.projectsCount}
                  </div>
                </div>
              </div>

              {/* Common Affected Activity Types */}
              {activeCategory.commonActivityTypes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Most Frequently Delayed Activity Types
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory.commonActivityTypes.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Excerpts */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Citing Field Reports & Statements
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeCategory.evidenceExcerpts.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-200">
                          {ev.activityName} ({ev.activityCode})
                        </span>
                        <span className="font-mono text-rose-400 font-bold">
                          +{ev.delayDays}d variance
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] italic leading-relaxed">
                        "{ev.quotedText}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                        <span>{ev.projectName}</span>
                        <span>
                          {ev.documentName} (Page {ev.pageNumber})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
