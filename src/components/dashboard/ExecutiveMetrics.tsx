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
  ShieldAlert,
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
      title: 'Verified Progress',
      value: `${metrics.overallProgress}%`,
      subtitle: `Plan: ${metrics.plannedProgress}% (${(metrics.overallProgress - metrics.plannedProgress).toFixed(1)}%)`,
      badge: 'HEALTHY',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      tooltip: metrics.calculationMethodology,
      onClick: onNavigateToGantt,
    },
    {
      id: 'schedule-variance',
      title: 'Schedule Variance',
      value: `${metrics.scheduleVarianceDays > 0 ? '+' : ''}${metrics.scheduleVarianceDays} d`,
      subtitle: metrics.scheduleVarianceDays > 2 ? 'Variance exceeds 2-day buffer' : 'Within critical threshold',
      badge: metrics.scheduleVarianceDays > 2 ? 'ATTENTION' : 'ON TRACK',
      badgeClass: metrics.scheduleVarianceDays > 2 
        ? 'bg-amber-50 text-amber-900 border-amber-300' 
        : 'bg-blue-50 text-blue-800 border-blue-300',
      tooltip: 'Calculated as actual finish vs planned baseline finish across critical path activities',
      onClick: onNavigateToGantt,
    },
    {
      id: 'total-activities',
      title: 'Total Activities',
      value: metrics.totalActivities.toLocaleString(),
      subtitle: 'L5 / L6 Schedule Nodes',
      badge: 'BASELINE',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      tooltip: 'Full WBS hierarchical activities ingested from master baseline schedule',
      onClick: onNavigateToGantt,
    },
    {
      id: 'verified-updates',
      title: 'Verified Records',
      value: metrics.verifiedUpdates.toLocaleString(),
      subtitle: 'Immutable audit provenance',
      badge: 'AUDITED',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      tooltip: 'Verified field report progress records backed by first-class evidence chains',
    },
    {
      id: 'review-required',
      title: 'Review Required',
      value: metrics.reviewRequired.toString(),
      subtitle: metrics.reviewRequired > 0 ? 'Requires planner verification' : 'Review queue cleared',
      badge: metrics.reviewRequired > 0 ? 'ACTION' : 'CLEAR',
      badgeClass: metrics.reviewRequired > 0 
        ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold' 
        : 'bg-emerald-50 text-emerald-800 border-emerald-300',
      tooltip: 'Match proposals with confidence < 0.90 requiring human-in-the-loop verification',
      onClick: onNavigateToReview,
    },
    {
      id: 'unmatched-events',
      title: 'Unmatched Events',
      value: metrics.unmatchedEvents.toString(),
      subtitle: 'Out-of-scope or new tasks',
      badge: 'UNLINKED',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      tooltip: 'Field report events that could not be matched to existing schedule activities',
      onClick: onNavigateToReview,
    },
    {
      id: 'critical-risks',
      title: 'High Risk Activities',
      value: metrics.criticalActivitiesAtRisk.toString(),
      subtitle: metrics.criticalActivitiesAtRisk > 0 ? 'Downstream delay cascade' : 'No critical risks',
      badge: metrics.criticalActivitiesAtRisk > 0 ? 'CRITICAL' : 'ZERO',
      badgeClass: metrics.criticalActivitiesAtRisk > 0 
        ? 'bg-red-100 text-red-900 border-red-400 font-bold' 
        : 'bg-slate-100 text-slate-700 border-slate-300',
      tooltip: 'Activities exceeding critical path float thresholds',
      onClick: onNavigateToRisks,
    },
    {
      id: 'data-freshness',
      title: 'Data Freshness',
      value: `${metrics.dataFreshnessPercentage}%`,
      subtitle: 'Verified field updates',
      badge: 'SYNCHRONIZED',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      tooltip: 'Percentage of activities with recent verified updates',
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
            className={`bg-white rounded-none border-[1.5px] border-slate-900 p-3.5 shadow-[2px_2px_0px_#0f172a] transition flex flex-col justify-between ${
              isClickable ? 'cursor-pointer hover:bg-stone-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider truncate">
                {`// ${card.title}`}
              </span>
              <span className={`px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider border ${
                card.badge === 'ACTION'
                  ? 'bg-amber-300 text-black border-slate-900'
                  : card.badge === 'CRITICAL'
                  ? 'bg-red-600 text-white border-slate-900'
                  : card.badge === 'HEALTHY' || card.badge === 'ON TRACK'
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-900'
                  : 'bg-stone-100 text-slate-900 border-slate-400'
              }`}>
                [{card.badge}]
              </span>
            </div>

            <div className="my-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-950 font-mono">
                {card.value}
              </span>
            </div>

            <div className="text-[10px] text-slate-600 truncate font-mono border-t border-slate-300 pt-1.5">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
