'use client';

import React from 'react';
import { Discipline, DisciplinePerformanceDTO } from '@sitesync/types';
import { Layers, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

interface DisciplinePerformanceProps {
  performance: DisciplinePerformanceDTO;
  onSelectDiscipline?: (discipline: Discipline) => void;
}

export const DisciplinePerformance: React.FC<DisciplinePerformanceProps> = ({
  performance,
  onSelectDiscipline,
}) => {
  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] font-mono">
      <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2.5">
        <div>
          <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
            // DISCIPLINE_PERFORMANCE_&_FLOAT_VARIANCE
          </h2>
          <p className="text-[10px] text-slate-600 font-mono">
            Verified actuals vs planned baseline progress by engineering work package
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {performance.disciplines.map((item) => {
          const hasNegativeVariance = item.variancePercentage < 0;

          return (
            <div
              key={item.discipline}
              onClick={() => onSelectDiscipline && onSelectDiscipline(item.discipline)}
              className="p-2.5 rounded-none border border-slate-900 hover:bg-stone-50 transition cursor-pointer space-y-1.5 text-xs font-mono shadow-[1px_1px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-950 uppercase font-mono tracking-wider text-[11px]">
                    [{item.discipline}]
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold">
                    // {item.activityCount} TASKS
                  </span>
                </div>

                <div className="flex items-center gap-2.5 font-mono text-[11px]">
                  <span className="text-slate-700">
                    ACT: <strong className="text-slate-950">{item.actualProgress}%</strong>
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">PLAN: {item.plannedProgress}%</span>
                  <span className="text-slate-400">|</span>
                  <span className={`font-bold px-1 border ${hasNegativeVariance ? 'text-red-950 bg-red-100 border-red-300' : 'text-emerald-950 bg-emerald-100 border-emerald-300'}`}>
                    {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage}%
                  </span>
                </div>
              </div>

              {/* Stepped Progress Bar */}
              <div className="h-2 w-full rounded-none bg-stone-100 overflow-hidden relative border border-slate-900">
                {/* Planned marker */}
                <div
                  style={{ width: `${item.plannedProgress}%` }}
                  className="h-full bg-stone-300 absolute left-0 top-0"
                  title={`Planned: ${item.plannedProgress}%`}
                />
                {/* Actual progress */}
                <div
                  style={{ width: `${item.actualProgress}%` }}
                  className="h-full bg-slate-900 absolute left-0 top-0"
                  title={`Actual: ${item.actualProgress}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
                <span>OPEN_REVIEWS: <strong className="text-slate-950 font-mono">[{item.openReviews}]</strong></span>
                {item.staleActivitiesCount > 0 ? (
                  <span className="text-amber-950 font-bold bg-amber-100 px-1 border border-amber-300">[{item.staleActivitiesCount} STALE_TASKS]</span>
                ) : (
                  <span className="text-emerald-900 font-bold">[FLOAT_PROTECTED]</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
