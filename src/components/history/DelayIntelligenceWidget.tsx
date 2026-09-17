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
      <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-48 bg-slate-50 rounded" />
      </div>
    );
  }

  const activeCategory =
    data.categories.find((c) => c.cause === selectedCause) || data.categories[0];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Delay Intelligence & Documented Root Causes
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical delay root causes extracted and verified against daily progress reports and site logs.
          </p>
        </div>

        {/* High-level stats */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700">
            Total Delays: <strong className="text-slate-900">{data.summary.totalDelays}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700">
            Median Delay: <strong className="text-rose-700 font-bold">+{data.summary.medianDelayDaysAcrossAll}d</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Categories List on Left, Drilldown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Ranked Categories List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Ranked Delay Categories
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {data.categories.map((cat) => {
              const isSelected = activeCategory?.cause === cat.cause;
              return (
                <div
                  key={cat.cause}
                  onClick={() => setSelectedCause(cat.cause)}
                  className={`p-3 rounded border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-50 border-slate-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {cat.cause}
                      </span>
                      {cat.cause === DelayCause.UNKNOWN && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Undocumented
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {cat.occurrences} ({cat.percentage}%)
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelected ? 'bg-amber-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(4, cat.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span>{cat.affectedActivitiesCount} activities | {cat.projectsCount} projects</span>
                    <span className="font-mono text-rose-700 font-semibold">
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
          <div className="lg:col-span-7 bg-slate-50 rounded border border-slate-200 p-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category Title & Meta */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {activeCategory.cause}
                    </span>
                    <span className="text-xs text-slate-600">{activeCategory.label}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Documented Impact & Evidence Chain
                  </h4>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Median Delay</div>
                  <div className="text-base font-bold font-mono text-rose-700">
                    +{activeCategory.medianDelayDays} days
                  </div>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Occurrences</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {activeCategory.occurrences}
                  </div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Affected Activities</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {activeCategory.affectedActivitiesCount}
                  </div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Historical Projects</div>
                  <div className="font-mono font-bold text-slate-700 text-sm">
                    {activeCategory.projectsCount}
                  </div>
                </div>
              </div>

              {/* Common Affected Activity Types */}
              {activeCategory.commonActivityTypes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Most Frequently Delayed Activity Types
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory.commonActivityTypes.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Excerpts */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Citing Field Reports & Statements
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeCategory.evidenceExcerpts.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-white border border-slate-200 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">
                          {ev.activityName} ({ev.activityCode})
                        </span>
                        <span className="font-mono text-rose-700 font-bold">
                          +{ev.delayDays}d variance
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] italic leading-relaxed">
                        &ldquo;{ev.quotedText}&rdquo;
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
