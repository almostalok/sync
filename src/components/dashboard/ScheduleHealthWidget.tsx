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
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-600',
      icon: CheckCircle2,
    },
    {
      label: 'On Track',
      count: health.onTrack,
      statusKey: 'IN_PROGRESS',
      percentage: Math.round((health.onTrack / health.total) * 100),
      color: 'text-blue-800',
      bgColor: 'bg-blue-50 border-blue-200',
      barColor: 'bg-blue-600',
      icon: Clock,
    },
    {
      label: 'At Risk',
      count: health.atRisk,
      statusKey: 'AT_RISK',
      percentage: Math.round((health.atRisk / health.total) * 100),
      color: 'text-amber-800',
      bgColor: 'bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
    },
    {
      label: 'Delayed',
      count: health.delayed,
      statusKey: 'DELAYED',
      percentage: Math.round((health.delayed / health.total) * 100),
      color: 'text-red-800',
      bgColor: 'bg-red-50 border-red-200',
      barColor: 'bg-red-600',
      icon: AlertOctagon,
    },
    {
      label: 'Not Started',
      count: health.notStarted,
      statusKey: 'NOT_STARTED',
      percentage: Math.round((health.notStarted / health.total) * 100),
      color: 'text-slate-600',
      bgColor: 'bg-slate-100 border-slate-200',
      barColor: 'bg-slate-400',
      icon: CircleDot,
    },
  ];

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] h-full flex flex-col justify-between font-mono">
      <div>
        <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
          <div>
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              // SCHEDULE_HEALTH_INDEX
            </h2>
            <p className="text-[10px] text-slate-600 font-mono">[{health.total.toLocaleString()}] activities tracked</p>
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-900 bg-stone-100 px-1.5 py-0.5 border border-slate-900">
            [100%_SYNCED]
          </span>
        </div>

        {/* Stepped Health Progress Bar */}
        <div className="h-3 w-full rounded-none bg-stone-100 flex overflow-hidden border-[1.5px] border-slate-900 mt-3">
          {items.map((item) => (
            <div
              key={item.label}
              style={{ width: `${item.percentage}%` }}
              className={`${item.barColor} border-r border-slate-900 last:border-r-0`}
              title={`${item.label}: ${item.count} (${item.percentage}%)`}
            />
          ))}
        </div>
      </div>

      {/* Breakdown Items List */}
      <div className="space-y-1 pt-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              onClick={() => onFilterStatus && onFilterStatus(item.statusKey)}
              className="flex items-center justify-between p-1.5 rounded-none hover:bg-amber-50/50 cursor-pointer border border-transparent hover:border-slate-900 transition text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="font-bold text-slate-900 uppercase text-[11px]">[{item.label}]</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-black text-slate-950">{item.count}</span>
                <span className="text-slate-500 text-[10px]">({item.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
