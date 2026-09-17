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
    <div className="space-y-5 pb-16">
      {/* Top Header Information Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
              Gantt / Schedule Controls
            </span>
            <span className="text-xs text-slate-500 font-medium">Oil India Limited • Compressor Station Expansion</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
            Schedule Execution Control &amp; Critical Path Visualizer
          </h1>
          <p className="text-xs text-slate-600">
            Expand and collapse WBS packages to inspect L5/L6 activities, start/finish variance, verified progress, and downstream dependency cascades.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchScheduleView(activeFilters)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveView('review')}
            className="px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold transition"
          >
            Review Queue
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
