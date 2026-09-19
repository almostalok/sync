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
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Calendar,
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
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        </span>
      );
    }
    if (varianceDays > 2 || status === ActivityStatus.DELAYED) {
      return (
        <span title="Delayed">
          <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
        </span>
      );
    }
    if (isCritical || varianceDays > 0) {
      return (
        <span title="At Risk / Zero Float">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        </span>
      );
    }
    if (status === ActivityStatus.IN_PROGRESS) {
      return (
        <span title="In Progress">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        </span>
      );
    }
    return <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" title="Not Started" />;
  };

  const getDisciplineStyle = (disc: Discipline | string, isCritical?: boolean) => {
    if (isCritical) {
      return {
        row: 'border-l-[5px] border-l-rose-600 bg-rose-50/30 hover:bg-rose-100/50',
        badge: 'bg-rose-600 text-white border-rose-700',
        bar: 'bg-rose-600',
      };
    }
    switch (disc) {
      case Discipline.CIVIL:
        return {
          row: 'border-l-[4px] border-l-amber-500 bg-amber-50/25 hover:bg-amber-100/40',
          badge: 'bg-amber-100 text-amber-950 border-amber-500',
          bar: 'bg-amber-500',
        };
      case Discipline.PIPING:
        return {
          row: 'border-l-[4px] border-l-sky-500 bg-sky-50/25 hover:bg-sky-100/40',
          badge: 'bg-sky-100 text-sky-950 border-sky-500',
          bar: 'bg-sky-500',
        };
      case Discipline.MECHANICAL:
        return {
          row: 'border-l-[4px] border-l-purple-500 bg-purple-50/25 hover:bg-purple-100/40',
          badge: 'bg-purple-100 text-purple-950 border-purple-500',
          bar: 'bg-purple-500',
        };
      case Discipline.ELECTRICAL:
        return {
          row: 'border-l-[4px] border-l-yellow-500 bg-yellow-50/25 hover:bg-yellow-100/40',
          badge: 'bg-yellow-100 text-yellow-950 border-yellow-500',
          bar: 'bg-yellow-500',
        };
      default:
        return {
          row: 'border-l-[4px] border-l-slate-400 bg-stone-50/30 hover:bg-stone-100/50',
          badge: 'bg-stone-100 text-slate-800 border-slate-400',
          bar: 'bg-slate-600',
        };
    }
  };

  // Render a WBS Node and its activities recursively
  const renderWBSNode = (node: WBSViewNodeDTO, depth = 0) => {
    const isExpanded = expandedNodes[node.id] !== false;
    const hasChildren = node.children && node.children.length > 0;
    const hasActivities = node.activities && node.activities.length > 0;

    return (
      <div key={node.id} className="space-y-1 font-mono">
        {/* WBS Folder Row */}
        <div
          onClick={() => toggleNode(node.id)}
          style={{ paddingLeft: `${depth * 16 + 10}px` }}
          className={`py-2 px-3 rounded-none flex items-center justify-between cursor-pointer transition select-none border-[1.5px] ${
            depth === 0
              ? 'bg-stone-200 border-slate-900 font-black text-slate-950 text-xs shadow-[1px_1px_0px_#0f172a]'
              : depth === 1
              ? 'bg-stone-100 border-slate-800 font-bold text-slate-900 text-xs'
              : 'bg-white border-slate-400 font-bold text-slate-800 text-xs hover:bg-stone-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {hasChildren || hasActivities ? (
              isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )
            ) : (
              <span className="w-3.5" />
            )}
            <span className="font-mono text-slate-950 font-black">[{node.code}]</span>
            <span className="truncate text-slate-900 uppercase">{node.name}</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
            {hasActivities && (
              <span className="bg-stone-200 text-slate-900 px-1.5 py-0.5 border border-slate-400 font-bold">
                {node.activities.length} TASKS
              </span>
            )}
            <span className="px-1.5 py-0.5 uppercase font-bold bg-white border border-slate-900 text-slate-900">
              {node.discipline}
            </span>
          </div>
        </div>

        {/* Nested Activities & Child Nodes if expanded */}
        {isExpanded && (
          <div className="space-y-1">
            {/* Activities Table */}
            {hasActivities && (
              <div className="space-y-1 pl-3">
                {node.activities.map((act) => {
                  const isSelected = selectedActivityId === act.id || selectedActivityId === act.activityCode;
                  const discTheme = getDisciplineStyle(node.discipline, act.isCritical);

                  return (
                    <div
                      key={act.id}
                      onClick={() => onSelectActivity(act.id)}
                      className={`p-2.5 rounded-none border-[1.5px] transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono ${discTheme.row} ${
                        isSelected
                          ? 'border-slate-950 shadow-[2px_2px_0px_#000] ring-2 ring-black'
                          : 'border-slate-400'
                      }`}
                    >
                      {/* Left: Code, Name, Badges */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {getStatusIcon(act.status, act.isCritical, act.varianceDays)}
                        <span className="font-mono font-black text-slate-950 shrink-0">
                          [{act.activityCode}]
                        </span>
                        <span className="text-slate-950 font-bold truncate uppercase font-sans" title={act.name}>
                          {act.name}
                        </span>
                        {act.isCritical && (
                          <span className="px-1.5 py-0.5 rounded-none text-[8px] font-black uppercase bg-rose-600 text-white border border-rose-800 shrink-0">
                            CRITICAL
                          </span>
                        )}
                        {act.isStale && (
                          <span className="px-1.5 py-0.5 rounded-none text-[8px] font-black uppercase bg-amber-300 text-black border border-slate-900 shrink-0">
                            STALE_DPR
                          </span>
                        )}
                      </div>

                      {/* Middle: Dates & Durations */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-700 shrink-0 font-mono">
                        <div>
                          <span className="text-slate-500 font-bold">PLAN: </span>
                          <span className="text-slate-900 font-bold">{act.plannedStart.slice(5)} → {act.plannedEnd.slice(5)}</span>
                        </div>
                        {act.actualStart && (
                          <div>
                            <span className="text-slate-500 font-bold">ACT: </span>
                            <span className="text-emerald-800 font-bold">{act.actualStart.slice(5)} → {act.actualEnd ? act.actualEnd.slice(5) : '—'}</span>
                          </div>
                        )}
                        <div>
                          <span className={`px-1 py-0.2 font-black ${
                            act.varianceDays > 2 
                              ? 'bg-rose-100 text-rose-950 border border-rose-400' 
                              : act.varianceDays > 0 
                              ? 'bg-amber-100 text-amber-950 border border-amber-400' 
                              : 'bg-stone-200 text-slate-800'
                          }`}>
                            {act.varianceDays > 0 ? `+${act.varianceDays}D` : `${act.varianceDays}D`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Progress Mini Bar */}
                      <div className="flex items-center gap-2.5 shrink-0 w-36">
                        <div className="w-full bg-stone-200 rounded-none h-2 overflow-hidden border border-slate-900">
                          <div
                            style={{ width: `${act.actualProgress}%` }}
                            className={`h-full transition-all duration-300 ${discTheme.bar}`}
                          />
                        </div>
                        <span className="font-mono font-black text-slate-950 text-xs w-10 text-right tabular-nums">
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
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] font-mono border-t-4 border-t-emerald-600">
      {/* Top Filter & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-[1.5px] border-slate-900 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-600 border border-slate-900 inline-block"></span>
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              {'// MASTER_PROJECT_SCHEDULE_WBS'}
            </h2>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">
            Showing {scheduleView.filteredActivitiesCount} of {scheduleView.totalActivities} activities from baseline
          </p>
        </div>

        {/* Zoom Controls & Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Level Selector */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-none border border-slate-900 text-xs">
            {(['DAY', 'WEEK', 'MONTH', 'QUARTER'] as GanttZoomLevel[]).map((z) => (
              <button
                key={z}
                onClick={() => {
                  setZoomLevel(z);
                  handleFilterApply(selectedDiscipline, selectedStatus, criticalOnly, searchQuery, z);
                }}
                className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase transition ${
                  zoomLevel === z
                    ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                    : 'text-slate-800 hover:bg-stone-200'
                }`}
              >
                [{z}]
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
            className="bg-white border-[1.5px] border-slate-900 text-slate-950 text-xs rounded-none px-2.5 py-1 font-mono font-bold uppercase focus:outline-none shadow-[1px_1px_0px_#0f172a]"
          >
            <option value="ALL">[ALL_DISCIPLINES]</option>
            <option value="CIVIL">[CIVIL_ENGINEERING]</option>
            <option value="PIPING">[PROCESS_PIPING]</option>
            <option value="MECHANICAL">[ROTATING_EQUIPMENT]</option>
            <option value="ELECTRICAL">[ELECTRICAL_SUBSTATION]</option>
            <option value="INSTRUMENTATION">[INSTRUMENTATION]</option>
            <option value="HSE">[SAFETY_HSE]</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleFilterApply(selectedDiscipline, e.target.value, criticalOnly, searchQuery, zoomLevel);
            }}
            className="bg-white border-[1.5px] border-slate-900 text-slate-950 text-xs rounded-none px-2.5 py-1 font-mono font-bold uppercase focus:outline-none shadow-[1px_1px_0px_#0f172a]"
          >
            <option value="ALL">[ALL_STATUSES]</option>
            <option value="IN_PROGRESS">[IN_PROGRESS]</option>
            <option value="COMPLETED">[COMPLETED]</option>
            <option value="DELAYED">[DELAYED]</option>
            <option value="NOT_STARTED">[NOT_STARTED]</option>
          </select>

          {/* Critical Path Toggle */}
          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-none border-[1.5px] border-slate-900 bg-stone-50 text-xs font-mono font-bold text-slate-950 cursor-pointer select-none hover:bg-stone-100 shadow-[1px_1px_0px_#0f172a]">
            <input
              type="checkbox"
              checked={criticalOnly}
              onChange={(e) => {
                setCriticalOnly(e.target.checked);
                handleFilterApply(selectedDiscipline, selectedStatus, e.target.checked, searchQuery, zoomLevel);
              }}
              className="rounded-none border-slate-900 text-black focus:ring-0"
            />
            <span className="text-[10px] uppercase">[CRITICAL_PATH_ONLY]</span>
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleFilterApply(selectedDiscipline, selectedStatus, criticalOnly, e.target.value, zoomLevel);
          }}
          placeholder="SEARCH_BY_CODE (CIV-EXC-042), NAME, WBS_NODE..."
          className="w-full pl-9 pr-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 text-slate-950 placeholder:text-slate-500 text-xs font-mono focus:bg-white focus:outline-none transition shadow-[1px_1px_0px_#0f172a]"
        />
      </div>

      {/* WBS Hierarchy Tree */}
      <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
        {scheduleView.wbsTree.map((rootNode) => renderWBSNode(rootNode, 0))}

        {scheduleView.filteredActivitiesCount === 0 && (
          <div className="p-8 text-center rounded-none border border-slate-900 bg-stone-50 text-slate-600 space-y-1 font-mono">
            <Search className="w-5 h-5 text-slate-700 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-900 uppercase">NO_ACTIVITIES_MATCHING_FILTER</div>
            <div className="text-[11px] text-slate-600">Try adjusting discipline dropdown or clearing search keywords.</div>
          </div>
        )}
      </div>
    </div>
  );
};
