'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  ActivityDetailDTO,
  ActivityStatus,
  DependencyGraphDTO,
  Discipline,
  GanttZoomLevel,
  ScheduleViewDTO,
} from '@sitesync/types';
import { GanttScheduleView } from './gantt/GanttScheduleView';
import { ActivityDetailDrawer } from './gantt/ActivityDetailDrawer';
import { DependencyImpactView } from './gantt/DependencyImpactView';
import { RefreshCw, CalendarRange, Filter } from 'lucide-react';

export const GanttView: React.FC = () => {
  const { state, setActiveView } = useProject();
  const projectId = 'PROJ-OIL-2026-01';

  const [scheduleView, setScheduleView] = useState<ScheduleViewDTO | null>(null);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<ActivityDetailDTO | null>(null);
  const [selectedDependencyGraph, setSelectedDependencyGraph] = useState<DependencyGraphDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [activeFilters, setActiveFilters] = useState<{
    discipline?: Discipline | string;
    status?: ActivityStatus | string;
    isCritical?: boolean;
    search?: string;
    zoomLevel?: GanttZoomLevel;
  }>({
    zoomLevel: GanttZoomLevel.MONTH,
  });

  const fetchScheduleView = async (filters = activeFilters) => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams();
      if (filters.discipline && filters.discipline !== 'ALL') params.append('discipline', filters.discipline);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.isCritical) params.append('isCritical', 'true');
      if (filters.search) params.append('search', filters.search);
      if (filters.zoomLevel) params.append('zoomLevel', filters.zoomLevel);

      const res = await fetch(`/api/v1/projects/${projectId}/schedule/view?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setScheduleView(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch schedule view:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduleView(activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleInspectActivity = async (activityIdOrCode: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/activities/${activityIdOrCode}`);
      const data = await res.json();
      if (data.success) {
        setSelectedActivityDetail(data.data);
      }
    } catch (err) {
      console.error('Failed to load activity detail:', err);
    }
  };

  const handleOpenDependencyGraph = async (activityIdOrCode: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/dependencies/${activityIdOrCode}`);
      const data = await res.json();
      if (data.success) {
        setSelectedDependencyGraph(data.data);
      }
    } catch (err) {
      console.error('Failed to load dependency graph:', err);
    }
  };

  const handleFilterChange = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
    fetchScheduleView(filters);
  };

  if (loading && !scheduleView) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-lg border border-slate-200">
        <RefreshCw className="w-6 h-6 text-slate-600 animate-spin mx-auto" />
        <div className="text-sm font-bold text-slate-800">Loading Master Baseline Schedule &amp; WBS Hierarchy...</div>
        <div className="text-xs text-slate-500">Reconciling activity progress, critical path floats, and predecessor links...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16 font-mono">
      {/* Top Header Information Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-none bg-white border-[1.5px] border-slate-900 shadow-[2px_2px_0px_#0f172a] border-t-4 border-t-emerald-600">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-600 border border-slate-900 inline-block"></span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-slate-900 border border-slate-900">
              [GANTT_SCHEDULE_CONTROLS]
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              {'// OIL_INDIA_LTD :: CSE-2026-001'}
            </span>
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tight text-slate-950 uppercase font-mono">
            SCHEDULE EXECUTION CONTROL &amp; CRITICAL PATH VISUALIZER
          </h1>
          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Expand and collapse WBS packages to inspect L5/L6 activities, start/finish variance, verified progress, and downstream dependency cascades.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchScheduleView(activeFilters)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-white hover:bg-stone-100 text-slate-900 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
            <span>[SYNC_SCHEDULE]</span>
          </button>
          <button
            onClick={() => setActiveView('review')}
            className="px-3 py-1.5 rounded-none bg-amber-300 hover:bg-amber-400 border-[1.5px] border-slate-900 text-black text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
          >
            [REVIEW_QUEUE]
          </button>
        </div>
      </div>

      {/* Main Gantt & WBS Hierarchy */}
      {scheduleView && (
        <GanttScheduleView
          scheduleView={scheduleView}
          onSelectActivity={(actId) => handleInspectActivity(actId)}
          onFilterChange={handleFilterChange}
          selectedActivityId={selectedActivityDetail?.id || null}
        />
      )}

      {/* Slide-in Activity Detail Drawer */}
      {selectedActivityDetail && (
        <ActivityDetailDrawer
          activity={selectedActivityDetail}
          onClose={() => setSelectedActivityDetail(null)}
          onOpenDependencyGraph={(actCode) => {
            setSelectedActivityDetail(null);
            handleOpenDependencyGraph(actCode);
          }}
          onSelectActivity={(actCode) => handleInspectActivity(actCode)}
        />
      )}

      {/* Interactive Dependency Graph Modal */}
      {selectedDependencyGraph && (
        <DependencyImpactView
          graph={selectedDependencyGraph}
          onClose={() => setSelectedDependencyGraph(null)}
          onSelectActivity={(actCode) => {
            setSelectedDependencyGraph(null);
            handleInspectActivity(actCode);
          }}
        />
      )}
    </div>
  );
};
