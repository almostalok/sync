'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  ActivityDetailDTO,
  AttentionRequiredDTO,
  DataFreshnessDTO,
  DependencyGraphDTO,
  Discipline,
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
import { Play, Sparkles, AlertTriangle, RefreshCw, AlertOctagon } from 'lucide-react';

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
      <div className="p-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <div className="text-base font-bold text-white">Initializing Operational Project Command Center...</div>
        <div className="text-xs text-slate-400">Loading verified execution data, schedule floats, and risk radar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner with SIH Demo Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/50 border border-cyan-500/20 p-5 md:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Project Control Room Active
              </span>
              <span className="text-xs text-slate-400">Oil India Limited • Problem Statement SIH26122</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Connecting Messy Field Reality with Structured Schedules
            </h2>
            <p className="text-xs md:text-sm text-slate-300/90 leading-relaxed">
              SiteSync extracts daily execution events from unstructured DPRs, executes 7-signal hybrid matching against L5/L6 activities, and enforces human-in-the-loop verification to eliminate schedule drift.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenDemoModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch SIH Demo Narrative</span>
            </button>

            <button
              onClick={() => setActiveView('review')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Review Queue ({attention?.totalReviewCount || 37})</span>
            </button>

            <button
              onClick={() => setActiveView('copilot')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 text-purple-200 text-xs font-semibold transition"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Project Header */}
      {header && (
        <ProjectHeader
          header={header}
          onRefresh={fetchDashboardData}
          isRefreshing={isRefreshing}
        />
      )}

      {/* 2. Executive Metrics (8 High-Value Cards) */}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
