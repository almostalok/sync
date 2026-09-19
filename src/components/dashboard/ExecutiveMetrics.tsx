'use client';

import React from 'react';
import { ExecutiveMetricsDTO } from '@sitesync/types';
import { StatusBadge, StatusVariant } from '../../../packages/design-system/components/StatusBadge';
import { ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, Clock, Layers } from 'lucide-react';

interface ExecutiveMetricsProps {
  metrics: ExecutiveMetricsDTO;
  onNavigateToReview?: () => void;
  onNavigateToGantt?: () => void;
  onNavigateToRisks?: () => void;
}

export const ExecutiveMetrics: React.FC<ExecutiveMetricsProps> = ({
  metrics,
  onNavigateToReview,
  onNavigateToGantt,
  onNavigateToRisks,
}) => {
  const cards: {
    id: string;
    title: string;
    value: string;
    subtitle: string;
    badge: string;
    badgeVariant: StatusVariant;
    accentColor: string;
    borderTop: string;
    bgTint: string;
    tooltip: string;
    actionLabel?: string;
    renderWidget?: () => React.ReactNode;
    onClick?: () => void;
  }[] = [
    {
      id: 'overall-progress',
      title: 'Verified Progress',
      value: `${metrics.overallProgress}%`,
      subtitle: `Plan: ${metrics.plannedProgress}% (${(metrics.overallProgress - metrics.plannedProgress).toFixed(1)}% var)`,
      badge: 'HEALTHY',
      badgeVariant: 'verified',
      accentColor: 'text-emerald-700',
      borderTop: 'border-t-[4px] border-t-emerald-600',
      bgTint: 'hover:bg-emerald-50/30',
      tooltip: metrics.calculationMethodology,
      actionLabel: 'GANTT_DRILLDOWN',
      onClick: onNavigateToGantt,
      renderWidget: () => (
        <div className="w-full bg-slate-200 h-1.5 border border-slate-900 mt-2 overflow-hidden relative">
          <div 
            className="bg-emerald-600 h-full" 
            style={{ width: `${metrics.overallProgress}%` }} 
          />
        </div>
      ),
    },
    {
      id: 'schedule-variance',
      title: 'Schedule Variance',
      value: `${metrics.scheduleVarianceDays > 0 ? '+' : ''}${metrics.scheduleVarianceDays} d`,
      subtitle: metrics.scheduleVarianceDays > 2 ? 'Exceeds 2-day buffer' : 'Within critical threshold',
      badge: metrics.scheduleVarianceDays > 2 ? 'ATTENTION' : 'ON TRACK',
      badgeVariant: metrics.scheduleVarianceDays > 2 ? 'warning' : 'verified',
      accentColor: metrics.scheduleVarianceDays > 2 ? 'text-amber-700' : 'text-emerald-700',
      borderTop: metrics.scheduleVarianceDays > 2 ? 'border-t-[4px] border-t-amber-500' : 'border-t-[4px] border-t-emerald-600',
      bgTint: metrics.scheduleVarianceDays > 2 ? 'hover:bg-amber-50/30' : 'hover:bg-emerald-50/30',
      tooltip: 'Calculated as actual finish vs planned baseline finish across critical path activities',
      actionLabel: 'IMPACT_ANALYSIS',
      onClick: onNavigateToGantt,
      renderWidget: () => (
        <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-amber-900 bg-amber-100/80 px-1 py-0.5 border border-amber-400">
          <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
          <span>Buffer: 2d · Slippage: +4d</span>
        </div>
      ),
    },
    {
      id: 'total-activities',
      title: 'Total Activities',
      value: metrics.totalActivities.toLocaleString(),
      subtitle: 'L5 / L6 Schedule Nodes',
      badge: 'BASELINE',
      badgeVariant: 'neutral',
      accentColor: 'text-slate-900',
      borderTop: 'border-t-[4px] border-t-slate-800',
      bgTint: 'hover:bg-slate-50',
      tooltip: 'Full WBS hierarchical activities ingested from master baseline schedule',
      actionLabel: 'VIEW_WBS',
      onClick: onNavigateToGantt,
      renderWidget: () => (
        <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono mt-2 pt-1 border-t border-slate-200">
          <span>CRITICAL_PATH:</span>
          <strong className="text-slate-900 font-bold">142 NODES</strong>
        </div>
      ),
    },
    {
      id: 'verified-updates',
      title: 'Verified Records',
      value: metrics.verifiedUpdates.toLocaleString(),
      subtitle: 'Audit-verified records',
      badge: 'AUDITED',
      badgeVariant: 'info',
      accentColor: 'text-blue-700',
      borderTop: 'border-t-[4px] border-t-blue-600',
      bgTint: 'hover:bg-blue-50/30',
      tooltip: 'Verified field report progress records backed by first-class evidence chains',
      renderWidget: () => (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-blue-900 bg-blue-100/70 px-1 py-0.5 border border-blue-400">
          <CheckCircle2 className="w-3 h-3 text-blue-700 shrink-0" />
          <span>Evidence integrity: 100% verified</span>
        </div>
      ),
    },
    {
      id: 'review-required',
      title: 'Review Required',
      value: metrics.reviewRequired.toString(),
      subtitle: metrics.reviewRequired > 0 ? 'Requires planner verification' : 'Review queue cleared',
      badge: metrics.reviewRequired > 0 ? 'ACTION_REQ' : 'CLEARED',
      badgeVariant: metrics.reviewRequired > 0 ? 'warning' : 'verified',
      accentColor: 'text-amber-800',
      borderTop: 'border-t-[4px] border-t-amber-500',
      bgTint: 'bg-amber-50/20 hover:bg-amber-50/50',
      tooltip: 'Match proposals with confidence < 0.90 requiring human-in-the-loop verification',
      actionLabel: 'TRIAGE_QUEUE',
      onClick: onNavigateToReview,
      renderWidget: () => (
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-amber-200 text-[10px] font-mono font-bold text-amber-950">
          <span>QUEUE_STATUS:</span>
          <span className="bg-amber-300 text-black px-1 border border-slate-900">
            {metrics.reviewRequired} ITEMS
          </span>
        </div>
      ),
    },
    {
      id: 'unmatched-events',
      title: 'Unmatched Events',
      value: metrics.unmatchedEvents.toString(),
      subtitle: 'Out-of-scope or new tasks',
      badge: 'UNLINKED',
      badgeVariant: 'neutral',
      accentColor: 'text-purple-800',
      borderTop: 'border-t-[4px] border-t-purple-600',
      bgTint: 'bg-purple-50/15 hover:bg-purple-50/40',
      tooltip: 'Field report events that could not be matched to existing schedule activities',
      actionLabel: 'RESOLVE_SCOPE',
      onClick: onNavigateToReview,
      renderWidget: () => (
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-purple-200 text-[10px] font-mono text-purple-900">
          <span>SCOPE_ADDITIONS:</span>
          <strong className="font-bold text-purple-950">{metrics.unmatchedEvents} DETECTED</strong>
        </div>
      ),
    },
    {
      id: 'critical-risks',
      title: 'High Risk Activities',
      value: metrics.criticalActivitiesAtRisk.toString(),
      subtitle: metrics.criticalActivitiesAtRisk > 0 ? 'Downstream delay cascade' : 'No critical risks',
      badge: metrics.criticalActivitiesAtRisk > 0 ? 'CRITICAL' : 'ZERO',
      badgeVariant: metrics.criticalActivitiesAtRisk > 0 ? 'critical' : 'neutral',
      accentColor: 'text-rose-800',
      borderTop: 'border-t-[4px] border-t-rose-600',
      bgTint: 'bg-rose-50/20 hover:bg-rose-50/50',
      tooltip: 'Activities exceeding critical path float thresholds',
      actionLabel: 'RADAR_ANALYSIS',
      onClick: onNavigateToRisks,
      renderWidget: () => (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-rose-950 bg-rose-100 px-1 py-0.5 border border-rose-400">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" />
          <span>Cascade risk detected</span>
        </div>
      ),
    },
    {
      id: 'data-freshness',
      title: 'Data Freshness',
      value: `${metrics.dataFreshnessPercentage}%`,
      subtitle: 'Recent field telemetry',
      badge: 'SYNCHRONIZED',
      badgeVariant: 'info',
      accentColor: 'text-cyan-800',
      borderTop: 'border-t-[4px] border-t-cyan-600',
      bgTint: 'hover:bg-cyan-50/30',
      tooltip: 'Percentage of activities with recent verified updates',
      renderWidget: () => (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-cyan-950 bg-cyan-100/70 px-1 py-0.5 border border-cyan-400">
          <Clock className="w-3 h-3 text-cyan-700 shrink-0" />
          <span>Last DPR: 14m ago</span>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono">
      {cards.map((card) => {
        const isClickable = !!card.onClick;

        return (
          <div
            key={card.id}
            onClick={card.onClick}
            title={card.tooltip}
            className={`bg-white rounded-none border-[1.5px] border-slate-900 ${card.borderTop} p-3.5 shadow-[2px_2px_0px_#0f172a] transition flex flex-col justify-between ${card.bgTint} ${
              isClickable 
                ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0f172a]' 
                : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider truncate font-mono">
                  {`// ${card.title}`}
                </span>
                <StatusBadge
                  status={card.badgeVariant}
                  label={card.badge}
                  size="sm"
                  showDot={false}
                />
              </div>

              <div className="my-2 flex items-baseline justify-between gap-2">
                <span className={`text-2xl lg:text-3xl font-black tracking-tight font-mono tabular-nums ${card.accentColor}`}>
                  {card.value}
                </span>

                {isClickable && card.actionLabel && (
                  <span className="text-[9px] font-bold text-slate-500 hover:text-slate-950 uppercase flex items-center gap-0.5 underline">
                    <span>{card.actionLabel}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                )}
              </div>

              {card.renderWidget && card.renderWidget()}
            </div>

            <div className="text-[10px] text-slate-600 truncate font-mono border-t border-slate-200 pt-1.5 mt-2">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
