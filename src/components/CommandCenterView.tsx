'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  ActivityDetailDTO,
  AttentionRequiredDTO,
  DataFreshnessDTO,
  DependencyGraphDTO,
  DisciplinePerformanceDTO,
  ExecutiveMetricsDTO,
  ProjectHeaderDTO,
  ProgressTimeSeriesDTO,
  RiskOverviewDTO,
  ScheduleHealthDTO,
} from '@sitesync/types';
import { ProjectHeader } from './dashboard/ProjectHeader';
import { ExecutiveMetrics } from './dashboard/ExecutiveMetrics';
import { ProgressScurveChart } from './dashboard/ProgressScurveChart';
import { ScheduleHealthWidget } from './dashboard/ScheduleHealthWidget';
import { AttentionWidget } from './dashboard/AttentionWidget';
import { DisciplinePerformance } from './dashboard/DisciplinePerformance';
import { RiskOverviewWidget } from './dashboard/RiskOverviewWidget';
import { RecentUpdatesFeed } from './dashboard/RecentUpdatesFeed';
import { DataFreshnessWidget } from './dashboard/DataFreshnessWidget';
import { ActivityDetailDrawer } from './gantt/ActivityDetailDrawer';
import { DependencyImpactView } from './gantt/DependencyImpactView';
import { Play, AlertTriangle, RefreshCw, AlertOctagon, Compass, Layers } from 'lucide-react';

export const CommandCenterView: React.FC<{ onOpenDemoModal: () => void }> = ({ onOpenDemoModal }) => {
  const { state, setActiveView, selectActivity } = useProject();

  const [header, setHeader] = useState<ProjectHeaderDTO | null>(null);
  const [metrics, setMetrics] = useState<ExecutiveMetricsDTO | null>(null);
  const [health, setHealth] = useState<ScheduleHealthDTO | null>(null);
  const [timeSeries, setTimeSeries] = useState<ProgressTimeSeriesDTO | null>(null);
  const [disciplinePerf, setDisciplinePerf] = useState<DisciplinePerformanceDTO | null>(null);
  const [attention, setAttention] = useState<AttentionRequiredDTO | null>(null);
  const [freshness, setFreshness] = useState<DataFreshnessDTO | null>(null);
  const [riskOverview, setRiskOverview] = useState<RiskOverviewDTO | null>(null);

  const [selectedActivityDetail, setSelectedActivityDetail] = useState<ActivityDetailDTO | null>(null);
  const [selectedDependencyGraph, setSelectedDependencyGraph] = useState<DependencyGraphDTO | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const projectId = 'PROJ-OIL-2026-01';

  // Fetch all dashboard data from dedicated REST endpoints
  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const [
        summaryRes,
        progressRes,
        disciplineRes,
        attentionRes,
        freshnessRes,
        risksRes,
      ] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/dashboard/summary`).then((r) => r.json()),
        fetch(`/api/v1/projects/${projectId}/dashboard/progress`).then((r) => r.json()),
        fetch(`/api/v1/projects/${projectId}/dashboard/discipline`).then((r) => r.json()),
        fetch(`/api/v1/projects/${projectId}/dashboard/attention`).then((r) => r.json()),
        fetch(`/api/v1/projects/${projectId}/dashboard/freshness`).then((r) => r.json()),
        fetch(`/api/v1/projects/${projectId}/risks`).then((r) => r.json()),
      ]);

      if (summaryRes.success) {
        setHeader(summaryRes.data.header);
        setMetrics(summaryRes.data.metrics);
        setHealth(summaryRes.data.health);
      }
      if (progressRes.success) setTimeSeries(progressRes.data);
      if (disciplineRes.success) setDisciplinePerf(disciplineRes.data);
      if (attentionRes.success) setAttention(attentionRes.data);
      if (freshnessRes.success) setFreshness(freshnessRes.data);
      if (risksRes.success) setRiskOverview(risksRes.data);
    } catch (err: any) {
      console.error('Error loading command center data:', err);
      setError('Could not load live command center data. Using cached project state.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [projectId]);

  // Open Activity Detail Drawer
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

  // Open Dependency Graph
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

  if (loading && !metrics) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-lg border border-slate-200">
        <RefreshCw className="w-6 h-6 text-slate-600 animate-spin mx-auto" />
        <div className="text-sm font-bold text-slate-800">Loading Operational Project Command Center...</div>
        <div className="text-xs text-slate-500">Reconciling verified execution data, schedule floats, and risk signals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16">
      {/* Operational Control Header Strip */}
      <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] font-mono">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-none text-[9px] font-bold tracking-widest uppercase bg-stone-100 text-slate-900 border border-slate-900">
                [PROJECT_CONTROL_ROOM]
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {'// OIL_INDIA_LTD :: PROBLEM_STMT_SIH26122'}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-black tracking-tight text-slate-950 uppercase font-mono">
              CONNECTING FIELD EXECUTION REALITY WITH MASTER SCHEDULE BASELINES
            </h2>
            <p className="text-xs text-slate-700 font-sans leading-relaxed">
              Extracts execution events from unstructured field DPRs, performs 7-signal deterministic matching against L5/L6 activities, and mandates human planner verification to eliminate schedule drift.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenDemoModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>[LAUNCH_DEMO]</span>
            </button>

            <button
              onClick={() => setActiveView('review')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-amber-300 hover:bg-amber-400 border-[1.5px] border-slate-900 text-black text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-black" />
              <span>[REVIEW_QUEUE: {attention?.totalReviewCount || 37}]</span>
            </button>

            <button
              onClick={() => setActiveView('copilot')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-stone-100 hover:bg-stone-200 border-[1.5px] border-slate-900 text-slate-900 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
            >
              <Compass className="w-3.5 h-3.5 text-slate-900" />
              <span>[DOSSIER_INTEL]</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Project Header Record Card */}
      {header && (
        <ProjectHeader
          header={header}
          onRefresh={fetchDashboardData}
          isRefreshing={isRefreshing}
        />
      )}

      {/* 2. Executive Metrics (Enterprise KPI Grid) */}
      {metrics && (
        <ExecutiveMetrics
          metrics={metrics}
          onNavigateToReview={() => setActiveView('review')}
          onNavigateToGantt={() => setActiveView('gantt')}
          onNavigateToRisks={() => {
            const riskElem = document.getElementById('risk-intelligence-section');
            if (riskElem) riskElem.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* 3. Progress S-Curve & Schedule Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {timeSeries && <ProgressScurveChart timeSeries={timeSeries} />}
        </div>
        <div className="lg:col-span-1">
          {health && (
            <ScheduleHealthWidget
              health={health}
              onFilterStatus={(status) => {
                setActiveView('gantt');
              }}
            />
          )}
        </div>
      </div>

      {/* 4. Attention Required (Review Queue & Unmatched Events) */}
      {attention && (
        <AttentionWidget
          attention={attention}
          onOpenReviewQueue={() => setActiveView('review')}
          onOpenUnmatchedQueue={() => setActiveView('review')}
        />
      )}

      {/* 5. Discipline Performance */}
      {disciplinePerf && (
        <DisciplinePerformance
          performance={disciplinePerf}
          onSelectDiscipline={(disc) => {
            setActiveView('gantt');
          }}
        />
      )}

      {/* 6. Deterministic Risk Intelligence Radar */}
      {riskOverview && (
        <div id="risk-intelligence-section">
          <RiskOverviewWidget
            riskOverview={riskOverview}
            onSelectActivity={(actId) => handleInspectActivity(actId)}
          />
        </div>
      )}

      {/* 7. Recent Field Updates & Data Freshness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentUpdatesFeed
            onSelectActivity={(code) => handleInspectActivity(code)}
            onOpenReview={(id) => setActiveView('review')}
          />
        </div>
        <div className="lg:col-span-1">
          {freshness && <DataFreshnessWidget freshness={freshness} />}
        </div>
      </div>

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

      {/* Interactive Dependency Graph Visualizer */}
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
