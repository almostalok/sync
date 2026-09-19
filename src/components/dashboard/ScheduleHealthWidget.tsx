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
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  const items = [
    {
      label: 'Completed',
      count: health.completed,
      statusKey: 'COMPLETED',
      percentage: Math.round((health.completed / health.total) * 100),
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-600',
      badgeBg: 'bg-emerald-100 border-emerald-500 text-emerald-950',
      barColor: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    {
      label: 'On Track',
      count: health.onTrack,
      statusKey: 'IN_PROGRESS',
      percentage: Math.round((health.onTrack / health.total) * 100),
      color: 'text-blue-700',
      bgColor: 'bg-blue-600',
      badgeBg: 'bg-blue-100 border-blue-500 text-blue-950',
      barColor: 'bg-blue-500',
      icon: Clock,
    },
    {
      label: 'At Risk',
      count: health.atRisk,
      statusKey: 'AT_RISK',
      percentage: Math.round((health.atRisk / health.total) * 100),
      color: 'text-amber-700',
      bgColor: 'bg-amber-500',
      badgeBg: 'bg-amber-100 border-amber-500 text-amber-950',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
    },
    {
      label: 'Delayed',
      count: health.delayed,
      statusKey: 'DELAYED',
      percentage: Math.round((health.delayed / health.total) * 100),
      color: 'text-rose-700',
      bgColor: 'bg-rose-600',
      badgeBg: 'bg-rose-100 border-rose-500 text-rose-950',
      barColor: 'bg-rose-500',
      icon: AlertOctagon,
    },
    {
      label: 'Not Started',
      count: health.notStarted,
      statusKey: 'NOT_STARTED',
      percentage: Math.round((health.notStarted / health.total) * 100),
      color: 'text-slate-600',
      bgColor: 'bg-slate-400',
      badgeBg: 'bg-stone-200 border-slate-400 text-slate-800',
      barColor: 'bg-slate-400',
      icon: CircleDot,
    },
  ];

  const handleSelect = (statusKey: string) => {
    const next = activeFilter === statusKey ? null : statusKey;
    setActiveFilter(next);
    if (onFilterStatus) onFilterStatus(next || 'ALL');
  };

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3.5 shadow-[2px_2px_0px_#0f172a] h-full flex flex-col justify-between font-mono border-t-4 border-t-emerald-600">
      <div>
        <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2.5">
          <div>
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              {'// SCHEDULE_HEALTH_INDEX'}
            </h2>
            <p className="text-[10px] text-slate-600 font-mono">
              [{health.total.toLocaleString()}] activities tracked in authoritative graph
            </p>
          </div>
          <span className="text-[9px] font-mono font-black text-slate-950 bg-stone-100 px-1.5 py-0.5 border border-slate-900">
            [100%_SYNCED]
          </span>
        </div>

        {/* Stepped Multi-Color Health Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="h-3.5 w-full rounded-none bg-stone-100 flex overflow-hidden border-[1.5px] border-slate-900 shadow-[1px_1px_0px_#0f172a]">
            {items.map((item) => (
              <div
                key={item.label}
                style={{ width: `${item.percentage}%` }}
                className={`${item.bgColor} border-r border-slate-900 last:border-r-0 cursor-pointer hover:opacity-90 transition`}
                title={`${item.label}: ${item.count} (${item.percentage}%)`}
                onClick={() => handleSelect(item.statusKey)}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono px-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Breakdown Items List with High-UX Filter Selection */}
      <div className="space-y-1.5 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isSelected = activeFilter === item.statusKey;

          return (
            <button
              type="button"
              key={item.label}
              onClick={() => handleSelect(item.statusKey)}
              className={`w-full flex items-center justify-between p-1.5 rounded-none transition text-xs font-mono text-left border ${
                isSelected
                  ? 'bg-black text-white border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'hover:bg-amber-50/60 border-transparent hover:border-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : item.color}`} />
                <span className={`font-bold uppercase text-[11px] ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  [{item.label}]
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-mono">
                {/* Mini visual fill gauge */}
                <div className="w-16 h-1.5 bg-stone-200 border border-slate-900 hidden sm:block overflow-hidden">
                  <div
                    className={`h-full ${item.barColor}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className={`font-black tabular-nums text-xs ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                  {item.count}
                </span>
                <span className={`text-[10px] w-8 text-right ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Navigation Footer */}
      <div className="pt-2 border-t border-slate-200">
        <button
          onClick={() => onFilterStatus && onFilterStatus(activeFilter || 'ALL')}
          className="w-full text-center py-1.5 bg-stone-100 hover:bg-stone-200 border-[1.5px] border-slate-900 font-bold text-[10px] uppercase text-slate-900 tracking-wider shadow-[1px_1px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px]"
        >
          {activeFilter ? `[FILTER_GANTT_BY: ${activeFilter}]` : '[EXPLORE_ALL_ACTIVITIES_IN_GANTT]'}
        </button>
      </div>
    </div>
  );
};
