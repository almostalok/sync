'use client';

import React from 'react';
import { ScheduleHealthDTO } from '@sitesync/types';
import { CheckCircle2, Clock, AlertTriangle, AlertOctagon, CircleDot } from 'lucide-react';

interface ScheduleHealthWidgetProps {
  health: ScheduleHealthDTO;
  onFilterStatus?: (status: string) => void;
}

export const ScheduleHealthWidget: React.FC<ScheduleHealthWidgetProps> = ({
  health,
  onFilterStatus,
}) => {
  const items = [
    {
      label: 'Completed',
      count: health.completed,
      statusKey: 'COMPLETED',
      percentage: Math.round((health.completed / health.total) * 100),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      barColor: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    {
      label: 'On Track',
      count: health.onTrack,
      statusKey: 'IN_PROGRESS',
      percentage: Math.round((health.onTrack / health.total) * 100),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      barColor: 'bg-cyan-500',
      icon: Clock,
    },
    {
      label: 'At Risk',
      count: health.atRisk,
      statusKey: 'AT_RISK',
      percentage: Math.round((health.atRisk / health.total) * 100),
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
    },
    {
      label: 'Delayed',
      count: health.delayed,
      statusKey: 'DELAYED',
      percentage: Math.round((health.delayed / health.total) * 100),
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      barColor: 'bg-rose-500',
      icon: AlertOctagon,
    },
    {
      label: 'Not Started',
      count: health.notStarted,
      statusKey: 'NOT_STARTED',
      percentage: Math.round((health.notStarted / health.total) * 100),
      color: 'text-slate-400',
      bgColor: 'bg-slate-800/40',
      barColor: 'bg-slate-600',
      icon: CircleDot,
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-white tracking-tight">Schedule Activity Health</h2>
          <p className="text-xs text-slate-400">Total {health.total.toLocaleString()} activities verified against schedule float</p>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
          100% Ingested
        </span>
      </div>

      {/* Multi-Segment Health Progress Bar */}
      <div className="h-3 w-full rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
        {items.map((item) => (
          <div
            key={item.label}
            style={{ width: `${item.percentage}%` }}
            className={`${item.barColor} transition-all duration-500`}
            title={`${item.label}: ${item.count} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Breakdown Items List */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              onClick={() => onFilterStatus && onFilterStatus(item.statusKey)}
              className={`p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/50 transition cursor-pointer flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-slate-400">{item.label}</span>
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-lg font-black font-mono ${item.color}`}>
                  {item.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
