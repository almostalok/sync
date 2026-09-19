'use client';

import React, { useState } from 'react';
import { Discipline, DisciplinePerformanceDTO } from '@sitesync/types';
import { Layers, AlertTriangle, Clock, ArrowUpRight, CheckCircle2, Filter } from 'lucide-react';

interface DisciplinePerformanceProps {
  performance: DisciplinePerformanceDTO;
  onSelectDiscipline?: (discipline: Discipline) => void;
}

export const DisciplinePerformance: React.FC<DisciplinePerformanceProps> = ({
  performance,
  onSelectDiscipline,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const getDisciplineTheme = (disc: string) => {
    switch (disc.toUpperCase()) {
      case 'CIVIL':
        return {
          borderLeft: 'border-l-[5px] border-l-amber-500',
          bgTint: 'bg-amber-50/25 hover:bg-amber-50/60',
          badge: 'bg-amber-200 text-amber-950 border-amber-800',
          progressBar: 'bg-amber-600',
          planBar: 'bg-amber-200',
          dot: 'bg-amber-500',
        };
      case 'PIPING':
        return {
          borderLeft: 'border-l-[5px] border-l-sky-600',
          bgTint: 'bg-sky-50/25 hover:bg-sky-50/60',
          badge: 'bg-sky-200 text-sky-950 border-sky-800',
          progressBar: 'bg-sky-600',
          planBar: 'bg-sky-200',
          dot: 'bg-sky-500',
        };
      case 'MECHANICAL':
        return {
          borderLeft: 'border-l-[5px] border-l-purple-600',
          bgTint: 'bg-purple-50/25 hover:bg-purple-50/60',
          badge: 'bg-purple-200 text-purple-950 border-purple-800',
          progressBar: 'bg-purple-600',
          planBar: 'bg-purple-200',
          dot: 'bg-purple-500',
        };
      case 'ELECTRICAL':
        return {
          borderLeft: 'border-l-[5px] border-l-yellow-500',
          bgTint: 'bg-yellow-50/25 hover:bg-yellow-50/60',
          badge: 'bg-yellow-200 text-yellow-950 border-yellow-800',
          progressBar: 'bg-yellow-500',
          planBar: 'bg-yellow-200',
          dot: 'bg-yellow-500',
        };
      default:
        return {
          borderLeft: 'border-l-[5px] border-l-emerald-600',
          bgTint: 'bg-emerald-50/25 hover:bg-emerald-50/60',
          badge: 'bg-emerald-200 text-emerald-950 border-emerald-800',
          progressBar: 'bg-emerald-600',
          planBar: 'bg-emerald-200',
          dot: 'bg-emerald-500',
        };
    }
  };

  const filteredList = activeFilter === 'ALL'
    ? performance.disciplines
    : performance.disciplines.filter(d => d.discipline.toUpperCase() === activeFilter);

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] font-mono">
      {/* Header & Quick Discipline Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-slate-900 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              {'// DISCIPLINE_PERFORMANCE_&_FLOAT_VARIANCE'}
            </h2>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-stone-100 text-slate-900 border border-slate-900">
              COLOR_CODED_WBS
            </span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">
            Verified actuals vs planned baseline progress by engineering work package
          </p>
        </div>

        {/* Quick Triage Filter Tabs */}
        <div className="flex items-center gap-1 text-[10px]">
          {['ALL', 'CIVIL', 'PIPING', 'MECHANICAL', 'ELECTRICAL'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-2 py-0.5 rounded-none font-bold uppercase transition border ${
                activeFilter === tab
                  ? 'bg-black text-white border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-stone-100 text-slate-800 border-slate-300 hover:bg-stone-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {filteredList.map((item) => {
          const hasNegativeVariance = item.variancePercentage < 0;
          const theme = getDisciplineTheme(item.discipline);

          return (
            <div
              key={item.discipline}
              onClick={() => onSelectDiscipline && onSelectDiscipline(item.discipline)}
              className={`p-3 rounded-none border border-slate-900 ${theme.borderLeft} ${theme.bgTint} transition cursor-pointer space-y-2 text-xs font-mono shadow-[2px_2px_0px_#0f172a] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${theme.badge}`}>
                    {item.discipline}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold">
                    {`// ${item.activityCount} SCHEDULE_NODES`}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 font-mono text-[11px]">
                  <span className="text-slate-800">
                    ACT: <strong className="text-slate-950 font-black tabular-nums">{item.actualProgress}%</strong>
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">PLAN: {item.plannedProgress}%</span>
                  <span className="text-slate-400">|</span>
                  <span className={`font-bold px-1.5 py-0.2 border rounded-none ${hasNegativeVariance ? 'text-rose-950 bg-rose-100 border-rose-400' : 'text-emerald-950 bg-emerald-100 border-emerald-400'}`}>
                    {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage}% VAR
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-700" />
                </div>
              </div>

              {/* High-Contrast Stepped Progress Bar */}
              <div className="space-y-1">
                <div className="h-2.5 w-full rounded-none bg-stone-200 overflow-hidden relative border border-slate-900">
                  {/* Planned marker */}
                  <div
                    style={{ width: `${item.plannedProgress}%` }}
                    className={`h-full ${theme.planBar} absolute left-0 top-0 border-r border-dashed border-slate-900`}
                    title={`Planned Baseline: ${item.plannedProgress}%`}
                  />
                  {/* Actual progress */}
                  <div
                    style={{ width: `${item.actualProgress}%` }}
                    className={`h-full ${theme.progressBar} absolute left-0 top-0 border-r border-slate-900`}
                    title={`Verified Actual: ${item.actualProgress}%`}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0%</span>
                  <span>PLAN TARGET: {item.plannedProgress}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Triage Status Row */}
              <div className="flex items-center justify-between text-[10px] text-slate-700 pt-1 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span>OPEN_REVIEWS:</span>
                  <span className={`px-1.5 py-0.2 border font-bold ${
                    item.openReviews > 0 
                      ? 'bg-amber-300 text-black border-slate-900' 
                      : 'bg-stone-100 text-slate-700 border-slate-400'
                  }`}>
                    [{item.openReviews}]
                  </span>
                </div>

                {item.staleActivitiesCount > 0 ? (
                  <span className="text-rose-950 font-bold bg-rose-100 px-1.5 py-0.2 border border-rose-400">
                    [{item.staleActivitiesCount} STALE_TASKS_NEED_DPR]
                  </span>
                ) : (
                  <span className="text-emerald-900 font-bold bg-emerald-100 px-1.5 py-0.2 border border-emerald-400">
                    [FLOAT_PROTECTED · ON_CADENCE]
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
