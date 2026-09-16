'use client';

import React from 'react';
import { ExecutiveMetricsDTO } from '@sitesync/types';
import { 
  TrendingUp, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  FileQuestion, 
  Zap, 
  ShieldAlert,
  Info
} from 'lucide-react';

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
  const cards = [
    {
      id: 'overall-progress',
      title: 'Overall Progress',
      value: `${metrics.overallProgress}%`,
      subtitle: `Plan: ${metrics.plannedProgress}% (${(metrics.overallProgress - metrics.plannedProgress).toFixed(1)}%)`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      tooltip: metrics.calculationMethodology,
      onClick: onNavigateToGantt,
    },
    {
      id: 'schedule-variance',
      title: 'Schedule Variance',
      value: `${metrics.scheduleVarianceDays > 0 ? '+' : ''}${metrics.scheduleVarianceDays} d`,
      subtitle: metrics.scheduleVarianceDays > 2 ? 'Variance exceeds 2-day buffer' : 'Within critical threshold',
      icon: Clock,
      color: metrics.scheduleVarianceDays > 2 ? 'text-amber-400' : 'text-cyan-400',
      bgColor: metrics.scheduleVarianceDays > 2 ? 'bg-amber-500/10' : 'bg-cyan-500/10',
      borderColor: metrics.scheduleVarianceDays > 2 ? 'border-amber-500/20' : 'border-cyan-500/20',
      tooltip: 'Calculated as actual finish vs planned baseline finish across critical path activities',
      onClick: onNavigateToGantt,
    },
    {
      id: 'total-activities',
      title: 'Total Activities',
      value: metrics.totalActivities.toLocaleString(),
      subtitle: 'L5 / L6 Schedule Nodes',
      icon: Layers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      tooltip: 'Full WBS hierarchical activities ingested from master baseline schedule',
      onClick: onNavigateToGantt,
    },
    {
      id: 'verified-updates',
      title: 'Verified Updates',
      value: metrics.verifiedUpdates.toLocaleString(),
      subtitle: 'Immutable audit records',
      icon: CheckCircle2,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
      tooltip: 'Verified field report progress records backed by first-class evidence chains',
    },
    {
      id: 'review-required',
      title: 'Review Required',
      value: metrics.reviewRequired.toString(),
      subtitle: metrics.reviewRequired > 0 ? 'Requires human verification' : 'Review queue cleared',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      badge: metrics.reviewRequired > 0 ? 'ACTION' : undefined,
      tooltip: 'AI match proposals with confidence < 0.90 or ambiguity requiring planner verification',
      onClick: onNavigateToReview,
    },
    {
      id: 'unmatched-events',
      title: 'Unmatched Events',
      value: metrics.unmatchedEvents.toString(),
      subtitle: 'Out-of-scope or new tasks',
      icon: FileQuestion,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      tooltip: 'Field report events that could not be matched to existing schedule activities',
      onClick: onNavigateToReview,
    },
    {
      id: 'data-freshness',
      title: 'Data Freshness',
      value: `${metrics.dataFreshnessPercentage}%`,
      subtitle: 'Updated within 48 hours',
      icon: Zap,
      color: metrics.dataFreshnessPercentage >= 90 ? 'text-emerald-400' : 'text-amber-400',
      bgColor: metrics.dataFreshnessPercentage >= 90 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      borderColor: metrics.dataFreshnessPercentage >= 90 ? 'border-emerald-500/20' : 'border-amber-500/20',
      tooltip: 'Percentage of in-progress schedule activities updated within the last 48 hours',
    },
    {
      id: 'critical-at-risk',
      title: 'Critical At Risk',
      value: metrics.criticalActivitiesAtRisk.toString(),
      subtitle: 'Zero float path items',
      icon: ShieldAlert,
      color: metrics.criticalActivitiesAtRisk > 0 ? 'text-rose-400' : 'text-slate-400',
      bgColor: metrics.criticalActivitiesAtRisk > 0 ? 'bg-rose-500/10' : 'bg-slate-800/40',
      borderColor: metrics.criticalActivitiesAtRisk > 0 ? 'border-rose-500/30' : 'border-slate-800',
      tooltip: 'Activities on the critical path exhibiting delay variance or negative progress velocity',
      onClick: onNavigateToRisks,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isClickable = !!c.onClick;

        return (
          <div
            key={c.id}
            onClick={c.onClick}
            className={`rounded-xl bg-slate-900/80 border ${c.borderColor} p-3.5 flex flex-col justify-between transition-all duration-200 ${
              isClickable ? 'cursor-pointer hover:bg-slate-800/80 hover:border-cyan-500/40 hover:shadow-lg' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg ${c.bgColor} ${c.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-2">
              <div className={`text-xl md:text-2xl font-black tracking-tight ${c.color}`}>
                {c.value}
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5" title={c.subtitle}>
                {c.subtitle}
              </div>
            </div>

            {c.tooltip && (
              <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[85%]">{c.tooltip.split('=')[0]}</span>
                <Info className="w-3 h-3 shrink-0 text-slate-500 hover:text-slate-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
