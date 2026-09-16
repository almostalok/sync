'use client';

import React, { useState } from 'react';
import {
  ActivityStatus,
  Discipline,
  GanttZoomLevel,
  ScheduleViewDTO,
  WBSViewNodeDTO,
} from '@sitesync/types';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';

interface GanttScheduleViewProps {
  scheduleView: ScheduleViewDTO;
  onSelectActivity: (activityId: string) => void;
  onFilterChange?: (filters: {
    discipline?: Discipline | string;
    status?: ActivityStatus | string;
    isCritical?: boolean;
    search?: string;
    zoomLevel?: GanttZoomLevel;
  }) => void;
  selectedActivityId?: string | null;
}

export const GanttScheduleView: React.FC<GanttScheduleViewProps> = ({
  scheduleView,
  onSelectActivity,
  onFilterChange,
  selectedActivityId,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'WBS-L1': true,
    'WBS-L2-1': true,
    'WBS-L2-2': true,
    'WBS-L2-3': true,
    'WBS-L2-4': true,
    'WBS-L3-1': true,
    'WBS-L3-2': true,
    'WBS-L3-3': true,
  });

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<GanttZoomLevel>(GanttZoomLevel.MONTH);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleFilterApply = (
    disc = selectedDiscipline,
    stat = selectedStatus,
    crit = criticalOnly,
    q = searchQuery,
    zoom = zoomLevel
  ) => {
    if (onFilterChange) {
      onFilterChange({
        discipline: disc === 'ALL' ? undefined : (disc as Discipline),
        status: stat === 'ALL' ? undefined : (stat as ActivityStatus),
        isCritical: crit ? true : undefined,
        search: q.trim() || undefined,
        zoomLevel: zoom,
      });
    }
  };

  const getStatusIcon = (status: ActivityStatus, isCritical: boolean, varianceDays: number) => {
    if (status === ActivityStatus.COMPLETED) {
      return (
        <span title="Completed (100%)">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </span>
      );
    }
    if (varianceDays > 2 || status === ActivityStatus.DELAYED) {
      return (
        <span title="Delayed">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
        </span>
      );
    }
    if (isCritical || varianceDays > 0) {
      return (
        <span title="At Risk / Zero Float">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        </span>
      );
    }
    if (status === ActivityStatus.IN_PROGRESS) {
      return (
        <span title="In Progress">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
        </span>
      );
    }
    return <div className="w-2.5 h-2.5 rounded-full bg-slate-600" title="Not Started" />;
  };


  // Render a WBS Node and its activities recursively
  const renderWBSNode = (node: WBSViewNodeDTO, depth = 0) => {
    const isExpanded = expandedNodes[node.id] !== false;
    const hasChildren = node.children && node.children.length > 0;
    const hasActivities = node.activities && node.activities.length > 0;

    return (
      <div key={node.id} className="space-y-1">
        {/* WBS Folder Row */}
        <div
          onClick={() => toggleNode(node.id)}
          style={{ paddingLeft: `${depth * 18 + 12}px` }}
          className={`py-2 px-3 rounded-lg flex items-center justify-between cursor-pointer transition select-none ${
            depth === 0
              ? 'bg-slate-800/80 border border-slate-700 font-bold text-white text-xs'
              : depth === 1
              ? 'bg-slate-900/90 border border-slate-800 font-semibold text-slate-200 text-xs'
              : 'bg-slate-950/60 border border-slate-800/50 font-medium text-slate-300 text-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            {hasChildren || hasActivities ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span className="font-mono text-cyan-300 font-bold">{node.code}</span>
            <span className="truncate">{node.name}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {hasActivities && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                {node.activities.length} tasks
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-900 border border-slate-700 text-slate-300">
              {node.discipline}
            </span>
          </div>
        </div>

        {/* Nested Activities & Child Nodes if expanded */}
        {isExpanded && (
          <div className="space-y-1">
            {/* Activities Table */}
            {hasActivities && (
              <div className="space-y-1 pl-4">
                {node.activities.map((act) => {
                  const isSelected = selectedActivityId === act.id || selectedActivityId === act.activityCode;

                  return (
                    <div
                      key={act.id}
                      onClick={() => onSelectActivity(act.id)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-500 shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      {/* Left: Code, Name, Badges */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {getStatusIcon(act.status, act.isCritical, act.varianceDays)}
                        <span className="font-mono font-bold text-cyan-400 shrink-0">
                          {act.activityCode}
                        </span>
                        <span className="text-slate-200 font-medium truncate" title={act.name}>
                          {act.name}
                        </span>
                        {act.isCritical && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                            Critical
                          </span>
                        )}
                        {act.isStale && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            Stale (&gt;48h)
                          </span>
                        )}
                      </div>

                      {/* Middle: Dates & Durations */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0 font-mono">
                        <div>
                          <span>Plan: </span>
                          <span className="text-slate-300">{act.plannedStart.slice(5)} → {act.plannedEnd.slice(5)}</span>
                        </div>
                        {act.actualStart && (
                          <div>
                            <span>Act: </span>
                            <span className="text-emerald-400">{act.actualStart.slice(5)} → {act.actualEnd ? act.actualEnd.slice(5) : '—'}</span>
                          </div>
                        )}
                        <div>
                          <strong className={`${act.varianceDays > 2 ? 'text-rose-400' : act.varianceDays > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {act.varianceDays > 0 ? `+${act.varianceDays}d` : `${act.varianceDays}d`}
                          </strong>
                        </div>
                      </div>

                      {/* Right: Progress Mini Bar */}
                      <div className="flex items-center gap-3 shrink-0 w-36">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            style={{ width: `${act.actualProgress}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              act.actualProgress >= 100
                                ? 'bg-emerald-500'
                                : act.varianceDays > 2
                                ? 'bg-rose-500'
                                : 'bg-cyan-500'
                            }`}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200 text-xs w-10 text-right">
                          {act.actualProgress}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Child WBS Nodes */}
            {hasChildren && node.children.map((child) => renderWBSNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Top Filter & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Master Project Schedule (WBS &amp; Activity Hierarchy)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Showing {scheduleView.filteredActivitiesCount} of {scheduleView.totalActivities} activities from baseline
          </p>
        </div>

        {/* Zoom Controls & Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Level Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['DAY', 'WEEK', 'MONTH', 'QUARTER'] as GanttZoomLevel[]).map((z) => (
              <button
                key={z}
                onClick={() => {
                  setZoomLevel(z);
                  handleFilterApply(selectedDiscipline, selectedStatus, criticalOnly, searchQuery, z);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  zoomLevel === z
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          {/* Discipline Dropdown */}
          <select
            value={selectedDiscipline}
            onChange={(e) => {
              setSelectedDiscipline(e.target.value);
              handleFilterApply(e.target.value, selectedStatus, criticalOnly, searchQuery, zoomLevel);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Disciplines</option>
            <option value="CIVIL">Civil</option>
            <option value="PIPING">Piping</option>
            <option value="MECHANICAL">Mechanical</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="INSTRUMENTATION">Instrumentation</option>
            <option value="HSE">HSE</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleFilterApply(selectedDiscipline, e.target.value, criticalOnly, searchQuery, zoomLevel);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELAYED">Delayed</option>
            <option value="NOT_STARTED">Not Started</option>
          </select>

          {/* Critical Path Toggle */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 cursor-pointer select-none hover:border-slate-700">
            <input
              type="checkbox"
              checked={criticalOnly}
              onChange={(e) => {
                setCriticalOnly(e.target.checked);
                handleFilterApply(selectedDiscipline, selectedStatus, e.target.checked, searchQuery, zoomLevel);
              }}
              className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
            />
            <span>Critical Path Only</span>
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleFilterApply(selectedDiscipline, selectedStatus, criticalOnly, e.target.value, zoomLevel);
          }}
          placeholder="Search activities by Code (CIV-EXC-042), Name, WBS node, or Location..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
        />
      </div>

      {/* WBS Hierarchy Tree */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {scheduleView.wbsTree.map((rootNode) => renderWBSNode(rootNode, 0))}

        {scheduleView.filteredActivitiesCount === 0 && (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 space-y-1">
            <Search className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-200">No activities match your filter criteria</div>
            <div className="text-xs text-slate-500">Try adjusting your discipline filter or clearing search keywords.</div>
          </div>
        )}
      </div>
    </div>
  );
};
