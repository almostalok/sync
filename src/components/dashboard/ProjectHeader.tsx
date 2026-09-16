'use client';

import React from 'react';
import { ProjectHeaderDTO, ProjectStatus } from '@sitesync/types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  User, 
  Activity as ActivityIcon,
  RefreshCw
} from 'lucide-react';

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
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ON_TRACK:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ON TRACK
          </span>
        );
      case ProjectStatus.AT_RISK:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            AT RISK
          </span>
        );
      case ProjectStatus.DELAYED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            DELAYED
          </span>
        );
      case ProjectStatus.CRITICAL:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            CRITICAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-500/15 text-slate-300 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  const formatUpdateDate = (dateStr: string | null) => {
    if (!dateStr) return 'No verified updates';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section: Project Title & Identity */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
            <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              {header.projectCode}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Oil India Limited
            </span>
            <span>•</span>
            <span className="text-slate-400">Duliajan Gas Processing Terminal, Assam</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {header.projectName}
          </h1>

          <p className="text-xs md:text-sm text-slate-300/80 line-clamp-2">
            {header.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200 font-medium">{header.projectManager}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Start: <strong className="text-slate-200">{header.startDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Planned Completion: <strong className="text-slate-100">{header.plannedCompletion}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Section: Deterministic Status & Live Timestamp */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="text-left lg:text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Status</div>
              <div className="mt-1">{getStatusBadge(header.currentStatus)}</div>
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh project control room metrics"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}
          </div>

          <div className="text-left lg:text-right space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Last Verified Update</div>
            <div className="text-xs font-mono font-semibold text-cyan-300">
              {formatUpdateDate(header.lastVerifiedUpdate)}
            </div>
            <div className="text-[11px] text-slate-400 max-w-xs truncate" title={header.statusReason}>
              {header.statusReason}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
