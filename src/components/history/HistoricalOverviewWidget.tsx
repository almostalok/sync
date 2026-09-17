'use client';

import React from 'react';
import { HistoricalOverviewDTO } from '@sitesync/types';
import { 
  CheckCircle2, 
  Building2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  TrendingUp,
} from 'lucide-react';

interface Props {
  overview: HistoricalOverviewDTO | null;
  loading: boolean;
}

export const HistoricalOverviewWidget: React.FC<Props> = ({ overview, loading }) => {
  if (loading || !overview) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 h-24 border border-slate-200" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: 'Verified Completed Tasks',
      value: overview.totalCompletedActivities.toLocaleString(),
      subtext: '100% verified field completion',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Historical Capital Projects',
      value: overview.totalHistoricalProjects.toString(),
      subtext: 'Oil India facility projects',
      icon: Building2,
      color: 'text-slate-800',
      bgColor: 'bg-slate-100 border-slate-200',
    },
    {
      label: 'Documented Delay Events',
      value: overview.totalDocumentedDelays.toLocaleString(),
      subtext: 'Traceable to field reports',
      icon: AlertTriangle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Avg Verified Duration',
      value: `${overview.averageVerifiedDurationDays}d`,
      subtext: 'Across all disciplines',
      icon: Clock,
      color: 'text-slate-800',
      bgColor: 'bg-slate-100 border-slate-200',
    },
    {
      label: 'Median Schedule Variance',
      value: `${overview.medianScheduleVarianceDays > 0 ? '+' : ''}${overview.medianScheduleVarianceDays}d`,
      subtext: 'Industry execution baseline',
      icon: TrendingUp,
      color: overview.medianScheduleVarianceDays > 0 ? 'text-rose-700' : 'text-emerald-700',
      bgColor: overview.medianScheduleVarianceDays > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded ${kpi.bgColor} border`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
              </div>

              <div className="mt-2">
                <div className={`text-xl font-bold font-mono ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {kpi.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discipline Breakdown Bar & Top Delay Snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Discipline Distribution */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Institutional Knowledge by Discipline
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {overview.disciplineDistribution.length} Disciplines
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {overview.disciplineDistribution.map((d) => (
              <div
                key={d.discipline}
                className="bg-slate-50 border border-slate-200 rounded p-2 text-center space-y-0.5 hover:border-slate-300 transition"
              >
                <div className="text-[10px] font-bold text-slate-600 truncate">{d.name}</div>
                <div className="text-sm font-bold font-mono text-slate-900">{d.count}</div>
                <div className="text-[9px] text-slate-500 font-mono">Med: {d.medianDuration}d | Var: {d.medianVariance > 0 ? `+${d.medianVariance}` : d.medianVariance}d</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Delay Summary */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Dominant Delay Categories
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Top 4</span>
          </div>

          <div className="space-y-2">
            {overview.topDelayCategories.slice(0, 4).map((c) => (
              <div key={c.cause} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 truncate max-w-[170px]" title={c.label}>
                  {c.cause}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 font-semibold w-7 text-right">
                    {c.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
