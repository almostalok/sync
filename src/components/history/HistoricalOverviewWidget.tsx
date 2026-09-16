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
  ShieldCheck,
  Compass
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
          <div key={i} className="glass-card rounded-xl p-4 h-24 bg-slate-900/60 border border-slate-800" />
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
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Historical Capital Projects',
      value: overview.totalHistoricalProjects.toString(),
      subtext: 'Oil India Limited facilities',
      icon: Building2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Documented Delay Events',
      value: overview.totalDocumentedDelays.toLocaleString(),
      subtext: 'Traceable to field reports',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Avg Verified Duration',
      value: `${overview.averageVerifiedDurationDays} days`,
      subtext: 'Across all disciplines',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Median Schedule Variance',
      value: `${overview.medianScheduleVarianceDays > 0 ? '+' : ''}${overview.medianScheduleVarianceDays}d`,
      subtext: 'Industry execution baseline',
      icon: TrendingUp,
      color: overview.medianScheduleVarianceDays > 0 ? 'text-rose-400' : 'text-emerald-400',
      bgColor: overview.medianScheduleVarianceDays > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
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
              className="glass-card rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bgColor} border`}>
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
        <div className="lg:col-span-2 glass-card rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Institutional Knowledge by Discipline
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              {overview.disciplineDistribution.length} Disciplines
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {overview.disciplineDistribution.map((d) => (
              <div
                key={d.discipline}
                className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-center space-y-1 hover:border-cyan-800/40 transition"
              >
                <div className="text-[10px] font-bold text-slate-400">{d.name}</div>
                <div className="text-sm font-bold font-mono text-cyan-300">{d.count}</div>
                <div className="text-[9px] text-slate-500">Med: {d.medianDuration}d | Var: {d.medianVariance > 0 ? `+${d.medianVariance}` : d.medianVariance}d</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Delay Summary */}
        <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Dominant Delay Categories
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Top 5</span>
          </div>

          <div className="space-y-2">
            {overview.topDelayCategories.slice(0, 4).map((c) => (
              <div key={c.cause} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[170px]" title={c.label}>
                  {c.cause}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 w-7 text-right">
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
