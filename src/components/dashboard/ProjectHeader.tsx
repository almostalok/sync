'use client';

import React from 'react';
import { ProjectHeaderDTO, ProjectStatus } from '@sitesync/types';
import { 
  Building2, 
  MapPin, 
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '../../../packages/design-system/components/StatusBadge';

interface ProjectHeaderProps {
  header: ProjectHeaderDTO;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  header,
  onRefresh,
  isRefreshing = false,
}) => {
  const getStatusVariant = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ON_TRACK:
        return 'verified';
      case ProjectStatus.AT_RISK:
        return 'warning';
      case ProjectStatus.DELAYED:
        return 'warning';
      case ProjectStatus.CRITICAL:
        return 'critical';
      default:
        return 'neutral';
    }
  };

  const formatUpdateDate = (dateStr: string | null) => {
    if (!dateStr) return '// NO_VERIFIED_UPDATES';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] font-mono border-t-4 border-t-slate-950">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Section: Project Title & Identity */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="px-2 py-0.5 rounded-none font-mono font-black bg-amber-300 text-slate-950 border-[1.5px] border-slate-900 shadow-[1px_1px_0px_#000]">
              [{header.projectCode}]
            </span>
            <span>|</span>
            <span className="flex items-center gap-1 text-slate-900 font-bold uppercase">
              <Building2 className="w-3.5 h-3.5 text-slate-700" />
              OIL INDIA LIMITED
            </span>
            <span>|</span>
            <span className="flex items-center gap-1 text-slate-600 uppercase">
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              DULIAJAN GAS PROCESSING TERMINAL, ASSAM
            </span>
          </div>

          <h1 className="text-base md:text-xl font-black tracking-tight text-slate-950 uppercase font-mono">
            {header.projectName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1 font-mono">
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px]">DIR: </span>
              <strong className="text-slate-950 uppercase font-bold">{header.projectManager}</strong>
            </div>
            <span>|</span>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px]">TIMELINE: </span>
              <span className="text-slate-950 font-bold">
                {header.startDate} → {header.plannedCompletion}
              </span>
            </div>
            <span>|</span>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px]">NODES: </span>
              <span className="text-slate-950 font-bold">[{header.totalActivitiesCount} ACTIVITIES]</span>
            </div>
            <span>|</span>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px]">SYNC: </span>
              <span className="text-slate-950 font-bold">{formatUpdateDate(header.lastVerifiedUpdate)}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Status Badge & Refresh Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <StatusBadge
            status={getStatusVariant(header.currentStatus)}
            label={header.currentStatus.replace(/_/g, ' ')}
            size="md"
          />

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-white hover:bg-stone-100 text-slate-900 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
              title="Refresh project telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
              <span className="hidden sm:inline">[SYNC_TELEMETRY]</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
