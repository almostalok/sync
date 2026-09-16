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
  const getDisciplineColor = (disc: Discipline) => {
    switch (disc) {
      case Discipline.CIVIL:
        return { bar: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
      case Discipline.PIPING:
        return { bar: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' };
      case Discipline.MECHANICAL:
        return { bar: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' };
      case Discipline.ELECTRICAL:
        return { bar: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
      case Discipline.INSTRUMENTATION:
        return { bar: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' };
      case Discipline.HSE:
        return { bar: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/10' };
      default:
        return { bar: 'bg-slate-500', text: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Discipline Performance & Schedule Variance
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Verified actuals vs planned baseline progress by engineering work package
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {performance.disciplines.map((item) => {
          const colors = getDisciplineColor(item.discipline);
          const hasVariance = item.variancePercentage < 0;

          return (
            <div
              key={item.discipline}
              onClick={() => onSelectDiscipline && onSelectDiscipline(item.discipline)}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {item.name}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {item.activityCount} Activities
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Actual: </span>
                    <strong className="text-slate-100 font-mono font-bold">{item.actualProgress}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Plan: </span>
                    <span className="text-slate-300 font-mono">{item.plannedProgress}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Variance: </span>
                    <strong className={`font-mono font-bold ${hasVariance ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage}%
                    </strong>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition" />
                </div>
              </div>

              {/* Progress Dual Bar */}
              <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                {/* Planned marker (background track) */}
                <div
                  style={{ width: `${item.plannedProgress}%` }}
                  className="absolute top-0 bottom-0 left-0 bg-slate-700/60"
                  title={`Planned: ${item.plannedProgress}%`}
                />
                {/* Actual bar */}
                <div
                  style={{ width: `${item.actualProgress}%` }}
                  className={`absolute top-0 bottom-0 left-0 ${colors.bar} rounded-full transition-all duration-500`}
                  title={`Actual: ${item.actualProgress}%`}
                />
              </div>

              {/* Bottom Metadata Badges */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <div className="flex items-center gap-3">
                  {item.openReviews > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{item.openReviews} reviews pending</span>
                    </span>
                  )}
                  {item.staleActivitiesCount > 0 && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.staleActivitiesCount} stale (&gt;48h)</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 transition">
                  Inspect Schedule Activities →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
